# CHECKPOINT — MIS-23 (traducción ES) · MIS-23-8 en progreso

## Estado (2026-10-27, tramo 13)
- Rama es/interfaz-espanol. MIS-23-7 cerrada (a0941159).
- **MIS-23-8 EN PROGRESO** (tramo 13): docs de usuario parcialmente traducidos.

## Tramo 13 (commit 8800e6f0)
- 14 archivos de docs en website-deploy/docs/ + espejo website/docs/
- Navegación lateral/superior: ES ✅
- Headers/footers: ES ✅
- Títulos (h1), subtítulos (doc-sub), pagers: ES ✅
- getting-started.html: cuerpo completo traducido ✅
- agents.html: cuerpo parcialmente traducido (secciones principales)
- station/providers/autonomy/help/troubleshooting/shortcuts/glossary/connectors/connect-a-platform/skills/migrating: nav+headers ES, cuerpo EN (pendiente)

## Pendiente MIS-23-8 (próximo tramo)
1. **Traducir cuerpo de docs** (12 archivos con body EN):
   - station.html, providers.html, autonomy.html, help.html, troubleshooting.html
   - shortcuts.html, glossary.html, connectors.html, connect-a-platform.html
   - skills.html, migrating.html, agents.html (secciones restantes)
2. **Guías** (website-deploy/docs/guides/*.html): ~10 archivos con contenido EN
3. **agent-station-demo.html**: página de demo (992 líneas, EN) — traducir o sincronizar con index.html
4. **Páginas prop-*** (developer tools): decidir si traducir o excluir
5. **Sincronizar espejo** website/docs/ tras cada lote

## Criterios MIS-23-8
- [ ] Traducción completa de textos visibles en demos y docs
- [ ] Preservación de código, identificadores y términos técnicos
- [ ] Espejos sincronizados
- [ ] node --check / validación HTML si aplica

## Reglas de oro
- Reglas de reemplazo: copiar texto EXACTO de grep/sed
- website-deploy/ está en .gitignore → usar git add -f
- El escáner canon subestima: falsos positivos en CSS/JS
- No traducir: brand names, código, URLs, términos técnicos (API, MCP, COMMS, etc.)
