#!/usr/bin/env python3
"""Second pass: fix remaining English strings and quote bugs in connectors.js."""

path = 'frontend/app/windows/connectors.js'
src = open(path, encoding='utf-8').read()

# ── Fix quote bug ─────────────────────────────────────────────────────
src = src.replace(
    "notify('Clave \"' + name + \" guardada', 'good')",
    "notify('Clave \"' + name + '\" guardada', 'good')"
)

# ── Fix mixed-language strings ────────────────────────────────────────
src = src.replace(
    "'✕ the \"' + viaId + '\" conector no está en el catálogo'",
    "'✕ el conector \"' + viaId + '\" no está en el catálogo'"
)
src = src.replace(
    "' se conecta a través de ' + v.name + ' — add ' + v.name + ' con una sola clave API.'",
    "' se conecta a través de ' + v.name + ' — añade ' + v.name + ' con una sola clave API.'"
)
src = src.replace(
    "'<b>Connect ' + esc(p.name) + '</b>'",
    "'<b>Conectar ' + esc(p.name) + '</b>'"
)
src = src.replace(
    "'Open ' + esc(p.name) + ' API instructions ↗'",
    "'Abre las instrucciones de la API de ' + esc(p.name) + ' ↗'"
)
src = src.replace(
    "'Open your ' + esc(p.name) + ' ajustes de cuenta.'",
    "'Abre los ajustes de cuenta de ' + esc(p.name) + '.'"
)
src = src.replace(
    "(p.docsUrl || 'the docs')",
    "(p.docsUrl || 'la documentación')"
)

# ── Spotify status (HTML spans) ───────────────────────────────────────
src = src.replace(
    "'<span style=\"color:var(--ok)\">● connected</span>'",
    "'<span style=\"color:var(--ok)\">● conectado</span>'"
)
src = src.replace(
    "'<span class=\"dim\">○ not connected (Client ID saved)</span>'",
    "'<span class=\"dim\">○ no conectado (Client ID guardado)</span>'"
)
src = src.replace(
    "'<span class=\"dim\">○ not connected</span>'",
    "'<span class=\"dim\">○ no conectado</span>'"
)
src = src.replace(
    "'✕ couldn't open the Spotify sign-in page'",
    "'✕ no se pudo abrir la página de inicio de sesión de Spotify'"
)

# ── Badge states ──────────────────────────────────────────────────────
src = src.replace("'◌ connecting…'", "'◌ conectando…'")
src = src.replace("'◐ idle · starts on use'", "'◐ en espera · se inicia al usarlo'")
src = src.replace("'○ disabled'", "'○ desactivado'")
src = src.replace("esc(state || 'unknown')", "esc(state || 'desconocido')")
src = src.replace("esc(c.state || 'off')", "esc(c.state || 'apagado')")

# ── Overview line ─────────────────────────────────────────────────────
src = src.replace(
    "list.length + ' service' + (list.length === 1 ? '' : 's')",
    "list.length + ' servicio' + (list.length === 1 ? '' : 's')"
)
src = src.replace(
    "deferred.length + ' deferred'",
    "deferred.length + ' diferido'"
)
src = src.replace(
    "attention + ' need attention'",
    "attention + ' necesitan atención'"
)
src = src.replace(
    "'<b>Service availability</b>'",
    "'<b>Disponibilidad del servicio</b>'"
)

# ── MCP row actions ───────────────────────────────────────────────────
src = src.replace("'reloading '", "'recargando '")
src = src.replace("'not connected'", "'no conectado'")
src = src.replace("'header saved'", "'cabecera guardada'")
src = src.replace("'token saved'", "'token guardado'")
src = src.replace("'managed in '", "'gestionado en '")
src = src.replace("'CONNECTED SERVICES'", "'SERVICIOS CONECTADOS'")

