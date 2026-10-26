# INVENTARIO-ES — texto en inglés pendiente de traducir (MIS-23)

Fecha: 2026-10-26 · Rama: es/interfaz-espanol · Método: escáner heurístico v4 (.pi/inventory/scan-en3.py) + barrido manual de estados con elipsis.

## Resumen
- **2316 cadenas candidatas en 112 archivos canónicos** (1013 únicas).
- Frontend y website se deduplikan: website/app/* es espejo de frontend/* (se traduce la fuente y se sincroniza el espejo).
- Falsos positivos posibles: fragmentos de código dentro de innerHTML y nombres de clase capturados por el patrón <button>; cada línea del inventario debe verificarse al traducir.
- Alcance confirmado en ENTREGA-ES.md: núcleo frontend + espejo website + contratos de test.

## Criterio de detección
- Sinks visibles: textContent, innerHTML, aria-*, title, placeholder, data-tip, toast(), createTextNode, append(str), alt, prompt/confirm/alert, status:.
- Cadena con 2+ palabras inglesas fuertes sin acento español ni palabras funcionales españolas, o palabra única de la lista curada (online, working…, ready, …).
- Estados con elipsis (…): barrido complementario manual — son estados de UI casi siempre visibles.

## Niveles de prioridad

| Nivel | Alcance | Archivos | Cadenas |
|---|---|---|---|
| P1 | P1 · UI principal (frontend/app) | 56 | 1860 |
| P1 | P2 · frontend html/demos | 27 | 298 |
| P3 | P3 · website (docs y otros) | 29 | 158 |

## Por archivo (canónico)

| # | Archivo | Cadenas | Nivel |
|---|---|---|---|
| 1 | frontend/app/stationui.js | 526 | P1 |
| 2 | frontend/app/app.js | 240 | P1 |
| 3 | frontend/app/workflowpanel.js | 168 | P1 |
| 4 | frontend/app/build.js | 154 | P1 |
| 5 | frontend/agent-station-demo.html | 148 | P1 |
| 6 | frontend/app/marketplace.js | 130 | P1 |
| 7 | frontend/app/chat.js | 120 | P1 |
| 8 | frontend/app/windows/workflows.js | 72 | P1 |
| 9 | frontend/app/windows/connectors.js | 52 | P1 |
| 10 | frontend/app/apps.js | 40 | P1 |
| 11 | frontend/app/deliverables.js | 38 | P1 |
| 12 | frontend/app/outputbrowser.js | 36 | P1 |
| 13 | frontend/app/voice-live.js | 32 | P1 |
| 14 | frontend/app/firstvalue.js | 22 | P1 |
| 15 | frontend/assets/industrial/shell-clean-preview.html | 20 | P1 |
| 16 | website/docs/guides/conveyors.html | 19 | P3 |
| 17 | frontend/agent-demo/demo.js | 18 | P1 |
| 18 | website/docs/guides/crew.html | 18 | P3 |
| 19 | frontend/app/stepin.js | 16 | P1 |
| 20 | website/docs/guides/first-line.html | 15 | P3 |
| 21 | frontend/index.html | 14 | P1 |
| 22 | frontend/app/deskscreen.js | 14 | P1 |
| 23 | frontend/prop-catalog-review.html | 12 | P1 |
| 24 | frontend/app/workhub.js | 12 | P1 |
| 25 | frontend/app/group-chat.js | 12 | P1 |
| 26 | frontend/app/datareset.js | 10 | P1 |
| 27 | frontend/app/tutorial.js | 10 | P1 |
| 28 | frontend/app/workview.js | 10 | P1 |
| 29 | website/docs/guides/splitter-joiner.html | 9 | P3 |
| 30 | frontend/prop-batch-review.html | 8 | P1 |
| 31 | frontend/prop-scale-review.html | 8 | P1 |
| 32 | frontend/prop-style-review.html | 8 | P1 |
| 33 | frontend/app/taskconversation.js | 8 | P1 |
| 34 | frontend/app/modelpicker.js | 8 | P1 |
| 35 | frontend/app/hudmode.js | 8 | P1 |
| 36 | frontend/app/project-home.js | 8 | P1 |
| 37 | frontend/app/remote-devices.js | 8 | P1 |
| 38 | frontend/app/prop-atlas.js | 8 | P1 |
| 39 | website/docs/guides/routines.html | 8 | P3 |
| 40 | website/docs/guides/filter.html | 7 | P3 |
| 41 | frontend/skin-review-0914.js | 6 | P1 |
| 42 | frontend/skin-review-0914.html | 6 | P1 |
| 43 | frontend/app/channels.js | 6 | P1 |
| 44 | frontend/app/warroom.js | 6 | P1 |
| 45 | frontend/app/delegated.js | 6 | P1 |
| 46 | frontend/app/windows/routines.js | 6 | P1 |
| 47 | frontend/assets/industrial/space-preview.html | 6 | P1 |
| 48 | frontend/assets/industrial/shell-variants/preview.html | 6 | P1 |
| 49 | website/index.html | 6 | P3 |
| 50 | website/docs/guides/channels.html | 6 | P3 |
| 51 | website/docs/index.html | 5 | P3 |
| 52 | frontend/agent-proportion-review.html | 4 | P1 |
| 53 | frontend/prop-atlas.html | 4 | P1 |
| 54 | frontend/app/dialogue.js | 4 | P1 |
| 55 | frontend/app/updates.js | 4 | P1 |
| 56 | frontend/app/crtlab.js | 4 | P1 |
| 57 | frontend/app/keycta.js | 4 | P1 |
| 58 | frontend/app/kepler-showcase.js | 4 | P1 |
| 59 | frontend/app/schedpicker.js | 4 | P1 |
| 60 | frontend/app/widgets.js | 4 | P1 |
| 61 | frontend/app/diagnostics.js | 4 | P1 |
| 62 | frontend/app/world.js | 4 | P1 |
| 63 | frontend/app/worldlab.js | 4 | P1 |
| 64 | frontend/app/windows/loops.js | 4 | P1 |
| 65 | frontend/agent-demo/review-world.js | 4 | P1 |
| 66 | frontend/dev/comms-layout-review.html | 4 | P1 |
| 67 | website/market.js | 4 | P3 |
| 68 | website/docs/getting-started.html | 4 | P3 |
| 69 | website/docs/migrating.html | 4 | P3 |
| 70 | website/docs/skills.html | 4 | P3 |
| 71 | website/docs/connect-a-platform.html | 4 | P3 |
| 72 | website/docs/station.html | 4 | P3 |
| 73 | website/docs/guides/goals.html | 4 | P3 |
| 74 | website/docs/guides/night-shift.html | 4 | P3 |
| 75 | website/docs/guides/index.html | 4 | P3 |
| 76 | website/docs/help.html | 3 | P3 |
| 77 | website/docs/troubleshooting.html | 3 | P3 |
| 78 | website/docs/shortcuts.html | 3 | P3 |
| 79 | website/docs/providers.html | 3 | P3 |
| 80 | website/docs/glossary.html | 3 | P3 |
| 81 | website/docs/connectors.html | 3 | P3 |
| 82 | website/docs/autonomy.html | 3 | P3 |
| 83 | website/docs/agents.html | 3 | P3 |
| 84 | frontend/agent-motion-review.js | 2 | P1 |
| 85 | frontend/prop-sharpness-audit.html | 2 | P1 |
| 86 | frontend/authored-machine-review.html | 2 | P1 |
| 87 | frontend/agent-motion-review.html | 2 | P1 |
| 88 | frontend/prop-room-review.html | 2 | P1 |
| 89 | frontend/app/bootguard.js | 2 | P1 |
| 90 | frontend/app/cratecard.js | 2 | P1 |
| 91 | frontend/app/remaster-runtime-audit.js | 2 | P1 |
| 92 | frontend/app/intake.js | 2 | P1 |
| 93 | frontend/app/skin-study-preview.js | 2 | P1 |
| 94 | frontend/app/glass-comms.js | 2 | P1 |
| 95 | frontend/app/prop-room-review.js | 2 | P1 |
| 96 | frontend/app/voice.js | 2 | P1 |
| 97 | frontend/app/briefing.js | 2 | P1 |
| 98 | frontend/app/userprops.js | 2 | P1 |
| 99 | frontend/app/modeldock.js | 2 | P1 |
| 100 | frontend/app/needsyou.js | 2 | P1 |
| 101 | frontend/app/projection-audit-panel.js | 2 | P1 |
| 102 | frontend/app/windows/automation.js | 2 | P1 |
| 103 | frontend/app/windows/messaging.js | 2 | P1 |
| 104 | frontend/agent-demo/proportion-review.js | 2 | P1 |
| 105 | frontend/dev/session-indicators.html | 2 | P1 |
| 106 | frontend/dev/authored-furniture-review.html | 2 | P1 |
| 107 | frontend/dev/authored-service-fixture.html | 2 | P1 |
| 108 | frontend/dev/authored-mount-checks.js | 2 | P1 |
| 109 | frontend/dev/authored-content-fixture.html | 2 | P1 |
| 110 | website/maps.js | 2 | P3 |
| 111 | website/docs/docs.js | 2 | P3 |
| 112 | website/market.html | 1 | P3 |

## Maquinarias de estado conocidas (cruciales para la coherencia)

1. **Estados de canal (channels.js)**: 'online' | 'connecting…' | 'thinking…' | 'working…' | 'awaiting your approval…' (L49, L76, L85, L101, L110, L118, L139-140, L152). Renderizados en rail y COMMS. 4 tests asercionan la forma EN (background-asks-ui, channels, comms-header-no-run-state, ask-cards-readable) y 3 la ES (voice-live-ui, consent-visibility, session-indicators) → alinear todos a ES.
2. **Estados de trabajo/flujo (workflowpanel.js, build.js, chat.js)**: 'THE JOB IS RIDING THE LINE…', 'POSTING LINE…', 'HANDING THE JOB ON…', 'JOB IN PROGRESS…', 'RUN COMPLETE', 'RUN STOPPED'.
3. **Estados de voz (voice.js, voice-live.js)**: 'listening…', 'transcribing…', 'speaking…', 'Listening…', 'Finalizing your turn…'.
4. **Estados de cuenta/modelo (app.js, stationui.js)**: 'requesting a sign-in code…', 'sign-in timed out', 'CHECKING…', 'SAVING YOUR GOAL…'.
5. **Estados de conector (windows/connectors.js, messaging.js)**: mezcla EN/ES ('INSTALANDO CUA…' vs 'Downloading and verifying CUA…').

## Exclusiones justificadas (no traducir)
- Identificadores y protocolos: BAY, LINE, COMMS, BUILD, DOCK, SKILL.md, SKILL.MD, CUA, cron (`0 9 * * *`), slugs de modelo.
- Nombres de marcas/productos: ChatGPT, Claude, Claude Code, GitHub, Telegram, Spotify, 1Password, Grok, xAI, OpenRouter, Anthropic.
- Clases CSS y data-* contractuales, IDs de ventanas/docks, endpoints y nombres de campo de API.
- Cadenas de prompt interno (instrucciones a modelos) salvo que se muestren al usuario (verificar caso a caso).
- Consolas/logs técnicos con formato fijo (diagnostics, nightreport) → criterio: si el usuario final lo lee, traducir; si es depuración, documentar la exclusión.

## Plan de subtareas (una activa a la vez, máx. 8 archivos/lote)

| Subtarea | Alcance | Criterio de aceptación |
|---|---|---|
| MIS-23-1 | Estados de canal + rail + COMMS + tooltips (channels.js y render) + alinear los 7 tests divididos | Los 5 estados de canal en español; 7 tests en verde sin tocar endpoints; sin regresión en los 10 tests de bounded-ui |
| MIS-23-2 | stationui.js región 1: panel de agentes + mercado de skills (L1600-4600) | Escáner: <80 cadenas EN restantes en el rango; tests de skills en verde |
| MIS-23-3 | stationui.js región 2: settings, modelos, claves, voz, autonomía (L4600-11700) | Escáner: <80 restantes; tests de voice/help en verde |
| MIS-23-4 | app.js: sign-in, catálogo de modelos, COMMS, recuperación | Escáner: <40 restantes en app.js; tests line-sendto/needs-you en verde |
| MIS-23-5 | chat.js + voice.js + voice-live.js: estados de ejecución y voz | Escáner: <40 restantes; tests voice-live-ui en verde |
| MIS-23-6 | build.js + workflowpanel.js + windows/ (workflows, connectors, loops, routines, outbox, messaging, rewind) | Escáner: <100 restantes en el conjunto; tests workflows-window en verde |
| MIS-23-7 | marketplace.js + apps.js + outputbrowser.js + deliverables.js + workhub.js + restantes de frontend/app | Escáner: <60 restantes en frontend/app |
| MIS-23-8 | Demos y páginas de revisión (agent-station-demo.html, agent-demo/, prop-*-review, skin-review, index.html) + website/docs (145) | Escáner: <40 restantes en P2/P3; espejo website sincronizado (diff -q) |
| MIS-23-9 | Suite global de tests + verificación visual (pantallas en ejecución) + ENTREGA-ES final | Suite completa con exitcode registrado; captura/revisión visual de pantallas clave; ENTREGA-ES.md actualizado |

## Métrica de cierre
La misión se cierra cuando: (a) el escáner v4 reportan <100 cadenas EN restantes en P1+P2, todas documentadas como exclusión o traducción; (b) la suite de tests relevante pasa; (c) revisión visual completada o bloqueador declarado.

## Datos crudos
- .pi/inventory/en-strings3.json — 2316 registros (file, line, sink, text).
- .pi/inventory/scan-en3.py — escáner re-ejecutable.