# CHECKPOINT — MIS-23-5: chat.js / voice.js / voice-live.js (done)

## Estado (cierre 2026-10-26)
- MIS-23-5 COMPLETA (ID 669bc888-9d1f-4f8f-8abb-07fde780b90f), rama es/interfaz-espanol
- Commits: e8a7137a (92 reglas) → c208fadf (cierre: card labels, wait lines, voice route, consent card + 10 tests)

## Criterios — todos cumplidos
- [x] Scanner: 6 candidatos en canónicos (<40), todos falsos positivos documentados:
      chat.js L2212 'data-tip' (nombre de atributo), L4263 'use your judgment' (contrato con host; botón visible 'Usa tu criterio'),
      L5097/5265 '▸ abrir TO REVIEW' (nombre de terminal), voice-live.js L396/1766 'ASR/VOZ' (acrónimos técnicos)
- [x] 13 suites en verde sobre el código actual (--final): browser-chip-wait, notifications-useful, voice-live-ui,
      comms-render-seams, comms-presence, comms-wait-line, voice-chat-route, stop-reason,
      task-postconditions-ui, delegated-approve-reach, ask-cards-readable, thread-ux-regressions, dialogue-offer-yields
- [x] Espejo website/app/app/ idéntico (diff -q en los 3)
- [x] node --check OK en los 6 archivos (3 fuente + 3 espejo)
- [x] Barrido manual final: sin cadenas EN visibles nuevas

## Decisiones clave (cierre)
- Etapas de voz approvalCommand (voice-live.js): 'Aprobada una vez.' / 'Permiso permanente.' / 'Denegada.' /
  'No pude enviar esa respuesta…' / 'Esa aprobación ya no está esperando.' — tests thread-ux-regressions y delegated-approve-reach
  actualizados a esas cadenas exactas (fixture sin Chat.consentPhrase → about='.').
- clarifyRow (chat.js): 'NOVA pregunta', 'Por qué NOVA pregunta', 'Enviando tu respuesta…' — ask-cards-readable actualizado.
- waitNoteText (chat.js): reintento/retroceso/esperando/conectando + WAIT_REASONS_ES (sobrecarga, error del servidor, tiempo agotado).
- Voice route (chat.js + sidecar/voice-chat-route.js): VOICE_ROUTE_REASONS en ES en ambos lados; test/voice-chat-route.test.js verde.
- retireConsentCard: '■ la ejecución terminó antes de la respuesta — nada se aprobó', '■ ya no espera tu respuesta'.
- Etiquetas de resultado: ■ EJECUCIÓN COMPLETA / DETENIDA / FALLIDA / RECORTADA / VERIFICACIÓN REQUERIDA / DETENIDA POR TI (ESC).
- phone (relay/app/app.js) sigue en EN: fuera de alcance de MIS-23-5 (comms-render-seams lo verifica).
- .pi/inventory/en-strings3.json restaurado a inventario completo (1314 entradas) con el escáner correcto
  (python3 .pi/inventory/scan-en3.py frontend website/app — sin args da 0, bug de invocación documentado).

## Próximos pasos (misión MIS-23)
- MIS-23-6: build/workflow/windows (frontend/app/windows/*)
- MIS-23-7: resto de frontend/app (briefing, userprops, modeldock, needsyou, projection-audit-panel, …)
- MIS-23-8: demos/docs
- MIS-23-9: suite global + verificación visual

## Notas de scripts
- .pi/translate/mis23-5e.py (92 reglas), .pi/translate/mis23-5g.py (46 reglas cierre) — ambos commitados
- .pi/inventory/scan-en3.py + en-strings3.json (inventario)
