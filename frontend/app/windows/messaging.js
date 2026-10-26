/* STARNET — windows/messaging.js : the CHANNELS (messaging platforms) window (extracted verbatim from stationui.js).
   Loads AFTER stationui.js (see index.html) and registers itself via StationUI.registerWindow;
   the only stationui internals it touches are the enumerated StationUI.h helper surface
   (sfx/notify/openTerm/mountConsole and the live present view). */
'use strict';
(() => {
  if (typeof StationUI === 'undefined' || !StationUI.registerWindow) return;
  const H = StationUI.h;
  const sfx = H.sfx, notify = H.notify, openTerm = H.openTerm;
  const mountConsole = H.mountConsole;

  /* ============== MESSAGING — every messaging platform the agent can be reached on ==============
     One catalog drives the whole CHANNELS panel: each entry supplies the platform copy (setup guide, field
     markup, messages) and the panel generates the card, status painting, and connect/disconnect wiring from
     it — adding a platform is a catalog row, mirroring the sidecar's channel registry. Status truth comes
     from ONE bulk poll (GET /api/channels/status) + live channel.connect bus refreshes. Only platforms the
     LOCAL-FIRST sidecar can honestly drive are listed (webhook-only surfaces like WhatsApp stay out). */
  function buildMessaging(body) {
    // ---- the channel catalog (copy + fields per platform; ids are literal so source-guards can pin them) ----
    // `accent` gives each card its per-platform accent strip + coin (marketplace card grammar); `steps` render as
    // an <ol> inside the setup <details>; `note` is the trailing dim caveat. Secret-input id + type order is
    // load-bearing (the wire source-guard pins e.g. id="sl-bot-token" type="password") — never reorder those.
    const CHANNEL_CATALOG = [
      { id: 'telegram', title: 'TELEGRAM', pre: 'tg', accent: '#37aee2',
        tagline: 'Envía mensajes directos a tu agente desde Telegram.',
        verb: 'polling',
        steps: [
          '<b>Crea tu bot en Telegram.</b><br>Busca <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a>, abre el chat y envía <code>/newbot</code>. Sigue sus respuestas para elegir un nombre y un usuario disponible que termine en <code>bot</code>.',
          '<b>Cónectalo a StarNet.</b><br>BotFather te envía un token de bot (un código largo). Cópialo en <b>Bot token</b> abajo y pulsa <b>CONECTAR</b>.',
          '<b>Vínculate y empieza a chatear.</b><br>StarNet muestra un mensaje <code>/pair</code> con un código. Copia el mensaje entero y envíalo a <b>tu nuevo bot</b> en Telegram. Cuando la vinculación se confirma, puedes chatear con tu agente.'
        ],
        note: 'Tu token se guarda en esta máquina y nunca se muestra.',
        fieldsHtml: '<label class="ch-lbl" for="tg-token">BOT TOKEN <span class="dim">— de @BotFather</span></label>' +
          '<input id="tg-token" type="password" class="key-input" placeholder="123456789:ABCdef..." autocomplete="off" spellcheck="false">',
        read: (b) => ({ token: (b.querySelector('#tg-token').value || '').trim() }),
        clear: (b) => { b.querySelector('#tg-token').value = ''; },
        emptyMsg: 'pega primero tu token de @BotFather',
        okMsg: '✓ conectado — Telegram acepta mensajes del propietario',
        // multi-bot: each additional bot is a SEPARATE Telegram contact hard-bound to one agent. The list paints
        // exclusively from the status payload's bots[] (truthful per-instance transport state); the add flow is
        // token + agent — the sidecar validates the token with getMe before anything persists.
        extraHtml:
          '<div class="ch-bots" id="tg-owner">' +
            '<div class="ch-bots-head">Vincula tu cuenta de Telegram <span class="dim" id="tg-owner-state">sin vincular</span></div>' +
            '<p class="ch-note">La vinculación le dice a tu bot qué cuenta de Telegram es la tuya. Envía el mensaje /pair a tu nuevo bot, no a BotFather. El código de vinculación caduca en 10 minutos.</p>' +
            '<div class="set-save"><button class="bb xs" id="tg-owner-pair">VINCULAR PROPIETARIO</button> <button class="bb xs danger" id="tg-owner-revoke" style="display:none">REVOCAR PROPIETARIO</button></div>' +
          '</div>' +
          '<div class="ch-bots" id="tg-bots">' +
            '<div class="ch-bots-head">Bots por agente <span class="dim">Un contacto de Telegram por agente</span></div>' +
            '<div id="tg-bots-list"></div>' +
            '<details class="ch-setup" id="tg-bot-addbox"><summary>AÑADIR BOT</summary>' +
              '<ol class="ch-steps">' +
                '<li><b>Crea otro bot.</b><br>En Telegram, envíale a <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a> <code>/newbot</code>. Elige un nombre y un usuario disponible que termine en <code>bot</code>, y copia el token que devuelve.</li>' +
                '<li><b>Elige su agente.</b><br>Pega el token abajo, elige qué agente debe responder y pulsa <b>AÑADIR BOT DE AGENTE</b>.</li>' +
                '<li><b>Vínculate y chatea.</b><br>Envía el mensaje completo <code>/pair</code> que StarNet te muestra a ese nuevo bot en Telegram. Cuando la vinculación se confirma, envíale mensajes cuando quieras hablar con ese agente.</li>' +
              '</ol>' +
              '<label class="ch-lbl" for="tg-bot-token">BOT TOKEN <span class="dim">— de @BotFather</span></label>' +
              '<input id="tg-bot-token" type="password" class="key-input" placeholder="123456789:ABCdef..." autocomplete="off" spellcheck="false">' +
              '<label class="ch-lbl" for="tg-bot-agent">Agente que responde</label>' +
              '<select id="tg-bot-agent" class="key-input"></select>' +
              '<div class="set-save"><button class="bb sm" id="tg-bot-add">+ AÑADIR BOT DE AGENTE</button></div>' +
              '<div id="tg-bots-msg" class="msg"></div>' +
            '</details>' +
          '</div>' },

      { id: 'discord', title: 'DISCORD', pre: 'dc', accent: '#7c83f5',
        // HONESTY: server/channel messages need a chat allowlist no production path supplies yet — DMs only today.
        tagline: 'Envía mensajes directos a tu bot de Discord para hablar con tu agente. Los canales de servidor aún no están soportados.',
        verb: 'receiving',
        steps: [
          'Abre el <b>Discord Developer Portal</b> → <b>New Application</b> → <b>Bot</b> → <b>Reset Token</b> → copia el token.',
          'Invita al bot a un servidor en el que estés (OAuth2 → URL Generator → marca <code>bot</code> → abre el enlace). Discord solo deja enviar MD a un bot con el que compartas servidor. No hay que activar intents.',
          'Pega el token abajo y conecta.',
          '<b>Vincula tu cuenta.</b> Abre un <b>mensaje directo</b> con el bot (púlsalo en la lista de miembros del servidor → Mensaje) y envía el mensaje <code>pair</code> que muestra StarNet, exactamente como aparece. Los mensajes en canales de servidor se ignoran. Hasta que te vincules, el bot rechaza todos los mensajes.'
        ],
        note: 'Tu token se guarda en esta máquina y nunca se muestra.',
        fieldsHtml: '<label class="ch-lbl" for="dc-token">BOT TOKEN <span class="dim">— del Discord Developer Portal</span></label>' +
          '<input id="dc-token" type="password" class="key-input" placeholder="MTE...Bot token" autocomplete="off" spellcheck="false">',
        read: (b) => ({ token: (b.querySelector('#dc-token').value || '').trim() }),
        clear: (b) => { b.querySelector('#dc-token').value = ''; },
        emptyMsg: 'pega primero el token de tu bot de Discord',
        okMsg: '✓ conectado — envía MD a tu bot en Discord',
        errHint: ' — revisa el token del bot' },

      { id: 'slack', title: 'SLACK', pre: 'sl', accent: '#b98ec8',
        // HONESTY: channel messages need a chat allowlist no production path supplies yet — DMs only today.
        // audit finding 5: Slack appears in BOTH panels — say which direction THIS one is.
        tagline: 'Envía mensajes directos a tu app de Slack para hablar con tu agente. Las conversaciones en canales aún no están soportadas. Para que tu agente use Slack como tool, abre ABILITIES.'
        verb: 'receiving',
        steps: [
          'Abre <b>api.slack.com/apps</b> → <b>Create New App</b> → From scratch.',
          'Activa <b>Socket Mode</b> (Settings → Socket Mode) y crea un <b>app-level token</b> con <code>connections:write</code> (empieza por <code>xapp-</code>).',
          'En <b>OAuth &amp; Permissions</b> añade los bot scopes <code>chat:write</code>, <code>im:history</code>, <code>channels:history</code> → <b>Install to Workspace</b> → copia el <b>bot token</b> (empieza por <code>xoxb-</code>).',
          'En <b>Event Subscriptions</b> suscribe al bot a <code>message.im</code>.',
          '<b>Vincula tu cuenta.</b> StarNet muestra un mensaje <code>pair</code> con un código de un solo uso. Envíaselo al bot desde TU cuenta, sin barra (Slack reserva <code>/</code>). Hasta que lo hagas, el bot rechaza todos los mensajes.'
        ],
        note: 'Ambos tokens se guardan en esta máquina y nunca se muestran.',
        fieldsHtml: '<label class="ch-lbl" for="sl-bot-token">BOT TOKEN <span class="dim">— xoxb-…, de OAuth &amp; Permissions</span></label>' +
          '<input id="sl-bot-token" type="password" class="key-input" placeholder="xoxb-..." autocomplete="off" spellcheck="false">' +
          '<label class="ch-lbl" for="sl-app-token">APP-LEVEL TOKEN <span class="dim">— xapp-…, de Socket Mode</span></label>' +
          '<input id="sl-app-token" type="password" class="key-input" placeholder="xapp-..." autocomplete="off" spellcheck="false">',
        read: (b) => {
          const bot = (b.querySelector('#sl-bot-token').value || '').trim();
          const app = (b.querySelector('#sl-app-token').value || '').trim();
          return { token: (bot && app) ? (bot + ' ' + app) : (bot || app) };   // combined secret; sidecar splits by prefix
        },
        clear: (b) => { b.querySelector('#sl-bot-token').value = ''; b.querySelector('#sl-app-token').value = ''; },
        emptyMsg: 'pega AMBOS tokens de Slack primero (xoxb-… y xapp-…)',
        okMsg: '✓ conectado — envía MD a tu app de Slack' },

      { id: 'matrix', title: 'MATRIX', pre: 'mx', accent: '#5bd18d',
        tagline: 'Alcanza a tu agente desde cualquier cliente de Matrix (Element, …) en cualquier homeserver.',
        verb: 'syncing',
        steps: [
          'Crea una cuenta de Matrix para el agente (p. ej. en <b>matrix.org</b> o tu homeserver).',
          'Consigue un <b>access token</b> para esa cuenta (Element: Settings → Help &amp; About → Advanced → Access Token).',
          'Introduce la URL del homeserver + el token abajo y conecta, luego invita a la cuenta del agente a una sala desde TU cuenta y acepta la invitación una vez desde cualquier cliente.',
          '<b>Vincula tu cuenta.</b> StarNet muestra un mensaje <code>pair</code> con un código de un solo uso. Envíalo en esa sala desde TU cuenta, exactamente como aparece. Hasta que lo hagas, el bot rechaza todos los mensajes.'
        ],
        note: 'Bloqueado al propietario: solo la cuenta que envía el código de vinculación puede alcanzar al agente — cualquier otro en la sala se ignora.',
        fieldsHtml: '<label class="ch-lbl" for="mx-endpoint">HOMESERVER URL <span class="dim">— p. ej. https://matrix.org</span></label>' +
          '<input id="mx-endpoint" type="text" class="key-input" placeholder="https://matrix.org" autocomplete="off" spellcheck="false">' +
          '<label class="ch-lbl" for="mx-token">ACCESS TOKEN <span class="dim">— de la cuenta Matrix del agente</span></label>' +
          '<input id="mx-token" type="password" class="key-input" placeholder="syt_..." autocomplete="off" spellcheck="false">',
        read: (b) => ({ token: (b.querySelector('#mx-token').value || '').trim(), endpoint: (b.querySelector('#mx-endpoint').value || '').trim() }),
        clear: (b) => { b.querySelector('#mx-token').value = ''; },
        prefill: (b, st) => { const e = b.querySelector('#mx-endpoint'); if (e && !e.value && st && st.endpoint) e.value = st.endpoint; },
        urlField: 'mx-endpoint', urlScheme: 'https',
        emptyMsg: 'introduce primero la URL del homeserver y pega un access token',
        okMsg: '✓ conectado — envía mensajes a la cuenta Matrix del agente' },

      { id: 'signal', title: 'SIGNAL', pre: 'sg', accent: '#6aa0ff', advanced: true,
        tagline: 'Envía mensajes a tu agente en Signal a través de un puente signal-cli autoalojado.',
        verb: 'receiving',
        steps: [
          'Start the bridge with Docker: <code>docker run -d --name signal-api -p 127.0.0.1:8080:8080 -v signal-api:/home/.local/share/signal-cli -e MODE=native bbernhard/signal-cli-rest-api</code>. Keep <code>MODE=native</code> (or <code>normal</code>); <code>json-rpc</code> mode cannot be polled.',
          'Link it to your own Signal: open <code>http://127.0.0.1:8080/v1/qrcodelink?device_name=starnet</code> and scan it from Signal → Settings → Linked devices. No second number needed. (A spare number registered on the bridge works too.)',
          'Enter the bridge URL and that number below, then connect.',
          '<b>Vincula tu cuenta.</b> StarNet muestra un mensaje <code>pair</code> con un código de un solo uso. Enlazado a tu propio número: envíalo en <b>Note to Self</b> y sigue chateando ahí. Número de repuesto: envíale mensajes a ese número desde tu Signal. Hasta que te vincules, el bot rechaza todos los mensajes.'
        ],
        note: 'No necesita token — el puente corre en tu máquina; déjalo enlazado a localhost.',
        fieldsHtml: '<label class="ch-lbl" for="sg-endpoint">SIGNAL-CLI REST URL <span class="dim">— p. ej. http://127.0.0.1:8080</span></label>' +
          '<input id="sg-endpoint" type="text" class="key-input" placeholder="http://127.0.0.1:8080" autocomplete="off" spellcheck="false">' +
          '<label class="ch-lbl" for="sg-account">NÚMERO DE SIGNAL <span class="dim">— el número enlazado o registrado en el puente</span></label>' +
          '<input id="sg-account" type="text" class="key-input" placeholder="+15551234567" autocomplete="off" spellcheck="false">',
        read: (b) => ({ endpoint: (b.querySelector('#sg-endpoint').value || '').trim(), account: (b.querySelector('#sg-account').value || '').trim() }),
        clear: () => {},
        prefill: (b, st) => {
          const e = b.querySelector('#sg-endpoint'); if (e && !e.value && st && st.endpoint) e.value = st.endpoint;
          const a = b.querySelector('#sg-account'); if (a && !a.value && st && st.account) a.value = st.account;
        },
        urlField: 'sg-endpoint', urlScheme: 'http',
        emptyMsg: 'introduce primero la URL del puente y tu número de Signal',
        okMsg: '✓ conectado — chatea en Note to Self (o al número de repuesto) en Signal' }
    ];

    // ---- console shell (the SETTINGS layout): left platform rail, one pane per platform ----
    // OVERVIEW carries the intro copy, the ONE shared autonomous-ping opt-in, and a live per-platform summary
    // (click a row → jump to that platform's pane). Each platform pane hosts the SAME catalog-generated card as
    // the old single-scroll panel — every control id (tg-token, sl-bot-token, …) is unchanged, and mountConsole
    // mounts ALL panes into `body` up-front, so the body.querySelector wiring + wire source-guards are untouched.
    // The "keeps working headless" promise is FULL-CONTRAST (a real capability, not fine print), lifted out of the
    // opacity-.55 intro. The opt-in label reads as a plain sentence with its description on its own line.
    function channelLogo(id) {
      const mark = typeof ClassIcons !== 'undefined' ? ClassIcons.brandIcon(id) : '';
      return mark ? '<span class="ch-logo" aria-hidden="true">' + mark + '</span>' : '';
    }
    const platformHints = {
      telegram: 'Mensajes privados · bot opcional por agente',
      discord: 'Mensajes privados · requiere un bot de Discord',
      slack: 'Mensajes privados · requiere una app de Slack',
      matrix: 'Conversaciones en salas · requiere una cuenta de bot',
      signal: 'Mensajes privados · puente autoalojado'
    };
    const overviewHtml =
      (typeof Tutorial !== 'undefined' && Tutorial.platformGuideHTML ? Tutorial.platformGuideHTML('messaging') : '') +
      '<div class="ch-intro"><h3>Chatea con tus agentes donde estés</h3>' +
        '<p>Conecta una app de mensajería a los mismos agentes, memoria, tools y workspace que usas aquí.</p></div>' +
      '<div class="ch-sum"><div class="ch-bots-head">Elige una app <span class="dim">Incluye instrucciones de setup</span></div>' +
        CHANNEL_CATALOG.map(c =>
          '<button type="button" class="ch-sum-row" data-ch="' + c.id + '">' +
            channelLogo(c.id) + '<span class="ch-sum-copy"><span class="ch-sum-t">' + c.title + '</span>' +
              '<span class="ch-sum-help">' + platformHints[c.id] + '</span></span>' +
            '<span class="ch-state st-off" id="' + c.pre + '-sum">comprobando…</span><span class="ch-sum-arrow" aria-hidden="true">›</span>' +
          '</button>').join('') +
      '</div>' +
      '<div class="ch-preferences"><label class="set-row ch-optin"><span class="ch-optin-copy">' +
        '<span class="ch-optin-t">Avisos de trabajo terminado</span>' +
        '<span class="ch-optin-d dim">Cuando el trabajo autónomo produzca un resultado, avísame en cada canal conectado.</span></span>' +
        '<input type="checkbox" id="ch-notify"></label><div id="ch-notify-msg" class="msg"></div></div>' +
      '<p class="ch-headless"><b>Mantén StarNet en marcha.</b> Puedes cerrar esta ventana. Los mensajes enviados con la app de la estación completamente apagada no se procesan; recibes una nota de "estaba offline" en su lugar.</p>';
    function cardHtml(c) {
      return '<div class="ch-card" id="ch-card-' + c.id + '" style="--accent:' + c.accent + '">' +
          '<div class="ch-head">' +
            '<div class="ch-id">' +
              (c.advanced ? '<span class="ch-adv">PUENTE AUTOALOJADO</span>' : '') +
              '<span class="ch-answers" id="' + c.pre + '-answers"></span>' +
            '</div>' +
            '<span class="ch-state" id="' + c.pre + '-status">comprobando…</span>' +
          '</div>' +
          '<p class="set-about ch-tagline">' + c.tagline + '</p>' +
          // OPEN by default: the steps are the whole point of a card nobody has set up yet, and a folded
          // <details> hides them at exactly the moment they are needed. paintCard folds it once this
          // platform is actually configured (and never again after the Commander toggles it by hand).
          '<details class="ch-setup" open data-autofold="1"><summary>GUÍA DE SETUP</summary>' +
            '<ol class="ch-steps"><li>' + c.steps.join('</li><li>') + '</li></ol>' +
            (c.note ? '<p class="ch-note">' + c.note + '</p>' : '') +
          '</details>' +
          '<section class="ch-connection"><h3 class="ch-section-title">Detalles de conexión</h3>' + c.fieldsHtml +
          '<div class="set-save">' +
            '<button class="bb sm" id="' + c.pre + '-connect">⏼ CONECTAR</button> ' +
            '<button class="bb sm danger" id="' + c.pre + '-disconnect" style="display:none">⏏ DESCONECTAR</button> ' +
            '<button class="bb xs danger" id="' + c.pre + '-forget" style="display:none" title="' + (c.id === 'signal' ? 'elimina la URL del puente y el número de Signal guardados en esta máquina' : 'borra para siempre el token guardado de esta máquina (registro + keychain del SO) — tendrías que configurarlo de nuevo') + '">' + (c.id === 'signal' ? '✕ QUITAR CONFIGURACIÓN' : '⌫ OLVIDAR') + '</button>' +
          '</div>' +
          '<div id="' + c.pre + '-msg" class="msg"></div>' +
          '</section>' + (c.extraHtml || '') +
          (c.id === 'telegram' ? '' :
            '<div class="ch-bots" id="' + c.pre + '-owner">' +
              '<div class="ch-bots-head">Vincula tu cuenta <span class="dim" id="' + c.pre + '-owner-state">sin vincular</span></div>' +
              '<p class="ch-note">La vinculación le dice al bot qué cuenta es la tuya; cualquier otro emisor se ignora. El código caduca en 10 minutos.</p>' +
              '<div class="set-save"><button class="bb xs" id="' + c.pre + '-owner-pair" style="display:none">VINCULAR PROPIETARIO</button></div>' +
            '</div>') +
        '</div>';
    }
    // Real platform marks share the station theme and stay decorative beside the text labels.
    mountConsole(body, 'messaging', [
      { id: 'overview', label: 'RESUMEN', build: (pane) => { pane.innerHTML = overviewHtml; } }
    ].concat(CHANNEL_CATALOG.map(c => ({
      id: c.id, label: c.title, glyph: channelLogo(c.id),
      build: (pane) => { pane.innerHTML = cardHtml(c); }
    }))));
    if (typeof Tutorial !== 'undefined' && Tutorial.wirePlatformGuide) Tutorial.wirePlatformGuide(body);
    // rail truth dots: one per platform tab, painted from the same proven status as its card (paintCard).
    for (const c of CHANNEL_CATALOG) {
      const heading = body.querySelector('.con-sec[data-section="' + c.id + '"] .sec-l');
      if (heading) heading.insertAdjacentHTML('afterbegin', channelLogo(c.id));
      const tab = body.querySelector('#con-tab-messaging-' + c.id);
      if (tab) {
        const d = document.createElement('span');
        d.className = 'ch-rail-dot st-off'; d.id = c.pre + '-dot'; d.textContent = '●';
        tab.appendChild(d);
      }
    }
    // overview rows jump to the platform pane by driving the REAL rail tab (active state/aria stay correct).
    body.querySelectorAll('.ch-sum-row').forEach(row => row.addEventListener('click', () => {
      const t = body.querySelector('#con-tab-messaging-' + row.dataset.ch);
      if (t) { t.click(); sfx('click'); }
    }));

    // per-card mutable UI state kept out of the DOM: are we mid-connect (finalize the msg from the PROVEN status,
    // not the POST), and the saved placeholders (restored when a card goes back to un-configured).
    const configuredById = {};
    const pendingConnect = {};
    // A pairing code is returned exactly once. Keep its instruction outside the repainting DOM so a later
    // channel.connect event cannot replace it with a generic success line (the live-reported lost-code bug).
    const pairingInstruction = {};
    const savedPlaceholder = {};
    // Signal has no bot account on the recommended linked-device path: the pair message goes in Note to Self
    const signalPair = code => 'Para activar los MD, envía este mensaje exacto en Note to Self (puente enlazado a tu número) o al número de repuesto del puente: pair ' + code + ' (caduca en 10 minutos).';
    function pairInstruction(c, code) {
      if (c.id === 'signal') return signalPair(code);
      return c.id === 'telegram'
        ? 'Arrancando el sondeo de Telegram. Para activar los MD, envía este mensaje exacto a tu bot: /pair ' + code + ' (caduca en 10 minutos).'
        : 'Para activar los MD, envía este mensaje exacto a tu bot de ' + c.title + ' desde tu propia cuenta: pair ' + code + ' (caduca en 10 minutos).';
    }

    // status-line colour by state as a CLASS (never inline el.style.color — truthful-telemetry palette lives in css).
    function stateClass(conn, inFlight, state, configured) {
      if (conn) return 'st-up';
      if (state === 'error') return 'st-err';
      if (inFlight) return 'st-wait';
      return configured ? 'st-wait' : 'st-off';
    }
    function setMsg(el, text, kind) {   // kind: 'ok' (success/gold) | 'info' (neutral) | '' (error/red default)
      if (!el) return;
      el.className = 'msg' + (kind === 'ok' ? ' ok' : kind === 'info' ? ' info' : '');
      el.textContent = text || '';
    }
    // A thrown request never got an answer. Say that in words — the browser's bare "Failed to fetch" read like the
    // user's own network or a bad token, so people regenerated tokens and restarted for nothing (2026-10-15).
    function noAnswerText(e, fallback) {
      const raw = String((e && e.message) || '');
      if (!raw) return fallback;
      if (/failed to fetch|networkerror|load failed/i.test(raw)) return 'StarNet no respondió a esta petición (la conexión se cayó) — reintenta; si sigue pasando, reinicia StarNet';
      return raw;
    }

    // ---- multi-bot telegram: paint the AGENT BOTS list from status.bots (per-instance transport truth) ----
    function paintTelegramBots(bots) {
      const list = body.querySelector('#tg-bots-list');
      if (!list) return;
      list.textContent = '';
      for (const bItem of (Array.isArray(bots) ? bots : [])) {
        const acceptingDms = bItem.acceptingDms === true;
        const pairingBlocked = !!bItem.connected && !acceptingDms;
        const row = document.createElement('div');
        row.className = 'tg-bot-row' + (acceptingDms ? ' on' : '');
        row.dataset.bot = String(bItem.botId || '');
        const name = document.createElement('span');
        name.className = 'tg-bot-name';
        name.textContent = (bItem.username ? '@' + bItem.username : 'bot ' + bItem.botId) + ' → ' + (bItem.agentName || bItem.agentId || '?'); // nombre del bot → agente
        const state = document.createElement('span');
        const inFlight = !bItem.connected && (bItem.state === 'connecting' || bItem.state === 'reconnecting');
        const deliveryDown = !!(bItem.delivery && bItem.delivery.state === 'down');
        const runBlocked = bItem.runReady === false;
        state.className = 'ch-state ' + ((deliveryDown || runBlocked) ? 'st-err' : pairingBlocked ? 'st-wait' : stateClass(bItem.connected, inFlight, bItem.state, bItem.configured));
        state.textContent = runBlocked ? ('✕ respuestas bloqueadas · ' + (bItem.runDetail || 'modelo del agente no disponible')) : deliveryDown ? '✕ respuestas bloqueadas · sondeo' : pairingBlocked ? '◐ sondeo · vincular propietario' : acceptingDms ? '● conectado' : inFlight ? '◐ conectando…'
          : bItem.state === 'error' ? ('✕ ' + (bItem.detail || 'error')) : (bItem.enabled === false ? '○ apagado' : '○ offline');
        if (bItem.ownerLocked) state.title = 'bloqueado al propietario';
        if (runBlocked) state.title = 'El transporte de Telegram puede estar sondeando, pero este agente no puede ejecutarse: ' + (bItem.runDetail || 'proveedor/modelo no disponible');
        if (bItem.delivery && bItem.delivery.state === 'down') state.title = 'envío saliente degradado' + (bItem.delivery.detail ? ': ' + bItem.delivery.detail : '');
        if (bItem.warning) state.textContent += ' ⚠ ' + bItem.warning;
        row.appendChild(name); row.appendChild(state);
        const btn = (label, act, danger) => {
          const b = document.createElement('button');
          b.className = 'bb xs' + (danger ? ' danger' : ''); b.textContent = label; b.dataset.act = act; b.dataset.bot = String(bItem.botId || '');
          row.appendChild(b); return b;
        };
        if (!bItem.ownerLocked) btn('VINCULAR', 'pair', false).title = 'emite un código de vinculación local para este bot';
        else btn('REVOCAR', 'revokeOwner', true).title = 'revoca localmente el propietario de este bot';
        if (!bItem.connected && bItem.configured) btn('⏵', 'resume', false).title = 'reconecta este bot';
        if (bItem.connected || bItem.enabled !== false) btn('⏏', 'off', false).title = 'desconectar (el token se guarda)';
        btn('⌫', 'forget', true).title = 'olvida este bot — elimina su token guardado';
        list.appendChild(row);
      }
      const wrap = body.querySelector('#tg-bots');
      if (wrap) wrap.classList.toggle('empty', !(Array.isArray(bots) && bots.length));
    }

    function paintCard(c, st) {
      const el = body.querySelector('#' + c.pre + '-status');
      if (!el) return;
      const conn = !!(st && st.connected);
      const state = st && st.state;
      const inFlight = !conn && (state === 'connecting' || state === 'reconnecting');
      const configured = !!(st && st.configured);
      // Telegram has two separate truths: Bot API polling and admitted owner DMs. Polling without a paired owner
      // is real transport health, but it is not an operational channel; ordinary messages are refused by design.
      const pairingBlocked = conn && !(st && st.acceptingDms === true);
      configuredById[c.id] = configured;
      el.className = 'ch-state ' + (pairingBlocked ? 'st-wait' : stateClass(conn, inFlight, state, configured));
      el.textContent = pairingBlocked ? (c.id === 'telegram' ? '◐ SONDEANDO — MD BLOQUEADOS: VINCULAR PROPIETARIO' : '◐ ' + c.verb.toUpperCase() + ' — MD BLOQUEADOS: VINCULAR PROPIETARIO')
        : conn ? ('● CONECTADO — ' + c.verb + (state && state !== 'up' ? ' (' + state + ')' : ''))
        : inFlight ? ('◐ ' + (state === 'reconnecting' ? 'reconectando' : 'conectando') + '…' + (st.detail ? ' — ' + st.detail : ''))
        : state === 'error' ? ('✕ error' + (st.detail ? ' — ' + st.detail : '') + (c.errHint || ''))
        : configured ? ('○ guardado pero offline — RETOMAR para reconectar' + (st.detail ? ' — ' + st.detail : ''))
        : '○ no conectado';
      // a standing backend warning (e.g. the owner binding failed to persist) rides EVERY state — real risk
      // the Commander must see, straight from channelStatusPayload (self-heals server-side once the disk agrees).
      if (st && st.warning) el.textContent += ' ⚠ ' + st.warning;
      // rail dot + overview summary row ride the SAME proven status (one truth, three projections)
      const dot = body.querySelector('#' + c.pre + '-dot');
      if (dot) dot.className = 'ch-rail-dot ' + (pairingBlocked ? 'st-wait' : stateClass(conn, inFlight, state, configured));
      const sum = body.querySelector('#' + c.pre + '-sum');
      if (sum) {
        sum.className = 'ch-state ' + (pairingBlocked ? 'st-wait' : stateClass(conn, inFlight, state, configured));
        sum.textContent = pairingBlocked ? '◐ ' + c.verb + ' — vincular propietario' : conn ? '● conectado' : inFlight ? '◐ conectando…'
          : state === 'error' ? '✕ error' : configured ? '○ guardado — offline' : '○ no conectado';
      }
      // SETUP GUIDE auto-fold — keyed off `configured` (a real saved config), never off `conn`: a platform
      // that is saved-but-offline is set up, while a cold card still needs its steps in front of the user.
      // One-shot: activating the SUMMARY clears the flag, after which we never move it again. Do not listen
      // for `toggle` here: assigning guide.open below emits that event too, so the old listener mistook our
      // automatic fold for a hand toggle and left a later cold/unconfigured card collapsed.
      const guide = body.querySelector('#ch-card-' + c.id + ' .ch-setup');
      if (guide && !guide.dataset.foldWired) {
        guide.dataset.foldWired = '1';
        const summary = guide.querySelector('summary');
        if (summary) summary.addEventListener('click', () => { delete guide.dataset.autofold; });
      }
      if (guide && guide.dataset.autofold === '1') guide.open = !configured;
      if (c.prefill) { try { c.prefill(body, st); } catch (_) {} }
      const card = body.querySelector('#ch-card-' + c.id);
      if (card) card.classList.toggle('on', conn && !pairingBlocked);

      // ANSWERS AS / owner-locked truth line (only once a config exists — never claim an identity for a cold card).
      const ans = body.querySelector('#' + c.pre + '-answers');
      if (ans) {
        const nm = (st && st.agentName || '').trim();
        const bits = [];
        if ((conn || configured) && nm) bits.push((pairingBlocked ? 'RESPONDERÁ COMO: ' : 'RESPONDE COMO: ') + nm);
        if (st && st.ownerLocked) bits.push('bloqueado al propietario ✓');
        if (c.id === 'telegram' && st && st.delivery && st.delivery.state === 'down') bits.push('SALIDA DEGRADADA: ' + (st.delivery.detail || 'fallo de envío'));
        ans.textContent = bits.join('  ·  ');
        ans.style.display = bits.length ? '' : 'none';
      }

      // buttons follow state: DISCONNECT/FORGET only when there is something to act on; CONNECT relabels to RESUME
      // when saved-but-offline, and disables to a neutral "connecting…" while a round-trip is in flight.
      const cBtn = body.querySelector('#' + c.pre + '-connect');
      const dBtn = body.querySelector('#' + c.pre + '-disconnect');
      const fBtn = body.querySelector('#' + c.pre + '-forget');
      if (cBtn) {
        cBtn.disabled = inFlight;
        cBtn.textContent = inFlight ? '◐ CONECTANDO…' : (configured && !conn ? '⏵ RETOMAR' : '⏼ CONECTAR');
      }
      if (dBtn) { dBtn.style.display = (conn || configured) ? '' : 'none'; if (!(conn || configured)) disarm(c.pre + '-disconnect', dBtn, '⏏ DESCONECTAR'); }
      if (fBtn) { fBtn.style.display = configured ? '' : 'none'; if (!configured) disarm(c.pre + '-forget', fBtn, c.id === 'signal' ? '✕ QUITAR CONFIGURACIÓN' : '⌫ OLVIDAR'); }

      // saved-but-offline: swap the password placeholder to a non-echoing hint (never render the secret).
      body.querySelectorAll('#ch-card-' + c.id + ' input[type=password]').forEach(inp => {
        if (savedPlaceholder[inp.id] == null) savedPlaceholder[inp.id] = inp.getAttribute('placeholder') || '';
        inp.placeholder = (configured && !inp.value) ? '•••• guardado — pega para reemplazar' : savedPlaceholder[inp.id];
      });

      if (c.id === 'telegram') {
        try { paintTelegramBots(st && st.bots); } catch (_) {}
        const ownerState = body.querySelector('#tg-owner-state');
        const pairBtn = body.querySelector('#tg-owner-pair');
        const revokeBtn = body.querySelector('#tg-owner-revoke');
        const ownerLocked = !!(st && st.ownerLocked);
        const pairingActive = !!(st && st.ownerPairingActive);
        if (ownerState) ownerState.textContent = ownerLocked ? 'propietario vinculado'
          : pairingActive ? 'código de vinculación activo — esperando /pair' : 'sin vincular';
        if (pairBtn) { pairBtn.style.display = configured && !ownerLocked ? '' : 'none'; pairBtn.disabled = !configured; }
        if (revokeBtn) { revokeBtn.style.display = ownerLocked ? '' : 'none'; if (!ownerLocked) disarm('tg-owner-revoke', revokeBtn, 'REVOCAR PROPIETARIO'); }
        const msgEl = body.querySelector('#tg-msg');
        if (ownerLocked && pairingInstruction.telegram) {
          delete pairingInstruction.telegram;
          setMsg(msgEl, '✓ propietario vinculado — Telegram está conectado y acepta MD', 'ok');
        } else if (!ownerLocked && !pairingActive && pairingInstruction.telegram) {
          delete pairingInstruction.telegram;
          setMsg(msgEl, 'código de vinculación caducado — pulsa VINCULAR PROPIETARIO para uno nuevo', 'info');
        }
      }

      if (c.id !== 'telegram') {
        const ownerState = body.querySelector('#' + c.pre + '-owner-state');
        const pairBtn = body.querySelector('#' + c.pre + '-owner-pair');
        const ownerLocked = !!(st && st.ownerLocked);
        const pairingActive = !!(st && st.ownerPairingActive);
        if (ownerState) ownerState.textContent = ownerLocked ? 'propietario vinculado' : pairingActive ? 'código de vinculación activo — esperando el mensaje pair' : 'sin vincular';
        if (pairBtn) { pairBtn.style.display = configured && !ownerLocked ? '' : 'none'; pairBtn.disabled = !configured; }
        const oMsg = body.querySelector('#' + c.pre + '-msg');
        if (ownerLocked && pairingInstruction[c.id]) { delete pairingInstruction[c.id]; setMsg(oMsg, '✓ propietario vinculado — ' + c.title + ' está conectado y acepta MD', 'ok'); }
        else if (!ownerLocked && !pairingActive && pairingInstruction[c.id]) { delete pairingInstruction[c.id]; setMsg(oMsg, 'código de vinculación caducado — pulsa VINCULAR PROPIETARIO para uno nuevo', 'info'); }
      }

      // finalize a pending connect's MESSAGE from the proven status (not the optimistic POST body).
      if (pendingConnect[c.id]) {
        const msgEl = body.querySelector('#' + c.pre + '-msg');
        if (conn) {
          if (!(st && st.acceptingDms === true)) {
            setMsg(msgEl, pairingInstruction[c.id] || (c.id === 'telegram' ? 'Telegram está sondeando, pero los MD siguen bloqueados hasta que pulses VINCULAR PROPIETARIO y envíes el comando /pair.' : c.title + ' está conectado, pero los MD siguen bloqueados hasta que pulses VINCULAR PROPIETARIO y envíes el mensaje pair.'), 'info');
          } else setMsg(msgEl, c.okMsg, 'ok');
          delete pendingConnect[c.id];
          // first-steps: only ticked on the PROVEN round-trip (this branch), never on the optimistic POST.
          try { if (typeof Tutorial !== 'undefined' && Tutorial.tickBrief) Tutorial.tickBrief('channel'); } catch (_) {}
        }
        else if (state === 'error') { setMsg(msgEl, '✕ ' + ((st && st.detail) || 'falló la conexión') + (c.errHint || ''), ''); delete pendingConnect[c.id]; }
        // else still 'connecting' — leave the neutral connecting… line until the transport proves one way or the other.
      }
    }

    // ---- armed-confirm helper: a danger action needs a second click within 2s (no accidental token loss) ----
    const armTimers = {};
    function disarm(id, btn, label) { if (armTimers[id]) { clearTimeout(armTimers[id]); delete armTimers[id]; } if (btn) { btn.classList.remove('armed'); btn.textContent = label; } }
    function armed(id, btn, label, confirmLabel, run) {
      if (btn.dataset.armed === '1') { disarm(id, btn, label); btn.dataset.armed = ''; run(); return; }
      btn.dataset.armed = '1'; btn.classList.add('armed'); btn.textContent = confirmLabel;
      armTimers[id] = setTimeout(() => { btn.dataset.armed = ''; disarm(id, btn, label); }, 2000);
    }

    let zeroChannelHintShown = false;
    async function refreshAll() {
      try {
        const r = await fetch('/api/channels/status');
        const all = await r.json();
        let notifyOn = false, anyConnected = false;
        for (const c of CHANNEL_CATALOG) { const st = all[c.id]; if (st) { paintCard(c, st); notifyOn = notifyOn || !!st.notifyAutonomous; anyConnected = anyConnected || !!st.connected; } }
        const nb = body.querySelector('#ch-notify'); if (nb) nb.checked = notifyOn;
        // notify is on but nothing is connected → it can never fire; say so honestly (don't imply pings will arrive).
        const nMsg = body.querySelector('#ch-notify-msg');
        if (notifyOn && !anyConnected) { setMsg(nMsg, 'aún no hay ningún canal conectado — conecta uno abajo para que estos avisos tengan dónde ir', 'info'); zeroChannelHintShown = true; }
        else if (zeroChannelHintShown) { setMsg(nMsg, '', 'info'); zeroChannelHintShown = false; }
      } catch (_) {
        for (const c of CHANNEL_CATALOG) {
          const el = body.querySelector('#' + c.pre + '-status');
          if (el) { el.className = 'ch-state st-off'; el.textContent = '○ sidecar offline'; }
          const dot = body.querySelector('#' + c.pre + '-dot');
          if (dot) dot.className = 'ch-rail-dot st-off';
          const sum = body.querySelector('#' + c.pre + '-sum');
          if (sum) { sum.className = 'ch-state st-off'; sum.textContent = '○ sidecar offline'; } // sidecar: anglicismo
          configuredById[c.id] = false;
        }
      }
    }
    buildMessaging._refresh = refreshAll;
    // live transport health: channel.connect (up/down/error) is emitted + SSE-broadcast by every hub — one
    // subscription refreshes whichever card it names, the moment health changes (not only on panel reopen).
    wireChannelHealth();
    // 30s heartbeat re-poll while the panel is open — a background reconnect/drop repaints without a manual reopen.
    // Self-terminating: the moment this panel's body leaves the DOM (window closed / rerendered) the timer clears.
    if (buildMessaging._poll) { clearInterval(buildMessaging._poll); }
    buildMessaging._poll = setInterval(() => {
      if (!document.body.contains(body)) { clearInterval(buildMessaging._poll); buildMessaging._poll = null; return; }
      refreshAll();
    }, 30000);

    // ---- connect / disconnect / forget wiring, generated per card from the catalog ----
    // the SAME selected agent supplies the id, prompt AND name (previously the id came from the active workstream
    // but the prompt/name came from present[0] — a mismatch whenever the active stream wasn't the first agent).
    function agentIdentity() {
      const ws = (typeof Workstreams !== 'undefined' && Workstreams.active) ? Workstreams.active() : null;
      const wsAgentId = ws && ws.agentId;
      let ag = null;
      if (wsAgentId) ag = H.present.find(a => a && a.id === wsAgentId) || null;
      if (!ag) ag = H.present[0] || null;
      return { agentId: (ag && ag.id) || wsAgentId || 'agent', system: (ag && ag.systemPrompt) || '', agentName: (ag && ag.name) || '' };
    }
    // normalize a URL-shape config field client-side: prepend the scheme when the user typed a bare host, and write
    // the normalized value back so what they see is what we send. Returns '' when there's nothing usable.
    function normalizeUrl(raw, scheme) {
      let v = String(raw || '').trim();
      if (!v) return '';
      if (!/^https?:\/\//i.test(v)) v = scheme + '://' + v.replace(/^\/+/, '');
      try { const u = new URL(v); if (!u.hostname) return ''; return u.origin + (u.pathname !== '/' ? u.pathname.replace(/\/+$/, '') : ''); }
      catch (_) { return ''; }
    }
    for (const c of CHANNEL_CATALOG) {
      const msgEl = body.querySelector('#' + c.pre + '-msg');
      body.querySelector('#' + c.pre + '-connect').addEventListener('click', async () => {
        // URL-shape validation + auto-scheme for the endpoint channels, written back into the field before we read.
        if (c.urlField) {
          const inp = body.querySelector('#' + c.urlField);
          if (inp && inp.value.trim()) {
            const norm = normalizeUrl(inp.value, c.urlScheme);
            if (!norm) { sfx('bad'); setMsg(msgEl, '✕ no parece una URL — p. ej. ' + inp.getAttribute('placeholder'), ''); return; }
            inp.value = norm;
          }
        }
        const vals = c.read(body);
        const hasFreshAuth = !!(vals.token || vals.endpoint || vals.account);
        // a saved config can be reused (one-click reconnect) — fresh credentials only required on first setup.
        if (!hasFreshAuth && !configuredById[c.id]) { sfx('bad'); setMsg(msgEl, c.emptyMsg, ''); return; }
        if (c.id === 'slack' && vals.token && !(/xoxb-/.test(vals.token) && /xapp-/.test(vals.token))) { sfx('bad'); setMsg(msgEl, c.emptyMsg, ''); return; }
        const provider = (typeof Harness !== 'undefined' && Harness.getProv) ? Harness.getProv() : 'openrouter';
        const usingCodex = provider === 'codex' || provider === 'openai-codex';
        const key = (typeof Harness !== 'undefined' && Harness.getKey) ? (Harness.getKey(provider) || '') : '';
        const baseUrl = (typeof Harness !== 'undefined' && Harness.getBaseUrl) ? (Harness.getBaseUrl(provider) || '') : '';
        const hasStoredKey = !!(typeof Harness !== 'undefined' && Harness.configured && Harness.configured(provider));
        const model = (typeof Harness !== 'undefined' && Harness.getModel()) || '';
        if (!model || (!usingCodex && !key && !hasStoredKey)) {
          sfx('bad'); setMsg(msgEl, '✕ configura primero el proveedor + modelo de tu agente en AJUSTES', '');
          // deep-link door: land Settings on PROVIDERS so a beginner can fix it in one hop (pattern: openTerm section).
          const link = document.createElement('button'); link.className = 'ch-door'; link.textContent = 'abrir AJUSTES → IA Y MODELOS';
          link.addEventListener('click', () => { try { openTerm('settings', 'providers'); } catch (_) {} });
          msgEl.appendChild(document.createTextNode(' ')); msgEl.appendChild(link);
          return;
        }
        const ident = agentIdentity();
        pendingConnect[c.id] = true;
        setMsg(msgEl, 'conectando… — observa el estado de arriba para el resultado verificado', 'info');
        try {
          // Desktop: park the secret in the OS keychain (via Tauri), then connect WITHOUT sending it over HTTP —
          // the sidecar reads it from the keychain-injected runtime layer. Browser: storeChannelToken is a no-op
          // and the token rides the POST body. Non-secret config (endpoint/account) always rides the body.
          let bodyToken = vals.token || '';
          let localFallback = false;
          if (typeof Harness !== 'undefined' && Harness.storeChannelToken && vals.token) {
            const stored = await Harness.storeChannelToken(c.id, vals.token);
            if (stored) bodyToken = '';
            else if (Harness.isDesktop && Harness.isDesktop()) localFallback = true;
          }
          const payload = { token: bodyToken, key, model, provider, baseUrl, agentId: ident.agentId, system: ident.system, agentName: ident.agentName };
          if (vals.endpoint != null) payload.endpoint = vals.endpoint;
          if (vals.account != null) payload.account = vals.account;
          const r = await Harness.api.post('/api/channels/' + c.id + '/connect', payload);
          const j = r.j || {};
          if (!r.ok || j.error) { delete pendingConnect[c.id]; setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); }
          else {
            // DERIVE the outcome line from the status refresh (paintCard finalizes pendingConnect), NOT from this
            // POST — the sidecar only reports 'connecting' until the transport actually proves the round-trip.
            if (j.pairingCode) {
              pairingInstruction[c.id] = pairInstruction(c, j.pairingCode);
              setMsg(msgEl, pairingInstruction[c.id], 'info');
            } else if (j.pairingRequired) {
              setMsg(msgEl, c.title + ' está arrancando, pero los MD están bloqueados: ' + (j.pairingError || 'pulsa VINCULAR PROPIETARIO para emitir un comando de vinculación.'), 'info');
            } else if (localFallback) setMsg(msgEl, 'conectando… (token guardado localmente, no en el keychain del SO)', 'info');
            sfx('click');
            try { c.clear(body); } catch (_) {}
          }
        } catch (e) { delete pendingConnect[c.id]; setMsg(msgEl, '✕ ' + noAnswerText(e, 'no se pudo llegar al sidecar'), ''); sfx('bad'); }
        refreshAll();
      });
      // DISCONNECT — armed (2s) so a stray click can't drop a live channel; never fires on a never-connected card
      // (the button is hidden then anyway). Marks the config disabled server-side but KEEPS the saved token so
      // RESUME is one click; use FORGET to actually purge the secret.
      const dBtn = body.querySelector('#' + c.pre + '-disconnect');
      dBtn.addEventListener('click', () => {
        if (!(configuredById[c.id])) { return; }   // nothing to disconnect — no lie, no request
        armed(c.pre + '-disconnect', dBtn, '⏏ DESCONECTAR', '⏏ CONFIRMAR DESCONECTAR', async () => {
          try {
            const r = await Harness.api.post('/api/channels/' + c.id + '/disconnect', {});
            const j = r.j;
            if (!r.ok || !j || j.connected !== false || j.persisted !== true) throw new Error((j && j.error) || 'la desconexión no quedó confirmada — actualiza y reintenta');
            setMsg(msgEl, 'desconectado — token guardado; RETOMAR para reconectar', 'info'); sfx('click');
          } catch (e) { setMsg(msgEl, '✕ ' + noAnswerText(e, 'no se pudo confirmar la desconexión'), ''); }
          refreshAll();
        });
      });
      // FORGET — armed purge of the stored secret (record + OS keychain). Explicit user destruction, so exempt from
      // the never-remove-a-secret-silently law; the record/runtime token is cleared server-side (purge:true) and the
      // desktop keychain entry is overwritten empty.
      const fBtn = body.querySelector('#' + c.pre + '-forget');
      fBtn.addEventListener('click', () => {
        if (!(configuredById[c.id])) { return; }
        const removeLabel = c.id === 'signal' ? '✕ QUITAR CONFIGURACIÓN' : '⌫ OLVIDAR';
        const confirmRemoveLabel = c.id === 'signal' ? '✕ CONFIRMAR QUITAR' : '⌫ CONFIRMAR OLVIDAR';
        armed(c.pre + '-forget', fBtn, removeLabel, confirmRemoveLabel, async () => {
          try {
            // Signal has no token. Its destructive action removes the actual durable configuration — endpoint,
            // registered account and adapter ownership — and claims success only from the backend read-back bit.
            if (c.id === 'signal') {
              const r = await Harness.api.post('/api/channels/signal/disconnect', { purge: true });
              const j = r.j || {};
              if (j.removedConfiguration) {
                setMsg(msgEl, 'configuración eliminada — Signal ya no está configurado en esta máquina', 'info');
                const endpoint = body.querySelector('#sg-endpoint'); if (endpoint) endpoint.value = '';
                const account = body.querySelector('#sg-account'); if (account) account.value = '';
                sfx('click');
              } else if (!r.ok || j.error) { setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); }
              else { setMsg(msgEl, '⚠ eliminación incompleta — no se pudo demostrar que la configuración de Signal salió del disco; reintenta', ''); sfx('bad'); }
              refreshAll();
              return;
            }
            // Desktop: clear the OS-keychain copy and KEEP the result — a swallowed failure here used to let
            // the "purged" line lie while the token lived on in the keychain. Browser builds have no keychain
            // copy (storeChannelToken is a no-op false there), so only desktop counts it.
            let kcCleared = true;
            if (typeof Harness !== 'undefined' && Harness.storeChannelToken && Harness.isDesktop && Harness.isDesktop()) {
              kcCleared = await Promise.resolve(Harness.storeChannelToken(c.id, '')).then(ok => ok !== false).catch(() => false);
            }
            const r = await Harness.api.post('/api/channels/' + c.id + '/disconnect', { purge: true });
            const j = r.j || {};
            // truthful telemetry: "purged" is a DESTRUCTION claim — assert it only from the backend's
            // read-back-proven bit (j.purged) plus the keychain result, never from the click itself.
            if (j.purged && kcCleared) { setMsg(msgEl, 'olvidado — el token guardado fue purgado', 'info'); sfx('click'); try { c.clear(body); } catch (_) {} }
            else if (!r.ok || j.error) { setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); }
            else {
              const where = [];
              if (!j.purged) where.push('el registro guardado');
              if (!kcCleared) where.push('el keychain del SO');
              setMsg(msgEl, '⚠ olvido incompleto — no se pudo demostrar que el token salió de ' + where.join(' o ') + '; reintenta', ''); sfx('bad');
            }
          } catch (_) { setMsg(msgEl, '✕ no se pudo llegar al sidecar', ''); }
          refreshAll();
        });
      });
      // Enter in any of the card's inputs = CONNECT
      body.querySelectorAll('#ch-card-' + c.id + ' input.key-input').forEach(inp => {
        inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); body.querySelector('#' + c.pre + '-connect').click(); } });
      });
    }

    // ---- Owner enrollment for Discord/Slack/Matrix/Signal (2026-09-23 audit): same one-time local code as Telegram. ----
    for (const c of CHANNEL_CATALOG) {
      if (c.id === 'telegram') continue;
      const pairBtn = body.querySelector('#' + c.pre + '-owner-pair');
      const msgEl = body.querySelector('#' + c.pre + '-msg');
      if (!pairBtn) continue;
      pairBtn.addEventListener('click', async () => {
        try {
          const r = await Harness.api.post('/api/channels/' + c.id + '/owner/pair', {});
          const j = r.j || {};
          if (!r.ok || j.error || !j.code) { setMsg(msgEl, 'no se pudo emitir un código de vinculación: ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); return; }
          pairingInstruction[c.id] = c.id === 'signal' ? signalPair(j.code) : 'Envía MD a tu bot de ' + c.title + ' desde tu propia cuenta: pair ' + j.code + ' (el código caduca en 10 minutos).';
          setMsg(msgEl, pairingInstruction[c.id], 'info');
          sfx('click'); refreshAll();
        } catch (_) { setMsg(msgEl, 'no se pudo llegar al sidecar', ''); sfx('bad'); }
      });
    }

    // ---- Telegram owner enrollment: code comes from the local authenticated sidecar and is never polled back. ----
    (function wireTelegramOwner() {
      const msgEl = body.querySelector('#tg-msg');
      const pairBtn = body.querySelector('#tg-owner-pair');
      const revokeBtn = body.querySelector('#tg-owner-revoke');
      if (!pairBtn || !revokeBtn) return;
      pairBtn.addEventListener('click', async () => {
        try {
          const r = await Harness.api.post('/api/channels/telegram/owner/pair', {});
          const j = r.j || {};
          if (!r.ok || j.error || !j.code) { setMsg(msgEl, 'no se pudo emitir un código de vinculación: ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); return; }
          pairingInstruction.telegram = 'En Telegram, envía MD a este bot: /pair ' + j.code + ' (el código caduca en 10 minutos).';
          setMsg(msgEl, pairingInstruction.telegram, 'info');
          sfx('click'); refreshAll();
        } catch (_) { setMsg(msgEl, 'no se pudo llegar al sidecar', ''); sfx('bad'); }
      });
      revokeBtn.addEventListener('click', () => armed('tg-owner-revoke', revokeBtn, 'REVOCAR PROPIETARIO', 'CONFIRMAR REVOCAR', async () => {
        try {
          const r = await Harness.api.post('/api/channels/telegram/owner/revoke', {});
          const j = r.j || {};
          if (!r.ok || j.error) { setMsg(msgEl, 'no se pudo revocar el propietario: ' + (j.error || ('HTTP ' + r.status)), ''); sfx('bad'); }
          else { setMsg(msgEl, 'propietario revocado localmente — emite un nuevo código de vinculación antes de que Telegram pueda ejecutar al agente de nuevo', 'info'); sfx('click'); }
        } catch (_) { setMsg(msgEl, 'no se pudo llegar al sidecar', ''); sfx('bad'); }
        refreshAll();
      }));
    })();

    // ---- multi-bot telegram wiring: add / resume / disconnect / forget --------------------------------------
    (function wireTelegramBots() {
      const msgEl = body.querySelector('#tg-bots-msg');
      const sel = body.querySelector('#tg-bot-agent');
      if (!sel) return;
      function fillAgents() {
        const cur = sel.value;
        sel.textContent = '';
        for (const a of (H.present || [])) {
          if (!a || !a.id) continue;
          const o = document.createElement('option');
          o.value = a.id; o.textContent = a.name || a.id;
          sel.appendChild(o);
        }
        if (cur) sel.value = cur;
      }
      fillAgents();
      const addBox = body.querySelector('#tg-bot-addbox');
      if (addBox) addBox.addEventListener('toggle', fillAgents);   // roster may have changed since build
      body.querySelector('#tg-bot-add').addEventListener('click', async () => {
        const tokInp = body.querySelector('#tg-bot-token');
        const token = (tokInp.value || '').trim();
        const agentId = sel.value;
        if (!token) { sfx('bad'); setMsg(msgEl, 'pega primero un token de @BotFather para el nuevo bot', ''); return; }
        if (!agentId) { sfx('bad'); setMsg(msgEl, 'elige qué agente debe ser este bot', ''); return; }
        const ag = (H.present || []).find(a => a && a.id === agentId) || null;
        // An agent bot runs as the SELECTED roster agent, not whichever agent/provider is currently focused in
        // COMMS. Keep provider+model+credential together here; the backend independently resolves the same roster
        // tuple and refuses any mismatch before it saves the Telegram token.
        const provider = (ag && ag.provider) || ((typeof Harness !== 'undefined' && Harness.getProv) ? Harness.getProv() : 'openrouter');
        const usingCodex = provider === 'codex' || provider === 'openai-codex';
        const usingOAuth = usingCodex || provider === 'grok' || provider === 'kimi';
        const key = (typeof Harness !== 'undefined' && Harness.getKey) ? (Harness.getKey(provider) || '') : '';
        const baseUrl = (typeof Harness !== 'undefined' && Harness.getBaseUrl) ? (Harness.getBaseUrl(provider) || '') : '';
        const hasStoredKey = !!(typeof Harness !== 'undefined' && Harness.configured && Harness.configured(provider));
        const model = (ag && ag.model) || '';
        const reasoningEffort = (ag && ag.reasoningEffort) || ((typeof Harness !== 'undefined' && Harness.getReasoningEffort) ? Harness.getReasoningEffort(provider) : 'medium');
        if (!model || (!usingOAuth && !key && !hasStoredKey)) { sfx('bad'); setMsg(msgEl, '✕ configura primero el proveedor + modelo de este agente en AJUSTES', ''); return; }
        setMsg(msgEl, 'comprobando Telegram y verificando la entrada de modelo de este agente…', 'info');
        try {
          const r = await Harness.api.post('/api/channels/telegram/bots/connect', {
            token, agentId, key, model, provider, baseUrl, reasoningEffort,
            system: (ag && ag.systemPrompt) || '', agentName: (ag && ag.name) || ''
          });
          const j = r.j || {};
          if (!r.ok || j.error) { sfx('bad'); setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); }
          else {
            let localFallback = false;
            if (j.botId && typeof Harness !== 'undefined' && Harness.storeChannelToken) {
              const stored = await Harness.storeChannelToken('telegram:' + j.botId, token);
              localFallback = !stored && !!(Harness.isDesktop && Harness.isDesktop());
            }
            sfx('click'); tokInp.value = '';
            // A new agent bot is deliberately deaf until its Telegram owner proves possession with /pair.
            // Surface that command NOW, in the same response that proved the token, instead of telling the user
            // to wait for a green row that cannot become green before pairing.
            if (j.pairingCode) {
              setMsg(msgEl, '✓ @' + (j.username || 'bot') + (j.rebound ? ' reenlazado' : ' añadido') + ' — ' + (j.providerVerified ? 'modelo del agente verificado; ' : '') + 'termina el setup ahora: envía MD a ese bot /pair ' + j.pairingCode + ' (caduca en 10 minutos).' + (localFallback ? ' Token guardado localmente, no en el keychain del SO.' : ''), 'info');
            } else if (j.pairingRequired) {
              setMsg(msgEl, '◐ @' + (j.username || 'bot') + ' está sondeando, pero los MD están bloqueados: ' + (j.pairingError || 'pulsa su botón VINCULAR para emitir el comando de propietario.') + (localFallback ? ' Token guardado localmente, no en el keychain del SO.' : ''), 'info');
            } else {
              setMsg(msgEl, '✓ @' + (j.username || 'bot') + (j.rebound ? ' reenlazado' : ' añadido') + ' — conectando como propietario vinculado' + (localFallback ? ' (token guardado localmente, no en el keychain del SO)' : ''), 'ok');
            }
          }
        } catch (e) { sfx('bad'); setMsg(msgEl, '✕ ' + noAnswerText(e, 'no se pudo llegar al sidecar'), ''); }
        refreshAll();
      });
      // row actions by delegation (rows re-render on every status paint)
      body.querySelector('#tg-bots-list').addEventListener('click', (ev) => {
        const b = ev.target && ev.target.closest ? ev.target.closest('button[data-act]') : null;
        if (!b) return;
        const botId = b.dataset.bot, act = b.dataset.act;
        if (!botId) return;
        const doPost = async (path, payload, okText) => {
          try { const r = await Harness.api.post(path, payload || {}); const j = r.j || {};
            if (!r.ok || j.error) { sfx('bad'); setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); }
            else { sfx('click'); if (okText) setMsg(msgEl, okText, 'info'); } }
          catch (_) { sfx('bad'); setMsg(msgEl, '✕ no se pudo llegar al sidecar', ''); }
          refreshAll();
        };
        if (act === 'resume') doPost('/api/channels/telegram/bots/' + botId + '/connect', {}, null);
        else if (act === 'pair') (async () => {
          try {
            const r = await Harness.api.post('/api/channels/telegram/bots/' + botId + '/owner/pair', {});
            const j = r.j || {};
            if (!r.ok || j.error || !j.code) { sfx('bad'); setMsg(msgEl, 'no se pudo emitir el código de vinculación: ' + (j.error || ('HTTP ' + r.status)), ''); }
            else { sfx('click'); setMsg(msgEl, 'Envía MD a ese bot: /pair ' + j.code + ' (caduca en 10 minutos).', 'info'); }
          } catch (_) { sfx('bad'); setMsg(msgEl, 'no se pudo llegar al sidecar', ''); }
          refreshAll();
        })();
        else if (act === 'revokeOwner') armed('tg-bot-owner-' + botId, b, 'REVOCAR', 'CONFIRMAR REVOCAR', () =>
          doPost('/api/channels/telegram/bots/' + botId + '/owner/revoke', {}, 'propietario del bot revocado localmente'));
        else if (act === 'off') doPost('/api/channels/telegram/bots/' + botId + '/disconnect', {}, 'bot desconectado — token guardado; ⏵ para reconectar');
        else if (act === 'forget') armed('tg-bot-forget-' + botId, b, '⌫', '⌫ ¿SEGURO?', async () => {
          try {
            const r = await Harness.api.post('/api/channels/telegram/bots/' + botId + '/disconnect', { purge: true });
            const j = r.j || {};
            if (!r.ok || j.error || !j.purged) { sfx('bad'); setMsg(msgEl, '✕ ' + (j.error || ('HTTP ' + r.status)), ''); }
            else {
              let kcCleared = true;
              if (Harness.storeChannelToken && Harness.isDesktop && Harness.isDesktop()) {
                kcCleared = await Harness.storeChannelToken('telegram:' + botId, '');
              }
              if (kcCleared) { sfx('click'); setMsg(msgEl, 'bot olvidado — su token guardado fue purgado', 'info'); }
              else { sfx('bad'); setMsg(msgEl, '⚠ registro del bot eliminado, pero el token del keychain del SO no se pudo borrar; reintenta OLVIDAR después de reañadirlo', ''); }
            }
          } catch (_) { sfx('bad'); setMsg(msgEl, '✕ no se pudo llegar al sidecar', ''); }
          refreshAll();
        });
      });
    })();

    // ---- the ONE global "ping me when I work on my own" opt-in (persisted server-side; cron reads it) ----
    const notifyBox = body.querySelector('#ch-notify');
    const notifyMsg = body.querySelector('#ch-notify-msg');
    if (notifyBox) notifyBox.addEventListener('change', async () => {
      try {
        const r = await Harness.api.post('/api/channels/notify', { on: notifyBox.checked });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        sfx('click'); refreshAll();   // refresh so the zero-channel hint appears/clears from PROVEN status
      } catch (_) { notifyBox.checked = !notifyBox.checked; setMsg(notifyMsg, '✕ no se pudo guardar — el sidecar no respondió', ''); }
    });

    refreshAll();
  }

  /* THE ONE SUBSCRIPTION LIVES AT MODULE SCOPE (night-leak, 2026-10-15). It used to be created inside the FIRST buildMessaging
     call, so its closure context was that call's scope — the one holding `body` — and the bus kept the first CHANNELS window ever
     opened alive for the rest of the session (heap snapshot: U.bus._h['channel.connect'][1] -> context -> body -> div.term). */
  function onChannelConnect(p) {
    if (p && p.channel && buildMessaging._refresh && document.querySelector('.ch-card')) buildMessaging._refresh();
  }
  function wireChannelHealth() {
    if (buildMessaging._wired || typeof U === 'undefined' || !U.bus) return;
    buildMessaging._wired = true;
    U.bus.on('channel.connect', onChannelConnect);
  }
  // a closed CHANNELS window lets go: the refresh hook and the 30s poll both close over its body (the poll only noticed the
  // window was gone at its next tick, and _refresh held the last closed window until the next open)
  function closed() {
    buildMessaging._refresh = null;
    if (buildMessaging._poll) { clearInterval(buildMessaging._poll); buildMessaging._poll = null; }
  }

  StationUI.registerWindow('messaging', 'CANALES', buildMessaging, { console: true, className: 'channels-console', onClose: closed });   // console mode = the wide SETTINGS-style two-pane window; the className scopes the no-glyph rail; dock label = window title (it's Telegram/external channels, not COMMS)
})();
