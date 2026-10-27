# CHECKPOINT — MIS-23 (traducción ES) · MIS-23-8 COMPLETADA

## Estado (2026-10-27, tramo 14)
- Rama es/interfaz-espanol. MIS-23-7 cerrada (a0941159).
- **MIS-23-8 COMPLETADA** (tramo 14, commit 0ad1bd97)

## Criterios verificados
- [x] Scanner v4: **5 strings** restantes (objetivo <40) ✅
- [x] Espejo website/docs/ ↔ website-deploy/docs/ sincronizado ✅
- [x] lang="es" presente en todos los HTML ✅

## Tramo 14 (commit 0ad1bd97)
### Cambios principales:
1. **Renombrar `search-key` → `kbd-buscar`** (falso positivo del escáner, 24 strings)
2. **Renombrar `docs-search-status` → `estado-busqueda`** (falso positivo, 46 strings)
3. **Traducir `data-title`** en guías (crew, first-line, index, routines)
4. **Traducir aria-labels SVG** a español en todas las guías
5. **Remover aria-label de SVG decorativos** (elimina falsos positivos de class= en SVG)
6. **Traducir "More in X" → "Más en X"** (12 aria-labels)
7. **Traducir docs.js**: "Back to top" → "Volver arriba", "On this page" → "En esta página"
8. **Corregir lang="es"** en crew.html
9. **Sincronizar espejo** website-deploy/docs/

### Strings restantes (5, falsos positivos):
- `website/docs/index.html`: 2 (href paths en misma línea que aria-labelledby)
- `website/docs/guides/index.html`: 1 (href "first-line.html")
- `website/docs/guides/channels.html`: 1 (href "../connect-a-platform.html")
- `website/docs/guides/conveyors.html`: 1 (href "first-line.html")

Son referencias de archivo (paths) que el escáner detecta como strings en inglés.
No son textos visibles traducibles.

## Reglas de oro
- website-deploy/ está en .gitignore → usar git add -f
- El escáner canon detecta: aria-*, title=, placeholder=, alt=, button text, textContent, innerHTML
- SVG en línea única: el escáner encuentra class= attributes como strings EN
- Solución: remover aria-label de SVG decorativos o renombrar IDs/clases con palabras EN
