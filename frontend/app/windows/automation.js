/* STARNET — windows/automation.js : the AUTOMATION window (ROUTINES + LOOPS, one console).

   NAV CONDENSE (2026-08-04): the WORK dock sold three flavours of "job" — TASKS, ROUTINES, LOOPS —
   and the subtitles were already apologising for it. ROUTINES answer WHEN, LOOPS answer UNTIL; both
   are standing automation over the same crew, and their windows had the identical shape (an ACTIVE
   list + a CREATE flow). So they now share ONE dock item and ONE console window with four sections:
   ACTIVE ROUTINES · CREATE ROUTINE · ACTIVE LOOPS · START A LOOP.

   Mechanics: this file owns the window slot (key `automation`) and a tiny lane registry. Loads AFTER
   stationui.js and BEFORE windows/routines.js + windows/loops.js (see index.html); each of those
   registers a LANE — a function of (body) returning { sections, wire } — instead of mounting its own
   console. buildAutomation concatenates the lanes' sections into one mountConsole call, then runs
   each lane's wire() against the shared body. All panes are mounted up-front (mountConsole's design),
   the two lanes' ids are disjoint (rt-* / lp-*), so both wirings coexist untouched. */
'use strict';
(() => {
  if (typeof StationUI === 'undefined' || !StationUI.registerWindow) return;
  const lanes = [];
  // the seam routines.js / loops.js register through. Kept deliberately tiny: order of registration
  // (script order in index.html) is the section order in the rail — routines first, loops second.
  let draft = null;
  let awayAgent = null;
  window.AutomationWindow = {
    registerLane(fn) { if (typeof fn === 'function') lanes.push(fn); },
    openAway(agentId) {
      awayAgent = agentId || null;
      StationUI.openTerm('automation', 'away');
      StationUI.h.rerender('automation');
    },
    openDraft(value) {
      draft = Object.assign({}, value || {});
      StationUI.openTerm('automation', 'routines-create');
    }
  };

  /* A DRAFT IS AN AGENT'S TASK (org wire AUTO-P16-3): RUN BY is set to the draft's agent; a draft whose agent has no button on this roster
     (none named, or one not aboard) puts RUN BY back on an agent when it sits on a WORKFLOW — routines.js keeps that pick as window state
     (routineLineKey), and a stale one would save the draft's prompt as runsLine at that workflow's first BAY. The select's own change
     handler clears the pick, so the form and the save read one choice. */
  function applyDraftAgent(body, agentId) {
    const agentButton = Array.from(body.querySelectorAll('.rt-agent-btn')).find(b => b.dataset.agent === agentId);
    if (agentButton) { agentButton.click(); return; }
    const sel = body.querySelector('#rt-agent-select');
    if (!sel || String(sel.value || '').indexOf('line:') !== 0) return;
    const first = Array.from(sel.options || []).find(o => o && !o.disabled && String(o.value || '').indexOf('line:') !== 0);
    if (first) { sel.value = first.value; sel.dispatchEvent(new Event('change')); }
  }

  function buildAutomation(body) {
    const built = lanes.map(fn => fn(body)).filter(b => b && Array.isArray(b.sections));
    const sections = built.reduce((acc, b) => acc.concat(b.sections), []);
    const H = StationUI.h;
    sections.push({ id: 'away', label: 'MIENTRAS ESTOY FUERA', glyph: '◈', desc: 'Elige un agente, revisa su cola y decide si puede construir mientras no estás.', build: pane => {
      pane.innerHTML = '<div class="away-picker"><label for="auto-away-agent">Agente</label><select id="auto-away-agent" class="key-input">' + H.present.map(a => '<option value="' + H.esc(a.id) + '">' + H.esc(a.name || a.id) + '</option>').join('') + '</select></div><div id="auto-away-body"></div>' +
        '<details class="cf-group"><summary>Deja que los agentes elijan su propio trabajo</summary><p>¿Quieres que los agentes sugieran o elijan tareas por sí mismos? Elige su nivel de iniciativa en Ajustes. La cola de arriba guarda el trabajo que elegiste tú.</p><button class="bb sm" id="auto-initiative">ABRIR AJUSTES DE INICIATIVA</button></details>';
    }});
    const labels = { routines: 'Trabajos programados', 'routines-create': 'Nueva programación', loops: 'Bucles de objetivo', 'loops-start': 'Nuevo bucle de objetivo', away: 'Trabajo fuera' };
    const hints = { routines: 'Próximas ejecuciones y resultados recientes', 'routines-create': 'Repetir una tarea a una hora elegida', loops: 'Progreso y trabajo por revisar', 'loops-start': 'Trabajar hacia un punto de parada definido', away: 'Trabajo en cola entre mensajes' };
    sections.forEach(sec => { sec.label = labels[sec.id] || sec.label; });
    // ONE AUTOMATION DOOR: the agents' initiative lives in SETTINGS › AUTONOMY, but whoever opens AUTOMATION sees it
    // here (read from the confirmed posture, never assumed) with a CHANGE door — no hunting through two windows. The rung
    // name comes from the dial's one INITIATIVE_RUNGS table (StationUI.initiativeLabel), so AUTOMATE reads SMALL JOBS
    // exactly where SETTINGS › AUTONOMY does.
    const railTop = top => {
      const sum = (typeof AutonomyStore !== 'undefined' && AutonomyStore.summary) ? AutonomyStore.summary() : null;
      top.classList.add('auto-init-head');
      top.innerHTML = '<div class="set-sub"><span class="set-sub-k">A SOLAS</span><span class="set-sub-d">'
        + (sum ? H.esc(StationUI.initiativeLabel(sum.initiative)) : 'aún no cargado') + '</span></div>'
        + '<button type="button" class="bb sm" id="auto-init-change" data-tip="Si los agentes empiezan trabajo que nadie pidió. No cambia las programaciones de aquí.">CAMBIAR</button>';
      top.querySelector('#auto-init-change').addEventListener('click', () => H.openTerm('settings', 'autonomy'));
    };
    StationUI.h.mountConsole(body, 'automation', sections, { search: false, railTop });
    // ONE MENU: AUTOMATE's tabs (SCHEDULES / GOAL LOOPS / AWAY WORK) pick the area, so the rail lists only that
    // area's own pages (e.g. Scheduled jobs + New schedule) instead of repeating the tabs beside them.
    const area = id => String(id || '').startsWith('routines') ? 'routines' : String(id || '').startsWith('loops') ? 'loops' : String(id || '');
    const cur = area(H.consoleSection.automation || (sections[0] && sections[0].id));
    body.querySelectorAll('.con-rail-item').forEach(item => { item.hidden = area(item.dataset.section) !== cur; });
    body.querySelectorAll('.con-rail-item').forEach(item => {
      const hint = document.createElement('span'); hint.className = 'sn-menu-nav-note';
      hint.textContent = hints[item.dataset.section] || ''; item.appendChild(hint);
    });
    body.querySelectorAll('[data-auto-tab]').forEach(button => button.addEventListener('click', () => {
      body.querySelectorAll('[data-auto-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      body.querySelectorAll('[data-auto-panel]').forEach(p => { p.hidden = p.dataset.autoPanel !== button.dataset.autoTab; });
    }));
    built.forEach(b => { if (typeof b.wire === 'function') b.wire(); });
    const picker = body.querySelector('#auto-away-agent');
    const awayBody = body.querySelector('#auto-away-body');
    picker.value = H.present.some(a => a.id === awayAgent) ? awayAgent : (H.present[H.sel] || H.present[0] || {}).id || '';
    const renderAway = () => {
      awayAgent = picker.value;
      const a = H.present.find(a => a.id === awayAgent);
      awayBody.innerHTML = a ? H.workshopCard(a) : '<p>No hay agentes en esta estación. Recluta uno para configurar el trabajo fuera.</p>';
      if (a) H.wireWorkshop(awayBody, a);
    };
    picker.addEventListener('change', renderAway);
    body.querySelector('#auto-initiative').onclick = () => H.openTerm('settings', 'autonomy');
    renderAway();
    if (draft) {
      if (draft.widgetId) {
        const prompt = body.querySelector('#rt-prompt');
        if (prompt) prompt.dataset.widgetId = draft.widgetId;
      }
      if (draft.workflowTakeoverId) {
        const prompt = body.querySelector('#rt-prompt');
        if (prompt) {
          prompt.dataset.workflowTakeoverId = draft.workflowTakeoverId;
          const note = document.createElement('p'); note.className = 'set-about';
          note.textContent = 'Revisión de toma de control — ' + draft.count + ' solicitudes completadas separadas. Revisa fuentes, fechas cambiantes, elecciones guardadas y acceso requerido. Elige la programación de abajo; nada se programa hasta que agregues la rutina.';
          prompt.insertAdjacentElement('beforebegin', note);
          const evidence = document.createElement('details');
          const summary = document.createElement('summary'); summary.textContent = 'Solicitudes detrás de esta oferta'; evidence.appendChild(summary);
          for (const item of (draft.evidence || [])) {
            const line = document.createElement('p'); line.textContent = new Date(item.at).toLocaleDateString() + ' — ' + item.quote; evidence.appendChild(line);
          }
          prompt.insertAdjacentElement('beforebegin', evidence);
        }
      }
      if(String(draft.prompt || '').includes('Pasted source (JSON string):')) {
        const note=document.createElement('p');note.className='warn';note.textContent='Este borrador contiene una muestra pegada fija. Para actualizaciones frescas en cada ejecución, sustituye esa muestra por una carpeta de fuente aprobada antes de agregar la rutina.';
        const prompt=body.querySelector('#rt-prompt');if(prompt)prompt.insertAdjacentElement('beforebegin',note);
      }
      for (const [selector, key] of [['#rt-name','name'],['#rt-prompt','prompt'],['#rt-workdir','workdir']]) {
        const el = body.querySelector(selector); if (el) el.value = String(draft[key] || '');
      }
      applyDraftAgent(body, draft.agentId);
      // REPEAT SENSE: a takeover carries the rhythm read off when the Commander actually asked. It only
      // pre-selects the picker; nothing is scheduled until the existing ADD click.
      const sug = draft.suggest;
      if (sug && sug.schedule && body._rtPicker && typeof body._rtPicker.set === 'function') {
        body._rtPicker.set(String(sug.schedule));
        const when = body.querySelector('#rt-when');
        if (when) {
          const hint = document.createElement('p'); hint.className = 'set-about'; hint.dataset.rtSuggest = '1';
          hint.textContent = 'Sugerido: ' + String(sug.display || sug.schedule) + (sug.why ? ' — ' + String(sug.why) : '') + '. Cámbialo si quieres.';
          when.insertAdjacentElement('beforebegin', hint);
        }
      }
      draft = null; // a draft is not a routine; only the existing CREATE click can persist one.
    }
  }

  StationUI.registerWindow('automation', 'AUTOMATION', buildAutomation, { console: true, className: 'automation-win' });
})();
