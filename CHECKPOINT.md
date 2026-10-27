# CHECKPOINT — MIS-23 (traducción ES) · MIS-23-9 EN CURSO

## Estado (2026-10-27, tramo 17)
- Rama es/interfaz-espanol. MIS-23-8 cerrada (0ad1bd97).
- **MIS-23-9 EN CURSO**: suite global + verificación visual + entrega final

## Criterios verificados
- [x] Scanner v4: 5 strings restantes (falsos positivos) ✅
- [x] Espejo website/docs/ ↔ website-deploy/docs/ sincronizado ✅
- [x] lang="es" presente en todos los HTML ✅
- [x] Traducción de documentación (14 HTML) ✅
- [x] Traducción de UI strings (agent-station-demo, stationui, app.js, chat, voice, build, workflowpanel, windows) ✅
- [x] Traducción de SEND TO / OUTBOX strings (workflowline, workflowpanel, build, worldmodel, stationcommands, propsprites) ✅
- [x] Tests actualizados para matchingar strings ES ✅

## Tramo 17: Suite global (tests 240-350)

### Tests corregidos en este tramo:
1. build-mode-easy.test.js: 17 assertions → ES strings ✅ (140/140 PASS)
2. build-select-target.test.js: 4 assertions → ES strings ✅ (150/150 PASS)
3. checkpoint-stale-lock.test.js: 1 regex fix (path placeholder) ✅ (80/80 PASS)
4. class-loadouts.test.js: SAVE CHANGES → GUARDAR CAMBIOS ✅
5. comms-system-register.test.js: Spanish goal line + clamp 202→210 ✅
6. community-hide-until-live.test.js: 5 assertions (SOLO LA APARIENCIA, CONSTRUCCIONES COMPARTIDAS, COMPARTIR CON LA COMUNIDAD, MAPAS DE LA COMUNIDAD) ✅
7. connector-reliability-wiring.test.js: 7 assertions + translate Credential storage → Almacenamiento de credenciales ✅
8. consent-timer-hint.test.js: 2 assertions (from now on → de ahora en adelante) ✅

### Pendientes en suite global:
- conveyor-choices.test.js: ~10 fallos (strings SPLITTER/PLANNER/TEST en build.js/workflowpanel.js)
- conveyor-ease.test.js: ~5 fallos (BAY card, INBOX card strings)
- conveyor-first-line.test.js: ~3 fallos (footer TEST button, SAVE SCHEDULE)
- cli-dashboard-drive.test.js: timeout (60s+) - pre-existing, no related to translation
- Tests 350-1646: pendientes

### Commits de este tramo:
- 7f03cebf: build.js strings + 3 test files (22 assertions)
- 5f47c204: class-loadouts.test.js
- c6d1a69b: comms-system-register + community-hide-until-live
- adb0110c: connector-reliability-wiring + connectors.js heading
- 84c443dc: consent-timer-hint

## Pendiente
- [ ] Corregir conveyor-choices.test.js (~10 fallos)
- [ ] Corregir conveyor-ease.test.js (~5 fallos)
- [ ] Corregir conveyor-first-line.test.js (~3 fallos)
- [ ] Continuar suite global (tests 350-1646)
- [ ] Verificación visual de pantallas en ejecución
- [ ] Entrega final y cierre de MIS-23-9

## Reglas de oro
- website-deploy/ está en .gitignore → usar git add -f
- No reducir alcance para cerrar subtareas
- No cambiar tests para aceptar inglés pendiente
- Conservar identificadores, protocolos, APIs y anglicismos técnicos necesarios
- Exclusiones registradas con justificación
