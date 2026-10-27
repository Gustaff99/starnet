# CHECKPOINT — MIS-23-6: build.js / workflowpanel.js / windows/ (COMPLETADO)

## Estado (tramo 2026-10-27 09:15, CIERRE)
- Rama es/interfaz-espanol, subtarea MIS-23-6 **COMPLETADA**
- **build.js: TRADUCIDO** (commit 4c739aba + fix GIVE...A DESK en 669103ea)
- **workflowpanel.js: TRADUCIDO COMPLETO** — commit 7e94fc1f (L1-1900 en c685c098; L1901-2374 en 7e94fc1f con lotes c6 [88 reglas] + c7 [34 reglas]); fix GIVE...A DESK en 669103ea; node --check OK
- **windows/workflows.js: TRADUCIDO** (~90 cadenas EN→ES, commit 669103ea)
- **windows/connectors.js: REMANENTE TRADUCIDO** (L38 credential store, commit 669103ea)
- **windows/automation.js: TÍTULO TRADUCIDO** ('AUTOMATION'→'AUTOMATIZACIÓN', commit 669103ea)
- **windows/messaging.js, routines.js, loops.js: YA ESTABAN TRADUCIDOS** en misiones previas
- **EX_HEAD: CONSISTENTE** — 'IGUALA A ESTE EJEMPLO de un buen resultado...' en workflows.js + workflowpanel.js; regex en putStyleBack + exampleBrief actualizados
- **test/workflows-window.test.js: 133/133 PASS** (29 aserciones actualizadas a español)
- **Espejo website/app/app/: SINCRONIZADO** (diff -q OK)

## Misterio resuelto (importante para no repetir)
- `.pi/mis23-6c6.py` NO tiene lógica --dry: el argumento se ignora y SIEMPRE escribe al final. La "dry run" de 08:27 era una ejecución real que escribió el archivo (c6 completo, 88 reglas). La ejecución "real" posterior falló al releer el archivo ya traducido.
- Los scripts son atómicos SOLO si ninguna regla falla antes del write final: `rep()` aserta count y reemplaza en memoria; el write es la última línea.

## Próximos pasos (MIS-23-6 completada)
- **MIS-23-7**: resto app (archivos no cubiertos por MIS-23-1..6)
- **MIS-23-8**: demos + docs
- **MIS-23-9**: suite global + verificación visual + ENTREGA final

## Criterio de MIS-23-6
- <100 candidatas EN restantes en build.js+workflowpanel.js+windows/ (o todas visibles traducidas)
- Tests workflows-window en verde
- Espejo website/app/app/ idéntico (diff -q)
- node --check OK

## Evidencia
- git log: 7e94fc1f (workflowpanel c6+c7), c685c098 (L1-1900), 4c739aba (build.js)
- node --check workflowpanel.js OK (08:29)
- c6 OK: 88 reglas; c7 OK: 34 reglas
- automation.js: 1 regla editada

## Método (conservar)
- Scripts .py atómicos (assert count → replace en memoria → write al final)
- VERIFICAR siempre el patrón contra el JS real (grep/cat -A) antes de aplicar; los bordes de comillas importan (`')>"` ≠ `')>`)
- Terminología establecida: ENTREGABLES=DELIVERABLES, SHIPPED/DOES/HANDS OFF/OUTBOX/BAY/BAHÍA en inglés, WORKFLOWS=nombre de producto, TO REVIEW=POR REVISAR, LAST JOBS=ÚLTIMOS TRABAJOS
- El escáner .pi/inv-wins.py tiene ruido (falsos positivos); filtrar a mano
