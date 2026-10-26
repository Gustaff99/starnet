# CHECKPOINT — MIS-23-4: app.js (criterios cumplidos, pendiente cierre)

## Estado
- Subtarea activa: MIS-23-4 (app.js) — TODOS los criterios de traducción cumplidos
- Rama: es/interfaz-espanol
- Commits: 94a8e18b (lote A) + commit lotes B/C/D (este)

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
- [ ] Comentario Paperclip + cierre (done) o continuación

## Notas de terminología aplicadas
- WAKE→DESPERTAR, WAKING→DESPERTANDO, RESUME→REANUDAR, GENESIS→GÉNESIS
- START FRESH→EMPEZAR NUEVO, START COMPLETELY FRESH→EMPEZAR POR COMPLETO DESDE CERO
- bless→bendecir (coherente con el tono comisionar/tripulación de la app)
- harness, sidecar, slug, keychain, staging: anglicismos técnicos conservados

## Rojos conocidos (fuera de alcance MIS-23-4)
19 CDP/Chrome ambientales (requieren SKYNET_CHROME en host). Ver checkpoint MIS-23-3.

## Siguiente acción
Comentar en Paperclip MIS-23-4 con evidencia (commits, scanner, tests) y marcar
done; activar MIS-23-5 (chat/voice).

## Archivos clave
- frontend/app/app.js (traducido)
- website/app/app/app.js (espejo)
- .pi/inventory/scan-en3.py + en-strings3.json (scanner v3)
