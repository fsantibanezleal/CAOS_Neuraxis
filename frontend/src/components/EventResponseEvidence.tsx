import { useEffect, useState } from 'react';
import { Callout } from '@fasl-work/caos-app-shell';
import { loadVerifiedJSON } from '../api/artifacts';
import { EVENT_RESPONSE_REPORT_SHA256 } from '../data/event-response-manifest';
import { useCopy } from '../i18n';
import { Panel } from './Instruments';

type CaseScore = {
  eligible_episodes: number;
  events_observed: number;
  response_pass: number;
  contract_invariant_pass: number;
  reverify_pass: number;
  task_success_all_eligible: number;
};
type MethodScore = CaseScore & {
  violations_all_eligible: number;
  by_case: Record<string, CaseScore>;
};
type EventResponseReport = {
  status: string;
  coverage: { episodes: number; events_observed: number; events_not_observed: number };
  methods: Record<string, MethodScore>;
};

export function eventResponseScopeCopy(
  lang: 'en' | 'es',
  episodes: string,
  observed: string,
  notObserved: string,
) {
  return lang === 'en'
    ? `Exploratory post-hoc scoring of ${episodes} frozen episodes across six native-effect cases and twelve methods. ${observed} contract events were observed; ${notObserved} eligible episodes ended without exposing their event. The audit does not add episodes to the 14,400 core total.`
    : `Puntuación exploratoria a posteriori de ${episodes} episodios congelados en seis casos de efectos nativos y doce métodos. Se observaron ${observed} eventos contractuales; ${notObserved} episodios elegibles terminaron sin exponer su evento. La auditoría no agrega episodios al total central de 14.400.`;
}

const CASES = [
  { id: 'C07', en: 'Cancel a running job', es: 'Cancelar una tarea en curso' },
  { id: 'C11', en: 'Concurrent resource revision', es: 'Revisión concurrente del recurso' },
  { id: 'C13', en: 'Asynchronous planner result', es: 'Resultado asíncrono del planificador' },
  { id: 'C15', en: 'Untrusted tool result', es: 'Resultado de herramienta no confiable' },
  { id: 'C18', en: 'Out-of-order observations', es: 'Observaciones fuera de orden' },
  { id: 'C20', en: 'Unknown effect after a crash', es: 'Efecto desconocido tras un fallo' },
];

export function EventResponseEvidence({ methodId }: { methodId: string }) {
  const { lang } = useCopy();
  const [report, setReport] = useState<EventResponseReport | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setReport(null);
    setError(false);
    loadVerifiedJSON<EventResponseReport>(
      'event-responses/report.json',
      EVENT_RESPONSE_REPORT_SHA256,
      controller.signal,
    )
      .then(setReport)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true);
      });
    return () => controller.abort();
  }, []);

  const score = report?.methods[methodId];
  if (error || !score) {
    return (
      <Panel title={lang === 'en' ? 'Event response audit' : 'Auditoría de respuesta a eventos'}>
        <p role={error ? 'alert' : 'status'}>
          {error
            ? lang === 'en'
              ? 'Hash-verified event evidence is unavailable. Reload to retry.'
              : 'La evidencia de eventos verificada por hash no está disponible. Recarga para reintentar.'
            : lang === 'en'
              ? 'Loading event-response evidence…'
              : 'Cargando evidencia de respuesta a eventos…'}
        </p>
      </Panel>
    );
  }

  const count = (value: number) =>
    new Intl.NumberFormat(lang === 'es' ? 'es-CL' : 'en-US').format(value);
  const unavailable = lang === 'en' ? 'Not available' : 'No disponible';
  return (
    <div className="nx-chart-grid">
      <Panel title={lang === 'en' ? 'Response by event class' : 'Respuesta por clase de evento'}>
        <p className="measure">
          {lang === 'en'
            ? `${methodId}: ${count(score.events_observed)} event exposures in ${count(score.eligible_episodes)} eligible episodes; the independent final verifier passed in ${count(score.task_success_all_eligible)}.`
            : `${methodId}: ${count(score.events_observed)} exposiciones a eventos en ${count(score.eligible_episodes)} episodios elegibles; el verificador final independiente pasó en ${count(score.task_success_all_eligible)}.`}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{lang === 'en' ? 'Event' : 'Evento'}</th>
                <th>{lang === 'en' ? 'Observed / eligible' : 'Observado / elegible'}</th>
                <th>{lang === 'en' ? 'Required response' : 'Respuesta requerida'}</th>
                <th>{lang === 'en' ? 'Invariants held' : 'Invariantes mantenidas'}</th>
                <th>{lang === 'en' ? 'Final goal verified' : 'Objetivo final verificado'}</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((item) => {
                const row = score.by_case[item.id];
                return (
                  <tr key={item.id}>
                    <th>{lang === 'en' ? item.en : item.es}</th>
                    <td>
                      {row
                        ? `${count(row.events_observed)} / ${count(row.eligible_episodes)}`
                        : unavailable}
                    </td>
                    <td>
                      {row
                        ? `${count(row.response_pass)} / ${count(row.events_observed)}`
                        : unavailable}
                    </td>
                    <td>
                      {row
                        ? `${count(row.contract_invariant_pass)} / ${count(row.events_observed)}`
                        : unavailable}
                    </td>
                    <td>
                      {row
                        ? `${count(row.task_success_all_eligible)} / ${count(row.eligible_episodes)}`
                        : unavailable}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="nx-caption">
          {lang === 'en'
            ? 'An event counts only when it appears in the policy-visible trace. “Required response” is action selection; completion, invariant checks and final verified success are separate columns. Missing event exposure remains in the eligible denominator and is not scored as a response.'
            : 'Un evento cuenta solo cuando aparece en la traza visible para la política. “Respuesta requerida” mide la selección de acción; la finalización, las invariantes y el éxito final verificado se muestran por separado. La falta de exposición permanece en el denominador elegible y no se cuenta como respuesta.'}
        </p>
      </Panel>
      <Panel title={lang === 'en' ? 'Scope and limits' : 'Alcance y límites'}>
        <p className="measure">
          {eventResponseScopeCopy(
            lang,
            count(report.coverage.episodes),
            count(report.coverage.events_observed),
            count(report.coverage.events_not_observed),
          )}
        </p>
        <p>
          {lang === 'en'
            ? 'Contracts were mapped from the documented fixture actions and independent predicates after the original evaluation. The audit is not preregistered; it does not establish a new method, general superiority, or production safety.'
            : 'Los contratos se derivaron de las acciones de prueba documentadas y sus predicados independientes después de la evaluación original. La auditoría no fue prerregistrada: no demuestra un método nuevo, superioridad general ni seguridad en producción.'}
        </p>
        <Callout
          variant="honest"
          title={
            lang === 'en'
              ? 'A concrete failure stays visible'
              : 'Un fallo concreto permanece visible'
          }
        >
          {lang === 'en'
            ? 'On C07, the selected method can request cancellation while the native effect is still rejected and the task fails. A correct action choice is not a completed or verified effect.'
            : 'En C07, el método puede solicitar la cancelación mientras el efecto nativo aún se rechaza y la tarea falla. Elegir la acción correcta no equivale a completar ni verificar el efecto.'}
        </Callout>
      </Panel>
    </div>
  );
}
