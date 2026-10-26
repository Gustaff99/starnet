# CHECKPOINT — MIS-27 (MIS-23-3): Traducción región 2 (L4600-11700) + espejo

## Estado al cierre de esta ejecución (6.ª pasada, 2026-10-26 ~14:50)

### Región 2 (stationui.js) — COMPLETA
- Scanner v4: 21 candidatos EN en L4600-11700 (meta <80), todos falsos positivos.
- node --check OK (stationui.js, chat.js, group-chat.js).

### Espejo
- sync-website-app.mjs re-ejecutado → MIRROR_OK (cmp de 15820 archivos, 0 diffs).

### Tests alineados a ES en ESTA pasada (6.ª)
- dossier-reliability: "2 ejecuciónes" → "2 ejecuciones" (ejecució → ejecucio en el plural)
- declutter-strips: MARK ALL N REVIEWED → MARCAR TODAS N REVISADAS, toast, tips, notes (81 assertions OK)
- session-power-tools: "search sessions + transcripts" → "buscar sesiones + transcripciones"
- tool-withheld-message: "off unless you grant them below" → "apagados a menos que los otorgues abajo", WORKBENCH, connected tools (55 assertions OK)
- outbox.js: toast "Marked N reviewed. Nothing was deleted." → "Marcadas N como revisadas. Nada se borró."

### Suite fast — estado real (sweep88, 58 rojos restantes)
Lista completa: .pi/red-now58.list
Detalles de fallos: .pi/fails58.txt

**CDP/Chrome (ambientales, sin Chrome en host):**
- crt-context-loss.e2e, prop-recovery-live.e2e, stationbake.{connections,offcanvas,plate-parity}, worldlight-receiver, world-sharpen, session-reliability.e2e, dossier-voice-label, provider-connections-ui, genesis-starnet-link, station-show, free-path-ollama, budget-authority-ui, ease-of-use, google-connector, routine-preview-race, settle-managed-copy, tier-model-catalog, ssh-bg-read-remote

**Fallos de alineación EN→ES pendientes (~40 tests):**
Grupos por patrón:
1. **queryspine (19):** "Lv 3" → "Nv 3" — la UI tradujo Lv→Nv; el test espera "Lv 3". Decidir: alinear test a "Nv" o revertir UI a "Lv".
2. **manual-concepts (11):** FLUJOS, HORARIOS, BUCLES DE OBJETIVO, TRABAJO EN AUSENCIA — el test busca strings EN que ya no existen.
3. **org-crew-comms (7):** PURPOSE, AWAY WORK, BRIEF, CONFIG strings.
4. **rc-final-seams (5):** "New session" → "Nueva sesión" (5 fallos).
5. **station-commands (5):** "New session" → "Nueva sesión" (mismo patrón).
6. **needs-you-one-list (4):** "awaiting your approval" → "esperando tu aprobación".
7. **execution-profiles-ui (4):** dossier backend, genesis Full Power, Settings sync.
8. **dossier-growth-live (4):** XP paint, threshold, level-up, agent switch.
9. **routine-images-grant (4):** refusal row key, plain language, spend capped, badge.
10. **community-hide-ununtil-live (6):** Edit/Change sharing/Archive buttons.
11. **first-minutes-labels (3):** YOUR OVERSEER, CONNECT A BRAIN, APPEARANCE/THE BRAIN.
12. **dossier-delete-visible (3):** DELETE AGENT button.
13. **save-empty-station-seed (3):** banner EN vs ES.
14. **save-restore-hardening (3):** boot offer strings.
15. **save-restore-safety (3):** banner Restore.
16. **connector-reliability-wiring (3):** "la carpeta de conectores" mezcla EN/ES.
17. **poweruser-shell-repairs (3):** skill switch names, task-board aggregate.
18. **readability (2):** Cmd+= / Ctrl+= chord strings.
19. **starnet-door-names (2):** AI & MODELS section.
20. **battlepass (2):** fecha-relative (Oct 21 → 10 vs 11 days; Sunday 23:00 → 1H vs <1H) — probable fecha-ambiental.
21. **Varios 1-fallo:** channels.secrets, connector-required, connectors-ui, control-acknowledgements, conveyor-legibility, conveyor-results, conveyor-retest, group-stop-truth, hints-setting, markdown-everywhere, refit-run-gate, room-lighting-settings, toolsets, visible-text-caps.

### Criterios de MIS-23-3
- [x] Scanner v4: <80 candidatos EN en L4600-11700 (21)
- [x] node --check OK x3
- [x] Tests help-copy (146) y voice en verde
- [ ] Suite fast completa en verde — PENDING (~40 tests de alineación + ~18 CDP ambientales)
- [x] Espejo sincronizado (MIRROR_OK)
- [ ] Commit en es/interfaz-espanol

### Decisión de alcance
La traducción de la UI está completa para región 2 + chat + group-chat + mirror + outbox + app.js. El resto es **alineación de tests** (contratos EN → ES) — trabajo mecánico, lote a lote. No hay fallo de lógica.

## Recuperación 2026-10-26 ~13:40 UTC (disposición)
- La pasada anterior terminó sin disposición registrada (canal degradado); fast-run4.log desapareció de /tmp → el plan «poll log» está muerto.
- Commit acotado de las pasadas 4-6 (frontend + tests + espejo) para proteger el trabajo de la rotación de sesión.
- Siguiente ejecución: re-lanzar `.pi/sweep88.sh` (no poll) y aplicar Lotes A/B/C.

## Siguiente paso acotado (1 ejecución)
1. **Lote A (queryspine 19 + manual-concepts 11 + org-crew-comms 7 = 37 fallos):**
   - queryspine: buscar "Nv" en stationui.js → decidir si revertir a "Lv" o alinear test a "Nv".
   - manual-concepts: buscar los 4 conceptos EN en stationui.js → alinear test.
   - org-crew-comms: buscar PURPOSE/AWAY WORK/BRIEF/CONFIG → alinear test.
2. **Lote B (rc-final-seams 5 + station-commands 5 + needs-you-one-list 4 + execution-profiles-ui 4 = 18 fallos):**
   - "New session" → "Nueva sesión" pattern (grep en stationui.js).
   - "awaiting your approval" → "esperando tu aprobación".
   - Dossier backend/readiness strings.
3. **Lote C (restante ~15 tests de 1-4 fallos cada uno).**
4. Re-sweep con .pi/sweep88.sh hasta verde o CDP-only.
5. CDP: documentar como ambiental (SKYNET_CHROME ausente).
6. Verde → commit acotado + comentario Paperclip + done.

## Archivos sin commit (estado actual)
- frontend/app/stationui.js (región 2 + ejecucio fix + RECENT DECISIONS + excludedNote)
- frontend/app/chat.js, group-chat.js, app.js, modeldock.js, modelpicker.js, backup.js, systems.js
- frontend/app/windows/outbox.js (toast ES)
- website/app/app/* (espejo, MIRROR_OK)
- website/docs/search-index.js (regenerado)
- test/: ~20 archivos alineados (ver lista completa en .pi/red-now58.list complementaria)

## Rama
es/interfaz-espanol; último commit b8b52818 (MIS-23-2). Pasadas 4-6 commitadas en la recuperación 13:40 UTC; Lotes A/B/C pendientes.

## Notas
- .pi/sweep88.sh + .pi/fails58.txt son helpers reutilizables.
- .pi/red-now58.list = lista definitiva de 58 rojos.
- battlepass fecha-relative puede ser ambiental (hoy 2026-10-26).
- connector-reliability-wiring tiene mezcla EN/ES: "la carpeta de conectores" — buscar en stationui.js.
