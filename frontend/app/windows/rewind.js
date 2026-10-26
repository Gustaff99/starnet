/* STARNET — windows/rewind.js : the RESTORE lane of the AGENT DOSSIER (was the RESTORE POINTS window).
   NAV CONDENSE 2 (2026-08-04): restore points are agent-scoped, so they live in the dossier — this
   file registers a DossierLane ((body)=>({sections,wire})) that stationui's buildAgents mounts as a
   RESTORE section. The dossier roster rail drives agent switching (the lane reads H.present/H.sel
   on every rebuild), so the old in-window roster switcher is gone. */
'use strict';
(() => {
  if (typeof StationUI === 'undefined' || !StationUI.h) return;
  const H = StationUI.h;
  const esc = H.esc, sfx = H.sfx, fmtRel = H.fmtRel, notify = H.notify;

  /* ============== REWIND — restore points (the execution-spine checkpoint net) ==============
     Every command an agent runs auto-saves a workspace snapshot FIRST; this lists them per agent and
     restores one with a two-step confirm. Server-owned (GET/POST /api/checkpoint); honest — only real
     snapshots show, and it says plainly when there are none yet. */
  function rewindLane(body) {
    const a = H.present[H.sel] || {};   // live core state via the h getters
    const agentId = a.id || 'agent';
    const nm = a.name || agentId;   // display NAME, never the raw id
    const secRestore =
      '<p class="set-about">Una instantánea del espacio de trabajo exacto o del proyecto autorizado que <b>' + esc(nm) + '</b> está modificando se guarda automáticamente <b>antes de cada comando que ejecuta</b> ' +
      '(y antes de editar archivos cuando los checkpoints están activados). Restaurar devuelve esa raíz nombrada a su estado anterior y elimina todo ' +
      'lo creado desde entonces. <span class="dim">Úsalo para deshacer un cambio malo.</span></p>' +
      // 9px de margen superior: el párrafo anterior termina en una cláusula atenuada y el botón estaba pegado a ella,
      // lo que se leía como una sola línea envuelta en vez de prosa seguida de un control.
      '<div class="mc-acts" style="margin:9px 0 8px"><button class="bb xs" id="rw-refresh" title="volver a leer los puntos de restauración de este agente">↻ ACTUALIZAR</button></div>' +
      '<div id="rw-list" class="mc-list"><span class="loading pulse">loading…</span></div>' +
      '<div id="rw-msg" class="msg"></div>';
    const sections = [
      { id: 'restore', label: 'RESTAURAR', glyph: '↶', desc: 'Puntos de restauración del espacio de trabajo de ' + nm + ' — vuelve a antes de un cambio malo.',
        build: (el => { el.innerHTML = secRestore; }) }
    ];
    function wire() {
    const listEl = body.querySelector('#rw-list'), msgEl = body.querySelector('#rw-msg');
    function row(s) {
      const when = s.ts ? esc(fmtRel(new Date(s.ts).toISOString())) : '';
      const target = s.workTree ? String(s.workTree) : ("espacio de trabajo del agente " + nm);
      const targetKind = s.workTree ? 'RAÍZ DEL PROYECTO' : 'ESPACIO DEL AGENTE';
      const available = s.restoreAvailable !== false;
      return '<div class="mc-row" data-id="' + esc(s.id) + '" data-when="' + when + '" data-root="' + esc(target) + '">' +
        '<div class="mc-top"><b>' + esc(s.label || 'snapshot') + '</b> <span class="dim">' + when + '</span></div>' +
        '<div class="mc-url"><b>' + targetKind + '</b> · ' + esc(target) + '</div>' +
        '<div class="mc-url dim">' + esc(String(s.id).slice(0, 12)) + ' · turno ' + (s.turn || 0) + (s.files ? (' · ' + s.files + ' archivo' + (s.files === 1 ? '' : 's')) : '') + '</div>' +
        '<div class="mc-acts">' + (available
          ? '<button class="bb xs danger" data-act="restore">↶ RESTAURAR</button>'
          : '<span class="dim">ACCESO AL PROYECTO REVOCADO · REAUTORIZA ESTA RAÍZ PARA RESTAURAR</span>') + '</div>' +
        '</div>';
    }
    // TRUTHFUL NET STATE: the paragraph above promises a point before every command, but a snapshot is fail-open —
    // when one cannot be saved (a killed Git command's lock, a timeout on a huge workspace, a project file an IDE
    // holds) the run goes on with no undo point. The server's health record (GET /api/checkpoint .health: the LAST
    // automatic attempt of each root this boot) says so here, naming the root, instead of the list silently looking
    // complete. No health yet = nothing attempted = no claim.
    const rel = at => esc(fmtRel(new Date(at).toISOString()));
    // the same root label a row prints: AGENT WORKSPACE · <name>'s agent workspace, or PROJECT ROOT · <path>
    const rootLabel = r => (r && r.kind === 'project' && r.workTree)
      ? '<b>RAÍZ DEL PROYECTO</b> · ' + esc(String(r.workTree)) : '<b>ESPACIO DEL AGENTE</b> · ' + esc("espacio de trabajo del agente " + nm);
    // a row belongs to a root by scopeId ('' = the agent workspace); a never-authorized project root has no rows
    const ownsRow = (r, s) => (r && r.kind === 'project') ? !!r.scopeId && String(s.scopeId || '') === String(r.scopeId) : !s.scopeId;
    function healthNote(h, snaps) {
      if (!h || !h.lastFailure) return '';
      // fmtRel reads 'now' / '5m ago': keep each time in parentheses so every value reads as a sentence
      const failureOf = r => {
        const f = r.lastFailure || {};
        return ' (' + (f.at ? rel(f.at) : 'recientemente') + '): ' + esc(String(f.reason || 'el punto de restauración no se pudo guardar').replace(/[.\s]+$/, ''));
      };
      if (h.ok === false) {
        const roots = (Array.isArray(h.roots) ? h.roots : []).filter(r => r && r.ok === false && r.lastFailure);
        if (!roots.length) roots.push(Object.assign({}, h.lastFailure, { lastFailure: h.lastFailure }));   // no per-root record: the top-level one
        // Both halves are literal: restoring the newest point DOES roll back everything since it (in one step, with no
        // finer point in between), and a restore first saves the current state through the same failing `add`, so it
        // may be refused (safely, nothing changed) until a point saves.
        const lines = roots.map(r => {
          const newest = (snaps || []).find(s => ownsRow(r, s));   // snaps are newest first
          const tail = newest
            ? 'Nada hecho en esta raíz desde su punto de restauración más reciente' + (newest.ts ? ' (' + rel(newest.ts) + ')' : '') +
              ' tiene un punto propio, y una restauración aquí puede ser rechazada hasta que uno se guarde, porque el estado actual se guarda primero.'
            : 'Aún no tiene punto de restauración, así que nada hecho ahí puede revertirse hasta que uno se guarde.';
          return '<div data-kind="' + (r.kind === 'project' ? 'project' : 'workspace') + '">' + rootLabel(r) + ' · último intento' + failureOf(r) + '. ' + tail + '</div>';
        });
        return '<div class="mc-detail" id="rw-health" data-state="failing">LOS PUNTOS DE RESTAURACIÓN NO SE ESTÁN GUARDANDO' + lines.join('') + '</div>';
      }
      return '<div class="mc-url dim" id="rw-health" data-state="missed">No se pudo guardar un punto de restauración para ' + rootLabel(h.lastFailure) + failureOf(h) +
        '. El cambio hecho justo después no tiene punto de restauración propio.</div>';
    }
    async function refresh() {
      try {
        const j = await Harness.api.get('/api/checkpoint?agent=' + encodeURIComponent(agentId));
        const snaps = ((j && j.snapshots) || []).slice().reverse();   // newest first
        // honest empty-state: file-edit snapshots are opt-in (SKYNET_CHECKPOINTS); shell commands ALWAYS snapshot.
        // Tell the user what actually triggers a restore point under their current config, not an aspirational promise.
        const empty = (j && j.enabled)
          ? 'AÚN NO HAY PUNTOS DE RESTAURACIÓN.<br><span>Aparecen cuando este agente ejecuta un comando o edita un archivo en un WORKBENCH.</span>'
          : 'AÚN NO HAY PUNTOS DE RESTAURACIÓN.<br><span>Aparecen cuando este agente ejecuta un <b>comando de shell</b>. Las instantáneas de edición de archivos no están activadas en esta estación.</span>';
        listEl.innerHTML = healthNote(j && j.health, snaps) +(snaps.length ? snaps.map(row).join('') : '<div class="fb-empty">' + empty + '</div>');
      } catch (_) { listEl.innerHTML = '<div class="mc-detail">sidecar sin conexión — arráncalo para gestionar puntos de restauración.</div>'; }
    }
    let armTimer = 0;
    listEl.addEventListener('click', async ev => {
      const btn = ev.target.closest('button[data-act="restore"]'); if (!btn) return;
      const rowEl = ev.target.closest('.mc-row'); const id = rowEl && rowEl.dataset.id; if (!id) return;
      if (!btn.dataset.armed) {
        // arma + DICE LAS APUESTAS: nombra lo que una restauración elimina (todo lo creado desde la hora de este punto).
        btn.dataset.armed = '1'; btn.textContent = '↶ CONFIRMAR'; sfx('bad');
        const when = rowEl.dataset.when || 'este punto';
        const root = rowEl.dataset.root || ("espacio de trabajo del agente " + nm);
        msgEl.className = 'msg'; msgEl.innerHTML = '<span class="dim">devuelve <b>' + esc(root) + '</b> y elimina todo lo creado ahí desde <b>' + esc(when) + '</b> — CONFIRMAR para continuar</span>';
        clearTimeout(armTimer);
        armTimer = setTimeout(() => { if (btn.isConnected && btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = '↶ RESTAURAR'; msgEl.innerHTML = ''; } }, 5000);
        return;
      }
      clearTimeout(armTimer); delete btn.dataset.armed;
      sfx('bad'); btn.disabled = true; msgEl.className = 'msg'; msgEl.textContent = 'restaurando…';
      try {
        const r = (await Harness.api.post('/api/checkpoint/restore', { agentId: agentId, snapshotId: id })).j;
        if (r && r.ok) { notify('restaurado ' + (rowEl.dataset.root || "espacio de " + nm) + ' a un punto anterior', 'warn'); msgEl.className = 'msg ok'; msgEl.textContent = '✓ restaurado.'; }
        else { msgEl.innerHTML = '<span style="color:var(--bad)">✕ ' + esc((r && r.error) || 'la restauración falló') + '</span>'; sfx('bad'); }
      } catch (e) { msgEl.innerHTML = '<span style="color:var(--bad)">✕ ' + esc((e && e.message) || 'la restauración falló') + '</span>'; sfx('bad'); }
      btn.disabled = false; refresh();
    });
    const refreshBtn = body.querySelector('#rw-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', () => { sfx('click'); listEl.innerHTML = '<span class="loading pulse">cargando…</span>'; refresh(); });
    refresh();
    }

    return { sections, wire };
  }

  window.DossierLanes = window.DossierLanes || [];
  window.DossierLanes.push(rewindLane);
})();
