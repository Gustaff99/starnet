#!/usr/bin/env python3
"""Third pass: remaining English strings in connectors.js."""

path = 'frontend/app/windows/connectors.js'
src = open(path, encoding='utf-8').read()

# Tab labels + descriptions
src = src.replace(
    "label: 'BUILT-IN ABILITIES', glyph: '▤', desc: 'The list shows what the agent you pick can use, but each switch turns a built-in ability on or off for every agent; CHECK WITH ME and LET IT WORK obey the switches, FULL POWER overrides them. Connected services still need working credentials.'",
    "label: 'HABILIDADES INTEGRADAS', glyph: '▤', desc: 'La lista muestra lo que el agente elegido puede usar, pero cada interruptor activa o desactiva una habilidad integrada para todos los agentes; COMPROBAR CONMIGO y DEJARLO TRABAJAR obedecen los interruptores, PODER TOTAL los anula. Los servicios conectados siguen necesitando credenciales válidas.'"
)
src = src.replace(
    "label: 'COMPUTER CONTROL', glyph: '▣', desc: 'Choose how agents interact with native desktop apps. Full Power or a paired remote-owner lease is required.'",
    "label: 'CONTROL DE ORDENADOR', glyph: '▣', desc: 'Elige cómo interactúan los agentes con las apps nativas de escritorio. Se necesita Poder Total o un arrendamiento de propietario remoto emparejado.'"
)
src = src.replace(
    "label: 'EXTENSIONS', glyph: '⌥', desc: 'Automate a step or extend StarNet with your own code.'",
    "label: 'EXTENSIONES', glyph: '⌥', desc: 'Automatiza un paso o amplía StarNet con tu propio código.'"
)
src = src.replace("label: 'INSTALLED'", "label: 'INSTALADO'")
src = src.replace("label: 'DISCOVER'", "label: 'DESCUBRIR'")
src = src.replace("label: 'CREATE / ADVANCED'", "label: 'CREAR / AVANZADO'")

# Extensions section
src = src.replace("done = 'Command added.'", "done = 'Comando añadido.'")
src = src.replace(
    "done = 'Plugin created and its window opened. Find its code under Details & code.'",
    "done = 'Plugin creado y su ventana abierta. Encuentra su código en Detalles y código.'"
)
src = src.replace(
    "done = 'Plugin created. Find its code under Details & code.'",
    "done = 'Plugin creado. Encuentra su código en Detalles y código.'"
)
src = src.replace(
    "cuStatus.textContent = 'Computer control status unavailable. Reopen Abilities after reconnecting.'",
    "cuStatus.textContent = 'Estado del control de ordenador no disponible. Reabre Habilidades tras reconectar.'"
)

# MCP form headers
src = src.replace("formH.textContent = 'ADD A CONNECTOR'", "formH.textContent = 'AÑADIR UN CONECTOR'")
src = src.replace("formH.textContent = 'EDIT CONNECTOR — '", "formH.textContent = 'EDITAR CONECTOR — '")

# Overview + actions
src = src.replace("overview.textContent = 'Saved services unavailable'", "overview.textContent = 'Servicios guardados no disponibles'")
src = src.replace(
    "notify('START FRESH failed: ' + ((r && r.j && r.j.error) || 'the station did not answer'))",
    "notify('EMPEZAR DE CERO falló: ' + ((r && r.j && r.j.error) || 'la estación no respondió'))"
)
src = src.replace(
    "notify('Conector \"' + id + '\" ' + (editing ? 'saved' : 'connected'), 'good')",
    "notify('Conector \"' + id + '\" ' + (editing ? 'guardado' : 'conectado'), 'good')"
)
src = src.replace(
    "notify('Conector \"' + e.name + '\" connected', 'good')",
    "notify('Conector \"' + e.name + '\" conectado', 'good')"
)

# Time ago
src = src.replace(
    "s < 60 ? 'just now' : (s < 3600 ? Math.round(s / 60) + ' min ago' : Math.round(s / 3600) + ' h ago')",
    "s < 60 ? 'ahora mismo' : (s < 3600 ? Math.round(s / 60) + ' min atrás' : Math.round(s / 3600) + ' h atrás')"
)

# Misc
src = src.replace("'the connectors folder'", "'la carpeta de conectores'")

open(path, 'w', encoding='utf-8').write(src)
print("connectors.js pass 3 done")
