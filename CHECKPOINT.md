# CHECKPOINT — MIS-23: Traducción completa de la interfaz visible de starnet-es

## Objetivo
Traducir al español toda la interfaz visible de starnet-es (frontend + espejo website + contratos de test), conservando identificadores, protocolos, APIs y anglicismos técnicamente necesarios.

## Criterios de misión
1. Inventario de pantallas y texto pendiente ANTES de cambios de código. ✅
2. Subtareas Paperclip acotadas con criterios de aceptación, una activa a la vez. ✅ (9 creadas)
3. Todos los menús, botones, estados, diálogos, errores, ayuda y accesibilidad traducidos.
4. Identificadores/protocolos/APIs/anglicismos técnicos conservados.
5. Sin reducción de alcance; sin cambiar tests para aceptar inglés pendiente.
6. Exclusiones documentadas con justificación.
7. Tests relevantes en verde.
8. Revisión visual de pantallas en ejecución (o bloqueador declarado).
9. Trabajo local, sin publicar ni reinstalar servicios.

## Estado (2026-10-26)
- **Inventario COMPLETADO** (commit 85ffe2ce): escáner v4 + barrido manual de estados con elipsis.
  - 2316 cadenas candidatas en 112 archivos canónicos (950 únicas). Datos: `.pi/inventory/en-strings3.json` + `INVENTARIO-ES.md`.
- **Triage de fallos con worktree HEAD** (`git worktree add /tmp/starnet-head HEAD`): 6 fallos PREEXISTENTES (fallan igual en HEAD limpio) asignados a subtareas futuras:
  - budget-caps + fallback-chain → MIS-23-3 (headers BUDGET/FALLBACK MODELS en settings de stationui).
  - agent-color-escape → MIS-23-2 (aria-label "Rename agent" en stationui).
  - workshop-toggle-ui → MIS-23-6 (toggle sin accessible name en build/workflowpanel).
  - journey-wiring → MIS-23-2 ("FIELD MANUAL › LINES"/"OPEN FLUJOS" en stationui).
  - slash.config → MIS-23-2/3/6 ("Could not set reasoning effort to" en build/places/stationui).
- **9 subtareas creadas** (hijas de MIS-23, proyecto 9739d80c):
  1. **a8c23b12 MIS-23-1 estados de canal + rail + COMMS + tests — EN CURSO**
  2. 772a614b MIS-23-2 stationui.js región 1 (agentes/skills)
  3. fe3223e0 MIS-23-3 stationui.js región 2 (settings/modelos/claves/voz/autonomía)
  4. 41ece128 MIS-23-4 app.js (sign-in/catálogo/COMMS/recuperación)
  5. 669bc888 MIS-23-5 chat.js + voice.js + voice-live.js
  6. abfb7fea MIS-23-6 build.js + workflowpanel.js + windows/
  7. 7ac1e310 MIS-23-7 marketplace/apps/outputbrowser/deliverables + resto
  8. 3e859024 MIS-23-8 demos + páginas de revisión + website/docs
  9. 56b4b9c8 MIS-23-9 suite global + verificación visual + ENTREGA final
- Rama: es/interfaz-espanol. Commits previos: 85ffe2ce (inventario), 22aa3c78 (checkpoint).

## MIS-23-1: trabajo completado en este slice (SIN COMMIT AÚN)
### Batch A — fuentes (7 archivos, node --check OK en todos):
- **channels.js**: 5 estados de canal → 'en línea' | 'conectando…' | 'pensando…' | 'trabajando…' | 'esperando tu aprobación…' (+statusOf default, addTool/addToolResult/setRunId/clear, comentarios).
- **chat.js**: presenceVerb (ESPERANDO TU RESPUESTA / ESPERANDO TU APROBACIÓN), classifier EN→ES (CONECTANDO/TRABAJANDO/PENSANDO), renderAgentBusy ('OCUPADO EN', 'VER EJECUCIÓN ACTIVA', 'AGENTE OCUPADO'), status() classifier por substring ES, syncStatus ('esperando tu aprobación…'/'pensando…'/'estación inalcanzable'/'en línea'), 'despertando…', 'esperando tu contexto…', 'esperando tu respuesta…', 'deteniendo…' (+ 'deteniendo… sin confirmar'), 'trabajando…' ×2, '¿En qué quieres trabajar?', placeholder 'responde para despertar a tu agente…', placeholder 'habla con tu agente · / comandos' (byte-identical a index.html L682 ✅).
- **app.js**: paintBridgeConnecting ('conectando…', 'CONECTANDO', 'COMMS conectando…'), paintBridgeUnavailable ('estación inalcanzable', 'ENLACE CAÍDO', 'COMMS no disponible — reconectando a la estación.'), online ('EN LÍNEA', 'en línea', '¿En qué quieres trabajar?'), railRowState (Trabajando/Conectando/tripulación · desconocido/N trabajando/la última ejecución falló/⚒ REVISAR/actividad sin leer/leído), railRowLabel (chat de grupo/actividad sin leer/Enter para abrir/Shift+F10 para acciones), railRowTip (archivado/tablero/última ejecución con/clic derecho/abrir esta sesión), aria-labels de sesiones de proyecto.
- **stationui.js**: LINE_TEST_TIP, pillFor (ENLACE CAÍDO/EN ESPERA/TRABAJANDO/PENSANDO/EN LÍNEA), crew status (EN CONVERSACIÓN/EN UN FLUJO/TRABAJANDO/EN ESPERA), agHead statusText (SIN LÍNEA/TRABAJANDO/PENSANDO/EN LÍNEA).
- **voice.js**: setStatus ×13 (en línea, modo de voz activado, 🔇 toca en cualquier parte…, modo de voz — pulsa 🎤…, ocupado — espera la respuesta, modo de voz — escuchando…, grabando — pulsa el micrófono…, transcribiendo…, hablando…, pulsa 🎙️ para reanudar…, micrófono no abrió, Entrada de voz en pausa…, micErrorText ×7, microphoneHelp ×3).
- **autosessions.js**: setStatus 'pensando…'.
- **stationcommands.js**: setStatus 'trabajando…'.

