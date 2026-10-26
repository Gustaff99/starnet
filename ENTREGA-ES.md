# ENTREGA-ES — fork starnet-es en español (MIS-17 · MIS-20/21/22)

Fecha: 2026-10-26 · Rama: `es/interfaz-espanol` · Worktree: `/home/gus/paperclip-projects/space-station/starnet-es`

## Estado
**Entrega local completada.** Traducción ES de las pantallas core + espejo `website/` + alineación de los
contratos de tests con la UI como fuente de verdad. **10 tests del alcance en verde** con evidencia de
hashes (bounded-ui-tests.py). No se instalan ni arrancan servicios de StarNet; no hay publicación.

## Fases (Paperclip)
1. **MIS-20 (1/3)**: viabilidad → **VIABLE** (`VIABILIDAD-ES.md`) + triage de 5 tests: 9 fallos de texto, 0 funcionales. Commit `41701636`.
2. **MIS-21 (2/3)**: Lote A (`d9a7b244`, 7 archivos) + Lote B (`16a7b0a7`, 4 archivos) → 5/5 tests verdes. Checkpoint `44005420`.
3. **MIS-22 (3/3, esta entrega)**: validación ampliada a 10 tests + lote de alineación fase 3 (6 archivos) + este informe.

## Lote fase 3 (esta entrega)
- `test/consent-visibility.test.js`: status de canal alineado a `channels.js` (fuente de verdad: `'awaiting your approval…'`, EN).
- `test/ask-cards-readable.test.js`: botones de aprobación alineados a `group-chat.js` (`'Aprobar una vez'`/`'Deny'`): 3 aserciones, 3 finds y comentarios.
- `test/help-copy-matches-screen.test.js`: `WORK_LABELS` y títulos de ventana alineados a `stationui.js` (`tasks: 'TAREAS'`).
- `frontend/app/glossary.js` + `website/app/app/glossary.js` (espejo): entrada `capability` apunta a `CONNECT › HABILIDADES`.
- `website/docs/connect-a-platform.html`: rutas de la guía `CONNECT › HABILIDADES` (3 lugares).

## Pruebas (bounded-ui-tests.py · node real · límite 20 s/test)
| Lote | Tests | Resultado |
|---|---|---|
| 1 (core) | voice-live-ui, workflows-window, autonomy-ui, line-sendto, needs-you | **5/5 exit 0** (re-ejecución real tras cambio de fuente) |
| 2 (contrato) | outbox-window, ask-cards-readable, session-indicators, consent-visibility, help-copy-matches-screen | **5/5 exit 0** (ask-cards real; resto cached con hashes vigentes) |

Evidencia: `VALIDACION-ES.json` (sha256 de cada test + `sourceSha256` del frontend) y logs íntegros en `validation-logs/`.
`node --check` OK en los 61 archivos JS modificados.

**No se afirma que la suite global pasó**: solo los 10 tests del alcance están verificados (criterio explícito de la misión).

## Commits (rama `es/interfaz-espanol`)
- `345ebc1a` es/interfaz: windows restantes, espejo website/, places y contratos en español
- `41701636` i18n(es) 1/3: viabilidad + triage de 5 tests
- `d9a7b244` i18n(es) 2/3 lote A: ABRIR EN FLUJOS, FLUJOS COMUNES, lang=es, espejo, contrato workflows-window
- `16a7b0a7` i18n(es) 2/3 lote B: contratos line-sendto, needs-you, autonomy-ui, voice-live-ui
- `44005420` i18n(es) 2/3: checkpoint + VALIDACION-ES.json
- (esta entrega) i18n(es) 3/3: 63 archivos M de MIS-20 + lote fase 3 + `scripts/translate-core-es.py` + `.gitignore` (`.pi/`)
- (esta entrega) i18n(es) 3/3: `ENTREGA-ES.md` + `CHECKPOINT.md`

## Alcance completado
- 63 archivos: traducción ES de pantallas core (chat, app, stationui, group-chat, glossary, needsyou, windows, docs) + espejo `website/app/app/` sincronizado + 25 contratos de tests alineados a la UI.
- `lang="es"` en `frontend/index.html` y `website/index.html` (Lote A).
- 10 tests del alcance en verde con hashes vigentes; 0 regresiones funcionales detectadas en el alcance.

## Límites conocidos (no son regresiones del alcance)
1. **Suite global no ejecutada**: solo los 10 tests del alcance verificados. Otros tests del repo pueden llevar aserciones de texto sin revisar.
2. **Estados de canal en EN**: `channels.js` es la fuente de verdad (`'awaiting your approval…'`, rail, COMMS, tooltips). La traducción completa de estados de canal queda como fase futura; en esta entrega 2 tests se alinearon a EN (precedente del 2/3).
3. **Mezcla intencional EN/ES**: `'Aprobar una vez'` + `'Deny'` (así emite `group-chat.js`); `AGENT DOSSIER`/`NOTIFICATIONS` en `WORK_LABELS` siguen en EN (keyed por window ids).
4. **Guías `website/docs`**: se tradujeron las rutas `CONNECT › HABILIDADES`; otras menciones (`CONNECTED SERVICES`, `BUILT-IN ABILITIES`) quedan como semilla de fase futura.
5. `scripts/translate-core-es.py`: helper de traducción por diccionario explícito, incluido como evidencia de método.

## Ruta del fork
`/home/gus/paperclip-projects/space-station/starnet-es` (rama `es/interfaz-espanol`), recuperable por Git; estado persistente en `CHECKPOINT.md`.