# ── Toolset toggle ────────────────────────────────────────────────────
src = src.replace(
    "(enabled ? ' on' : ' off') + ' for every agent'",
    "(enabled ? ' activado' : ' desactivado') + ' para todos los agentes'"
)
src = src.replace("'toggle failed'", "'falló el interruptor'")

# ── Connector remove ──────────────────────────────────────────────────
src = src.replace(
    "notify('Conector \"' + id + '\" was NOT removed', 'warn')",
    "notify('Conector \"' + id + '\" NO se eliminó', 'warn')"
)
src = src.replace(
    "notify('Conector \"' + id + '\" removed')",
    "notify('Conector \"' + id + '\" eliminado')"
)

# ── Autonomy checkbox ─────────────────────────────────────────────────
src = src.replace(
    "'watched sessions only — ' + esc(k.unattendedReason || 'el uso sin supervisión no está soportado')",
    "'solo sesiones supervisadas — ' + esc(k.unattendedReason || 'el uso sin supervisión no está soportado')"
)
src = src.replace(
    "'usable in scheduled &amp; messaged runs'",
    "'usable en ejecuciones programadas y con mensajes'"
)
src = src.replace(
    "' while 1Password can answer without you (unlocked, or a service account)'",
    "' mientras 1Password puede responder sin ti (desbloqueada, o una cuenta de servicio)'"
)
src = src.replace(
    "'watched sessions only — tick to allow scheduled &amp; messaged runs'",
    "'solo sesiones supervisadas — marca para permitir ejecuciones programadas y con mensajes'"
)

# ── Tab descriptions ──────────────────────────────────────────────────
src = src.replace(
    "desc: 'Find a service by name or what you want to do. Choose it to see the setup required; YOUR SERVICES shows saved setups, not a live connection guarantee.'",
    "desc: 'Encuentra un servicio por nombre o por lo que quieres hacer. Elígelo para ver la configuración necesaria; TUS SERVICIOS muestra configuraciones guardadas, no una garantía de conexión en vivo.'"
)
src = src.replace(
    "desc: 'The platform credentials your agents actually hold, plus a safe drop for a custom API the catalog does not list.'",
    "desc: 'Las credenciales de plataforma que tus agentes realmente tienen, más un espacio seguro para una API personalizada que el catálogo no lista.'"
)
src = src.replace(
    "desc: 'Manage service access, check connection status, and reconnect when needed.'",
    "desc: 'Gestiona el acceso a servicios, comprueba el estado de conexión y reconecta cuando sea necesario.'"
)
src = src.replace("'SAVED API CONNECTIONS'", "'CONEXIONES API GUARDADAS'")

# ── CUA driver section ────────────────────────────────────────────────
src = src.replace("'CHECK DRIVER'", "'COMPROBAR DRIVER'")
src = src.replace(
    "Install downloads the verified Windows x64 driver from CUA's official release. Reinstall and backend changes close current CUA sessions; start a new task afterward.",
    "Instalar descarga el driver Windows x64 verificado de la publicación oficial de CUA. Reinstalar y los cambios de backend cierran las sesiones CUA actuales; inicia una nueva tarea después."
)

# ── Tool count in platform rows ───────────────────────────────────────
src = src.replace(
    "c.toolCount + ' tool' + (c.toolCount === 1 ? '' : 's')",
    "c.toolCount + ' herramienta' + (c.toolCount === 1 ? '' : 's')"
)

# ── Spotify catch block (duplicate) ───────────────────────────────────
src = src.replace(
    "readFailLine(cRes, 'sidecar offline — start it to see connected platforms.')",
    "readFailLine(cRes, 'sidecar desconectado — inícialo para ver las plataformas conectadas.')"
)
# Also the catch block at the end of kyPlatformsRefresh
src = src.replace(
    "'<div class=\"mc-detail\">sidecar offline — start it to see connected platforms.</div>'",
    "'<div class=\"mc-detail\">sidecar desconectado — inícialo para ver las plataformas conectadas.</div>'"
)

open(path, 'w', encoding='utf-8').write(src)
print("connectors.js pass 2 done")