### Batch B — tests alineados (16 archivos):
channels, background-asks-ui, voice-live-ui, consent-visibility, comms-presence, comms-header-no-run-state, ask-cards-readable, comms-link-honesty, session-indicators, app-boot-provider-truth, delegated-threads (sin cambios), delegated-ledger-first-read (sin cambios), org-crew-comms, **line-test-stop** ('EN UN FLUJO'/'TRABAJANDO'/'EN ESPERA' + tip 'la vista TEST'), **state-truth-overlap** (regex 'TRABAJANDO' en agHead + crew labels ES), **harness.cancel-truth** (regex 'deteniendo… sin confirmar'/'en línea'), **voice.button** (regex 'bloqueado|permite', 'se puede alcanzar', 'Privacidad y seguridad').

### Espejo website sincronizado (7 archivos):
website/app/app/{channels,chat,app,stationui,voice,autosessions,stationcommands}.js == frontend/app/* (diff -q OK, incluido state-truth-overlap L50 mirror test).

### Pruebas ejecutadas (comando: `node test/<t>.test.js`):
- **PASS ×19**: channels, background-asks-ui, voice-live-ui, consent-visibility, comms-presence, comms-header-no-run-state, ask-cards-readable, comms-link-honesty, session-indicators, app-boot-provider-truth, delegated-threads, delegated-ledger-first-read, org-crew-comms, line-test-stop, state-truth-overlap, crew-rail-fit, hudmode, linewatch, tutorial-equipped-station, one-gutter, harness.cancel-truth, voice.button (22 en total).
- **FALLO PREEXISTENTE (no de este slice)**: `consent-full-request.test.js` — falla también en HEAD limpio (verificado con git stash): el botón 'Acceso total' está en ES pero su tip sigue en EN ('Give .+ full access…') y el receipt '✓ full access from your phone'. Pertenencia: **MIS-23-5** (consent cards en chat.js).
- Suite fast completa (1398 tests, `.pi/run-all-fast.mjs` colector) lanzada en segundo plano → `/tmp/full-fast.log` (PID 2215, estado al cierre: en curso; la puerta canónica `scripts/run-fast-tests.mjs` detuvo en paso 41/1398 por consent-full-request).
- `node --check` OK en los 7 archivos fuente cambiados.
- Consistencia verificada: 'OFFLINE' no aparece en ningún test (agHead 'SIN LÍNEA' seguro); 'speak to your agent' byte-identical entre chat.js e index.html.

## Decisiones
- Estados efímeros (nunca persisten en localStorage) → traducción sin migración.
- CSS usa clases (status-working, etc.), no texto → sin cambios CSS.
- Nombres de menú (WORK/AUTOMATE/WORKFLOWS/BUILD/TEST) se conservan EN dentro de tooltips hasta MIS-23-2/3.
- 'EN UN FLUJO' (no 'EN UN FLUJO DE TRABAJO') por economía en pill de crew.
- 'SIN LÍNEA' para OFFLINE de agHead (coherente con ENLACE CAÍDO).
- chat.js placeholder de entrevista: 'responde para despertar a tu agente…'.
- 'deteniendo… sin confirmado' → 'deteniendo… sin confirmar'.

## Archivos cambiados (25)
frontend/app/{channels,chat,app,stationui,voice,autosessions,stationcommands}.js
test/{channels,background-asks-ui,voice-live-ui,consent-visibility,comms-presence,comms-header-no-run-state,ask-cards-readable,comms-link-honesty,session-indicators,app-boot-provider-truth,org-crew-comms,line-test-stop,state-truth-overlap,harness.cancel-truth,voice.button}.test.js
website/app/app/{channels,chat,app,stationui,voice,autosessions,stationcommands}.js (espejo)

## Siguiente paso acotado (MIS-23-1, ≤120 s por comando)
1. Esperar a que termine el colector `.pi/run-all-fast.mjs` (PID 108 → `.pi/full-fast-rerun.log`).
2. Re-ejecutar SOLO la lista de FAIL del colector (lotes de ~8) para obtener el estado final limpio (el colector leyó archivos en estados mixtos durante mis ediciones).
3. Commit acotado: `git add` de los 7 fuentes + 15 tests + 7 espejo (NO `git add .`) → commit "MIS-23-1: estados de canal, rail, COMMS, presencia y voz en ES (+tests alineados +espejo website)".
4. Comentario Paperclip en MIS-23-1 (a8c23b12) con evidencia (tests PASS, 6-7 fallos preexistentes triados y asignados).
5. Marcar MIS-23-1 done y activar MIS-23-2 (772a614b).

## Pendiente
- MIS-23-2..9 en orden (una activa a la vez).
- Verificación visual: requiere app en ejecución (Tauri + sidecar); evaluar headless en MIS-23-9.
- consent-full-request.test.js → resolver en MIS-23-5 (tips/receipts de consent en ES).

## Herramientas auxiliares
- `.pi/run-all-fast.mjs`: colector de fallos para los 1398 tests fast (no detiene en el primero).
- `.pi/inventory/`: escáner v4 + datos JSON del inventario.
