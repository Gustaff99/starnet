# CHECKPOINT — MIS-23-5: chat.js / voice.js / voice-live.js (in_progress)

## Estado (corte de tramo 2026-10-26, 2º corte)
- MIS-23-5 activa (ID 669bc888-9d1f-4f8f-8abb-07fde780b90f), rama es/interfaz-espanol
- FUENTE: 92 reglas aplicadas vía .pi/translate/mis23-5e.py (chat.js 86, voice.js 1, voice-live.js 5). node --check OK en los 3 canónicos.
- ESPEJO: website/app/app/ re-sincronizado (cp + node --check OK en los 3).
- TESTS: 8 archivos actualizados (browser-chip-wait, comms-render-seams, comms-presence, notifications-useful, delegated-approve-reach, ask-cards-readable, thread-ux-regressions, dialogue-offer-yields).
- Resultado bounded-ui-tests lote 1:
  - PASS: browser-chip-wait, notifications-useful
  - FAIL: voice-live-ui (1 assert), comms-render-seams (4 asserts), comms-presence (1 assert)
  - Pendientes de ejecutar: delegated-approve-reach, ask-cards-readable, thread-ux-regressions, dialogue-offer-yields (lote 2 no corrió)

## Correcciones exactas pendientes (5, strings verificados)
1. frontend/app/chat.js L6744: `allowCustom: true, customLabel: 'edit the milestones', customPlaceholder: 'your milestones, separated by ; …'` → `allowCustom: true, customLabel: 'editar los hitos', customPlaceholder: 'tus hitos, separados por ; …'` (el script 5e la dejó fuera)
2. frontend/app/chat.js L3816: `if (wall - honest > 1500) bits.push(fmtMs(wall - honest) + ' waiting on you');` → `+ ' esperándote');`
3. test/comms-render-seams.test.js L83: REVERTIR mi cambio: `/s\.held \? ' · aún no se ejecuta' : ''/` → de vuelta a `/s\.held \? ' · not run yet' : ''/` (el "phone" es relay/app/app.js = FUERA de alcance MIS-23-5)
4. test/comms-render-seams.test.js L135: `['▸', 'denied']` → `['▸', 'denegada']`; L136: `'↳ fs_write · 54ms · denied','↳ fs_read · 3ms · failed'` → `'↳ fs_write · 54ms · denegada','↳ fs_read · 3ms · fallida'`
5. test/voice-live-ui.test.js L108: `/could not confirm this browser/.test(bare.tokenWithheld)` → `/no pudo confirmar que este navegador/.test(bare.tokenWithheld)`

## Siguiente acción (próximo tramo, en orden)
1. Aplicar las 5 correcciones (script Python tipo mis23-5e, strings exactos arriba)
2. node --check chat.js + cp espejo + node --check espejo
3. `bounded-ui-tests.py test/voice-live-ui.test.js test/comms-render-seams.test.js test/comms-presence.test.js --retry-reason 'correcciones 5e-f aplicadas'`
4. `bounded-ui-tests.py test/delegated-approve-reach.test.js test/ask-cards-readable.test.js test/thread-ux-regressions.test.js test/dialogue-offer-yields.test.js`
5. Barrido manual final (grep cadenas EN visibles en los 3 canónicos)
6. Commit acotado (frontend/app/{chat,voice,voice-live}.js, website/app/app/{...}, 9 test files)
7. Comentario Paperclip + done si todo verde

## Criterios MIS-23-5
- [x] Scanner: <40 candidatos → 6 (falsos positivos documentados)
- [ ] voice-live-ui + tests afectados en verde (4 de 7 suites verdes; 3 con fallos identificados)
- [x] Espejo sincronizado (pendiente re-sync si la corrección 1 toca chat.js)
- [x] node --check en los 6 archivos
- [ ] Barrido manual final

## Notas
- relay/app/app.js (phone) queda en EN para su propia subtarea; el test comms-render-seams lo verifica y debe seguir esperando 'not run yet' ahí.
- group-chat.js fuera de alcance (subtarea aparte).
- Los parsers de aprobación aceptan EN+ES; las cadenas habladas están en ES.
- Scripts: .pi/translate/mis23-5e.py (92 reglas), .pi/inventory/scan-en3.py + en-strings3.json
