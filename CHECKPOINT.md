# CHECKPOINT — MIS-23-6: build.js / workflowpanel.js / windows/ (in_progress)

## Estado (tramo 2026-10-26, cierre)
- Rama es/interfaz-espanol, subtarea MIS-23-6 (ID 105e14dc-469a-45d8-bba5-70a56cc761a4) in_progress
- build.js: TRADUCIDO (122 reglas mis23-6b.py + 9 mis23-6e.py + 21 mis23-6f.py), node --check OK
- workflowpanel.js: LOTES c, c2, c3 APLICADOS (node --check OK); LOTE c4 EN CURSO
  - c4 (.pi/translate/mis23-6c4.py): cubre L1000-1340 (rtRows, paintTrigger, projectSection, ltRowHtml, ltFormHtml, ltSectionHtml)
  - Estado c4: casi todo encaja; ÚLTIMA regla pendiente de fix: `((t.config && t.config.path) || 'a folder')` —
    el JS real (L1267) usa comillas tipográficas “ ” alrededor de t.name, así que la regla debe partirse en dos:
    `rep("|| 'a folder')", "|| 'una carpeta')")` y `rep(": '(unnamed)')", ": '(sin nombre)'")`
  - fix-c4d.py está escrito para aplicar ese fix; SI NO se ejecutó antes del cierre, ejecutar `python3 .pi/translate/fix-c4d.py` y luego `python3 .pi/translate/mis23-6c4.py`

## Pendiente en el próximo tramo
1. `python3 .pi/translate/fix-c4d.py && python3 .pi/translate/mis23-6c4.py && node --check frontend/app/workflowpanel.js`
2. workflowpanel.js L1340-1900 (editor de pasos: stepForm, stepRows, delete, drag, brief, etc.) — nuevo lote c5
3. windows/: workflows.js (36), connectors.js (26), routines.js (3), loops.js (2), automation.js (1), messaging.js (1)
4. Sincronizar espejo website/app/app/ (diff -q)
5. Tests workflows-window (bounded-ui-tests.py)
6. Commit MIS-23-6

## Criterio de MIS-23-6
- <100 candidatas restantes en build.js+workflowpanel.js+windows/ (o todas visibles traducidas)
- Tests workflows-window en verde
- Espejo idéntico
- node --check OK en los archivos

## Notas de método (lecciones de este tramo)
- Los patrones con comillas dobles internas en JS: en el .py usar string doble con \" — VERIFICAR siempre contra el JS real antes de aplicar (eval del arg + count)
- `·` es U+00B7 en ambos lados; `’` U+2019 literal
- L1267 workflowpanel: comillas tipográficas “ ” (U+201C/D) para el nombre, no straight
- limField firma real: limField(id, key, label, value, min) — 5 args
- trg-prompt (no trg-task) es el id del textarea de tarea
- armSet (no armed) es la condición de la nota de programación
- 'max stages after the first' aparece 2× (L320 comment + L1129)

## Próximos commits
- build.js + workflowpanel.js + windows/ → commit MIS-23-6 (build.js y workflowpanel c/c2/c3 ya en working tree)
