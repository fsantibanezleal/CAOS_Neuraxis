// The static host as deploy/neuraxis.nginx.tls serves it, for the shell gate and a local preview (the shell's own --serve server
// answers as GitHub Pages does, with no SPA fallback, and Neuraxis is a vps product):
//   - an existing file is 200 (a directory serves its index.html);
//   - a path with a file extension that does not exist is 404 (`location ~ \.[^/]+$`), never the application;
//   - any other path falls back to /index.html with 200 (`try_files $uri $uri/ /index.html`), so /app and the documentation routes load directly;
//   - /api/ is 404; /operations-api/ is proxied to the bounded operations service when one runs (NEURAXIS_OPERATIONS_UPSTREAM,
//     default 127.0.0.1:4178), the request keeping its Host header, and answers 502 when none does.
// Usage: node scripts/serve-static-host.mjs [dist] [port]   (a library: import { serveStaticHost })
import { createServer, request } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8', '.map': 'application/json',
};

export function serveStaticHost(dir, port = 0, upstream = process.env.NEURAXIS_OPERATIONS_UPSTREAM ?? '127.0.0.1:4178') {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    let path;
    try {
      path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    const send = (status, file) => {
      res.writeHead(status, { 'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
    };
    if (path.startsWith('/api/')) {
      res.writeHead(404);
      return res.end();
    }
    if (path.startsWith('/operations-api/')) {
      const [host, upstreamPort] = upstream.split(':');
      const proxied = request({ host, port: Number(upstreamPort), method: req.method, path: req.url, headers: req.headers }, (answer) => {
        res.writeHead(answer.statusCode ?? 502, answer.headers);
        answer.pipe(res);
      });
      proxied.on('error', () => {
        res.writeHead(502);
        res.end();
      });
      return req.pipe(proxied);
    }
    const file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(404);
      return res.end();
    }
    if (existsSync(file) && statSync(file).isFile()) return send(200, file);
    if (existsSync(file) && statSync(file).isDirectory() && existsSync(join(file, 'index.html')) && path.endsWith('/')) return send(200, join(file, 'index.html'));
    if (/\.[^/]+$/.test(path)) {
      res.writeHead(404);
      return res.end();
    }
    return send(200, join(root, 'index.html'));
  });
  return new Promise((done) =>
    server.listen(port, '127.0.0.1', () => done({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) })),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = process.argv[2] ?? fileURLToPath(new URL('../dist', import.meta.url));
  const { url } = await serveStaticHost(dist, Number(process.argv[3] ?? 4188));
  console.log(`serving ${dist} at ${url}`);
}
