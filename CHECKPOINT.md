# CHECKPOINT — MIS-23-4: app.js (DONE) → siguiente MIS-23-5

## Estado
- MIS-23-4 (app.js): **done** en Paperclip (comentario e9f598f2 con evidencia)
- Rama: es/interfaz-espanol
- Commits: 94a8e18b (lote A) + 0e36ee3c (lotes B/C/D + sueltos)
- Siguiente subtarea: MIS-23-5 (chat/voice) — activar en la próxima ejecución

## Criterios de MIS-23-4
- [x] Lote A: model catalog + sign-in (L1700-2560) — commit 94a8e18b
- [x] Lote B: StarNet linking + keys + recovery (L2635-3311)
- [x] Lote C: projects region (L4425-5265)
- [x] Lote D: updates + recovery (L5453-5906)
- [x] Strings sueltos: BROWSER_HINT, Claude CLI, placeholders de búsqueda,
      staging recovery, title "project actions" (L5080)
- [x] node --check OK (frontend + espejo)
- [x] Rescan: 112 → 4 candidatos; los 4 son falsos positivos:
      - L40 'status-connecting' (id de máquina, no visible)
      - L2186 'loading models…' (comentario de código)
      - L4425 / L5080 fragmentos dinámicos de aria-label (texto real ya en ES)
- [x] Tests: line-sendto 1/1, needs-you* 6/6 (needs-you, rail-fit, fold,
      bell-settle, one-list, loop-review-needs-you)
- [x] Espejo website/app/app/app.js sincronizado (cp + node --check)
- [x] Comentario Paperclip (e9f598f2) + status done

## Notas de terminología aplicadas
- WAKE→DESPERTAR, WAKING→DESPERTANDO, RESUME→REANUDAR, GENESIS→GÉNESIS
- START FRESH→EMPEZAR NUEVO, START COMPLETELY FRESH→EMPEZAR POR COMPLETO DESDE CERO
- bless→bendecir (coherente con el tono comisionar/tripulación de la app)
- harness, sidecar, slug, keychain, staging: anglicismos técnicos conservados

## Rojos conocidos (fuera de alcance MIS-23-4)
19 CDP/Chrome ambientales (requieren SKYNET_CHROME en host). Ver checkpoint MIS-23-3.

## Siguiente acción (próxima ejecución)
1. Checkout MIS-23-5 (chat/voice) y marcar in_progress.
2. Correr scanner sobre frontend/app/chat.js + voice para dimensionar lotes.
3. Traducir por lotes con el mismo método (script Python, exact replacements,
   count assertions); node --check + rescan + tests pertinentes por lote.

## Archivos clave
- frontend/app/app.js (traducido)
- website/app/app/app.js (espejo)
- .pi/inventory/scan-en3.py + en-strings3.json (scanner v3)
