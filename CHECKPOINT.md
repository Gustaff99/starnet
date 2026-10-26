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

## Estado (2026-10-26, cierre de ejecución)
- **MIS-23-1 CERRADA (done)** — commit `275dab2e`, 31 archivos, +338/−298. Comentario de evidencia en a8c23b12.
  - Evidencia final: 22 tests core PASS; suite fast completa (`.pi/full-final.log`) con **6 archivos fallantes, todos preexistentes** — re-verificados HOY en worktree limpio `22aa3c78` (/tmp/starnet-base2, todos FAIL idénticos): consent-full-request, budget-caps, fallback-chain, agent-color-escape, workshop-toggle-ui, journey-wiring. **Δ = 0 regresiones**.
  - El worktree comparador antiguo /tmp/starnet-head se perdió (tmp limpieza); la re-verificación por archivo sustituye la comparación de logs completos.
- **MIS-23-2 ACTIVADA (in_progress, asignada a mí)** — 772a614b-9bbd-486f-9812-f7ac289e614c.
  - Alcance: stationui.js L1600-4600 (panel de agentes, skills, market) + espejo website.
  - Criterio: escáner v4 <80 cadenas EN restantes en el rango; node --check OK; tests de skills/consent en verde; espejo sincronizado (diff -q).
  - Arrastra 2 fallos preexistentes de la región: `agent-color-escape` (aria-label "Rename agent") y `journey-wiring` ("FIELD MANUAL › LINES"/"OPEN FLUJOS" + subtítulo dock AUTOMATIZAR).
- **Progreso misión: 1/9 subtareas completas.**
- **Inventario COMPLETADO** (commit 85ffe2ce): 2316 cadenas candidatas en 112 archivos canónicos (950 únicas). Datos: `.pi/inventory/en-strings3.json` + `INVENTARIO-ES.md`.
- **Asignación de fallos preexistentes**: budget-caps + fallback-chain → MIS-23-3; agent-color-escape + journey-wiring → MIS-23-2 (ahora); workshop-toggle-ui → MIS-23-6; consent-full-request → MIS-23-5.
- **9 subtareas** (hijas de MIS-23, proyecto 9739d80c):
  1. ✅ a8c23b12 MIS-23-1 estados de canal + rail + COMMS + tests — **DONE**
  2. 🔵 772a614b MIS-23-2 stationui.js región 1 (agentes/skills) — **EN CURSO**
  3. fe3223e0 MIS-23-3 stationui.js región 2 (settings/modelos/claves/voz/autonomía)
  4. 41ece128 MIS-23-4 app.js (sign-in/catálogo/COMMS/recuperación)
  5. 669bc888 MIS-23-5 chat.js + voice.js + voice-live.js
  6. abfb7fea MIS-23-6 build.js + workflowpanel.js + windows/
  7. 7ac1e310 MIS-23-7 marketplace/apps/outputbrowser/deliverables + resto
  8. 3e859024 MIS-23-8 demos + páginas de revisión + website/docs
  9. 56b4b9c8 MIS-23-9 suite global + verificación visual + ENTREGA final
- Rama: es/interfaz-espanol. Commits: 85ffe2ce (inventario), 22aa3c78 (checkpoint), 275dab2e (MIS-23-1).

## Decisiones (acumuladas)
- Estados efímeros (nunca persisten en localStorage) → traducción sin migración.
- CSS usa clases (status-working, etc.), no texto → sin cambios CSS.
- Nombres de menú (WORK/AUTOMATE/WORKFLOWS/BUILD/TEST) se conservan EN dentro de tooltips hasta MIS-23-2/3.
- 'EN UN FLUJO' por economía en pill de crew. 'SIN LÍNEA' para OFFLINE de agHead.
- Comparación de regresiones por re-ejecución de los archivos fallantes en base limpia (más barato y equivalente a la diff de logs completa).

## Pendiente
- MIS-23-2 (activa) → 3..9 en orden (una activa a la vez).
- Verificación visual: requiere app en ejecución (Tauri + sidecar); evaluar headless en MIS-23-9.

## Herramientas auxiliares
- `.pi/run-all-fast.mjs`: colector de fallos para los tests fast (no detiene en el primero).
- `.pi/inventory/`: escáner v4 + datos JSON del inventario.
- Helper Paperclip: `bash /home/gus/.pi/agent/skills/paperclip/scripts/paperclip-issue-update.sh --issue-id <uuid> --status <s>` (comentario por stdin).
- Subtask UUIDs: 1=a8c23b12-bc8b-4987-a374-86e5be6cf864 · 2=772a614b-9bbd-486f-9812-f7ac289e614c · 3=fe3223e0-0327-454d-a973-c2202412b0de · 4=41ece128-cf97-4e82-8188-f5044e43d67b · 5=669bc888-9d1f-4f8f-8abb-07fde780b90f · 6=abfb7fea-ff12-4771-a8cc-cc3f3fe835fe · 7=7ac1e310-5776-4580-a015-de582805892e · 8=3e859024-26f0-451a-b79e-f3181d2f316e · 9=56b4b9c8-22db-48a3-81cf-a96e1178d1b0.

## Siguiente paso acotado (al despertar)
1. Recon de región 1: extraer del inventario (`.pi/inventory/en-strings3.json`) las cadenas EN de stationui.js L1600-4600; agrupar por panel (agentes vs skills/market).
2. Traducir el primer lote acotado (panel de agentes) + arreglar agent-color-escape ('Rename agent' → aria ES) y journey-wiring ('FIELD MANUAL › LINES', 'OPEN FLUJOS', subtítulo dock AUTOMATIZAR).
3. Sincronizar espejo website/app/app/stationui.js (diff -q).
4. Tests: agent-color-escape, journey-wiring + tests de skills/consent + node --check.
5. Commit acotado + comentario en MIS-23-2; si queda skills/market, continuar en el siguiente slice.
