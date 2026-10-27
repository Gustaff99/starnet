/* STARNET — windows/connectors.js : the TOOLSETS & CONNECTORS window (extracted verbatim from stationui.js).
   Loads AFTER stationui.js (see index.html) and registers itself via StationUI.registerWindow;
   the only stationui internals it touches are the enumerated StationUI.h helper surface
   (esc/sfx/notify/fmtRel, mountConsole, and openSignIn for catalog OAuth flows). */
'use strict';
(() => {
  if (typeof StationUI === 'undefined' || !StationUI.registerWindow) return;
  const H = StationUI.h;
  const esc = H.esc, sfx = H.sfx, notify = H.notify, fmtRel = H.fmtRel;
  const mountConsole = H.mountConsole, openSignIn = H.openSignIn;

  // CATALOG DEEP-LINK (tutorial lane 2, 2026-08-22): StationUI.connectorJump(id) opens ABILITIES on the CATALOG
  // rail and scrolls/flashes that connector's card (the same cc-jump flash the ▸ VIA action uses) — the
  // Commander still presses the card's OWN ▸ SIGN IN, so the existing OAuth path stays the only door. The id
  // parks here until ccRefresh has rendered the cards (the window builds async).
  let ccJumpPending = null;
  function ccFlash(target) {
    for (let p = target.parentElement; p; p = p.parentElement) { if (p.tagName === 'DETAILS') p.open = true; }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.remove('cc-jump'); void target.offsetWidth;
    target.classList.add('cc-jump');
    setTimeout(() => target.classList.remove('cc-jump'), 2500);
  }
  StationUI.connectorJump = function (id) {
    ccJumpPending = String(id || '') || null;
    if (typeof StationUI.openTerm === 'function') StationUI.openTerm('connectors', 'catalog');
  };

  /* LOCKED CREDENTIAL STORAGE — the next step the panel names under the sidecar's own message. A held file ('busy':
     antivirus, backup or sync) and an unreachable OS store ('key-unavailable') leave an intact store that a restart or
     an unlock fixes, and START FRESH would only set it aside, so neither is told its files are unreadable: the restart
     or the unlock comes first and START FRESH stays as the exit when that fails. A busy lock's sidecar message already
     says restart, then START FRESH, so the line adds nothing for it. The sidecar sends canStartFresh for every lock
     today; a lock with no START FRESH and no fix of its own leaves the sidecar's message to speak. */
  function storageNextStep(storage) {
    const s = storage || {};
    if (s.reason === 'busy') return s.canStartFresh ? '' : ' Restart StarNet to try again.';
    if (s.reason === 'key-unavailable') return s.canStartFresh ? ' Usa START FRESH solo si no puedes desbloquear o reparar la tienda de credenciales.' : ' Desbloquea la tienda de credenciales y reinicia StarNet.';
    return s.canStartFresh ? ' START FRESH sets the unreadable files aside and lets you sign in to each service again.' : '';
  }
  /* An open store's storage notes. `notice` is a store StarNet does not count as encrypted (fallback, or a seal not yet
     checked), so it is headed that way. `migrationNotice` is an older sign-in file left beside a SEALED store: a plain
     heading, never 'not encrypted'. */
  function storageNoticeHtml(storage) {
    const s = storage || {};
    return (s.notice ? '<div class="mc-notice"><b>Credential storage · not encrypted</b>' + esc(s.notice) + '</div>' : '') +
      (s.migrationNotice ? '<div class="mc-notice"><b>Credential storage</b>' + esc(s.migrationNotice) + '</div>' : '');
  }
  /* START FRESH's answer: where the old files went. Finishing an interrupted attempt also returns `previous`, the
     folders that attempt filled; with nothing left to move it has no movedTo, and the marker that named those folders
     is gone, so this toast is the one place left that says where the old files are. */
  function startFreshKeptText(answer) {
    const j = answer || {};
    const previous = Array.isArray(j.previous) ? j.previous.filter(p => typeof p === 'string' && p) : [];
    const where = (typeof j.movedTo === 'string' && j.movedTo) || previous[0] || 'la carpeta de conectores';
    const earlier = previous.filter(p => p !== where);
    return 'El almacenamiento de conectores empezó de cero. Archivos antiguos en ' + where + (earlier.length ? ' (copias anteriores en ' + earlier.join(', ') + ')' : '');
  }

  /* ============== CONNECTORS — attach MCP servers so agents gain external tools ==============
     A connector is a remote MCP (Model Context Protocol) server. Once added + connected, its tools
     become real agent tools, gated by the same consent prompt as everything else. The server URL +
     optional bearer token are stored by the sidecar (never displayed) via /api/connectors. */
  function buildConnectors(body) {
    // CONSOLE MODE: TOOLSETS & CONNECTORS. TOOLSETS (first) is the standard organized surface — one CRT
    // pill-switch row per capId FAMILY (web, files, workbench, delegation, studio, memory, jukebox), each a
    // kill-switch layered on object=capability (available = object placed AND toolset enabled). The JUKEBOX row
    // is where Spotify now lives (the connect flow is hosted inline, all sp-* ids intact). MCP CONNECTORS (second)
    // is the pre-existing generic manager, unchanged except each row gains a per-connector ENABLE pill.
    // mountConsole appends its host to `body`, so the existing body.querySelector wiring (setupSpotify, the MCP
    // form/list handlers) resolves against the mounted panes with no rewrite.
    // ---- TOOLSETS pane: rendered async from GET /api/toolsets; the Spotify flow markup is embedded in-line so
    //      the JUKEBOX row can host it (kept verbatim from the old SPOTIFY section, ids unchanged). ----
    const spotifyInline =
      '<div class="ts-spotify" id="ts-spotify">' +
        '<p class="set-about">Configuración única: crea una app gratis en <span class="dim">developer.spotify.com/dashboard</span>, añade la URI de redirección de abajo, pega el Client ID y conecta. ' +
          '<span class="dim">(OAuth PKCE — nunca se guarda el client secret.)</span></p>' +
        '<div id="sp-status" class="mc-url dim">comprobando…</div>' +
        '<div class="mc-form">' +
          '<input id="sp-client" class="key-input" placeholder="Spotify Client ID" autocomplete="off" spellcheck="false" maxlength="64">' +
          '<div class="mc-url dim">URI de redirección para autorizar: <code id="sp-redir">…</code></div>' +
          '<div class="mc-acts">' +
            '<button class="bb sm" id="sp-connect">▶ CONECTAR SPOTIFY</button>' +
            '<button class="bb xs danger" id="sp-disconnect" style="display:none">✕ DESCONECTAR</button>' +
          '</div>' +
        '</div>' +
        '<div id="sp-msg" class="msg" role="status" aria-live="polite"></div>' +
      '</div>';
    // NO LEAD PARAGRAPH HERE. mountConsole already prints this section's `desc` as `.con-sec-desc`
    // directly above, and this pane used to follow it with a second sentence saying the same thing in
    // different words ("Every capability your agents can use, grouped and switchable…" then "Every
    // capability your agents can use, grouped into toolsets…"). Every pane in this console had the same
    // stutter. The `desc` is the one that stays — it is also what the search box matches on.
    const secToolsets =
      '<label class="mc-hint" for="ts-agent">Mostrar habilidades de</label><select id="ts-agent" class="ab-agent-pick" aria-label="Mostrar las habilidades del agente"></select>' +
      '<button class="bb xs" id="ts-refresh" type="button">REFRESCAR ACCESO</button>' +
      '<div id="ts-authority" class="set-about" role="status"></div>' +
      '<div class="ts-core set-row"><span class="ts-glyph" aria-hidden="true">◉</span>' +
        '<span class="ts-main"><span class="ts-name">COMPUTO <span class="ts-core-tag">CORE</span></span>' +
        '<span class="ts-desc dim">La compuerta de computo — un agente siempre puede pensar. Siempre activo.</span></span></div>' +
      '<div id="ts-list"><span class="loading pulse">cargando toolsets…</span></div>';
    // ---- CONNECTORS pane markup (unchanged generic MCP manager) ----
    // The lead sentence that used to open this pane restated the section `desc` verbatim; only the two
    // asides were load-bearing, so only they remain. The CHANNELS pointer earns its place because
    // "connect Slack" is genuinely ambiguous — tools-INTO-the-agent lives here, chat-FROM-Slack does not.
    const secMcp =
      // No ✉ in the prose: a symbol glyph falls back to a non-VT323 face, and mid-sentence it took its
      // own line break with it ("That’s ✉ / CHANNELS."). Glyphs stay in glyph SLOTS (the front-door
      // column, the rail), never inside a running sentence.
      // ⛔ "Remote http(s) MCP servers." is a SURFACE LOCATOR for the `manual-mcp-connect` claim in
      // qa/product-perfect/claims.json — the ledger anchors that advertised claim to this exact sentence.
      // A first pass at this paragraph reworded it and turned the claims audit BLOCKED. The claim is
      // still true and still stated, so the honest repair is to keep the canonical phrase here rather
      // than re-point the audit needle at whatever the copy happens to say now.
      '<div id="mc-overview" class="mc-overview" role="status"></div>' +
      '<div id="mc-notices"></div>' +
      '<div id="mc-list" class="mc-list"><span class="loading pulse">cargando…</span></div>' +
      '<details class="mc-adv"><summary>Acerca de los servicios conectados</summary>' +
        '<p class="set-about">Remote http(s) MCP servers. Los secretos se guardan localmente en el sidecar y nunca se muestran. ' +
        '¿Prefieres hablar con tu agente <i>desde</i> Slack o Telegram? Esa es la ventana CANALES.</p></details>' +
      '<div class="sec"><span class="sec-l" id="mc-form-h">AÑADIR UN CONECTOR</span><span class="sec-r"></span><span class="sec-nd"></span></div>' +
      '<div class="mc-form" id="mc-form">' +
        '<input id="mc-id" class="key-input" placeholder="id — p. ej. github (a-z 0-9 _ -)" autocomplete="off" spellcheck="false" maxlength="40">' +
        '<div class="mc-hint">Un identificador corto para este servidor. Sus herramientas aparecen para los agentes como <code>mcp__&lt;id&gt;__&lt;tool&gt;</code>.</div>' +
        '<input id="mc-label" class="key-input" placeholder="etiqueta (opcional) — p. ej. GitHub" autocomplete="off" spellcheck="false">' +
        '<div class="mc-seg" id="mc-transport" role="tablist">' +
          '<button type="button" class="mc-seg-btn active" data-tp="http" role="tab" aria-selected="true">HTTP</button>' +
          '<button type="button" class="mc-seg-btn" data-tp="oauth" role="tab" aria-selected="false">OAUTH</button>' +
          '<button type="button" class="mc-seg-btn" data-tp="stdio" role="tab" aria-selected="false">STDIO (Safe Cell)</button>' +
        '</div>' +
        // ---- HTTP fields ----
        '<div class="mc-tp-fields" data-tp="http oauth">' +
          '<input id="mc-url" class="key-input" placeholder="https://server.example/mcp" autocomplete="off" spellcheck="false">' +
          '<div class="mc-hint">El endpoint Streamable-HTTP del servidor. <code>http://</code> solo se permite para localhost.</div>' +
          '<div id="mc-token-fields">' +
            '<input id="mc-token" type="password" class="key-input" placeholder="bearer token (opcional)" autocomplete="off" spellcheck="false">' +
            '<div class="mc-hint">Se envía como <code>Authorization: Bearer …</code>. Déjalo en blanco al editar para conservar el token guardado.</div>' +
          '</div>' +
          '<div id="mc-oauth-note" class="mc-hint" style="display:none">Se abrirá una ventana segura del navegador para el inicio de sesión. La concesión OAuth se guarda localmente y se refresca automáticamente.</div>' +
        '</div>' +
        // ---- STDIO fields ----
        // Arbitrary stdio server code is bound to one named agent's persistent Docker Safe Cell.
        '<div class="mc-tp-fields" data-tp="stdio" style="display:none">' +
          '<select id="mc-agent" class="key-input" aria-label="Propietario de la Safe Cell"><option value="">cargando agentes de Safe Cell…</option></select>' +
          '<div class="mc-hint" id="mc-agent-hint">El servidor corre dentro de la Safe Cell persistente de este agente, nunca como hijo interactivo del host.</div>' +
          '<input id="mc-command" class="key-input" placeholder="comando — p. ej. npx" autocomplete="off" spellcheck="false">' +
          '<textarea id="mc-args" class="key-input mc-kv" placeholder="arguments, one per line:&#10;-y&#10;@modelcontextprotocol/server-filesystem&#10;/workspace" spellcheck="false" rows="3"></textarea>' +
          '<input id="mc-cwd" class="key-input" placeholder="cwd del contenedor (opcional; por defecto /workspace)" autocomplete="off" spellcheck="false">' +
          '<textarea id="mc-env" class="key-input mc-kv" placeholder="entorno (opcional), uno por línea:&#10;SERVICE_TOKEN=value" spellcheck="false" rows="2"></textarea>' +
          '<div class="mc-hint">Comando y argumentos usan argv exacto sin shell. Los secretos quedan fuera de las listas de procesos; un env en blanco al editar conserva los valores guardados.</div>' +
        '</div>' +
        // FOLDED, NOT REMOVED. Adding a server needs an id and a URL; custom headers and a hand-set
        // timeout are power-user fields, and stacked open they made the common path look like a
        // six-field form. Both keep their ids, so edit-prefill and the add handler are unchanged.
        // (Deliberately NOT `open` by default — unlike the CHANNELS setup guide, which is instructions
        // needed at exactly the moment it was folded away, these are settings almost nobody sets.)
        '<details class="mc-adv"><summary>avanzado — cabeceras personalizadas, timeout</summary>' +
          '<textarea id="mc-headers" class="key-input mc-kv" placeholder="cabeceras extra (opcionales), una por línea:&#10;X-Api-Version: 2024-01" spellcheck="false" rows="2"></textarea>' +
          '<div class="mc-hint">Cabeceras de request personalizadas como <code>Name: value</code>, una por línea.</div>' +
          '<input id="mc-timeout" class="key-input" type="number" min="1000" max="600000" placeholder="timeout ms (opcional, por defecto 30000)" autocomplete="off">' +
          '<div class="mc-hint">Cuánto esperar por el handshake / una llamada de herramienta antes de rendirse. Por defecto 30s.</div>' +
        '</details>' +
        '<div class="mc-acts">' +
          '<button class="bb sm" id="mc-add">+ AÑADIR &amp; CONECTAR</button>' +
          '<button class="bb xs" id="mc-cancel" style="display:none">CANCELAR EDICIÓN</button>' +
        '</div>' +
      '</div>' +
      '<div id="mc-msg" class="msg" role="status" aria-live="polite"></div>';
    // ---- CATALOG pane markup: one-click, vetted MCP servers and platform APIs. Cards render async from
    //      both catalog endpoints and route through the existing connector/key setup flows. ----
    // The pane copy is JUST the setup-type legend now — the "browse vetted MCP servers and add them" sentence lived
    // here AND verbatim in the section desc below (mountConsole), so it read twice. CRT glyphs, not emoji.
    // The legend doubles as the FILTER: it already taught the three setup tiers, so making those same
    // words the control costs no new vocabulary. "What can I add without any setup right now?" is the
    // first question a newcomer has and 39 cards in one scroll could not answer it; "which of these am
    // I already on?" was equally unanswerable without reading every card.
    const secCatalog =
      '<p class="set-about"><b>Conecta una app que ya usas.</b> Elige una plataforma de abajo. INICIAR SESIÓN abre tu navegador; la configuración de API key te guía para añadir una clave desde tu cuenta.</p>' +
      (typeof Tutorial !== 'undefined' && Tutorial.platformGuideHTML ? Tutorial.platformGuideHTML('apps') : '') +
      '<div class="cc-filters" id="cc-filters" role="group" aria-label="Filtrar conectores por tipo de configuración">' +
        '<button type="button" class="cc-filter active" data-cc-filter="all" aria-pressed="true">TODOS</button>' +
        '<button type="button" class="cc-filter cc-lg-none" data-cc-filter="none" aria-pressed="false">▸ sin setup</button>' +
        '<button type="button" class="cc-filter cc-lg-key" data-cc-filter="apikey" aria-pressed="false">API key</button>' +
        '<button type="button" class="cc-filter cc-lg-oauth" data-cc-filter="oauth" aria-pressed="false">INICIAR SESIÓN</button>' +
        '<button type="button" class="cc-filter" data-cc-filter="manual" aria-pressed="false">CONFIGURACIÓN MANUAL</button>' +
        '<button type="button" class="cc-filter cc-f-on" data-cc-filter="installed" aria-pressed="false">TUS SERVICIOS</button>' +
      '</div>' +
      '<p class="set-about"><span class="cc-legend"><b class="cc-lg-none">▸ sin setup</b> no necesita credenciales · ' +
        '<b class="cc-lg-key">API key</b> pegas una clave · <b class="cc-lg-oauth">INICIAR SESIÓN</b> conectas por tu navegador. Algunos servicios requieren una configuración de app única primero.</span></p>' +
      '<div id="cc-list" class="cc-list"><span class="loading pulse">cargando catálogo…</span></div>' +
      '<div id="cc-msg" class="msg" role="status" aria-live="polite"></div>' +
      '<p class="set-about dim">¿Necesitas algo no listado? Añade cualquier servidor MCP remoto por URL en <b>SERVICIOS CONECTADOS</b>, o pega una clave de plataforma personalizada en <b>CONEXIONES API GUARDADAS</b>.</p>';
    // ---- KEYS pane markup: every platform key the agents hold, in one place. Top = keyed catalog/MCP platforms
    //      currently connected (truth from /api/connectors — managed on their own tab, read-only here). Bottom =
    //      encrypted API credentials (POST /api/servicekeys): the sidecar exposes each as an env var in
    //      the agents' shell, so an agent can call ANY service's API with it. Values render masked, never whole. ----
    /* SHAPE (2026-08-13, Andrew's call): "keys should just be the list of keys available and connected,
       and underneath should allow users to add custom keys." The pane was FIVE stacked top-level sections
       — two lists, then a whole platform DIRECTORY, then the form — measured at 1560px of scroll in a
       599px pane, so the add form (the pane's only verb) sat a full screen below the fold with a catalog
       wedged between it and the list it belongs to.
       Now: ONE list block, then the form. The two lists stay SEPARATE rows inside that block because they
       are not the same thing — a keyed CATALOG/MCP platform is read-only here and managed where it was
       added, a custom key is editable and deletable — but they are demoted from full section rules to the
       shared `.set-sub` label, which is what they always were: two groups of one list. Their counts stay
       SPLIT for the same reason the code already refuses to fake one: if the /api/connectors read fails
       we say so rather than assert a zero, and a single summed total could not stay honest through that.
       The curated platform directory now lives in CATALOG, where discovery belongs. Its cards route here
       and prefill this form; KEYS stays the inventory/setup surface for credentials the Commander actually
       holds, plus the escape hatch for a custom platform the catalog does not list. */
    const secKeys =
      '<div class="sec"><span class="sec-l">TUS CLAVES</span><span class="sec-r"></span><span class="sec-nd"></span></div>' +
      '<div class="set-sub"><span class="set-sub-k">PLATAFORMAS CONECTADAS</span><span class="set-sub-d" id="ky-plat-n">0</span></div>' +
      '<div id="ky-platforms" class="mc-list"><span class="loading pulse">cargando…</span></div>' +
      '<div class="set-sub"><span class="set-sub-k">CLAVES API CONECTADAS</span><span class="set-sub-d" id="ky-mine-n">0</span></div>' +
      '<div id="ky-list" class="mc-list"></div>' +
      '<div class="sec"><span class="sec-l">AÑADIR UNA CLAVE</span><span class="sec-r"></span><span class="sec-nd"></span></div>' +
      '<div class="mc-form">' +
        '<div id="ky-guide" class="mc-hint" hidden></div>' +
        '<input id="ky-name" class="key-input" placeholder="nombre de plataforma — p. ej. Resend" autocomplete="off" spellcheck="false" maxlength="64">' +
        '<input id="ky-key" type="password" class="key-input" placeholder="API key — o una referencia de 1Password (op://vault/item/field)" autocomplete="off" spellcheck="false">' +
        '<input id="ky-docs" class="key-input" placeholder="URL de la documentación (opcional — ayuda a los agentes a usar el servicio)" autocomplete="off" spellcheck="false">' +
        '<div class="mc-hint">Se guarda localmente en el sidecar y se muestra solo como ····últimos4. Los agentes la reciben como variable de entorno ' +
          '(p. ej. <code>RESEND_API_KEY</code>) en su shell, así pueden llamar a la API de la plataforma directamente.</div>' +
        // 1PASSWORD: the same field takes a secret reference. Only the reference is saved; the sidecar reads the key with
        // the 1Password CLI when an agent needs it and keeps it in memory (sidecar/onepassword.js).
        '<div class="mc-hint">¿Guardas claves en 1Password? Pega en su lugar la referencia secreta del campo (en 1Password: menú del campo → Copy Secret Reference). ' +
          'StarNet guarda solo la referencia y lee la clave con el CLI de 1Password (<code>op</code>) cuando un agente la necesita.</div>' +
        // TRUTHFUL TELEMETRY: the key alone is not enough. The shell it is handed to only exists when a WORKBENCH
        // prop is placed (capability/office.js grants it nowhere by default), and workspace-process tools are not
        // projected onto unattended surfaces at all (inputpolicy.js), so a saved key is inert until both hold.
        '<div class="mc-hint">Estas claves API se usan a través de la terminal. Revisa el agente seleccionado en HABILIDADES INTEGRADAS: el acceso puede provenir de un banco de trabajo, un perfil de ejecución o Acceso Total. ' +
          'El trabajo programado también sigue sus ajustes guardados de acceso sin supervisión. Guardar una clave no verifica que el servicio la acepte.</div>' +
        '<div class="mc-acts"><button class="bb sm" id="ky-add">+ GUARDAR CLAVE</button></div>' +
      '</div>' +
      '<div id="ky-msg" class="msg" role="status" aria-live="polite"></div>';
    /* ---- EXTENSIONS: the Commander's OWN code, running inside the station ----
       Sits in this console and not in SETTINGS because "MCP server", "hook" and "plugin" are one user intent —
       things I plug into my station — and splitting them by which subsystem implements them is how a settings
       screen becomes a junk drawer. The two lists stay SEPARATE inside the tab because they are not the same
       promise: a hook is a script the station shells out to, a plugin is code loaded into the station itself.

       The PENDING rows are the reason this panel exists at all. Both gates are opt-in by design, so an
       unapproved extension is silently inert — and an extension you wrote that never ran, with nothing on
       screen saying why, is the worst failure this design can produce. */
    const secExt = `
      <div class="ext-workspace">
        <div class="ext-choices" aria-label="Añadir una extensión">
          <button class="ext-choice" data-ext-editor="hook" aria-controls="hk-form" aria-expanded="false">
            <span class="ext-choice-icon" aria-hidden="true">⌁</span>
            <span><b>Ejecutar un comando automáticamente</b><small>Elige cuándo StarNet ejecuta tu script.</small></span><span aria-hidden="true">＋</span>
          </button>
          <button class="ext-choice" data-ext-editor="plugin" aria-controls="pl-form" aria-expanded="false">
            <span class="ext-choice-icon" aria-hidden="true">⌘</span>
            <span><b>Crear un plugin</b><small>Empieza con código funcional que puedes personalizar.</small></span><span aria-hidden="true">＋</span>
          </button>
        </div>
        <div id="ext-msg" class="msg" role="status" aria-live="polite"></div>
        <section class="ext-editor mc-form" id="hk-form" aria-label="Ejecutar un comando automáticamente" hidden>
          <div class="ext-editor-head"><b>Ejecutar un comando automáticamente</b><button class="bb xs" data-ext-editor="">CANCELAR</button></div>
          <label for="hk-event">Cuándo ejecutar</label>
          <select id="hk-event" class="key-input fbc-sel"></select>
          <label for="hk-cmd">Comando</label>
          <input id="hk-cmd" class="key-input" placeholder="p. ej. node scripts/run-summary.js" autocomplete="off" spellcheck="false">
          <details class="ext-details"><summary>Nombre y detalles técnicos</summary>
            <label for="hk-name">Nombre <span class="dim">(opcional)</span></label>
            <input id="hk-name" class="key-input" placeholder="p. ej. Run summary" autocomplete="off" maxlength="60">
            <p class="mc-hint">Esto es un hook. El evento llega como JSON por stdin. Los comandos corren sin shell; pon pipes y redirecciones en un script. Los hooks before-tool pueden bloquear una herramienta imprimiendo <code>{"decision":"block","reason":"why"}</code>.</p>
          </details>
          <p class="mc-hint">Corre con los permisos de tu equipo. Activa solo comandos en los que confíes.</p>
          <div class="mc-acts"><button class="bb sm" id="hk-add">+ AÑADIR &amp; ACTIVAR</button></div>
        </section>
        <section class="ext-editor mc-form" id="pl-form" aria-label="Crear un plugin" hidden>
          <div class="ext-editor-head"><b>Crear un plugin</b><button class="bb xs" data-ext-editor="">CANCELAR</button></div>
          <p class="mc-hint">Tu starter viene con su propia ventana, con el estilo del resto de la estación, más código que cuenta llamadas de herramientas por ejecución. Abre la ventana y edita sus archivos para hacerla tuya.</p>
          <label for="pl-name">Nombre del plugin</label>
          <input id="pl-name" class="key-input" placeholder="p. ej. PR Radar" autocomplete="off" maxlength="60">
          <details class="ext-details" id="pl-options"><summary>Ajustes opcionales</summary>
            <label for="pl-desc">Descripción</label>
            <input id="pl-desc" class="key-input" placeholder="Una nota corta sobre este plugin" autocomplete="off" maxlength="140">
            <label for="pl-id">ID de carpeta <span class="dim">(se rellena con el nombre)</span></label>
            <input id="pl-id" class="key-input" autocomplete="off" spellcheck="false" maxlength="64" aria-describedby="pl-id-hint">
            <p id="pl-id-hint" class="mc-hint">Letras, números, puntos, guiones o guiones bajos. Usa otro ID si este nombre ya está ocupado.</p>
          </details>
          <p class="mc-hint">Corre con los permisos de tu equipo. Crearlo activa el código starter.</p>
          <div class="mc-acts"><button class="bb sm" id="pl-add">+ CREAR &amp; ACTIVAR</button></div>
        </section>
        <div class="sec"><span class="sec-l">TUS EXTENSIONES</span><span class="sec-r"></span><span class="sec-nd"></span></div>
        <div class="ext-list-heading">COMANDOS AUTOMÁTICOS <span class="dim">/ hooks</span></div>
        <div id="hk-list" class="mc-list"><span class="loading pulse">Cargando comandos…</span></div>
        <div class="ext-list-heading">PLUGINS</div>
        <div id="pl-list" class="mc-list"><span class="loading pulse">Cargando plugins…</span></div>
        <button class="bb xs" id="pl-where">COPIAR RUTA DE LA CARPETA DE PLUGINS</button>
      </div>`;

    const frag = h => (el => { el.innerHTML = h; });
    // NAV CONDENSE 2 (2026-08-04): the standalone SKILLS window merged in here — one window owns
    // the whole "what agents can do" axis. stationui.js pushes its skill-library/agent-skills lane
    // onto window.AbilityLanes ((body)=>({sections,wire}), the windows/automation.js shape); the
    // lanes' sections mount in THIS console and their wire() runs after ours, against the same body.
    const lanes = (window.AbilityLanes || []).map(fn => { try { return fn(body); } catch (_) { return null; } }).filter(l => l && Array.isArray(l.sections));
    // TOOLSETS first (audit finding 5): the dock button says TOOLSETS, so the panel must open on the tab it's
    // named for — a first click used to land on the CATALOG storefront, which read as "TOOLSETS = connectors".
    /* ---- THE FRONT DOOR ----
       This console's five tabs are five MECHANISMS (curated MCP server · platform API key · MCP server by
       URL · hook/plugin · built-in toolset), and picking the right one is a question a newcomer cannot
       answer — they know the NAME of the thing they want, not which of six subsystems implements it.
       Landing on TOOLSETS and reading a rail of jargon is where that user stops.

       So the console opens with the question they CAN answer ("what are you trying to connect?") and each
       answer is a real jump to the tab that handles it. Two of the answers leave this window entirely —
       chat-FROM-Slack is CHANNELS and model providers are SETTINGS — because the honest answer to "how do
       I connect Telegram" is a different window, and silence there is exactly what sends people hunting.
       Nothing here gates anything: every tab remains one click away in the rail. */
    const ROUTES = [
      { glyph: '⊞', to: 'catalog', title: 'Conecta un servicio que usas',
        blurb: 'Encuentra servicios y APIs de plataforma, incluido print-on-demand. Mira qué pueden hacer y sigue sus pasos de configuración. <b>Empieza aquí.</b>' },
      { glyph: '⧉', to: 'mcp', title: 'Avanzado: añade una conexión personalizada',
        blurb: 'Ya tienes un endpoint MCP y quieres apuntar la estación a él.' },
      { glyph: '▤', to: 'toolsets', title: 'Activa o desactiva una integrada',
        blurb: 'Web, archivos, terminal, memoria — inspecciona las herramientas del agente seleccionado y de dónde viene su acceso.' },
      // cross-window, and deliberately so: naming the wrong window is worse than naming none.
      { glyph: '✉', term: 'messaging', title: 'Escríbele a tu agente desde Telegram o Slack',
        blurb: 'Conecta una cuenta de chat para darle trabajo a tu agente desde allí. Abre CANALES.' },
      { glyph: '◈', term: 'settings', section: 'providers', title: 'Añade un proveedor de modelos de IA',
        blurb: 'Las claves e inicios de sesión de Anthropic, OpenAI, OpenRouter están en AJUSTES › IA Y MODELOS.' }
    ];
    const secRouter =
      '<details class="ab-router" id="ab-router">' +
        '<summary class="ab-router-q"><span>＋ AÑADIR UNA HABILIDAD</span><small>Elige un servicio, servidor, canal o proveedor de modelos</small></summary>' +
        '<div class="ab-router-grid">' +
          ROUTES.map((r, i) =>
            '<button type="button" class="ab-route" style="--ci:' + i + '"' +
              (r.to ? ' data-ab-to="' + esc(r.to) + '"' : '') +
              (r.term ? ' data-ab-term="' + esc(r.term) + '"' : '') +
              (r.section ? ' data-ab-section="' + esc(r.section) + '"' : '') + '>' +
              '<span class="ab-route-glyph" aria-hidden="true">' + esc(r.glyph) + '</span>' +
              '<span class="ab-route-main"><span class="ab-route-title">' + esc(r.title) + '</span>' +
                '<span class="ab-route-blurb dim">' + r.blurb + '</span></span>' +
              '<span class="ab-route-go" aria-hidden="true">' + (r.term ? '↗' : '›') + '</span>' +
            '</button>').join('') +
        '</div>' +
      '</details>';

    // FIRST OPEN LANDS ON THE CATALOG (first-hour walk 2026-09-28): a newcomer who came here to connect Gmail met
    // "capability grants", "ASK mode" and REFRESH AUTHORITY first. With no remembered section yet, land on
    // DISCOVER › CATALOG ("find a service by name"); every later open returns to the section last used. Tabs and
    // sections are unchanged — only the first one shown.
    if (H.consoleSection && !H.consoleSection.connectors) H.consoleSection.connectors = 'catalog';
    const host = mountConsole(body, 'connectors', [
      { id: 'toolsets', label: 'HABILIDADES INTEGRADAS', glyph: '▤', desc: 'La lista muestra lo que el agente elegido puede usar, pero cada interruptor activa o desactiva una habilidad integrada para todos los agentes; COMPROBAR CONMIGO y DEJARLO TRABAJAR obedecen los interruptores, PODER TOTAL los anula. Los servicios conectados siguen necesitando credenciales válidas.', build: frag(secToolsets) },
      { id: 'computer', label: 'CONTROL DE ORDENADOR', glyph: '▣', desc: 'Elige cómo interactúan los agentes con las apps nativas de escritorio. Se necesita Poder Total o un arrendamiento de propietario remoto emparejado.', build: frag(
        '<div class="set-about">CUA apunta a ventanas y elementos de accesibilidad, trabaja en segundo plano donde se soporta e informa evidencia de cada acción. La entrada en primer plano puede mover el foco si hace falta.</div>' +
        '<div id="cu-status" class="set-about" role="status" aria-live="polite">Comprobando control de ordenador…</div>' +
        '<div class="mc-acts" role="group" aria-label="Backend de control de ordenador">' +
        '<button type="button" class="bb sm" data-cu-backend="cua">CUA · ACCESIBILIDAD</button>' +
        '<button type="button" class="bb sm" data-cu-backend="win32">WINDOWS · CLÁSICO</button>' +
        '<button type="button" class="bb sm" data-cu-backend="off">APAGADO</button></div>' +
        '<div class="mc-acts"><button type="button" class="bb sm" id="cu-install">INSTALAR CUA</button>' +
        '<button type="button" class="bb sm" id="cu-check">COMPROBAR DRIVER</button></div>' +
        '<p class="dim">Instalar descarga el driver Windows x64 verificado de la publicación oficial de CUA. Reinstalar y cambiar de backend cierran las sesiones CUA actuales; empieza una tarea nueva después.</p>' +
        '<div id="cu-message" class="msg" role="status" aria-live="polite"></div>') },
      { id: 'catalog', label: 'CATÁLOGO', glyph: '⊞', desc: 'Encuentra un servicio por nombre o por lo que quieres hacer. Elígelo para ver la configuración necesaria; TUS SERVICIOS muestra configuraciones guardadas, no una garantía de conexión en vivo.', build: frag(secCatalog) },
      { id: 'keys', label: 'CONEXIONES API GUARDADAS', glyph: '⊟', desc: 'Las credenciales de plataforma que tus agentes realmente tienen, más un espacio seguro para una API personalizada que el catálogo no lista.', build: frag(secKeys) },
      { id: 'mcp', label: 'SERVICIOS CONECTADOS', glyph: '⧉', desc: 'Gestiona el acceso a servicios, comprueba el estado de conexión y reconecta cuando sea necesario.', build: frag(secMcp) },
      // (ONE DOOR EACH, 2026-10-01: the CREATE / ADVANCED router pane repeated the rail — custom MCP server → CONNECTED
      // SERVICES, custom API key → SAVED API CONNECTIONS, skill package → SKILL EXCHANGE, hooks/plugins → EXTENSIONS)
      { id: 'extensions', label: 'EXTENSIONES', glyph: '⌥', desc: 'Automatiza un paso o amplía StarNet con tu propio código.', build: frag(secExt) }
    ].concat(lanes.reduce((acc, l) => acc.concat(l.sections), [])), {
      search: true,
      groups: [
        { id: 'installed', label: 'INSTALADO', sections: ['toolsets', 'computer', 'mcp', 'keys', 'agent'] },
        { id: 'discover', label: 'DESCUBRIR', sections: ['catalog', 'market', 'library'] },
        { id: 'advanced', label: 'CREAR / AVANZADO', sections: ['extensions', 'exchange'] }
      ],
      searchLabel: 'Buscar habilidades',
      searchPlaceholder: 'search abilities…',   // fits the rail's search box whole (the long hint was cut at 'search a platform,')
      searchEmptyText: 'Ninguna habilidad coincide con esa búsqueda. Prueba otra plataforma, herramienta o skill.'
    });
    lanes.forEach(l => { try { if (typeof l.wire === 'function') l.wire(); } catch (_) {} });
    if (typeof Tutorial !== 'undefined' && Tutorial.wirePlatformGuide) Tutorial.wirePlatformGuide(body);

    /* Mount the front door ABOVE the panes, inside the scrolling content column: it is the first thing
       read on every tab, and it scrolls away once you are working — permanent chrome for a question you
       only ask once would be worse than no answer. It hides itself while the search box is active
       (`.con-searching`), because then the Commander has already named the thing and the results ARE the
       answer. */
    const routerEl = document.createElement('div');
    routerEl.innerHTML = secRouter;
    const routerNode = routerEl.firstChild;
    if (host && routerNode) host.insertBefore(routerNode, host.firstChild);
    const handoffEl = document.createElement('div');
    handoffEl.className = 'mc-hint'; handoffEl.setAttribute('aria-live', 'polite');
    if (host) host.insertBefore(handoffEl, host.firstChild);
    function renderHandoffs(connectors) {
      handoffEl.replaceChildren();
      if (typeof Workstreams === 'undefined' || !Workstreams.connectorHandoff) return;
      for (const ws of Workstreams.list()) {
        const h = Workstreams.connectorHandoff(ws.id); if (!h) continue;
        const c = connectors.find(x => x.id === h.connectorId);
        const ready = c && c.enabled && c.state === 'up' && !c.authRequired;
        const dormant = c && c.enabled && c.state === 'cached' && !c.authRequired;
        // a handoff held while the task's question is open only ever RETURNS to it — continuing would answer it
        const supported = !h.awaitingAnswer && (dormant || (ready && (!h.toolName || (c.tools || []).includes(h.toolName))));
        const line = document.createElement('div');
        const caption = document.createElement('span');
        caption.textContent = (ws.title || 'Tarea') + ' · ' + h.connectorId + ' — '
          + (h.awaitingAnswer ? (ready || dormant ? 'conectado — responde la pregunta abierta de la tarea para continuar. ' : 'esperando conexión; la tarea tiene una pregunta abierta. ')
            : dormant ? 'se comprobará la conexión guardada. ' : supported ? 'conexión lista. ' : ready ? 'la operación solicitada no está disponible. ' : 'esperando conexión. ');
        line.appendChild(caption);
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bb xs';
        btn.textContent = h.awaitingAnswer ? 'VOLVER A LA TAREA' : dormant ? 'COMPROBAR Y CONTINUAR TAREA' : supported ? 'CONTINUAR TAREA' : 'VOLVER A LA TAREA';
        btn.onclick = async () => {
          if (!supported) { App.openWorkstream(ws.id); return; }
          btn.disabled = true;
          await Chat.continueConnectorTask(ws.id);
          if (btn.isConnected) btn.disabled = false;
          refresh();
        };
        line.appendChild(btn); handoffEl.appendChild(line);
      }
    }
    // Delegated on the whole console body, not just the strip: `data-ab-to` is the jump CONTRACT for this
    // window, and the empty states reuse it (KEYS' "no keyed platform yet" offers OPEN CATALOG). Binding
    // to the strip alone would have left those buttons inert — a new dead end shipped beside a cured one.
    body.addEventListener('click', ev => {
      const btn = ev.target.closest('.ab-route, [data-ab-to], [data-ab-term]'); if (!btn) return;
      sfx('click');
      // in-console jump: click the REAL rail button so the console's own selection + persistence run.
      const to = btn.dataset.abTo;
      if (to) {
        const tab = body.querySelector('#con-tab-connectors-' + to);
        if (tab) { tab.click(); routerNode.open = false; host.scrollTop = 0; }
        return;
      }
      // cross-window jump: openTerm is idempotent (restores a minimized window rather than duplicating).
      const term = btn.dataset.abTerm;
      if (term && typeof H.openTerm === 'function') H.openTerm(term, btn.dataset.abSection || undefined);
    });

    /* ===== EXTENSIONS: hooks + plugins, straight off /api/hooks and /api/plugins =====
       TRUTHFUL TELEMETRY, strictly: every badge here reads a state the sidecar can prove. "active" means the
       hook spine actually registered it this boot — not that it appears in a config file. That distinction is
       the entire value of the panel, because a configured-but-unapproved extension looks identical to a
       working one from the outside. */
    /* The picker says WHEN in plain language. "post_tool_call" is the wire name and it is meaningless to
       anyone who has not read the source; the value stays the wire name, only the label is human. */
    const EVENT_LABEL = {
      pre_tool_call: 'antes de que el agente use una herramienta  (puede bloquearla)',
      post_tool_call: 'después de que el agente use una herramienta',
      pre_llm_call: 'antes de cada llamada al modelo  (puede añadir una nota, o bloquear)',
      post_llm_call: 'después de cada llamada al modelo',
      on_session_start: 'cuando empieza una ejecución',
      on_session_end: 'cuando termina una ejecución',
      subagent_stop: 'cuando termina un trabajador delegado',
      on_pre_compress: 'justo antes de compactar el historial',
      on_memory_write: 'cuando se escribe algo en la memoria'
    };
    let extPluginDir = '';
    const extMsg = body.querySelector('#ext-msg');
    function extSay(text, bad) {
      if (!extMsg) return;
      extMsg.textContent = text || '';
      extMsg.style.color = bad ? 'var(--bad)' : 'var(--ok)';
    }
    // Actions carry their own busy state: a double-click on APPROVE must not fire two re-installs.
    async function extPost(url, payload, btn) {
      if (btn) { btn.disabled = true; btn.classList.add('busy'); }
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { extSay((j && j.error) || ('falló la solicitud (' + r.status + ')'), true); return false; }
        return true;
      } catch (e) { extSay('no se pudo alcanzar la estación: ' + ((e && e.message) || e), true); return false; }
      finally { if (btn) { btn.disabled = false; btn.classList.remove('busy'); } }
    }

    function extBadge(state) {
      return ({
        active: ['var(--ok)', '● Activado'],
        pending: ['var(--gold)', '○ Inactivo · necesita aprobación'],
        error: ['var(--bad)', '✕ error']
      })[state] || ['var(--ph-dim)', '○ Inactivo'];
    }
    // A findings block is DISCLOSURE at the approval moment — the guard is not a boundary, so the Commander
    // has to be able to see what they are about to say yes to.
    // The sidecar's guard returns a LIST of findings ({ severity, description, file, line }); the old {level, hits}
    // shape this used to read never existed, so every plugin's findings silently rendered as nothing.
    function extFindings(f) {
      if (Array.isArray(f)) {
        if (!f.length) return '<div class="mc-hint">analizador: no se encontró nada sospechoso</div>';
        const rank = { critical: 3, high: 2, medium: 1, low: 0 };
        const worst = f.reduce((w, x) => (rank[x && x.severity] || 0) > (rank[w] || 0) ? x.severity : w, 'low');
        const lines = f.slice(0, 6).map(x => esc(String((x && x.description) || 'hallazgo')) + ' <span class="mc-hint">(' + esc(String((x && x.file) || '')) + ':' + esc(String((x && x.line) || '')) + ')</span>').join('<br>');
        return '<div class="mc-hint">analizador: <b>' + esc(String(f.length)) + ' hallazgo' + (f.length === 1 ? '' : 's') + ' · peor ' + esc(String(worst)) + '</b><br>' + lines +
          (f.length > 6 ? '<br>…y ' + esc(String(f.length - 6)) + ' más' : '') + '</div>';
      }
      if (!f || !f.level) return '';
      const hits = Array.isArray(f.hits) && f.hits.length ? ' — ' + f.hits.map(h => esc(String(h))).join(', ') : '';
      return '<div class="mc-hint">scanner: <b>' + esc(String(f.level)) + '</b>' + hits + '</div>';
    }
    // A plugin's TOOLS (what its process actually registered) and its terminal in the station — the tools reach an
    // agent only through that terminal (object = capability), so the row says where it stands or offers to place it.
    function extTools(p) {
      const tools = Array.isArray(p.tools) ? p.tools : [];
      if (!p.active || !tools.length) return '';
      const host = typeof PluginHost !== 'undefined' ? PluginHost : null;
      const term = host && host.terminalOf ? host.terminalOf(p.id) : null;
      return '<div class="mc-hint">Herramientas: ' + tools.map(t => '<code>' + esc(t) + '</code>').join(' ') + '<br>' +
        (term ? 'Su terminal está en la estación: los agentes de esa sala pueden usarlas. Cada llamada te pregunta primero salvo que elijas Siempre o Acceso total.'
          : 'Todavía no hay terminal en la estación, así que ningún agente puede usarlas. <button class="bb xs" data-ext="plugin-place" data-id="' + esc(p.id) + '">COLOCAR TERMINAL</button>') +
        '</div>';
    }
    // A plugin's windows (plugin.json `screens`), openable only while it is approved and live.
    function extScreens(p) {
      const list = Array.isArray(p.screens) ? p.screens : [];
      if (!list.length) return '';
      if (!p.active) return '<div class="mc-hint">Tiene ' + list.length + ' ventana' + (list.length === 1 ? '' : 's') + ' — apruébalo para abrir ' + (list.length === 1 ? 'la ventana' : 'las ventanas') + '.</div>';
      return list.map(s => '<button class="bb xs" data-ext="plugin-open" data-id="' + esc(p.id) + '" data-screen="' + esc(s.id) + '">ABRIR ' + esc(String(s.title || s.id).toUpperCase()) + '</button>').join('');
    }

    // Keep drafts in the DOM while changing editors; never ask for two setups at once.
    function extEditor(kind, focus = true) {
      body.querySelector('#hk-form').hidden = kind !== 'hook';
      body.querySelector('#pl-form').hidden = kind !== 'plugin';
      body.querySelectorAll('.ext-choice').forEach(btn => {
        btn.setAttribute('aria-expanded', String(btn.dataset.extEditor === kind));
      });
      if (focus && kind) body.querySelector(kind === 'hook' ? '#hk-event' : '#pl-name').focus();
    }
    body.querySelectorAll('[data-ext-editor]').forEach(btn => btn.addEventListener('click', () => {
      const kind = btn.dataset.extEditor;
      const prior = body.querySelector('#hk-form').hidden ? 'plugin' : 'hook';
      extEditor(kind);
      extSay('');
      if (!kind) body.querySelector('[data-ext-editor="' + prior + '"]').focus();
    }));
    const pluginName = body.querySelector('#pl-name'), pluginId = body.querySelector('#pl-id');
    let pluginIdEdited = false;
    function suggestedPluginId(name) {
      return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'my-plugin';
    }
    pluginName.addEventListener('input', () => {
      if (!pluginIdEdited) pluginId.value = suggestedPluginId(pluginName.value);
    });
    pluginId.addEventListener('input', () => { pluginIdEdited = !!pluginId.value.trim(); });

    async function renderExtensions() {
      const hkEl = body.querySelector('#hk-list'), plEl = body.querySelector('#pl-list');
      if (!hkEl || !plEl) return false;
      // A failed read is unavailable state, never an empty list. Keep the other list usable.
      const read = async (url, key) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        if (!Array.isArray(data[key])) throw new Error('Invalid extension response');
        return data;
      };
      const results = await Promise.allSettled([read('/api/hooks', 'hooks'), read('/api/plugins', 'plugins')]);
      const hooks = results[0].status === 'fulfilled' ? results[0].value : null;
      const plugins = results[1].status === 'fulfilled' ? results[1].value : null;
      // nothing left to approve: the bell's "extensions awaiting your approval" leaves NEEDS YOU (it stayed lit for good)
      if (hooks && plugins && !((hooks.pending || []).length + plugins.plugins.filter(x => x && x.pending).length)
        && typeof StationUI !== 'undefined' && StationUI.settleNotifs) StationUI.settleNotifs('extensions-pending');
      extPluginDir = plugins ? plugins.dir || '' : '';
      body.querySelector('#pl-where').hidden = !extPluginDir || !plugins.plugins.length;
      const unavailable = label => '<div class="mc-hint">No se pudo cargar ' + label + '. <button class="bb xs" data-ext="retry">INTENTAR DE NUEVO</button></div>';
      const evSel = body.querySelector('#hk-event');
      if (hooks && evSel && !evSel.options.length && Array.isArray(hooks.events)) {
        evSel.innerHTML = hooks.events.map(e => '<option value="' + esc(e) + '">' + esc(EVENT_LABEL[e] || e) + '</option>').join('');
        if (hooks.events.includes('on_session_end')) evSel.value = 'on_session_end';
      }
      body.querySelector('#hk-add').disabled = !hooks || !evSel.options.length;
      hkEl.innerHTML = !hooks ? unavailable('los comandos') : hooks.hooks.map(h => {
        const badge = extBadge(h.active ? 'active' : 'pending');
        const dat = ' data-event="' + esc(h.event) + '" data-command="' + esc(h.command) + '"';
        return '<div class="mc-row ext-row"><div class="mc-top"><b>' + esc(h.name || h.command) + '</b>' +
          '<span class="mc-state" style="color:' + badge[0] + '">' + badge[1] + '</span></div>' +
          '<div class="mc-hint">' + esc(EVENT_LABEL[h.event] || h.event) + '</div>' +
          '<div class="mc-acts"><button class="bb xs" data-ext="hook-' + (h.active ? 'revoke' : 'allow') + '"' + dat + '>' +
          (h.active ? 'DESACTIVAR' : 'APROBAR &amp; ACTIVAR') + '</button></div>' +
          '<details class="ext-details"><summary>Detalles</summary><code class="ext-command">' + esc(h.command) + '</code>' +
          (!h.active ? '<p class="mc-hint">Corre con los permisos de tu equipo cuando se activa.</p>' : '') +
          '<button class="bb xs danger" data-ext="hook-delete"' + dat + '>ELIMINAR COMANDO</button></details></div>';
      }).join('') || '<div class="ext-empty">Todavía no hay comandos automáticos.</div>';
      plEl.innerHTML = !plugins ? unavailable('los plugins') : plugins.plugins.map(p => {
        const badge = extBadge(p.active ? 'active' : (p.pending ? 'pending' : 'inert'));
        return '<div class="mc-row ext-row"><div class="mc-top"><b>' + esc(p.name || p.id) + '</b>' +
          '<span class="mc-state" style="color:' + badge[0] + '">' + badge[1] + '</span></div>' +
          (p.description ? '<div class="mc-hint">' + esc(p.description) + '</div>' : '') +
          (!p.active ? extFindings(p.findings) : '') +
          '<div class="mc-acts">' + (p.active ? extScreens(p) : '') + '<button class="bb xs" data-ext="plugin-' + (p.active ? 'revoke' : 'allow') + '" data-id="' + esc(p.id) + '" data-digest="' + esc(p.digest || '') + '">' +
          (p.active ? 'DESACTIVAR' : 'APROBAR &amp; ACTIVAR') + '</button></div>' +
          (!p.active ? extScreens(p) : '') +
          extTools(p) +
          (p.process && p.process.state === 'crashed' ? '<div class="mc-hint" style="color:var(--bad)">Su código se cayó: ' + esc(p.process.error || 'desconocido') + '. Se reinicia en su próximo uso.</div>' : '') +
          '<details class="ext-details"><summary>Detalles y código</summary>' +
          '<p class="mc-hint">Carpeta: <code>' + esc(p.id) + '</code> · Versión ' + esc(p.version || '0') +
          '<br>Abre su carpeta para editar el código. Los starters usan <code>index.js</code> y <code>ui/index.html</code>.</p>' +
          (p.active ? extFindings(p.findings) : (p.hasCode === false
            ? '<p class="mc-hint">Plugin solo de ventanas: sus páginas corren aisladas dentro de sus ventanas, sin acceso a tu estación ni a tu equipo.</p>'
            : '<p class="mc-hint">Activar carga este código con los permisos de tu equipo.</p>')) +
          '<div class="mc-acts"><button class="bb xs" data-ext="plugin-where" data-id="' + esc(p.id) + '">COPIAR RUTA DE CARPETA</button>' +
          '<button class="bb xs danger" data-ext-remove="' + esc(p.id) + '">ELIMINAR PLUGIN</button></div>' +
          '<p class="mc-hint">Eliminar también borra su código del disco.</p></details></div>';
      }).join('') || '<div class="ext-empty">Todavía no hay plugins.</div>';
      plEl.querySelectorAll('[data-ext-remove]').forEach(btn => {
        ArmConfirm.wire(btn, {
          armedLabel: '¿SEGURO? ELIMINAR CÓDIGO', restLabel: 'ELIMINAR PLUGIN', timeoutMs: 4000,
          onArm: () => sfx('bad'),
          onConfirm: async () => {
            if (await extPost('/api/plugins/delete', { id: btn.dataset.extRemove }, btn)) {
              if (typeof PluginHost !== 'undefined') { try { await PluginHost.refresh(); } catch (_) {} }
              const refreshed = await renderExtensions();
              if (refreshed) extSay('Plugin eliminado.');
            }
          }
        });
      });
      const errors = (hooks ? hooks.errors || [] : ['Could not load commands. Try again.'])
        .concat(plugins ? plugins.errors || [] : ['Could not load plugins. Try again.']);
      extSay(errors[0] || '', !!errors.length);
      return !errors.length;
    }

    // The three form buttons carry no data-ext of their own (they live in the markup, not in a rendered row),
    // so they are mapped to actions here rather than duplicating the handler.
    const EXT_FORM_BTNS = { 'hk-add': 'hook-add', 'pl-add': 'plugin-add', 'pl-where': 'plugin-where' };
    body.addEventListener('click', async (ev) => {
      const formBtn = ev.target.closest('#hk-add, #pl-add, #pl-where');
      const btn = formBtn || ev.target.closest('[data-ext]');
      if (!btn || !body.contains(btn) || btn.disabled) return;
      const kind = formBtn ? EXT_FORM_BTNS[formBtn.id] : btn.getAttribute('data-ext');
      let ok = false;
      // Set AFTER the re-render, never before: renderExtensions() clears the message line to drop stale
      // errors, so a success set inline is wiped the instant it is written (caught live).
      let done = '';
      let openAfter = '';   // a freshly created plugin opens its window, so the first thing seen is that it works
      if (kind === 'retry') { await renderExtensions(); return; }
      if (kind === 'hook-allow') ok = await extPost('/api/hooks/allow', { event: btn.dataset.event, command: btn.dataset.command }, btn);
      else if (kind === 'hook-revoke') ok = await extPost('/api/hooks/revoke', { event: btn.dataset.event, command: btn.dataset.command }, btn);
      else if (kind === 'hook-delete') ok = await extPost('/api/hooks/delete', { event: btn.dataset.event, command: btn.dataset.command }, btn);
      else if (kind === 'plugin-allow') ok = await extPost('/api/plugins/allow', { id: btn.dataset.id, digest: btn.dataset.digest }, btn);
      else if (kind === 'plugin-revoke') ok = await extPost('/api/plugins/revoke', { id: btn.dataset.id }, btn);
      else if (kind === 'plugin-place') {
        const host = typeof PluginHost !== 'undefined' ? PluginHost : null;
        const r = host ? host.placeTerminal(btn.dataset.id) : { ok: false, msg: 'plugin windows are not available in this build' };
        if (!r || !r.ok) { extSay('No se pudo colocar su terminal: ' + ((r && (r.msg || r.error)) || 'desconocido') + '. Coloca un TERMINAL DE PLUGIN en MODO CONSTRUCCIÓN.', true); return; }
        try { sfx('ok'); } catch (_) {}
        await renderExtensions();
        extSay('Su terminal ahora está en la sala del líder.');
        return;
      }
      else if (kind === 'plugin-open') {
        const host = typeof PluginHost !== 'undefined' ? PluginHost : null;
        if (!host) { extSay('plugin windows are not available in this build', true); return; }
        if (!host.open(btn.dataset.id, btn.dataset.screen)) {
          await host.refresh();   // approved in another window, or just now: learn about it, then try once more
          if (!host.open(btn.dataset.id, btn.dataset.screen)) extSay('that window is not available — is the plugin still on?', true);
        }
        return;
      }
      else if (kind === 'hook-add') {
        const ev = body.querySelector('#hk-event'), cmd = body.querySelector('#hk-cmd'), nm = body.querySelector('#hk-name');
        if (!cmd.value.trim()) { extSay('Escribe el comando que quieres ejecutar.', true); cmd.focus(); return; }
        ok = await extPost('/api/hooks/create', { event: ev.value, command: cmd.value.trim(), name: nm.value.trim() }, btn);
        if (ok) { cmd.value = ''; nm.value = ''; done = 'Comando añadido.'; extEditor('', false); }
      }
      else if (kind === 'plugin-add') {
        const id = body.querySelector('#pl-id'), nm = body.querySelector('#pl-name'), ds = body.querySelector('#pl-desc');
        if (!nm.value.trim()) { extSay('Dale un nombre a tu plugin.', true); nm.focus(); return; }
        if (!pluginIdEdited) id.value = suggestedPluginId(nm.value);
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(id.value.trim())) {
          body.querySelector('#pl-options').open = true;
          extSay('Empieza el ID de carpeta con letras o números, y usa letras, números, puntos, guiones o guiones bajos.', true);
          id.focus(); return;
        }
        const newId = id.value.trim();
        ok = await extPost('/api/plugins/create', { id: newId, name: nm.value.trim(), description: ds.value.trim() }, btn);
        if (!ok) body.querySelector('#pl-options').open = true;
        if (ok) { openAfter = newId; done = 'Plugin creado y su ventana abierta. Encuentra su código en Detalles y código.'; id.value = ''; nm.value = ''; ds.value = ''; pluginIdEdited = false; extEditor('', false); }
      }
      else if (kind === 'plugin-where') {
        if (!extPluginDir) { extSay('the station has not reported a plugins folder yet', true); return; }
        const path = extPluginDir + (btn.dataset.id ? '/' + btn.dataset.id : '');
        try { await navigator.clipboard.writeText(path); extSay('Ruta copiada a tu portapapeles.'); }
        catch (_) { extSay(path); }   // no clipboard permission — show it rather than fail silently
        return;
      }
      else return;
      if (ok) {
        try { sfx('ok'); } catch (_) {}
        // an approve / turn-off / add / remove changes what waits on approval: NEEDS YOU (rail, NOTIFICATIONS, the bell)
        // re-reads the station now, never up to a minute later (org P01)
        if (typeof NeedsYou !== 'undefined' && NeedsYou.refreshFeeds) NeedsYou.refreshFeeds(true);
        // plugin windows follow approval immediately: a turned-off plugin's open window says so, a new one can open
        if (/^plugin-/.test(kind) && typeof PluginHost !== 'undefined') {
          try {
            await PluginHost.refresh();
            if (openAfter && !PluginHost.open(openAfter)) done = 'Plugin creado. Encuentra su código en Detalles y código.';
            // INSTALL PLACES THE TERMINAL: a plugin that came up with tools gets its body in the lead's room now,
            // so "approve" is the only step between writing a tool and the crew being able to use it.
            const pid = openAfter || (kind === 'plugin-allow' ? btn.dataset.id : '');
            const p = pid ? PluginHost.list().find(x => x.id === pid) : null;
            // FIRST TIME ONLY: a terminal the Commander deliberately removed is not put back by a later re-approve
            // (that would quietly hand the tools back) — the row keeps offering PLACE TERMINAL instead
            let placedBefore = [];
            try { placedBefore = JSON.parse(localStorage.getItem('starnet.pluginTerminalsPlaced') || '[]'); } catch (_) { placedBefore = []; }
            if (p && p.active && Array.isArray(p.tools) && p.tools.length && placedBefore.indexOf(pid) < 0) {
              const r = PluginHost.placeTerminal(pid);
              if (r && r.ok) { try { localStorage.setItem('starnet.pluginTerminalsPlaced', JSON.stringify(placedBefore.concat([pid]).slice(-200))); } catch (_) { /* per-browser memory only */ } }
              const n = p.tools.length + ' tool' + (p.tools.length === 1 ? '' : 's');
              const note = r && r.ok ? (r.existing ? '' : ' Its terminal now stands in the lead’s room, so the lead can use its ' + n + '.')
                : ' Its terminal could not be placed (' + ((r && (r.msg || r.error)) || 'unknown') + ') — place a PLUGIN TERMINAL in BUILD MODE.';
              done = (done || 'Plugin on.') + note;
            }
          } catch (_) {}
        }
        const refreshed = await renderExtensions(); if (done && refreshed) extSay(done);
      }
    });
    renderExtensions();

    // Computer control settings reflect host facts, never a guessed connection badge.
    const cuStatus = body.querySelector('#cu-status');
    const cuMessage = body.querySelector('#cu-message');
    const cuInstall = body.querySelector('#cu-install');
    const cuCheck = body.querySelector('#cu-check');
    const cuChoices = [...body.querySelectorAll('[data-cu-backend]')];
    let cuState = null, cuBusy = false;
    function cuRender(state) {
      cuState = state;
      cuStatus.textContent = (state.backend === 'cua' ? 'CUA' : state.backend === 'win32' ? 'WINDOWS CLÁSICO' : 'APAGADO') + ' — ' + state.detail + (state.envLocked ? ' La selección la controla el entorno de lanzamiento.' : '');
      for (const button of cuChoices) {
        button.setAttribute('aria-pressed', String(button.dataset.cuBackend === state.backend));
        button.disabled = cuBusy || state.envLocked || ((!state.desktopShell || !state.nativeSupported) && button.dataset.cuBackend !== 'off') || (button.dataset.cuBackend === 'cua' && (!state.supported || !state.installed));
      }
      cuInstall.textContent = state.installing ? 'INSTALANDO CUA…' : (state.installed ? 'REINSTALAR CUA ' : 'INSTALAR CUA ') + state.version;
      cuInstall.hidden = state.customBinary;
      cuInstall.style.display = state.customBinary ? 'none' : '';
      cuInstall.disabled = cuBusy || state.installing || !state.supported || !state.desktopShell;
      cuCheck.disabled = cuBusy || !state.installed;
    }
    async function cuRefresh() {
      try {
        const state = await Harness.api.get('/api/computer-control');
        cuRender(state);
        if (state.installing) setTimeout(() => { if (cuStatus.isConnected) cuRefresh(); }, 1500);
      }
      catch (_) { cuStatus.textContent = 'Estado del control de ordenador no disponible. Reabre Habilidades tras reconectar.'; }
    }
    async function cuAction(payload) {
      if (cuBusy) return;
      cuBusy = true;
      if (cuState) cuRender(cuState);
      cuMessage.textContent = payload.action === 'install' ? 'Downloading and verifying CUA…' : 'Checking…';
      try {
        const response = await Harness.api.post('/api/computer-control', payload, { timeoutMs: 240000 });
        if (!response.ok || response.j?.error) throw new Error(response.j?.error || 'Fallo la solicitud de control de ordenador');
        cuRender(response.j);
        cuMessage.textContent = response.j.checkDetail || (payload.action === 'install' ? 'Installed. Select CUA to use it for new runs.' : 'Selection saved. Start a new run to use it.');
      } catch (e) { cuMessage.textContent = e.message || 'Fallo la solicitud de control de ordenador'; }
      finally { cuBusy = false; await cuRefresh(); }
    }
    for (const button of [...cuChoices, cuInstall, cuCheck]) button.disabled = true;
    for (const button of cuChoices) button.addEventListener('click', () => cuAction({ action: 'select', backend: button.dataset.cuBackend }));
    cuInstall.addEventListener('click', () => cuAction({ action: 'install', repair: !!cuState?.installed }));
    cuCheck.addEventListener('click', () => cuAction({ action: 'check' }));
    cuRefresh();

    // ===== TOOLSETS: render pill-switch rows from GET /api/toolsets, honestly reflecting placement + consent =====
    const tsListEl = body.querySelector('#ts-list');
    // Refresh the selected agent's workspace projection alongside its host authority.
    let placedTypes = [];
    // How many tool chips a row shows before folding the rest behind a count. WEB & BROWSER grants 36:
    // unfolded they ran seven lines deep and pushed every other toolset below the fold, so the pane's
    // first screen was a wall of `browser.*` instead of the seven families it exists to present. The
    // full list is still one click away — this hides nothing, it just stops one row eating the pane.
    const TS_TOOLS_SHOWN = 8;
    function tsAvailability(t) {
      if (t.available) return 'DISPONIBLE';
      if (t.switchEffective && !t.enabled) return 'DESACTIVADO';
      if (t.switchEffective && !t.placed && !t.profileGranted) return 'NECESITA PROP';
      return 'NO DISPONIBLE';
    }
    function tsRowHTML(t, ri) {
      const off = !t.available;
      const availability = tsAvailability(t);
      const inert = availability === 'NEEDS PROP';
      // A DIAGNOSIS WITHOUT A CURE. This span named the exact missing prop and offered nothing to click,
      // so the one row that knows what is wrong was the one row you could not act on. The button hands
      // off to the same BUILD MODE deep-link the SKILLS library's PLACE uses (arms the palette on the prop),
      // which is the honest path: the prop still lands where the Commander puts it.
      const hint = inert
        ? '<span class="ts-inert">no ' + esc(t.object || 'prop') + ' in this agent’s workspace — choose one matching prop for this ability' +
            (t.object ? '<button class="bb xs ts-place" type="button" data-ts-place="' + esc(t.object) + '">⚒ PLACE ONE</button>' : '') +
          '</span>'
        : '';
      const consent = '<span class="ts-tag">' + (t.available ? esc(t.grantSource || 'granted') : 'not granted') + '</span>' + (t.consentGated ? '<span class="ts-tag">risky actions may ask</span>' : '');
      const status = '<span class="ts-availability' + (t.available ? ' available' : '') + '">' + availability + '</span>';
      const isJuke = t.id === 'jukebox';
      const all = (t.tools && t.tools.length) ? t.tools : [];
      const rest = all.length - TS_TOOLS_SHOWN;
      const tools = all.length
        ? '<details><summary>Inspect tools</summary><div class="ts-tools">' + all.map((n, i) =>
            '<code' + (i >= TS_TOOLS_SHOWN ? ' class="ts-tool-more" hidden' : '') + '>' + esc(n) + '</code>').join('') +
            (rest > 0 ? '<button class="ts-more" type="button" data-ts-more="' + esc(t.id) + '">+' + rest + ' more</button>' : '') +
          '</div></details>'
        : '';
      return '<div class="set-row ts-row' + (off ? ' ts-off' : '') + (inert ? ' ts-inert-row' : '') + '" data-id="' + esc(t.id) + '" style="--ci:' + (ri || 0) + '">' +
          '<input type="checkbox" data-ts-toggle="' + esc(t.id) + '"' + (t.enabled ? ' checked' : '') + ' aria-label="Activar ' + esc(t.label) + ' para todos los agentes"' + (t.switchEffective ? ' data-tip="Activa o desactiva ' + esc(t.label) + ' para todos los agentes"' : ' disabled data-tip-below data-tip="PODER TOTAL anula este interruptor guardado. Cambia el acceso primero."') + '>' +
          '<span class="ts-glyph" aria-hidden="true">' + esc(t.glyph || '▪') + '</span>' +
          '<span class="ts-main">' +
            '<span class="ts-name">' + esc(t.label) + ' ' + status + consent +
              '<span class="ts-count dim">' + t.toolCount + ' tool' + (t.toolCount === 1 ? '' : 's') + '</span></span>' +
            '<span class="ts-desc dim">' + esc(t.desc) + '</span>' + hint + tools +
            (isJuke ? spotifyInline : '') +
          '</span>' +
        '</div>';
    }
    const tsAgentEl = body.querySelector('#ts-agent');
    const tsAuthorityEl = body.querySelector('#ts-authority');
    const agents = H.present || [];
    tsAgentEl.innerHTML = agents.map(a => '<option value="' + esc(a.id) + '">' + esc(a.name || a.id) + '</option>').join('') || '<option value="">Station defaults</option>';
    // ORG P21: open on the same agent the skills lane in this console shows (sent from a dossier, or the dossier's own)
    const openOn = typeof H.skillsAgentId === 'function' ? H.skillsAgentId() : (agents[H.sel] && agents[H.sel].id);
    if (openOn && agents.some(a => a.id === openOn)) tsAgentEl.value = openOn; else if (agents[H.sel]) tsAgentEl.value = agents[H.sel].id;
    let tsRequest = 0;
    const tsLabels = {};
    tsAgentEl.addEventListener('change', tsRefresh);
    body.querySelector('#ts-refresh').addEventListener('click', tsRefresh);
    async function tsRefresh() {
      const request = ++tsRequest;
      try {
        placedTypes = (typeof World !== 'undefined' && World.heroCaps) ? World.heroCaps(tsAgentEl.value).map(c => c.objectType) : [];
        const j = await Harness.api.get('/api/toolsets?agent=' + encodeURIComponent(tsAgentEl.value) + '&placed=' + encodeURIComponent(placedTypes.join(',')));
        if (request !== tsRequest || !body.isConnected) return;
        if (!j || j.error || !j.authority) throw new Error((j && j.error) || 'authority unavailable');
        const a = j.authority;
        tsAuthorityEl.textContent = a.name + ' · ' + a.approvalLabel + ' · ' + a.filesystemLabel + '. ' + a.revoke + ' Capability grants shown here; the current task, service connection and operating system can still limit execution.';
        const list = (j && j.toolsets) || [];
        list.forEach(t => { if (t && t.id) tsLabels[t.id] = t.label || t.id; });   // the toast names the ability, not its id
        tsListEl.innerHTML = '<div class="ability-readout" aria-label="Selected agent toolset availability">' +
          '<div><b>' + list.filter(t => t.available).length + '</b><span>DISPONIBLE</span></div>' +
          '<div><b>' + list.filter(t => tsAvailability(t) === 'NECESITA PROP').length + '</b><span>NECESITA PROP</span></div>' +
          '<div><b>' + list.filter(t => !t.available && tsAvailability(t) !== 'NECESITA PROP').length + '</b><span>NO DISPONIBLE</span></div></div>' +
          '<p class="ability-legend">DISPONIBLE significa que este agente tiene la capacidad mediante equipo o ajustes de acceso. Las conexiones de servicio y los permisos de tarea aún se aplican. Cada interruptor de abajo se aplica a todos los agentes.</p>' +
          list.map(tsRowHTML).join('');
        if (body.querySelector('#sp-connect')) setupSpotify(body);   // wire Spotify now the sp-* markup is in the JUKEBOX row
      } catch (_) { if (request !== tsRequest) return; tsAuthorityEl.textContent = 'Autoridad efectiva no disponible.'; tsListEl.innerHTML = '<div class="mc-detail">No se pueden leer las capacidades actuales. Reabre HABILIDADES tras reconectar.</div>'; }
    }
    tsListEl.addEventListener('change', async ev => {
      const cb = ev.target.closest('input[data-ts-toggle]'); if (!cb) return;
      const id = cb.dataset.tsToggle; const enabled = cb.checked;
      cb.disabled = true;
      try {
        const r = await Harness.api.post('/api/toolsets/' + encodeURIComponent(id), { enabled });
        const j = r.j || {};
        if (!r.ok || j.error) { cb.checked = !enabled; sfx('bad'); notify('✕ ' + (j.error || 'falló el interruptor')); }
        else { sfx('tick'); notify((tsLabels[id] || id) + (enabled ? ' activado' : ' desactivado') + ' para todos los agentes', enabled ? 'good' : undefined); }
      } catch (e) { cb.checked = !enabled; sfx('bad'); notify('✕ ' + ((e && e.message) || 'solicitud fallida')); }
      cb.disabled = false;
      tsRefresh();
    });
    // The two non-toggle controls on a toolset row: unfold the rest of the tool chips, and cure an
    // inert row by deep-linking its missing prop into BUILD MODE.
    tsListEl.addEventListener('click', ev => {
      const more = ev.target.closest('button[data-ts-more]');
      if (more) {
        const wrap = more.parentElement;
        if (wrap) wrap.querySelectorAll('.ts-tool-more').forEach(c => { c.hidden = false; });
        more.remove(); sfx('tick'); return;
      }
      const place = ev.target.closest('button[data-ts-place]');
      if (place) {
        sfx('click');
        // H.placeGearForSkill minimizes this console, opens BUILD MODE and arms the palette on the prop.
        // No mapping for this objectType still opens BUILD MODE + names the gear in a toast, which is the
        // floor of acceptable — never a silent no-op.
        if (typeof H.placeGearForSkill === 'function') H.placeGearForSkill(place.dataset.tsPlace);
        else notify('Abre ⚒ MODO CONSTRUCCIÓN y coloca un ' + place.dataset.tsPlace + ' para otorgar estas herramientas', 'warn');
      }
    });
    tsRefresh();

    const listEl = body.querySelector('#mc-list');
    const msgEl = body.querySelector('#mc-msg');
    const formH = body.querySelector('#mc-form-h');
    const addBtn = body.querySelector('#mc-add');
    const cancelBtn = body.querySelector('#mc-cancel');
    const idInput = body.querySelector('#mc-id');
    let editing = null;   // id being edited (null = adding a new connector)
    let stdioAgents = [];

    // ----- transport segmented toggle -----
    function transport() { const on = body.querySelector('.mc-seg-btn.active'); return (on && on.dataset.tp) || 'http'; }
    function setTransport(tp) {
      body.querySelectorAll('.mc-seg-btn').forEach(b => { const a = b.dataset.tp === tp; b.classList.toggle('active', a); b.setAttribute('aria-selected', a ? 'true' : 'false'); });
      body.querySelectorAll('.mc-tp-fields').forEach(f => { f.style.display = String(f.dataset.tp || '').split(/\s+/).indexOf(tp) >= 0 ? '' : 'none'; });
      const tokenFields = body.querySelector('#mc-token-fields'); if (tokenFields) tokenFields.style.display = tp === 'http' ? '' : 'none';
      const oauthNote = body.querySelector('#mc-oauth-note'); if (oauthNote) oauthNote.style.display = tp === 'oauth' ? '' : 'none';
      const dead = tp === 'stdio' && stdioAgents.length === 0;
      addBtn.disabled = dead;
      addBtn.title = dead ? 'set an agent’s execution profile to SAFE CELL first' : '';
      addBtn.textContent = tp === 'oauth' ? (editing ? '✓ SAVE & SIGN IN' : '+ ADD & SIGN IN') : (editing ? '✓ SAVE & RECONNECT' : '+ ADD & CONNECT');
    }
    body.querySelector('#mc-transport').addEventListener('click', ev => {
      const b = ev.target.closest('.mc-seg-btn'); if (!b) return; setTransport(b.dataset.tp); sfx('tick');
    });

    async function loadStdioAgents(selected) {
      const sel = body.querySelector('#mc-agent'); if (!sel) return;
      try {
        const j = await Harness.api.get('/api/execution-profiles');
        stdioAgents = ((j && j.agents) || []).filter(x => x && x.agentId && x.profile && x.profile.id === 'safe-cell' && x.environment && x.environment.effectiveBackend === 'docker' && x.environment.safeCell && x.environment.safeCell.hostileCodeSandbox === true);
      } catch (_) { stdioAgents = []; }
      sel.innerHTML = stdioAgents.length
        ? '<option value="">choose a Safe Cell agent…</option>' + stdioAgents.map(x => '<option value="' + esc(x.agentId) + '">' + esc(x.agentId) + ' — SAFE CELL</option>').join('')
        : '<option value="">no Safe Cell agents available</option>';
      if (selected && stdioAgents.some(x => x.agentId === selected)) sel.value = selected;
      const hint = body.querySelector('#mc-agent-hint');
      if (hint) hint.textContent = stdioAgents.length
        ? 'The server runs inside this agent’s persistent Safe Cell, never as an interactive host child.'
        : 'Set an agent’s execution profile to SAFE CELL first, then return here. Docker must also be available on this machine.';
      if (transport() === 'stdio') setTransport('stdio');
    }

    // ----- key:value textarea parsers (headers use ':' , env uses '=') -----
    function parseKV(text, sep) {
      const out = {}; let bad = null;
      for (const raw of String(text || '').split(/\r?\n/)) {
        const line = raw.trim(); if (!line) continue;
        const i = line.indexOf(sep); if (i < 1) { bad = line; break; }
        out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      return { out, bad };
    }

    function resetForm() {
      editing = null;
      formH.textContent = 'AÑADIR UN CONECTOR';
      addBtn.textContent = '+ ADD & CONNECT';
      cancelBtn.style.display = 'none';
      idInput.disabled = false;
      ['#mc-id', '#mc-label', '#mc-url', '#mc-token', '#mc-headers', '#mc-timeout', '#mc-command', '#mc-args', '#mc-cwd', '#mc-env']
        .forEach(s => { const el = body.querySelector(s); if (el) el.value = ''; });
      const adv = body.querySelector('#mc-form .mc-adv'); if (adv) adv.open = false;   // a cleared form is the simple form again
      setTransport('http');
    }
    cancelBtn.addEventListener('click', () => { resetForm(); msgEl.textContent = ''; sfx('click'); });

    // populate the form from an existing connector for EDIT (secrets stay blank = keep-saved).
    function startEdit(c) {
      editing = c.id;
      formH.textContent = 'EDITAR CONECTOR — ' + (c.label || c.id);
      addBtn.textContent = '✓ SAVE & RECONNECT';
      cancelBtn.style.display = '';
      idInput.disabled = true;
      idInput.value = c.id;
      body.querySelector('#mc-label').value = c.label && c.label !== c.id ? c.label : '';
      body.querySelector('#mc-timeout').value = (c.timeoutMs && c.timeoutMs !== 30000) ? c.timeoutMs : '';
      setTransport(c.transport === 'stdio' ? 'stdio' : (c.oauth ? 'oauth' : 'http'));
      if (c.transport === 'stdio') {
        body.querySelector('#mc-command').value = c.command || '';
        body.querySelector('#mc-args').value = (c.args || []).some(x => x === '<redacted>') ? '' : (c.args || []).join('\n');
        body.querySelector('#mc-cwd').value = '';
        body.querySelector('#mc-env').value = '';
        loadStdioAgents(c.agentId || '');
        msgEl.classList.remove('ok');
        msgEl.textContent = c.hasEnv ? 'Saved environment values are hidden; leave env blank to keep them.' : '';
      } else {
        body.querySelector('#mc-url').value = c.url || '';
        body.querySelector('#mc-token').value = '';   // never round-trip the token
        const hKeys = Object.keys(c.headers || {});
        body.querySelector('#mc-headers').value = hKeys.map(k => k + ': ' + (c.headers[k] === '<redacted>' ? '' : c.headers[k])).join('\n');
        // Unfold the advanced block when this connector actually HAS advanced settings — otherwise an
        // edit would silently hide the headers/timeout it is about to re-save, which reads as data loss.
        const adv = body.querySelector('#mc-form .mc-adv');
        if (adv) adv.open = hKeys.length > 0 || !!(c.timeoutMs && c.timeoutMs !== 30000);
      }
      formH.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      idInput.focus();
      sfx('click');
    }

    function badge(state) {
      return ({ up: ['var(--ok)', '● conectado'], connecting: ['var(--gold)', '◌ conectando…'],
                cached: ['var(--gold)', '◐ en espera · se inicia al usarlo'],
                down: ['var(--ph-dim)', '○ desactivado'], error: ['var(--bad)', '✕ error'] })[state] || ['var(--ph-dim)', '○ ' + esc(state || 'desconocido')];
    }
    function row(c, ri) {
      const b = c.releaseDeferred ? ['var(--gold)', '○ diferido'] : badge(c.state);
      const tools = (c.tools && c.tools.length) ? '<div class="mc-tools">' + c.tools.map(t => '<code>' + esc(t) + '</code>').join('') + '</div>' : '';
      const detail = (c.state === 'error' && c.detail) ? '<div class="mc-detail">' + esc(c.detail) + '</div>' : '';
      const next = c.releaseDeferred ? (c.credentialSaved ? 'Conexión guardada retenida.' : 'No disponible en esta versión.') : !c.enabled ? 'Activa el interruptor de arriba para que los agentes usen este servicio.'
        : c.oauth && (c.authRequired || !c.oauthAuthorized) ? 'Inicia sesión abajo para restaurar el acceso a esta cuenta.'
        : c.catalogSignIn ? 'Este servicio ahora se conecta con inicio de sesión en el navegador. INICIAR SESIÓN abajo reemplaza el token guardado solo después de que apruebes.'
        : c.state === 'error' ? 'Abre los detalles del error de abajo y luego recarga para reintentar.'
        : '';
      const where = c.transport === 'stdio'
        ? ('<span class="mc-tag">stdio</span> <code>' + esc([c.command].concat(c.args || []).join(' ')) + '</code>' + (c.hasEnv ? ' · env set' : '') +
           '<div class="mc-hint">isolated owner: ' + esc(c.agentId || 'unbound') + ' · persistent Safe Cell</div>')
        : ('<span class="mc-tag">' + (c.oauth ? 'oauth' : 'http') + '</span> ' + esc(c.url)
          // COPY TRUTH: a row must never read "OAuth authorized" AND "reauthentication required" at once — a
          // rejected grant (authRequired) outranks token presence (oauthAuthorized derives from a stored token).
          + (c.releaseDeferred ? (c.credentialSaved ? ' · conexión guardada retenida' : '') : c.oauth ? (c.authRequired ? ' · concesión OAuth rechazada — inicia sesión de nuevo' : (c.oauthAuthorized ? ' · OAuth autorizado' : ' · necesita inicio de sesión OAuth')) : (c.hasToken ? ' · token guardado' : ''))
          + (c.hasHeaders ? ' · cabeceras configuradas' : ''));
      const timeout = (c.timeoutMs && c.timeoutMs !== 30000) ? '<span class="dim"> · ' + Math.round(c.timeoutMs / 1000) + 's</span>' : '';
      return '<div class="mc-row" data-service data-id="' + esc(c.id) + '" data-enabled="' + (c.enabled ? '1' : '0') + '" style="--ci:' + (ri || 0) + '">' +
        '<div class="mc-top">' +
          '<span class="set-row mc-enable"><input type="checkbox" data-act="toggle"' + (c.enabled ? ' checked' : '') + (c.releaseDeferred ? ' disabled' : '') + ' aria-label="Enable connector ' + esc(c.id) + '"></span>' +
          '<b>' + esc(c.label || c.id) + '</b>' +
          '<span class="mc-state" style="color:' + b[0] + '">' + b[1] + (c.toolCount ? ' · ' + c.toolCount + ' herramienta' + (c.toolCount === 1 ? '' : 's') : '') + '</span></div>' +
        (c.account && c.account.email ? '<div class="mc-summary">Cuenta en el último inicio de sesión: ' + esc(c.account.email) + '</div>' : '') +
        (next ? '<div class="mc-summary">' + esc(next) + '</div>' : '') +
        '<details class="mc-inspect"><summary>' + (detail ? 'Error y detalles de conexión' : 'Detalles de conexión') + (c.tools && c.tools.length ? ' · ' + c.tools.length + ' herramienta' + (c.tools.length === 1 ? '' : 's') : '') + '</summary>' +
          '<div class="mc-hint">ID de servicio: <code>' + esc(c.id) + '</code></div>' +
          '<div class="mc-url dim">' + where + timeout + '</div>' +
          '<div class="mc-hint">' + (c.account && c.account.email ? '' : 'Identidad de cuenta: no verificada por StarNet. ') + 'Los inicios de sesión del navegador son independientes de esta conexión.</div>' +
          detail + tools +
        '</details>' +
        '<div class="mc-acts">' +
          // an OAuth connector's stored grant can die provider-side (token revoked, DCR client deleted) — a state
          // RELOAD can't cure (it reconnects with the same dead grant) and EDIT can't reach (its form is the
          // http-bearer/stdio editor; there is no bearer to paste). A fresh browser consent is the only cure, so
          // the row always carries it — same engine as the catalog card's ▸ SIGN IN (ccSignIn), which is otherwise
          // unreachable here: the catalog card renders a disabled ✓ ADDED for every installed connector.
          // catalogSignIn = a saved-token row whose catalog entry now signs in: the same engine, and its callback
          // swaps the token for the grant only after consent (EDIT → OAUTH would drop the token first).
          ((c.oauth || c.catalogSignIn) && !c.releaseDeferred ? '<button class="bb xs" data-act="resign" title="' + (c.id === 'google-files' ? 'elige archivos en el selector de Google">ELEGIR ARCHIVOS DE GOOGLE' : c.oauthAuthorized
            ? 'repite el inicio de sesión OAuth del navegador — la solución para una concesión revocada o expirada">⏼ RE-INICIAR SESIÓN'
            : 'abre el inicio de sesión OAuth del navegador">⏼ INICIAR SESIÓN') + '</button>' : '') +
          (c.releaseDeferred ? '' :
          '<button class="bb xs" data-act="reload">↻ RECARGAR</button>' +
          (c.id === 'google-files' ? '' : '<button class="bb xs" data-act="edit">✎ EDITAR</button>')) +
          '<button class="bb xs danger" data-act="remove">✕ QUITAR</button>' +
        '</div></div>';
    }
    let lastList = [];
    async function refresh() {
      try {
        const j = await Harness.api.get('/api/connectors');
        const list = (j && j.connectors) || []; lastList = list;
        const storage = (j && j.credentialStorage) || {};
        const storageError = storage.error;
        renderHandoffs(list);
        const overview = body.querySelector('#mc-overview');
        const notices = body.querySelector('#mc-notices');
        const connected = list.filter(c => !c.releaseDeferred && c.state === 'up').length;
        const deferred = list.filter(c => c.releaseDeferred);
        const attention = list.filter(c => !c.releaseDeferred && (c.state === 'error' || c.authRequired)).length;
        overview.textContent = list.length + ' servicio' + (list.length === 1 ? '' : 's') + ' · ' + connected + ' conectado' + (deferred.length ? ' · ' + deferred.length + ' diferido' : '') + (attention ? ' · ' + attention + ' necesitan atención' : '');
        // A release-wide explanation belongs once above the list, not in every saved service.
        notices.innerHTML = Array.from(new Set(deferred.map(c => c.detail).filter(Boolean))).map(note =>
          '<div class="mc-notice"><b>Disponibilidad del servicio</b>' + esc(note) + '</div>').join('');
        if (storageError) {
          overview.textContent = 'Servicios guardados no disponibles';
          notices.innerHTML += '<div class="mc-notice"><b>Almacenamiento de credenciales</b>' + esc(storageError) + '</div>';
          // START FRESH is the exit the sidecar offers for a store it cannot open (wrong key, damaged, unrecognized):
          // the old files are moved aside, never deleted, and every service is signed in again.
          listEl.innerHTML = '<div class="mc-detail">Your saved connections have not been erased.' + storageNextStep(storage) + '</div>' +
            (storage.canStartFresh ? '<div class="mc-acts"><button class="bb sm danger" id="mc-start-fresh" type="button">START FRESH</button></div>' : '');
          const fresh = listEl.querySelector('#mc-start-fresh');
          if (fresh && typeof ArmConfirm !== 'undefined' && ArmConfirm.wire) {
            ArmConfirm.wire(fresh, {
              armedLabel: '¿SEGURO? VOLVER A INICIAR SESIÓN', restLabel: 'EMPEZAR DESDE CERO', timeoutMs: 4000,
              onArm: () => sfx('bad'),
              onConfirm: async () => {
                fresh.disabled = true;
                let r = null;
                try { r = await Harness.api.post('/api/connectors/storage/start-fresh', { confirm: true }); } catch (_) {}
                if (r && r.ok) { sfx('ok'); notify(startFreshKeptText(r.j)); }
                else { sfx('bad'); notify('EMPEZAR DE CERO falló: ' + ((r && r.j && r.j.error) || 'la estación no respondió')); }
                refresh();
              }
            });
          }
          return;
        }
        notices.innerHTML += storageNoticeHtml(storage);
        if (list.length) {
          const expanded = new Set(Array.from(listEl.querySelectorAll('.mc-inspect[open]')).map(el => el.closest('.mc-row').dataset.id));
          listEl.innerHTML = list.map(row).join('');
          listEl.querySelectorAll('.mc-inspect').forEach(el => { el.open = expanded.has(el.closest('.mc-row').dataset.id); });
        }
        else {
          listEl.innerHTML = '<div class="empty-state"><span class="es-glyph">⧉</span>' +
            '<b>NO CONNECTORS YET</b><span>Attach an MCP server to give your agents external tools — GitHub, Slack, a database.</span>' +
            '<button class="es-cta" id="mc-empty-cta" type="button">+ ADD A CONNECTOR</button></div>';
          const cta = listEl.querySelector('#mc-empty-cta');
          if (cta) cta.addEventListener('click', () => { sfx('click'); const idf = body.querySelector('#mc-id'); if (idf) idf.focus(); });
        }
        wireRemoveButtons();
      } catch (_) {
        body.querySelector('#mc-overview').textContent = 'Estado del servicio no disponible';
        body.querySelector('#mc-notices').textContent = '';
        listEl.innerHTML = '<div class="mc-detail">Could not read connections. Retry when the station is available.</div>';
      }
    }
    const postJSON = (path, payload) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    /* ⛔ AN ERRORED ENDPOINT IS NOT AN EMPTY ONE, AND A REFUSAL IS NOT AN OFFLINE STATION.
       `(await fetch(u)).json()` resolves on 4xx/5xx: a JSON error body parses fine, `j.groups` comes back
       undefined, and the panel prints "no platform directory available" / "No keyed platform connected yet" —
       a CONFIRMED EMPTY over a read that never succeeded. A non-JSON error (the plain-text `forbidden token`
       a 403 returns) throws instead, and the catch printed "sidecar offline — start it", which is the opposite
       of true: the station answered, it just refused. Both readings send a Commander to fix the wrong thing —
       or to re-add a key they already have.

       Returns {ok, json, status, offline} so a caller can say which of the three actually happened. */
    async function readJSON(path) {
      let r;
      try { r = await fetch(path, { cache: 'no-store' }); }
      catch (_) { return { ok: false, offline: true, status: 0, json: null }; }
      if (!r.ok) return { ok: false, offline: false, status: r.status, json: null };
      try { return { ok: true, offline: false, status: r.status, json: await r.json() }; }
      catch (_) { return { ok: false, offline: false, status: r.status, json: null }; }
    }
    // the one honest sentence for a failed read: offline vs the station refusing/erroring.
    const readFailLine = (res, offlineMsg) => res.offline
      ? '<div class="mc-detail">' + esc(offlineMsg) + '</div>'
      : '<div class="mc-detail">couldn\'t read this from the station' + (res.status ? ' (HTTP ' + res.status + ')' : '') + ' — it is running, so this is not a start-it problem. Retry, and check the station log if it persists.</div>';
    async function removeConnector(id, btn) {
      if (btn) btn.disabled = true;
      try {
        const r = await postJSON('/api/connectors/remove', { id });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          notify('Conector "' + id + '" NO se eliminó', 'warn');
          msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((j && j.error) || ('HTTP ' + r.status)); sfx('bad');
        } else {
          notify('Conector "' + id + '" eliminado'); sfx('click'); if (editing === id) resetForm(); ccRefresh();
        }
      } catch (e) { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((e && e.message) || 'solicitud fallida'); sfx('bad'); }
      if (btn && btn.isConnected) btn.disabled = false;
      refresh();
    }
    function wireRemoveButtons() {
      if (typeof ArmConfirm === 'undefined' || !ArmConfirm.wire) return;
      listEl.querySelectorAll('button[data-act="remove"]').forEach(btn => {
        const rowEl = btn.closest('.mc-row'); const id = rowEl && rowEl.dataset.id;
        if (!id) return;
        btn.dataset.wired = '1';
        ArmConfirm.wire(btn, {
          armedLabel: 'SURE? REMOVE CONNECTOR',
          restLabel: '✕ REMOVE',
          timeoutMs: 4000,
          onArm: () => sfx('bad'),
          onConfirm: () => removeConnector(id, btn)
        });
      });
    }
    listEl.addEventListener('click', async ev => {
      const btn = ev.target.closest('button[data-act]'); if (!btn) return;
      const rowEl = ev.target.closest('.mc-row'); const id = rowEl && rowEl.dataset.id; if (!id) return;
      const act = btn.dataset.act;
      if (act === 'edit') { const c = lastList.find(x => x.id === id); if (c) startEdit(c); return; }
      // ⏼ RE-SIGN-IN: a fresh OAuth consent for an installed connector — the callback upserts new tokens and
      // reconnects, so this works for revoked/expired grants where RELOAD just re-errors. ccSignIn owns the
      // pending/poll state; its progress lands in THIS pane's message line (msgEl), not the catalog's.
      if (act === 'resign') { sfx('click'); ccSignIn(id, msgEl); return; }
      if (act === 'remove' && btn.dataset.wired === '1') return; // ArmConfirm owns both clicks.
      if (act === 'remove') { await removeConnector(id, btn); return; } // defensive fallback for stripped builds.
      btn.disabled = true;
      try {
        if (act === 'reload') {
          msgEl.classList.remove('ok'); msgEl.textContent = 'recargando ' + id + '…';
          const j = await (await postJSON('/api/connectors/refresh', { id })).json().catch(() => ({}));
          if (j.status && j.status.state === 'up') { msgEl.classList.add('ok'); msgEl.textContent = '✓ ' + id + ' — ' + (j.status.toolCount || 0) + ' herramienta(s)'; }
          else { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + id + ' — ' + ((j.status && j.status.detail) || j.error || 'no conectado'); }
          sfx('click');
        }
      } catch (e) { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((e && e.message) || 'solicitud fallida'); sfx('bad'); }
      refresh();
    });
    // per-connector ENABLE pill switch (upgraded presentation of the old DISABLE/ENABLE button; same server flag).
    listEl.addEventListener('change', async ev => {
      const cb = ev.target.closest('input[data-act="toggle"]'); if (!cb) return;
      const rowEl = ev.target.closest('.mc-row'); const id = rowEl && rowEl.dataset.id; if (!id) return;
      const c = lastList.find(x => x.id === id) || {};
      cb.disabled = true;
      try {
        const r = await postJSON('/api/connectors', { id, transport: c.transport, enabled: cb.checked });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          cb.checked = !cb.checked; msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((j && j.error) || ('HTTP ' + r.status)); sfx('bad');
        } else sfx('tick');
      }
      catch (e) { cb.checked = !cb.checked; msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((e && e.message) || 'solicitud fallida'); sfx('bad'); }
      cb.disabled = false;
      refresh();
    });
    addBtn.addEventListener('click', async () => {
      const id = (idInput.value || '').trim();
      const label = (body.querySelector('#mc-label').value || '').trim();
      const tp = transport();
      if (!id) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'an id is required'; return; }
      const httpMode = tp !== 'stdio';
      const payload = { id, label, transport: httpMode ? 'http' : 'stdio', enabled: true };
      if (httpMode) {
        const url = (body.querySelector('#mc-url').value || '').trim();
        if (!url) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'se necesita una URL de servidor'; return; }
        payload.url = url;
        payload.oauth = tp === 'oauth';
        const token = body.querySelector('#mc-token').value || '';
        if (tp === 'http' && token) payload.token = token;   // blank keeps the saved one (on edit)
        const h = parseKV(body.querySelector('#mc-headers').value, ':');
        if (h.bad) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'la cabecera necesita "Nombre: valor" — comprueba: ' + h.bad; return; }
        payload.headers = h.out;
      } else {
        const agentId = (body.querySelector('#mc-agent').value || '').trim();
        const command = (body.querySelector('#mc-command').value || '').trim();
        if (!agentId) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'elige un agente de Safe Cell'; return; }
        if (!command) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'se necesita un comando stdio'; return; }
        payload.agentId = agentId;
        payload.command = command;
        const argText = body.querySelector('#mc-args').value || '';
        if (argText.trim() || !editing) payload.args = argText.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        const cwd = (body.querySelector('#mc-cwd').value || '').trim();
        if (cwd) payload.cwd = cwd;
        const envText = body.querySelector('#mc-env').value || '';
        if (envText.trim()) {
          const e = parseKV(envText, '=');
          if (e.bad) { sfx('bad'); msgEl.classList.remove('ok'); msgEl.textContent = 'el entorno necesita "NOMBRE=valor" — comprueba: ' + e.bad; return; }
          payload.env = e.out;
        }
      }
      const to = (body.querySelector('#mc-timeout').value || '').trim();
      if (to) payload.timeout = Number(to);
      msgEl.classList.remove('ok'); msgEl.textContent = (editing ? 'guardando ' : 'conectando ') + id + '…';
      try {
        const j = await (await postJSON('/api/connectors', payload)).json().catch(() => ({}));
        if (tp === 'oauth' && j.saved) {
          // The unsigned 401 is expected between the durable config save and the callback. Start the same proven
          // browser flow as catalog connectors; the poll waits for oauthAuthorized before treating that 401 as final.
          await ccSignIn(id, msgEl, label || id);
          if (ccPending.has(id)) resetForm();
        } else if (j.error) { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + j.error; sfx('bad'); }
        else if (j.status && j.status.state === 'up') {
          msgEl.classList.add('ok'); msgEl.textContent = '✓ conectado — ' + (j.status.toolCount || 0) + ' herramienta(s) disponible(s)'; sfx('click');
          notify('Conector "' + id + '" ' + (editing ? 'guardado' : 'conectado'), 'good');
          resetForm();
        } else { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((j.status && j.status.detail) || ('estado: ' + (j.state || 'error'))); sfx('bad'); }
      } catch (e) { msgEl.classList.remove('ok'); msgEl.textContent = '✕ ' + ((e && e.message) || 'no se pudo alcanzar el sidecar'); sfx('bad'); }
      refresh();
    });
    refresh();
    loadStdioAgents('');
    // NB: setupSpotify(body) is invoked from tsRefresh() above, once the JUKEBOX toolset row has mounted the sp-* markup.

    // ===== CATALOG: unified discovery over connector and platform API catalogs =====
    // Each card installs by pre-filling the SAME POST /api/connectors upsert the manual form uses; the manager
    // then really connects and reports honest live state, so a card never claims more than the backend proves.
    const ccListEl = body.querySelector('#cc-list');
    const ccMsgEl = body.querySelector('#cc-msg');
    let ccCache = [];   // flat catalog entries, so a click reads the authoritative id/url/name (never re-typed)
    let ccAlternatives = new Map();
    const ccEntry = id => ccCache.find(x => (x.catalogId || x.id) === id);
    const ccPending = new Set();   // connector ids with an in-flight OAuth sign-in (guards duplicate popups/pollers)
    const ccTimers = new Map();    // id -> live poll interval, so a CANCEL / panel-close can clear it (EL-11 #13)
    const ccPendingWin = new Map();// id -> popup window handle (browser) so a CANCEL can close a still-open consent tab
    const ccAttempts = new Map();  // id -> { attemptId, controller }; CANCEL reaches backend discovery too
    // Stop and forget the poll for a connector — used by success/error/cap paths, the CANCEL affordance, and the
    // panel-leaves-DOM self-terminate guard. Idempotent (a missing id is a no-op).
    function stopCcPoll(id) { const t = ccTimers.get(id); if (t) { clearInterval(t); ccTimers.delete(id); } }
    // Restore a signing-in card's action button back to its idle SIGN IN state so a re-click starts fresh.
    function ccResetSignBtn(id) {
      const btn = ccListEl && ccListEl.querySelector('.cc-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"] button[data-cc-act]');
      if (btn && (btn.dataset.ccAct === 'signin' || btn.dataset.ccAct === 'signin-cancel')) {
        btn.dataset.ccAct = 'signin'; btn.textContent = id === 'github' ? 'INICIAR SESIÓN CON GITHUB' : '▸ INICIAR SESIÓN'; btn.disabled = false;
        btn.title = 'opens a secure browser sign-in (OAuth)';
      }
    }
    // auth tier chip: glyph, label, colour. Drives the honest "what will adding this cost me" cue.
    // CRT glyphs, not emoji (⚡🔑🔒 punched holes in the phosphor look). ▸ = no setup; API key + OAUTH ride as plain
    // colour-coded text chips (gold / dim) — VT323 has no key/lock glyph that renders (⚿ came out as tofu), and the
    // task says plain text chips are fine. The render below omits the leading glyph when it's empty.
    const CC_CHIP = { none: ['▸', 'sin configuración', 'var(--ok)'], apikey: ['', 'clave API', 'var(--gold)'], oauth: ['', 'iniciar sesión', 'var(--ph-dim)'] };
    // Shared local brand marks. SPOD's wordmark needs a wider frame than square symbols.
    function ccSeal(e) {
      return '<span class="cc-brand' + (e.id === 'spod' ? ' cc-brand-wide' : '') + '" aria-hidden="true">' + (ClassIcons.brandIcon(e) || esc(e.name.slice(0, 2).toUpperCase())) + '</span>';
    }
    function ccCard(e, ci) {
      const cardId = e.catalogId || e.id;
      const chip = e.platformApi && e.unattendedSupported === false
        ? ['', 'configuración manual', 'var(--gold)']
        : e.appPassword ? ['', 'contraseña de app', 'var(--gold)']
        : (e.signInAvailable === false ? ['', e.releaseDeferred ? 'diferido' : 'inicio de sesión no disponible', 'var(--gold)'] : (CC_CHIP[e.authType] || CC_CHIP.none));
      const origin = e.googleApi ? '<span class="cc-badge cc-official" title="StarNet connector using Google’s APIs">STARNET · GOOGLE API</span>' : e.platformApi
        ? (e.apiVia ? '<span class="cc-badge cc-community" title="this vendor publishes no API of its own">via ' + esc(e.apiVia) + '</span>'
                    : '<span class="cc-badge cc-official" title="API REST de primera parte documentada por el proveedor">✓ API oficial</span>')
        : (e.official ? '<span class="cc-badge cc-official" title="first-party server, run by the vendor">✓ official</span>'
                      : '<span class="cc-badge cc-community" title="community-run server">community</span>');
      let action;
      if (e.installed) action = '<button class="bb xs" data-cc-act="manage" data-id="' + esc(cardId) + '">GESTIONAR SERVICIO</button>' +
        // a rejected or revoked app password is fixed HERE (the login error says so): re-open the same form
        (e.appPassword ? '<button class="bb xs" data-cc-act="key" data-id="' + esc(cardId) + '">NEW APP PASSWORD</button>' : '');
      else if (e.platformApi) action = '<button class="bb xs" data-cc-act="platform" data-id="' + esc(cardId) + '">CONFIGURAR CLAVE API</button>';
      else if (e.googleApi && e.signInAvailable === false) action =
        '<button class="bb xs" disabled>' + (e.releaseDeferred ? 'DIFERIDO' : 'INICIO DE SESIÓN DE GOOGLE NO DISPONIBLE') + '</button>';
      else if (e.authType === 'oauth') action = e.url
        ? '<button class="bb xs" data-cc-act="signin" data-id="' + esc(cardId) + '" title="abre un inicio de sesión seguro en el navegador (OAuth)">' + (e.id === 'google-files' ? 'ELEGIR ARCHIVOS DE GOOGLE' : e.deviceFlow ? 'INICIAR SESIÓN CON GITHUB' : e.googleApi ? 'INICIAR SESIÓN CON GOOGLE' : '▸ INICIAR SESIÓN') + '</button>'
        : (e.via
          // url-less oauth entry reachable through an aggregator: a LIVE jump to that card, never a mute dead button.
          ? '<button class="bb xs" data-cc-act="via" data-id="' + esc(cardId) + '" data-via="' + esc(e.via) + '" title="no direct endpoint — jump to the connector that reaches it">▸ VIA ' + esc(e.via.toUpperCase()) + '</button>'
          : '<button class="bb xs" data-cc-act="soon" disabled title="not directly wired yet — see the note">SOON</button>');   // an oauth entry with no endpoint and no aggregator is honestly not sign-in-able
      else if (e.authType === 'apikey') action = '<button class="bb xs" data-cc-act="key" data-id="' + esc(cardId) + '">' + (e.appPassword ? 'CONFIGURAR CONTRASEÑA DE APP' : 'CONFIGURAR CLAVE API') + '</button>';
      else action = '<button class="bb sm" data-cc-act="add" data-id="' + esc(cardId) + '">+ ADD</button>';
      const keyDelivery = e.keyHeader
        ? '<code>' + esc(e.keyHeader) + ': &hellip;</code>'
        : '<code>Authorization: Bearer &hellip;</code>';
      const keyField = e.appPassword
        ? '<div class="cc-key cc-apppw" style="display:none"><div class="mc-hint">1. Turn on 2-Step Verification for your Google account. <a href="https://myaccount.google.com/signinoptions/two-step-verification" target="_blank" rel="noopener">2-Step Verification ↗</a>' +
            '<br>2. Create an app password (any name, for example StarNet). <a href="' + esc(e.homepage || 'https://myaccount.google.com/apppasswords') + '" target="_blank" rel="noopener">Create app password ↗</a>' +
            '<br>3. Enter your Gmail address and the 16-letter app password, then choose CONNECT.</div>' +
            '<input type="text" inputmode="email" class="key-input" data-cc-addr="' + esc(cardId) + '" aria-label="Gmail address" placeholder="you@gmail.com" autocomplete="off" spellcheck="false">' +
            '<input type="password" class="key-input" data-cc-key="' + esc(cardId) + '" aria-label="Google app password" placeholder="16-letter app password" autocomplete="off" spellcheck="false">' +
            '<div class="mc-hint">This uses an app password, not Google sign-in. StarNet talks to Gmail directly from this computer (IMAP and SMTP); the password is saved with your other connector credentials on this computer and never shown again.' +
            ' Mail read through this connection is never sent to StarNet Managed. On a work or school account, an administrator can turn app passwords off. Remove the connection or revoke the app password in your Google account at any time.</div></div>'
        : (e.authType === 'apikey' || e.deviceFlow) && !e.platformApi
        ? '<div class="cc-key" style="display:none"><div class="mc-hint">1. Abre tu cuenta de ' + esc(e.name) + ' y crea una clave o token API. ' + (e.homepage ? '<a href="' + esc(e.homepage) + '" target="_blank" rel="noopener">Abrir ' + esc(e.name) + ' ↗</a>' : '') + '<br>2. Pégalo abajo y elige CONECTAR.</div><input type="password" class="key-input" data-cc-key="' + esc(cardId) + '" aria-label="Clave o token API de ' + esc(e.name) + '" placeholder="Clave / token API de ' + esc(e.name) + '" autocomplete="off" spellcheck="false">' +
            '<div class="mc-hint">Stored locally by the sidecar, sent as ' + keyDelivery + ', never displayed again.</div></div>'
        : '';
      const clientField = e.googleApi && e.signInAvailable === false
        ? '<div class="mc-hint">' + esc(e.signInMessage || 'Google sign-in is not available in this build. StarNet needs to finish enabling it. No account setup is required from you.') + '</div>' : '';
      const home = e.homepage ? ' <a class="cc-home dim" href="' + esc(e.homepage) + '" target="_blank" rel="noopener">site ↗</a>' : '';
      // data-search: the console search box (stationui.js doFilter) matches textContent + this attribute, so a
      // Commander typing "google drive" reaches the Google Workspace card even though those words are only in
      // its blurb by luck. Off-screen matching text only — never rendered.
      const alias = (Array.isArray(e.aliases) && e.aliases.length) ? ' data-search="' + esc(e.aliases.join(' ')) + '"' : '';
      const presets = (Array.isArray(e.presets) && e.presets.length)
        ? '<div class="mc-hint">PRESETS · ' + e.presets.map(esc).join(' · ') + '</div>'
        : '';
      const platformMeta = e.platformApi
        ? (e.note ? '<div class="mc-hint">' + esc(e.note) + '</div>' : '') +
          '<div class="mc-url dim"><code>' + esc(e.envVar) + '</code>' +
            (e.docsUrl ? ' · <a class="dim" href="' + esc(e.docsUrl) + '" target="_blank" rel="noopener">docs ↗</a>' : '') + '</div>'
        : '';
      const setupHint = e.installed ? 'Setup saved — manage access or reconnect.'
        : e.signInAvailable === false ? (e.signInMessage || 'Sign-in is unavailable in this build.')
        : e.platformApi ? (e.unattendedSupported === false ? 'Manual setup required. See the service instructions before adding a key.' : 'Requires an API key from your account. Guided setup opens the key form.')
        : e.appPassword ? 'Needs a Google app password.'
        : e.authType === 'apikey' ? 'Requires an API key or token from your account.'
        : e.authType === 'oauth' ? (e.url ? 'Sign in in your browser, then return here to check the connection.' : 'Connect through the service shown below.')
        : e.local ? 'Start the local service first, then connect.' : 'No account credentials needed.';
      // data-auth / data-installed drive the tier filter above. They mirror the chip the card already
      // shows, so the filter can never disagree with what is printed on the card.
      return '<div class="cc-card' + (e.installed ? ' cc-on' : '') + '" data-id="' + esc(cardId) + '"' + alias +
          ' data-auth="' + esc(e.authType || 'none') + '" data-installed="' + (e.installed ? '1' : '0') + '"' +
          ' style="--ci:' + (ci || 0) + '">' +
          '<div class="cc-head">' + ccSeal(e) + '<div class="cc-identity"><b>' + esc(e.name) + '</b>' +
            '<span class="cc-chip" style="color:' + chip[2] + '" title="' + esc(chip[1]) + '">' + (chip[0] ? chip[0] + ' ' : '') + esc(chip[1]) + '</span></div></div>' +
          (e.appPassword ? '<div class="cc-blurb dim" data-tip="' + esc(e.blurb) + '">IMAP · SMTP · app password</div>' : '<div class="cc-blurb dim">' + esc(e.blurb) + '</div>') + '<details class="cc-details"><summary>Connection details</summary><div class="cc-details-body">' + clientField + origin + presets + platformMeta + (e.installed ? '<div class="mc-hint">' + (e.releaseDeferred ? 'Conexión guardada retenida. Abre Gestionar Servicio para verlo o eliminarlo.' : 'Configuración guardada. Abre Gestionar Servicio para comprobar el acceso o reconectar.') + '</div>' : '') + '</div></details>' + keyField +
          '<div class="mc-hint cc-setup-hint">' + esc(setupHint) + '</div>' +
          '<div class="cc-acts">' + action + home + '</div>' + (e.deviceFlow && !e.installed ? '<details><summary>Use a personal access token instead</summary><button class="bb xs" data-cc-act="key" data-id="' + esc(cardId) + '">SET UP TOKEN</button></details>' : '') +
        '</div>';
    }
    function ccGroupHTML(g) {
      if (!g.connectors || !g.connectors.length) return '';
      return '<div class="cc-group"><div class="sec"><span class="sec-l">' + esc(g.category) + '</span>' +
          '<span class="sec-tag">' + g.connectors.length + '</span><span class="sec-r"></span><span class="sec-nd"></span></div>' +
        (g.category === 'Popular' ? '<p class="mc-hint">A curated starting point for everyday work.</p>' : '') +
        '<div class="cc-grid">' + g.connectors.map((e, i) => {
          const alternate = ccAlternatives.get(e.catalogId || e.id);
          return alternate ? '<div class="cc-service">' + ccCard(e, i) + '<details class="cc-alternatives"><summary>Advanced: ' + esc(e.name) + ' API connection</summary>' + ccCard(alternate, i) + '</details></div>' : ccCard(e, i);
        }).join('') + '</div></div>';
    }
    // Editorial picks, not a claim about measured customer usage. Move rather than duplicate
    // cards so sign-in progress, search results and saved-service counts have one owner.
    function ccPopularGroups(groups) {
      const picks = ['gmail', 'gmail-app-password', 'google-drive', 'google-calendar', 'notion', 'github', 'canva', 'linear', 'stripe', 'asana', 'clickup'];
      const entries = groups.flatMap(g => g.connectors);
      const popular = picks.map(id => entries.find(e => e.id === id && !e.platformApi && e.signInAvailable !== false && !e.releaseDeferred && e.url)).filter(Boolean).slice(0, 8);
      const selected = new Set(popular);
      return (popular.length ? [{ category: 'Popular', connectors: popular }] : []).concat(
        groups.map(g => ({ category: g.category, connectors: g.connectors.filter(e => !selected.has(e)) })).filter(g => g.connectors.length));
    }
    async function ccRefresh() {
      try {
        const pair = await Promise.all([
          Harness.api.get('/api/connectors/catalog'),
          Harness.api.get('/api/servicekeys/catalog')
        ]);
        const j = pair[0] || {}, keyed = pair[1] || {};
        // A platform API is catalog-worthy but it is NOT an MCP connector. Normalize only the card grammar;
        // `platformApi` keeps its action on the KEYS/servicekeys path and prevents ccInstall from ever seeing it.
        const platformGroups = ((keyed && keyed.groups) || []).map(g => ({
          category: g.category,
          connectors: (g.platforms || []).map(p => Object.assign({}, p, {
            authType: p.unattendedSupported === false ? 'manual' : 'apikey',
            official: true,
            platformApi: true,
            catalogId: 'platform:' + p.id
          }))
        }));
        // Platform categories lead: a Commander asking for Printify should not have to scroll past the entire
        // MCP directory. Exact-name categories merge so Developer Tools does not render twice.
        const groups = [];
        ccAlternatives = new Map();
        const connections = ((j && j.groups) || []).flatMap(g => g.connectors || []);
        const serviceName = value => String(value || '').trim().toLowerCase();
        for (const group of platformGroups) {
          group.connectors = group.connectors.filter(platform => {
            const primary = connections.find(c => serviceName(c.name) === serviceName(platform.name));
            if (!primary) return true;
            ccAlternatives.set(primary.catalogId || primary.id, platform);
            return false;
          });
        }
        for (const g of platformGroups.concat((j && j.groups) || [])) {
          let out = groups.find(x => x.category === g.category);
          if (!out) { out = { category: g.category, connectors: [] }; groups.push(out); }
          out.connectors.push.apply(out.connectors, g.connectors || []);
        }
        ccCache = groups.flatMap(g => g.connectors).concat([...ccAlternatives.values()]);
        ccListEl.innerHTML = ccPopularGroups(groups).map(ccGroupHTML).join('') || '<div class="mc-detail">catalog is empty.</div>';
        ccApplyFilter();   // a refresh re-renders every card, so re-assert the active tier filter
        const search = body.querySelector('.con-search-in');
        if (search && search.value.trim()) search.dispatchEvent(new Event('input', { bubbles: true }));
        if (ccJumpPending) {
          const jid = ccJumpPending; ccJumpPending = null;
          const card = ccListEl.querySelector('.cc-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(jid) : jid) + '"]');
          if (card) { if (card.hidden) ccSetFilter('all'); ccFlash(card); }
          else { ccMsgEl.classList.remove('ok'); ccMsgEl.textContent = '✕ "' + jid + '" is not in the catalog'; }
        }
      } catch (_) { ccListEl.innerHTML = '<div class="mc-detail">sidecar offline — start it to browse the catalog.</div>'; }
    }
    /* Tier filter. Hides cards, then hides any category group left with nothing visible — a category
       heading over an empty grid reads as a broken render. The per-group count re-states what is SHOWN
       rather than the authored total, because a header claiming "7" above three cards is exactly the kind
       of small lie this project treats as a bug. */
    let ccFilter = 'all';
    const ccFiltersEl = body.querySelector('#cc-filters');
    function ccApplyFilter() {
      if (!ccListEl) return;
      let shown = 0;
      ccListEl.querySelectorAll('.cc-group').forEach(g => {
        let vis = 0;
        g.querySelectorAll('.cc-card').forEach(c => {
          const hit = ccFilter === 'all' ? true
            : ccFilter === 'installed' ? c.dataset.installed === '1'
            : c.dataset.auth === ccFilter;
          c.hidden = !hit;
        });
        // Count services, including one whose saved setup uses the alternate API path.
        for (const service of g.querySelector('.cc-grid').children) {
          if (service.matches('.cc-card') ? !service.hidden : service.querySelector('.cc-card:not([hidden])')) vis++;
        }
        g.hidden = vis === 0;
        const tag = g.querySelector('.sec-tag');
        if (tag) tag.textContent = String(vis);
        shown += vis;
      });
      // An empty result is a real answer and must say which filter produced it — never a blank pane.
      let none = ccListEl.querySelector('.cc-nores');
      if (!shown && ccFilter !== 'all') {
        if (!none) {
          none = document.createElement('div');
          none.className = 'mc-detail cc-nores';
          ccListEl.appendChild(none);
        }
        none.hidden = false;
        none.textContent = ccFilter === 'installed'
          ? 'No saved services from the catalog yet — pick ALL to connect one.'
          : 'No catalog entry uses that setup type.';
      } else if (none) none.hidden = true;
    }
    function ccSetFilter(f) {
      ccFilter = f;
      if (ccFiltersEl) ccFiltersEl.querySelectorAll('.cc-filter').forEach(x => {
        const active = x.dataset.ccFilter === f;
        x.classList.toggle('active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      ccApplyFilter();
    }
    if (ccFiltersEl) ccFiltersEl.addEventListener('click', ev => {
      const b = ev.target.closest('button[data-cc-filter]'); if (!b) return;
      ccSetFilter(b.dataset.ccFilter); sfx('tick');
    });
    // SEARCH BEATS THE TIER FILTER. The console search (stationui doFilter) marks a matching card
    // `.con-hit`, but a card this filter set `hidden` stays display:none — so searching "stripe" with
    // "▸ no setup" active lit the CATALOG rail and showed NOTHING (probed live: hit:true, painted:false).
    // The Commander who types a name has stated a stronger intent than a chip they clicked earlier, so
    // entering search resets the filter to ALL rather than leaving two filters silently ANDed.
    const ccSearchIn = body.querySelector('.con-search-in');
    if (ccSearchIn) ccSearchIn.addEventListener('input', () => {
      if ((ccSearchIn.value || '').trim() && ccFilter !== 'all') ccSetFilter('all');
    });
    async function ccInstall(id, token) {
      const e = ccEntry(id);
      if (!e || !e.url) { sfx('bad'); return; }
      ccMsgEl.classList.remove('ok'); ccMsgEl.textContent = 'conectando ' + e.name + '…';
      const payload = { id: e.id, label: e.name, transport: 'http', url: e.url, enabled: true };
      if (token) payload.token = token;
      try {
        const j = await (await postJSON('/api/connectors', payload)).json().catch(() => ({}));
        if (j.error) { ccMsgEl.textContent = '✕ ' + j.error; sfx('bad'); }
        else if (j.status && j.status.state === 'up') {
          ccMsgEl.classList.add('ok'); ccMsgEl.textContent = '✓ ' + e.name + ' connected — ' + (j.status.toolCount || 0) + ' herramienta(s) disponible(s)'; sfx('click');
          notify('Conector "' + e.name + '" conectado', 'good');
        } else { ccMsgEl.textContent = '✕ ' + ((j.status && j.status.detail) || ('could not connect (' + (j.state || 'error') + ')')); sfx('bad'); }
      } catch (err) { ccMsgEl.textContent = '✕ ' + ((err && err.message) || 'no se pudo alcanzar el sidecar'); sfx('bad'); }
      ccRefresh();   // reflect the new installed state on the cards
      refresh();     // and repaint the MCP CONNECTORS list (same underlying connector set)
    }
    // OAuth sign-in: start the flow, open the provider's consent (browser tab on desktop, popup in a browser),
    // then poll until the connector connects — but only if the consent window actually opened.
    async function ccSignIn(id, msgOut, labelOverride, googleDisclosed = false) {
      // progress lands in the caller's message line: the catalog's by default, the MCP CONNECTORS pane's when the
      // ⏼ RE-SIGN-IN row action drives this (the user is looking at that tab — the catalog line is off-screen).
      const out = msgOut || ccMsgEl;
      if (ccPending.has(id)) { sfx('bad'); out.classList.remove('ok'); out.textContent = 'ya hay un inicio de sesión en curso para este conector…'; return; }
      const e = ccEntry(id); const label = labelOverride || (e && e.name) || id;
      if (e && e.releaseDeferred) { out.classList.remove('ok'); out.textContent = e.signInMessage; return; }
      // Disclose the actual model/data path in the app immediately before Google consent.
      // No OAuth attempt exists until the explicit Continue action; dismissing this panel is not consent.
      if (!googleDisclosed && ((e && e.googleApi) || /^(gmail|google-(drive|calendar|docs|sheets))$/.test(id))) {
        body.querySelectorAll('.google-disclosure').forEach(node => node.remove());
        const notice = document.createElement('section');
        notice.className = 'ext-editor mc-form google-disclosure';
        notice.setAttribute('role', 'group');
        notice.setAttribute('aria-label', 'Conexión de Google y uso de datos');
        notice.innerHTML = '<strong>CONNECT ' + esc(label.toUpperCase()) + '</strong>' +
          '<p>' + esc((e && e.blurb) || 'Conecta el servicio de Google seleccionado usando los permisos que apruebes en Google.') + '</p>' +
          '<p>Cuando un agente usa esta conexión, el contenido del servicio de Google puede enviarse a tu proveedor de modelos de IA seleccionado. Con StarNet Credits, esas solicitudes también pasan por la pasarela de créditos de StarNet.</p>' +
          '<p>Las credenciales de inicio de sesión se guardan en este dispositivo. Las conversaciones, archivos y memorias pueden retener contenido de tus solicitudes. Eliminar la conexión borra sus credenciales guardadas; no borra el trabajo previo ni revoca el acceso en tu cuenta de Google.</p>' +
          '<p><a class="bb sm" href="https://starnetos.com/legal/privacy#google-workspace" target="_blank" rel="noopener">Google data use and removal details ↗</a></p>' +
          '<div class="mc-acts"><button class="bb sm" data-google-continue>CONTINUE TO GOOGLE</button><button class="bb sm" data-google-cancel>CANCEL</button></div>';
        out.classList.remove('ok'); out.textContent = '';
        out.before(notice);
        const proceed = notice.querySelector('[data-google-continue]');
        proceed.addEventListener('click', () => {
          if (!body.isConnected || !notice.isConnected) return;
          proceed.disabled = true; notice.remove();
          ccSignIn(id, msgOut, labelOverride, true);
        });
        notice.querySelector('[data-google-cancel]').addEventListener('click', () => {
          notice.remove(); out.textContent = 'Inicio de sesión de Google cancelado — no se inició ninguna conexión.';
        });
        notice.scrollIntoView({ block: 'center' }); proceed.focus({ preventScroll: true });
        return;
      }
      ccPending.add(id);   // one in-flight sign-in per connector — no duplicate popups / concurrent pollers
      out.classList.remove('ok'); out.textContent = 'iniciando sesión para ' + label + '…';
      const attemptId = 'cc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      const controller = new AbortController();
      ccAttempts.set(id, { attemptId, controller });
      const earlyCancel = ccListEl.querySelector('.cc-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"] button[data-cc-act]');
      if (earlyCancel) { earlyCancel.dataset.ccAct = 'signin-cancel'; earlyCancel.textContent = 'CANCELAR'; earlyCancel.disabled = false; }
      let url, device;
      try {
        const startRes = await fetch('/api/connectors/oauth/start', { method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, attemptId: attemptId }) });
        const j = await startRes.json().catch(() => ({}));
        if (j.error || !j.url) { out.textContent = '✕ ' + (j.error || 'no se pudo iniciar la sesión'); sfx('bad'); ccPending.delete(id); ccAttempts.delete(id); ccResetSignBtn(id); return; }
        url = j.url;
        if (j.deviceFlow) device = j;
      } catch (err) {
        ccPending.delete(id); ccAttempts.delete(id); ccResetSignBtn(id);
        if (controller.signal.aborted) { out.textContent = 'sign-in for ' + label + ' cancelada — pulsa INICIAR SESIÓN para reintentar.'; return; }
        out.textContent = '✕ ' + ((err && err.message) || 'solicitud fallida'); sfx('bad'); return;
      }
      if (controller.signal.aborted) return;
      if (device) { await ccDeviceSignIn(id, out, device, controller); return; }
      const opened = await openSignIn(url);
      if (!opened.opened) {
        // The consent window never opened (popup-blocked in a browser, or the OS-browser hand-off failed on
        // desktop). Do NOT start the poll — a "waiting for sign-in" claim against a window that doesn't exist
        // is the exact lie this fix removes. Tell the truth and stop.
        out.textContent = '✕ couldn’t open the sign-in page for ' + label + (opened.where === 'popup' ? ' — permite ventanas emergentes para este sitio e inténtalo de nuevo.' : ' — inténtalo de nuevo.'); sfx('bad'); ccPending.delete(id); ccAttempts.delete(id); ccResetSignBtn(id); return;
      }
      const win = opened.win;   // popup handle when in a browser; null on desktop (opened in the real browser)
      ccPendingWin.set(id, win || null);   // remembered so a CANCEL can close a still-open popup
      out.textContent = 'completa el inicio de sesión para ' + label + (opened.where === 'browser' ? ' en tu navegador…' : ' en la ventana emergente…');
      // Turn the card's SIGN IN button into a visible CANCEL affordance for the duration of the poll — before this
      // the only way out of a stalled/abandoned sign-in was to wait out the 5-minute cap (EL-11 #13).
      const signBtn = ccListEl.querySelector('.cc-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"] button[data-cc-act]');
      if (signBtn) { signBtn.dataset.ccAct = 'signin-cancel'; signBtn.textContent = '✕ CANCELAR'; signBtn.disabled = false; signBtn.title = 'deja de esperar este inicio de sesión'; }
      let tries = 0;
      const timer = setInterval(async () => {
        // Self-terminate the moment the panel body leaves the DOM (window closed / rerendered) — the same guard
        // buildMessaging._poll uses. Without it an abandoned sign-in kept hitting /api/connectors for ~5 min.
        if (!document.body.contains(body)) { stopCcPoll(id); ccPending.delete(id); ccPendingWin.delete(id); ccAttempts.delete(id); return; }
        tries++;
        try {
          const j = await Harness.api.get('/api/connectors');
          const found = (j.connectors || []).find(x => x.id === id);
          // Only an OAuth row is proof of a finished sign-in: a saved-token row moving to sign-in (catalogSignIn) is
          // already up — or already erroring — before consent, and stays non-oauth until the callback lands.
          const c = found && found.oauth ? found : null;
          if (c && c.state === 'up') { stopCcPoll(id); ccPending.delete(id); ccPendingWin.delete(id); ccAttempts.delete(id); sfx('click'); notify('Conector "' + label + '" conectado', 'good'); out.classList.add('ok'); out.textContent = '✓ ' + label + ' con sesión iniciada — ' + (c.toolCount || 0) + ' herramienta(s)'; ccRefresh(); refresh(); try { if (win && !win.closed) win.close(); } catch (_) {} return; }
          if (c && c.state === 'error' && (!c.oauth || c.oauthAuthorized)) { stopCcPoll(id); ccPending.delete(id); ccPendingWin.delete(id); ccAttempts.delete(id); sfx('bad'); out.textContent = '✕ ' + label + ' — ' + (c.detail || 'falló la conexión'); ccRefresh(); refresh(); return; }
        } catch (_) {}
        if (tries > 150) { stopCcPoll(id); ccPending.delete(id); ccPendingWin.delete(id); ccAttempts.delete(id); ccResetSignBtn(id); out.classList.remove('ok'); out.textContent = 'El inicio de sesión expiró. Inicia sesión de nuevo y vuelve a tu tarea.'; }   // ~5-minute cap
      }, 2000);
      ccTimers.set(id, timer);
    }
    async function ccDeviceSignIn(id, out, device, controller) {
      const notice = document.createElement('dialog');
      notice.className = 'ext-editor mc-form github-device-code';
      notice.setAttribute('aria-label', 'Iniciar sesión con GitHub');
      notice.style.cssText = 'position:fixed;inset:0;margin:auto;width:min(520px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:24px;background:#17140e;color:var(--ph,#ddbd83);border:1px solid var(--gold,#ac853e);z-index:10000;box-shadow:0 0 0 100vmax #0009';
      notice.innerHTML = '<strong>CONNECT GITHUB</strong><p>1. Copy this code: <code style="font-size:20px;user-select:all">' + esc(device.userCode) + '</code> <button class="bb sm" data-device-copy>COPY CODE</button></p>' +
        '<p>2. Open GitHub, enter the code, and approve StarNet’s repository and organization access.</p>' +
        '<p>3. Vuelve aquí. StarNet verificará y guardará tu conexión en este dispositivo.</p>' +
        '<div class="mc-acts"><button class="bb sm" data-device-open>OPEN GITHUB</button><button class="bb sm" data-device-cancel>CANCEL</button></div><p data-device-status role="status"></p>';
      document.body.appendChild(notice); notice.showModal();
      notice.addEventListener('cancel', ev => { ev.preventDefault(); ccCancelSignIn(id); });
      const progress = message => { out.textContent = message; notice.querySelector('[data-device-status]').textContent = message; };
      const copy = notice.querySelector('[data-device-copy]');
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(device.userCode); copy.textContent = 'COPIADO'; }
        catch (_) { copy.textContent = 'SELECCIONA EL CÓDIGO DE ARRIBA'; }
      });
      const open = async () => {
        const result = await openSignIn(device.url);
        if (!result.opened) progress('No se pudo abrir GitHub. Permite ventanas emergentes y elige ABRIR GITHUB.');
        else { ccPendingWin.set(id, result.win || null); progress('Esperando a que introduzcas el código y apruebes StarNet en GitHub…'); }
      };
      notice.querySelector('[data-device-open]').addEventListener('click', open);
      notice.querySelector('[data-device-cancel]').addEventListener('click', () => ccCancelSignIn(id));
      const remove = () => notice.remove();
      controller.signal.addEventListener('abort', remove, { once: true });
      try {
        await open();
        const until = Date.now() + device.expiresIn * 1000;
        while (!controller.signal.aborted && body.isConnected && Date.now() < until) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (controller.signal.aborted || !body.isConnected) break;
          const res = await fetch('/api/connectors/oauth/device/poll', { method: 'POST', signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId: device.attemptId }) });
          const j = await res.json();
          if (j.state === 'pending') continue;
          if (controller.signal.aborted) break;
          if (j.state === 'connected') {
            out.classList.add('ok'); out.textContent = '✓ GitHub conectado como ' + j.login + ' — ' + j.toolCount + ' herramienta(s)';
            sfx('click'); notify(out.textContent, 'good');
          } else { out.classList.remove('ok'); out.textContent = j.error || 'Falló el inicio de sesión de GitHub. Inténtalo de nuevo.'; notify(out.textContent, 'bad'); }
          ccRefresh(); refresh(); return;
        }
        if (!controller.signal.aborted && body.isConnected) { out.textContent = 'El código de GitHub expiró. Inicia sesión de nuevo para obtener un código nuevo.'; notify(out.textContent, 'bad'); }
      } catch (_) { if (!controller.signal.aborted) { out.textContent = 'No se pudo completar el inicio de sesión de GitHub. Inténtalo de nuevo.'; notify(out.textContent, 'bad'); } }
      finally {
        controller.signal.removeEventListener('abort', remove); notice.remove();
        postJSON('/api/connectors/oauth/cancel', { id, attemptId: device.attemptId }).catch(() => {});
        if (ccAttempts.get(id) && ccAttempts.get(id).attemptId === device.attemptId) {
          ccPending.delete(id); ccAttempts.delete(id); ccPendingWin.delete(id); ccResetSignBtn(id);
        }
      }
    }
    // CANCEL a still-polling sign-in: clear the timer, drop the in-flight guard, close any popup we opened, and reset
    // the card so a re-click can start over. Honest neutral message — we are NOT claiming a failure, the user opted out.
    function ccCancelSignIn(id) {
      stopCcPoll(id);
      ccPending.delete(id);
      const attempt = ccAttempts.get(id); ccAttempts.delete(id);
      if (attempt) {
        try { attempt.controller.abort(); } catch (_) {}
        postJSON('/api/connectors/oauth/cancel', { id: id, attemptId: attempt.attemptId }).catch(() => {});
      } else postJSON('/api/connectors/oauth/cancel', { id: id }).catch(() => {});
      const w = ccPendingWin.get(id); ccPendingWin.delete(id);
      try { if (w && !w.closed) w.close(); } catch (_) {}
      ccResetSignBtn(id);
      const e = ccEntry(id); const label = (e && e.name) || id;
      ccMsgEl.classList.remove('ok'); ccMsgEl.textContent = 'sign-in for ' + label + ' cancelada — pulsa INICIAR SESIÓN para reintentar.'; sfx('tick');
    }
    ccListEl.addEventListener('click', async ev => {
      const copyBtn = ev.target.closest('button[data-cc-copy]');
      if (copyBtn) {
        try { await navigator.clipboard.writeText(copyBtn.dataset.ccCopy); copyBtn.textContent = 'COPIADO'; sfx('tick'); }
        catch (_) { copyBtn.textContent = 'SELECCIONAR'; const code = copyBtn.previousElementSibling; try { getSelection().selectAllChildren(code); } catch (__) {} }
        setTimeout(() => { copyBtn.textContent = 'COPIAR'; }, 1500);
        return;
      }
      const btn = ev.target.closest('button[data-cc-act]'); if (!btn) return;
      const act = btn.dataset.ccAct, id = btn.dataset.id;
      if (act === 'manage') {
        const entry = ccEntry(id);
        if (!entry) return;
        const tab = body.querySelector('#con-tab-connectors-' + (entry.platformApi ? 'keys' : 'mcp'));
        if (tab) tab.click();
        if (entry.platformApi) { await kyRefresh(); await kyPlatformsRefresh(); }
        else {
          await refresh();
          const target = Array.from(listEl.querySelectorAll('.mc-row')).find(r => r.dataset.id === entry.id);
          if (target) ccFlash(target);
          else { msgEl.classList.remove('ok'); msgEl.textContent = 'Esta conexión guardada ya no aparece en la lista. Vuelve al CATÁLOGO y actualiza para comprobar su configuración.'; }
        }
      }
      else if (act === 'add') { btn.disabled = true; await ccInstall(id); }
      else if (act === 'platform') {
        const entry = ccEntry(id);
        if (entry) ccPrefillPlatform(entry);
      }
      else if (act === 'key') {
        // first tap reveals the inline key field; the second (now ▶ CONNECT) submits it — no modal.
        const card = ev.target.closest('.cc-card');
        const wrap = card && card.querySelector('.cc-key');
        const input = wrap && wrap.querySelector('input[data-cc-key]');
        const addrIn = wrap && wrap.querySelector('input[data-cc-addr]');
        // the class (not the inline style) is what menu-glass.css's :has() keys on: a :has() reading [style] re-checks on every inline-style write in the page
        if (wrap && wrap.style.display === 'none') { wrap.style.display = ''; wrap.classList.add('cc-key-open'); btn.textContent = '▶ CONECTAR'; if (addrIn || input) (addrIn || input).focus(); sfx('tick'); return; }
        let token = ((input && input.value) || '').trim();
        if (addrIn) {
          const addr = (addrIn.value || '').trim();
          if (!addr || !token) { sfx('bad'); ccMsgEl.classList.remove('ok'); ccMsgEl.textContent = 'introduce primero tu dirección de Gmail y la contraseña de app de 16 caracteres'; return; }
          token = addr + ':' + token.replace(/\s+/g, '');
          input.value = '';   // the password never lingers in the page
        }
        if (!token) { sfx('bad'); ccMsgEl.classList.remove('ok'); ccMsgEl.textContent = 'pega primero la clave API'; return; }
        btn.disabled = true; await ccInstall(id, token);
      }
      else if (act === 'signin') { btn.disabled = true; await ccSignIn(id); btn.disabled = false; }
      else if (act === 'signin-cancel') { ccCancelSignIn(id); }
      else if (act === 'via') {
        // Jump to the aggregator card that actually reaches this platform (e.g. Atlassian -> Zapier).
        const viaId = btn.dataset.via;
        const target = ccListEl.querySelector('.cc-card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(viaId) : viaId) + '"]');
        const e = ccEntry(id), v = ccEntry(viaId);
        ccMsgEl.classList.remove('ok');
        if (!target || !v) { ccMsgEl.textContent = '✕ el conector "' + viaId + '" no está en el catálogo'; sfx('bad'); return; }
        ccMsgEl.textContent = ((e && e.name) || id) + ' se conecta a través de ' + v.name + ' — añade ' + v.name + ' con una sola clave API.';
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.remove('cc-jump'); void target.offsetWidth;   // restart the flash on a re-click
        target.classList.add('cc-jump');
        setTimeout(() => target.classList.remove('cc-jump'), 2500);
        sfx('tick');
      }
    });
    ccRefresh();

    // ===== KEYS: connected keyed platforms (truth from /api/connectors + catalog) + custom /api/servicekeys =====
    const kyPlatEl = body.querySelector('#ky-platforms');
    const kyListEl = body.querySelector('#ky-list');
    const kyMsgEl = body.querySelector('#ky-msg');
    const kyNameEl = body.querySelector('#ky-name');
    const kyKeyEl = body.querySelector('#ky-key');
    const kyDocsEl = body.querySelector('#ky-docs');
    kyNameEl.addEventListener('input', () => { body.querySelector('#ky-guide').hidden = true; });
    // a 1Password reference is not a secret (it names where the key lives): show it while it is typed or pasted
    const kyIsRef = v => /^op:\/\//i.test(String(v || '').trim());
    kyKeyEl.addEventListener('input', () => { kyKeyEl.type = kyIsRef(kyKeyEl.value) ? 'text' : 'password'; });
    // CATALOG owns discovery; KEYS owns the credential. A platform card lands on the real add form and
    // carries only public setup metadata from /api/servicekeys/catalog — never a secret or invented state.
    function ccPrefillPlatform(p) {
      const tab = body.querySelector('#con-tab-connectors-keys');
      if (tab) tab.click();
      kyNameEl.value = p.name;
      kyKeyEl.value = '';
      kyDocsEl.value = p.docsUrl || '';
      const guide = body.querySelector('#ky-guide');
      guide.hidden = false;
      guide.innerHTML = '<b>Conecta ' + esc(p.name) + '</b><br>1. ' + (p.docsUrl ? '<a href="' + esc(p.docsUrl) + '" target="_blank" rel="noopener">Abre las instrucciones de la API de ' + esc(p.name) + ' ↗</a>' : 'Abre los ajustes de cuenta de ' + esc(p.name) + '.') +
        '<br>2. Crea una clave o token siguiendo esas instrucciones y pégalos abajo. Usa una clave API, no la contraseña de tu cuenta.' +
        '<br>3. Elige GUARDAR CLAVE y pide a tu agente que pruebe una tarea con ' + esc(p.name) + '. Guardar una clave no verifica el acceso.';
      kyMsgEl.classList.remove('ok');
      kyMsgEl.textContent = p.unattendedSupported === false
        ? p.name + ' solo es supervisado/manual — ' + (p.unattendedReason || 'el uso sin supervisión no está soportado')
        : (p.authHint
          ? 'pega tu clave de ' + p.name + ' — el agente la enviará como  ' + p.authHint
          : 'pega tu clave de ' + p.name + ' — el agente lee ' + (p.docsUrl || 'la documentación') + ' para la cabecera correcta');
      if (host) host.scrollTop = host.scrollHeight;
      kyKeyEl.focus();
      sfx('click');
    }
    // TOP: platforms whose credential is a saved key/token on a live connector config. Read-only here — each is
    // managed where it was added (its CATALOG card / MCP CONNECTORS row). hasToken/hasHeaders are the backend's honest flags;
    // we never see (or show) the value. OAuth connectors are keyless by design and stay off this list.
    async function kyPlatformsRefresh() {
      try {
        const [cRes, gRes] = await Promise.all([readJSON('/api/connectors'), readJSON('/api/connectors/catalog')]);
        // The CONNECTORS read is what decides "you have none" — if it failed, say so instead of asserting zero.
        // The catalog is only display sugar (names); a failed catalog degrades labels, never the count.
        if (!cRes.ok) { kyPlatEl.innerHTML = readFailLine(cRes, 'sidecar desconectado — inícialo para ver las plataformas conectadas.'); return; }
        const cj = cRes.json, gj = gRes.json;
        const byId = {};
        for (const e of ((gj && gj.connectors) || [])) byId[e.id] = e;
        const keyed = ((cj && cj.connectors) || []).filter(c => (c.hasToken || c.hasHeaders) && !c.oauth);
        const n = body.querySelector('#ky-plat-n'); if (n) n.textContent = String(keyed.length);
        if (!keyed.length) {
          // The sentence named a destination and gave nothing to click — the same dead-end shape as the
          // inert toolset row. `data-ab-to` is the front door's own jump contract, handled by the router.
          kyPlatEl.innerHTML = '<div class="mc-detail">No keyed platform connected yet — add one from the CATALOG (the entries marked <b style="color:var(--gold)">API key</b>). ' +
            '<button type="button" class="bb xs" data-ab-to="catalog">⊞ OPEN CATALOG</button></div>';
          return;
        }
        kyPlatEl.innerHTML = keyed.map((c, i) => {
          const cat = byId[c.id];
          const b = c.state === 'up' ? ['var(--ok)', '● conectado'] : (c.state === 'cached' ? ['var(--gold)', '◐ en espera · se inicia al usarlo'] : (c.state === 'error' ? ['var(--bad)', '✕ error'] : ['var(--ph-dim)', '○ ' + esc(c.state || 'apagado')]));
          return '<div class="mc-row" style="--ci:' + i + '">' +
            '<div class="mc-top"><b>' + esc((cat && cat.name) || c.label || c.id) + '</b> <span class="dim">' + esc(c.id) + '</span>' +
              '<span class="mc-state" style="color:' + b[0] + '">' + b[1] + (c.toolCount ? ' · ' + c.toolCount + ' herramienta' + (c.toolCount === 1 ? '' : 's') : '') + '</span></div>' +
            '<div class="mc-url dim"><span class="mc-tag">' + (c.hasHeaders && !c.hasToken ? 'cabecera guardada' : 'token guardado') + '</span> gestionado en ' + (cat ? 'CATÁLOGO' : 'SERVICIOS CONECTADOS') + '</div>' +
          '</div>';
        }).join('');
      } catch (_) { kyPlatEl.innerHTML = '<div class="mc-detail">sidecar desconectado — inícialo para ver las plataformas conectadas.</div>'; }
    }
    // BOTTOM: the custom store. Checkbox = kill-switch (key stays saved, agents stop seeing it); ✕ deletes.
    // "read 4 min ago" from the sidecar's own read time (refReadAt) — never a client-side guess
    function kyReadAgo(t) {
      const s = Math.max(0, Math.round((Date.now() - Number(t || 0)) / 1000));
      return s < 60 ? 'ahora mismo' : (s < 3600 ? Math.round(s / 60) + ' min atrás' : Math.round(s / 3600) + ' h atrás');
    }
    function kyRow(k, i) {
      const unattendedSupported = k.unattendedSupported !== false;
      const docs = k.docsUrl ? ' <a class="dim" href="' + esc(k.docsUrl) + '" target="_blank" rel="noopener">docs ↗</a>' : '';
      // A 1Password row is "live" only when the sidecar actually holds a value it read (refReady); until the first
      // read it says it reads on use, and a failed read says why in the row itself.
      const op = k.source === '1password';
      const notYet = op && !k.refReady && /^not read yet/.test(k.refError || '');
      const state = !k.enabled ? ['var(--ph-dim)', '○ off']
        : (!op || k.refReady ? ['var(--ok)', '● live for agents']
          : (notYet ? ['var(--gold)', '◐ reads from 1Password on use'] : ['var(--bad)', '✕ 1Password not read']));
      return '<div class="mc-row" data-id="' + esc(k.id) + '" style="--ci:' + (i || 0) + '">' +
        '<div class="mc-top">' +
          '<span class="set-row mc-enable"><input type="checkbox" data-ky-act="toggle"' + (k.enabled ? ' checked' : '') + ' aria-label="Enable key ' + esc(k.name) + '"></span>' +
          '<b>' + esc(k.name) + '</b> <span class="dim">' + esc(op ? '1Password' : k.last4) + '</span>' +
          '<span class="mc-state" style="color:' + state[0] + '">' + state[1] + '</span></div>' +
        '<div class="mc-url dim">env var <code>' + esc(k.envVar) + '</code>' + docs + '</div>' +
        (op ? '<div class="mc-url dim">from <code>' + esc(k.ref) + '</code>' + (k.refReady && k.refReadAt ? ' · read ' + kyReadAgo(k.refReadAt) : '') + '</div>' +
          (k.refError && !notYet ? '<div class="mc-url" style="color:' + (k.refReady ? 'var(--gold)' : 'var(--bad)') + '">' + esc(k.refError) + '</div>' : '') : '') +
        // THE UNATTENDED GRANT, stated plainly. `enabled` = an agent may spend this while you watch;
        // this second switch = ...and while you don't (cron, Night Shift, a Telegram message). Default OFF
        // and never inferred, so pasting a key can't silently change what happens overnight.
        '<div class="set-row ky-auto"><input type="checkbox" data-ky-act="autonomy"' + (k.autonomous ? ' checked' : '') +
          (k.enabled && unattendedSupported ? '' : ' disabled') + ' aria-label="Allow unattended use of ' + esc(k.name) + '">' +
          '<span class="dim">' + (!unattendedSupported
            ? 'solo sesiones supervisadas — ' + esc(k.unattendedReason || 'el uso sin supervisión no está soportado')
            : (k.autonomous
              ? 'usable en ejecuciones programadas y con mensajes' + (op ? ' mientras 1Password puede responder sin ti (desbloqueada, o una cuenta de servicio)' : '')
              : 'solo sesiones supervisadas — marca para permitir ejecuciones programadas y con mensajes')) + '</span></div>' +
        '<div class="mc-acts"><button class="bb xs danger" data-ky-act="remove">✕ REMOVE</button></div>' +
      '</div>';
    }
    async function kyRefresh() {
      // same law as readJSON's banner above: an errored read must never render as a CONFIRMED
      // empty key list, and a refusal (403 plain-text) is not an offline station.
      const res = await readJSON('/api/servicekeys');
      if (!res.ok) { kyListEl.innerHTML = readFailLine(res, 'sidecar offline — start it to manage keys.'); return; }
      const list = (res.json && res.json.keys) || [];
      const n = body.querySelector('#ky-mine-n'); if (n) n.textContent = String(list.length);
      kyListEl.innerHTML = list.length ? list.map(kyRow).join('')
        : '<div class="mc-detail">No API keys connected yet — choose a platform in CATALOG, or add a custom key below.</div>';
    }
    body.querySelector('#ky-add').addEventListener('click', async () => {
      const name = (kyNameEl.value || '').trim(), key = (kyKeyEl.value || '').trim(), docsUrl = (kyDocsEl.value || '').trim();
      kyMsgEl.classList.remove('ok');
      if (!name) { kyMsgEl.textContent = 'dale primero un nombre a la plataforma'; sfx('bad'); kyNameEl.focus(); return; }
      if (!key) { kyMsgEl.textContent = 'pega la clave API'; sfx('bad'); kyKeyEl.focus(); return; }
      // the sidecar reads a reference before it answers: say so, since 1Password may be asking for approval right now
      if (kyIsRef(key)) kyMsgEl.textContent = 'leyendo desde 1Password — aprueba StarNet en la app de 1Password si te lo pide…';
      try {
        // a non-JSON refusal parses to {} — without the r.ok check that {} reads as "saved".
        // A body that carries `key` is a structured verdict (saved:false = live-this-session,
        // handled below) even on a 500, so only a key-less answer is a refusal.
        const r = await postJSON('/api/servicekeys', { name, key, docsUrl });
        const j = await r.json().catch(() => ({}));
        if (!j.key && (!r.ok || j.error)) { kyMsgEl.textContent = '✕ ' + (j.error || ('la estación rechazó (HTTP ' + r.status + ') — la clave NO se guardó')); sfx('bad'); return; }
        // saved:false still means LIVE this session — surface the persistence truth instead of a flat "saved".
        // A 1Password reference is saved even when the read failed; the message says which happened.
        const opUnread = !!(j.key && j.key.source === '1password' && !j.key.refReady);
        kyMsgEl.classList.toggle('ok', j.saved !== false && !opUnread);
        kyMsgEl.textContent = j.saved === false
          ? '⚠ ' + name + ' está activo para esta sesión, pero falló el guardado en disco — puede no sobrevivir a un reinicio'
          : (opUnread
            ? '⚠ ' + name + ' guardado, pero 1Password no se pudo leer: ' + (j.key.refError || 'sin respuesta') + ' — los agentes obtienen ' + j.key.envVar + ' cuando pueda'
            : '✓ ' + name + ' guardado' + (j.key && j.key.source === '1password' ? ' y leído desde 1Password' : '') + ' — los agentes pueden usar ' + ((j.key && j.key.envVar) || 'it') + ' en su shell');
        sfx(j.saved === false || opUnread ? 'bad' : 'click');
        if (j.saved !== false && !opUnread) notify('Clave "' + name + '" guardada', 'good');
        kyNameEl.value = ''; kyKeyEl.value = ''; kyDocsEl.value = ''; kyKeyEl.type = 'password';
        body.querySelector('#ky-guide').hidden = true;
      } catch (e) { kyMsgEl.textContent = '✕ ' + ((e && e.message) || 'no se pudo alcanzar el sidecar'); sfx('bad'); }
      ccRefresh(); kyRefresh();
    });
    kyListEl.addEventListener('click', async ev => {
      const btn = ev.target.closest('button[data-ky-act]'); if (!btn) return;
      const rowEl = ev.target.closest('.mc-row'); const id = rowEl && rowEl.dataset.id; if (!id) return;
      if (btn.dataset.kyAct === 'remove') {
        try {
          const r = await postJSON('/api/servicekeys/remove', { id });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || (j.error && !j.ok)) { kyMsgEl.classList.remove('ok'); kyMsgEl.textContent = '✕ ' + (j.error || ('la estación rechazó (HTTP ' + r.status + ') — la clave NO se eliminó')); sfx('bad'); }
          else { sfx('tick'); notify('Clave eliminada'); }
        } catch (_) { kyMsgEl.classList.remove('ok'); kyMsgEl.textContent = '✕ no se pudo alcanzar el sidecar — la clave NO se eliminó'; sfx('bad'); }
        ccRefresh(); kyRefresh();
      }
    });
    kyListEl.addEventListener('change', async ev => {
      const cb = ev.target.closest('input[data-ky-act="toggle"], input[data-ky-act="autonomy"]'); if (!cb) return;
      const rowEl = ev.target.closest('.mc-row'); const id = rowEl && rowEl.dataset.id; if (!id) return;
      const isAutonomy = cb.dataset.kyAct === 'autonomy';
      cb.disabled = true;
      try {
        // the unattended-grant switch: a ticked box the station never recorded is a false grant
        // readout, so any non-ok answer reverts the checkbox to the state the harness can prove.
        const r = isAutonomy
          ? await postJSON('/api/servicekeys/autonomy', { id, autonomous: cb.checked })
          : await postJSON('/api/servicekeys/toggle', { id, enabled: cb.checked });
        const j = await r.json().catch(() => ({}));
        if (j.key && j.saved === false) {
          // structured 500: the switch IS live this session (list + env already updated) — keep the
          // box truthful to the live state and surface the persistence gap instead of reverting.
          sfx('bad'); notify('⚠ el interruptor está activo para esta sesión, pero falló el guardado en disco — puede no sobrevivir a un reinicio', 'warn');
        }
        else if (!r.ok || (j.error && !j.ok)) { cb.checked = !cb.checked; sfx('bad'); notify('✕ ' + (j.error || ('la estación rechazó (HTTP ' + r.status + ') — no cambió nada'))); }
        else sfx('tick');
      } catch (_) { cb.checked = !cb.checked; sfx('bad'); }
      cb.disabled = false;
      ccRefresh(); kyRefresh();
    });
    kyPlatformsRefresh();
    kyRefresh();
    // panes mount once and tab clicks only toggle visibility — re-poll both lists when the Commander
    // lands on KEYS, so a connector keyed on the CATALOG tab moments ago shows up without a window reopen.
    const kyTab = body.querySelector('#con-tab-connectors-keys');
    if (kyTab) kyTab.addEventListener('click', () => { kyPlatformsRefresh(); kyRefresh(); });
    const ccTab = body.querySelector('#con-tab-connectors-catalog');
    if (ccTab) ccTab.addEventListener('click', ccRefresh);
  }

  /* ---- SPOTIFY connect (OAuth PKCE): open the consent window, then poll /api/spotify/status until the
     callback lands. The Client ID + tokens live in the sidecar; the browser only triggers the flow. ---- */
  function setupSpotify(body) {
    const statusEl = body.querySelector('#sp-status');
    const msgEl = body.querySelector('#sp-msg');
    const redirEl = body.querySelector('#sp-redir');
    const connectBtn = body.querySelector('#sp-connect');
    const disconnectBtn = body.querySelector('#sp-disconnect');
    const clientInput = body.querySelector('#sp-client');
    let pollTimer = null;
    async function refreshStatus() {
      try {
        const j = await Harness.api.get('/api/spotify/status');
        if (redirEl && j.redirectUri) redirEl.textContent = j.redirectUri;
        if (j.connected) {
          statusEl.innerHTML = '<span style="color:var(--ok)">● conectado</span>' + (j.scope ? ' <span class="dim">· ' + esc(j.scope) + '</span>' : '');
          connectBtn.textContent = '↻ RECONECTAR';
          disconnectBtn.style.display = '';
        } else {
          statusEl.innerHTML = j.hasClientId ? '<span class="dim">○ no conectado (Client ID guardado)</span>' : '<span class="dim">○ no conectado</span>';
          disconnectBtn.style.display = 'none';
          connectBtn.textContent = '▶ CONECTAR SPOTIFY';
        }
        return j;
      } catch (_) { statusEl.textContent = 'sidecar desconectado — inicia la app completa para conectar Spotify.'; return null; }
    }
    connectBtn.addEventListener('click', async () => {
      const clientId = (clientInput.value || '').trim();
      msgEl.textContent = 'abriendo Spotify…';
      try {
        const j = (await Harness.api.post('/api/spotify/auth/start', clientId ? { clientId } : {})).j;
        if (j.error) { msgEl.textContent = '✕ ' + j.error; sfx('bad'); return; }
        const opened = await openSignIn(j.url);
        if (!opened.opened) {
          // No consent window opened → don't poll and don't claim one is waiting (truthful-telemetry law).
          msgEl.textContent = '✕ couldn’t open the Spotify sign-in page' + (opened.where === 'popup' ? ' — permite ventanas emergentes para este sitio e inténtalo de nuevo.' : ' — inténtalo de nuevo.'); sfx('bad'); return;
        }
        msgEl.textContent = 'Aprueba el acceso en ' + (opened.where === 'browser' ? 'tu navegador' : 'la ventana que se abrió') + ', y luego vuelve aquí — esto se actualiza automáticamente.';
        sfx('click');
        let n = 0, fails = 0; clearInterval(pollTimer);
        pollTimer = setInterval(async () => {
          // Panel closed -> stop. Without this the poll outlived the window for its full ~120s
          // (writing status into a detached tree, notifying from a dead panel), and a re-opened
          // panel's fresh CONNECT couldn't clear it (new closure, new pollTimer) — two live polls.
          // Same law as the connector-card poll above (stopCcPoll on !contains(body)).
          if (!document.body.contains(body)) { clearInterval(pollTimer); return; }
          // E6d: guard the poll body so a throw can't leak an unhandled rejection AND never stops the timer.
          // Count consecutive failures toward an EARLY bail so a persistently-broken poll gives up instead of
          // spinning the full ~120s window; a success resets the streak.
          n++;
          let s = null;
          try { s = await refreshStatus(); fails = 0; }
          catch (_) { fails++; }
          if ((s && s.connected) || n > 60 || fails >= 5) {
            clearInterval(pollTimer);
            if (s && s.connected) { msgEl.textContent = '✓ Spotify conectado'; notify('Spotify conectado', 'good'); sfx('click'); }
          }
        }, 2000);
      } catch (e) { msgEl.textContent = '✕ ' + ((e && e.message) || 'no se pudo alcanzar el sidecar'); sfx('bad'); }
    });
    disconnectBtn.addEventListener('click', async () => {
      disconnectBtn.disabled = true;
      try {
        const out = await Harness.api.post('/api/spotify/disconnect');
        if (!out.ok || !out.j || out.j.ok === false) {
          const why = (out.j && out.j.error) || 'la estación no confirmó el cambio';
          msgEl.textContent = '✕ ' + why;
          notify('Spotify NO se desconectó', 'warn'); sfx('bad');
          return;
        }
        clearInterval(pollTimer); msgEl.textContent = 'desconectado'; notify('Spotify desconectado'); sfx('click');
      } catch (_) {
        msgEl.textContent = '✕ no se pudo alcanzar la estación — Spotify no se desconectó';
        notify('Spotify NO se desconectó', 'warn'); sfx('bad');
      } finally {
        disconnectBtn.disabled = false;
        refreshStatus();
      }
    });
    refreshStatus();
  }

  // The title must match the dock button that opens it — a window whose chrome disagrees with the button you
  // pressed reads as the wrong window, and this console now covers more than toolsets and connectors.
  StationUI.registerWindow('connectors', 'HABILIDADES', buildConnectors, { console: true });
})();
