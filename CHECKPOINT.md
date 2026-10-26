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
  - **2316 cadenas candidatas en 112 archivos canónicos** (950 únicas). Datos: `.pi/inventory/en-strings3.json` + `INVENTARIO-ES.md`.
  - P1 frontend/app: 1736 · P2 frontend html/demos: 288 · P3 website/docs: 145 · P3 website otros: 13.
  - Top: stationui.js 526, app.js 240, workflowpanel.js 168, build.js 154, agent-station-demo.html 148, marketplace.js 130, chat.js 120, windows/workflows.js 72, windows/connectors.js 52, apps.js 40.
  - **Estados de canal (channels.js)** confirmados: 'online' | 'connecting…' | 'thinking…' | 'working…' | 'awaiting your approval…' (L49-152) + estados de voz/trabajo/conector en inglés repartidos por el app (ver INVENTARIO-ES.md §maquinarias).
  - Limitación del escáner: fragmentos de innerHTML y clases CSS pueden dar falsos positivos; cada línea se verifica al traducir.
- **9 subtareas creadas** (hijas de MIS-23, proyecto 9739d80c-c9eb-4e0e-856b-bb2c6c038f6a):
  1. a8c23b12 MIS-23-1 estados de canal + rail + COMMS + 7 tests
  2. 772a614b MIS-23-2 stationui.js región 1 (agentes/skills)
  3. fe3223e0 MIS-23-3 stationui.js región 2 (settings/modelos/claves/voz/autonomía)
  4. 41ece128 MIS-23-4 app.js (sign-in/catálogo/COMMS/recuperación)
  5. 669bc888 MIS-23-5 chat.js + voice.js + voice-live.js
  6. abfb7fea MIS-23-6 build.js + workflowpanel.js + windows/
  7. 7ac1e310 MIS-23-7 marketplace/apps/outputbrowser/deliverables + resto
  8. 3e859024 MIS-23-8 demos + páginas de revisión + website/docs
  9. 56b4b9c8 MIS-23-9 suite global + verificación visual + ENTREGA final
- Rama: es/interfaz-espanol. Commits de MIS-23: 85ffe2ce (inventario).

## Decisiones
- El escáner exige 2+ palabras inglesas fuertes o palabra única curada, sin acento español ni palabras funcionales ES; estados con elipsis se capturan con barrido complementario.
- website/app/* se trata como espejo: se traduce la fuente frontend y se sincroniza (diff -q).
- Prioridad: P1 app/ → P2 demos → P3 docs; estados de canal primero (gap conocido de MIS-22, contrato de tests dividido).

## Pruebas
- node --check OK en los js existentes (sin cambios de código todavía, solo inventario).
- bounded-ui-tests.py 10/10 verde desde MIS-22 (línea base).

## Siguiente acción
Ejecutar MIS-23-1 (a8c23b12): traducir los 5 estados de canal en channels.js + su render en rail/COMMS/tooltips y alinear los 7 tests divididos a la forma ES. Lote máx. 8 archivos.

## Pendiente
- MIS-23-1..9 en orden (una activa a la vez).
- Verificación visual: requiere app en ejecución (Tauri + sidecar); evaluar headless en MIS-23-9.
