# CHECKPOINT — MIS-23: Traducción completa de la interfaz visible de starnet-es

## Objetivo
Traducir al español toda la interfaz visible de starnet-es (frontend + espejo website + contratos de test), conservando identificadores, protocolos, APIs y anglicismos técnicamente necesarios.

## Estado (2026-10-26, cierre de ejecución — MIS-23-2 COMPLETA)

### Completado en esta ejecución (MIS-23-2, cierre)
- Corregida la última aserción de `abilities.skills-lane.test.js` ('Could not load' → 'No se pudo cargar', L113): el catch de `loadSkillLibrary` renderiza 'No se pudo cargar la biblioteca de habilidades — ¿está funcionando el sidecar?'.
- 4 tests de la región en verde: agent-color-escape (15), journey-wiring (23), autonomy-ui (23), abilities.skills-lane (133). `node --check` stationui.js + tutorial.js OK.
- Espejo website/app/app/stationui.js re-sincronizado (la sync anterior era anterior al slice 2b; ahora `diff -q` idéntico).
- Escáner v4 (frontend completo): 1017 candidatos brutos, de los cuales 215 en stationui.js — el residuo es falsos positivos (datos dinámicos `esc(...)`, atributos `data-tip=`, fragmentos de template).
- **Commit b8b52818**: stationui.js (slice 2a+2b), tutorial.js, 3 contratos de test, espejo, en-strings3.json. 7 archivos, +859/−8653.

### MIS-23-2 (772a614b): DONE
Criterios cumplidos: región 1 (L1600-4600) traducida, tests de la región en verde, espejo sincronizado, evidencia registrada.

## Criterios de misión
1. Inventario ANTES de cambios. ✅ (commit 85ffe2ce)
2. Subtareas acotadas, una activa. ✅ (9 creadas; siguiente: MIS-23-3)
3. Menús/botones/estados/diálogos/errores/ayuda/accesibilidad traducidos. 🔵 en curso
4. Identificadores/protocolos/APIs/anglicismos conservados. ✅ (STATION XP, Memory Core, sidecar, nombres de menú en tooltips)
5. Sin reducción de alcance; tests no cambian para aceptar inglés. ✅
6. Exclusiones documentadas. 🔵 (INVENTARIO-ES.md)
7. Tests relevantes en verde. 🔵
8. Revisión visual en ejecución (o bloqueador declarado). ⬜ (MIS-23-9)
9. Trabajo local, sin publicar. ✅

## Decisiones acumuladas
- Estados efímeros → traducción sin migración.
- CSS usa clases, no texto → sin cambios CSS.
- Nombres de menú (WORK/AUTOMATE/WORKFLOWS/BUILD/TEST) en EN dentro de tooltips hasta MIS-23-3.
- 'EN UN FLUJO' (crew pill), 'SIN LÍNEA' (OFFLINE agHead), 'ASPECTO' (SKIN), 'KUDOS' y 'STATION XP' como anglicismos.
- Memory Core / sidecar en EN.
- Comparación de regresiones por re-ejecución de archivos fallantes en base limpia.

## Asignación de fallos preexistentes
- agent-color-escape + journey-wiring → MIS-23-2 ✅ (hecho)
- abilities.skills-lane → MIS-23-2 ✅ (hecho; NO era preexistente: lo causaba el slice 2b no commitado)
- budget-caps + fallback-chain → MIS-23-3
- consent-full-request → MIS-23-5
- workshop-toggle-ui → MIS-23-6

## 9 subtareas (hijas de MIS-23, proyecto 9739d80c)
1. ✅ a8c23b12 MIS-23-1 — DONE (commit 275dab2e)
2. ✅ 772a614b MIS-23-2 stationui.js región 1 — DONE (commit b8b52818)
3. 🔵 fe3223e0 MIS-23-3 región 2 (settings/modelos/claves/voz/autonomía) — SIGUIENTE
4. 41ece128 MIS-23-4 app.js
5. 669bc888 MIS-23-5 chat.js + voice.js + voice-live.js
6. abfb7fea MIS-23-6 build.js + workflowpanel.js + windows/
7. 7ac1e310 MIS-23-7 marketplace/apps/outputbrowser/deliverables
8. 3e859024 MIS-23-8 demos + páginas de revisión + website/docs
9. 56b4b9c8 MIS-23-9 suite global + verificación visual + ENTREGA

## Herramientas auxiliares
- `.pi/run-all-fast.mjs`: colector de fallos fast (no detiene en el primero).
- `.pi/inventory/scan-en3.py` + `en-strings3.json`: escáner v4 (uso: `python3 .pi/inventory/scan-en3.py frontend`; añadir `website/app` incluye el espejo). El JSON es una LISTA de {file,line,sink,text}.
- Helper Paperclip: `bash /home/gus/.pi/agent/skills/paperclip/scripts/paperclip-issue-update.sh --issue-id <uuid> --status <s>`.
- Comentario: `POST /api/issues/:issueId/comments` con Bearer + X-Paperclip-Run-Id.
- Helper continuación: `python3 /home/gus/paperclip-stack/continue-task.py`.

## Siguiente paso acotado (al despertar — MIS-23-3, fe3223e0)
1. Extraer del escáner las cadenas EN de la región 2 de stationui.js (settings/modelos/claves/voz/autonomía; L4600+ y la franja no cubierta por MIS-23-2).
2. Traducir en lotes; `node --check` tras cada lote.
3. Alinear tests preexistentes de la región: budget-caps + fallback-chain.
4. Sincronizar espejo website/app/app/stationui.js (diff -q).
5. Tests afectados + commit acotado + comentario en MIS-23-3; al cumplir TODOS los criterios → done.

Rama: es/interfaz-espanol. Commits: 85ffe2ce (inventario), 22aa3c78 (checkpoint), 275dab2e (MIS-23-1), b1943a68 (checkpoint), 86959e12 (checkpoint repair), 72919431 (checkpoint disposición), b8b52818 (MIS-23-2).
