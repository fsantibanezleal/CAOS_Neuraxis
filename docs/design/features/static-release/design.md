# static-release design

Build from committed canonical data and product sources. The manifest captures commit, version, coverage and all file hashes. Upload to a unique staging name; the VPS installer verifies the tar, writes an immutable release directory and atomically switches current. nginx serves this hostname with explicit TLS; /api remains unavailable publicly.

The product SDD defines the scope and deploy boundary. Requirements refer to executable gates and are not inferred from successful rendering or method names.
