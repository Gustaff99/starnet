# VIABILIDAD-ES — Fork de StarNet con interfaz en español

Subtarea: MIS-20 (MIS-17 · 1/3 — viabilidad y triage acotado). Fecha: 2026-10-26.
Checkout: `/home/gus/paperclip-projects/space-station/starnet-es`, rama `es/interfaz-espanol`.

## Veredicto

**VIABLE**, con alcance acotado. La UI de StarNet es una capa de vanilla JavaScript
(sin framework de i18n) donde los textos viven como literales dentro de los módulos de
`frontend/app/*.js` y su espejo `website/app/app/*.js`. Traducir la interfaz es una
edición de cadenas + alineación de las aserciones de los tests de contrato. No toca el
sidecar Node, los contratos de API, el runtime de agentes ni el shell Tauri.

## Evidencia

1. **Arquitectura** (revisión Codex `specialist-review-1.json`, veredicto `continue`):
   README del repo: frontend vanilla JavaScript, sidecar Node, contratos compartidos y
   shell Tauri. `frontend/index.html` (99.695 bytes, HTTP 200 en la revisión) contiene
   `<html lang="en">` y controles en inglés. La UI es una capa acotable que se puede
   modificar sin sustituir la ejecución de agentes.
2. **Estado del diff actual**: `git diff --stat` → 66 archivos, +1024/−1024 (intercambio
   1:1 por línea → sustitución de cadenas, sin cambios estructurales).
   - `frontend/app`: 16 archivos, 183+/183−
   - `test/`: 33 archivos, 148+/148− (aserciones alineadas a los textos)
   - `website/app/app`: 17 archivos (espejo)
3. **Triage real de 5 tests** (este run, detalle en `TRIAGE-ES.json`): 5/5 ejecutados con
   timeout individual 20 s; 9 fallos sobre 329 aserciones ok. **Los 9 fallos son
   discrepancias de texto; 0 regresiones funcionales en el lote.**
4. **Licencia** (revisión 1): MIT para el código; nombre, logo, ilustraciones y sprites
   reservados por el autor. Afecta a un fork redistribuible (marca propia), no a la
   traducción local.

## Alcance y limitaciones

- **Dentro de alcance (fase 2)**: literales de UI en `frontend/app/**` y su espejo
  `website/app/app/**`, y las aserciones exactas de los tests de contrato en `test/**`.
- **Fuera de alcance en esta fase**: sidecar (CLI, `sidecar/routing/*`), prompts de
  agentes en inglés que son contrato de voz, shell Tauri, assets/sprites.
- **Limitación estructural**: no hay sistema de locales; cada cadena se edita a mano y
  cada test de contrato la verifica con regex/`includes` exacto. Un mismo concepto puede
  estar en español en la fuente y en inglés en el test (o al revés): el triage encontró
  fallos en **ambas direcciones** (p. ej. UI "TAREAS PEQUEÑAS" vs test "SMALL JOBS";
  test "OPEN IN FLUJOS" vs UI "OPEN IN WORKFLOWS").
- **Limitación menor**: `frontend/index.html` sigue con `<html lang="en">` (1 ocurrencia);
  se corrige en fase 2 junto a los `aria-label` ya traducidos ("Iniciar voz local manos
  libres", "Necesita de ti").

## Términos API / identificadores / prompts que DEBEN conservarse (no traducir)

- **IDs y claves de ventanas/docks**: `id: 'workflows'`, `k: 'workflows'`,
  `data-family="automate"`, `data-reach="sandbox|observe|free"`, `data-act="automatic"`,
  `data-tip=...`, `id="voice-live"`, `id="ws-needs"`.
- **Endpoints y bus**: `GET /api/line-jobs?stream=`, `/api/line-jobs?line=...&limit=1`,
  evento `permission.response`, llamada `lead-run`, `promptId`.
- **Estados de job (valores de protocolo)**: `status: 'running' | 'delivered' | 'refused'`,
  `kind: 'handoff' | 'sample'`, regex `jobStream = /^\(sample|handoff\)-/`.
- **APIs internas de JS**: `StationUI.registerWindow`, `StationUI.initiativeLabel`,
  `WorkflowsWindow.openByStream`, `ReturnStore.foldRow/pendingRows`, `Chat.awayRate`,
  `Chat.answerConsent`, `worldmodel.lineName`, `lineOfProp`.
- **Clases CSS contractuales**: `wfw-win`, `ws-needs`, `voice-toggle`, `voice-live`,
  `consent-btn ob-wf`, `wfw-tgroup wfw-goalhd`.
- **Palabras de respuesta de voz**: el flujo `spokenAsk` anuncia la pregunta y la
  respuesta se reconoce por palabras ("approve"/"deny" según el test de voz); si se
  traduce la voz hablada, la aserción debe moverse con ella (contrato de voz, no solo
  etiqueta).
- **`aria-label`**: accesibles para lectores de pantalla; traducirlos es correcto, pero el
  test de contrato debe alinearse en el mismo lote.

## Orden de lotes para fase 2 (máx. 8 archivos/lote)

- **Lote A (6 archivos)**: `frontend/app/windows/outbox.js` (OPEN IN WORKFLOWS→FLUJOS,
  ENTREGABLES, DE/ENVIADO A/NO ENVIADO A), `frontend/app/windows/workflows.js`
  (FOR YOUR GOAL→TU META, BUCLES DE OBJETIVO, COMMON FLUJOS), `frontend/index.html`
  (lang="es", aria-label), `test/workflows-window.test.js`, `test/line-sendto.test.js`,
  `test/needs-you.test.js`.
- **Lote B (4 archivos)**: `frontend/app/stationui.js` (SMALL JOBS→TAREAS PEQUEÑAS
  canónicas + espejo `website/app/app/*` de Lote A/B), `test/autonomy-ui.test.js`,
  `test/voice-live-ui.test.js`, re-ejecución del lote de 5 tests de triage.

Criterio de éxito por lote: los 5 tests del triage en verde sin cambiar la lógica
(solo cadenas y aserciones), y sin tocar endpoints/estados/IDs.
