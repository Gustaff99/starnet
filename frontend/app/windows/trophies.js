/* STARNET — windows/trophies.js : the TROPHY CASE window (extracted verbatim from stationui.js).
   Loads AFTER stationui.js (see index.html) and registers itself via StationUI.registerWindow;
   the only stationui internals it touches are the enumerated StationUI.h helper surface. */
'use strict';
(() => {
  if (typeof StationUI === 'undefined' || !StationUI.registerWindow) return;
  const esc = StationUI.h.esc;

  /* ============== TROPHY CASE (G3b) ==============
     The station-wide surface the TROPHY CASE prop opens: REAL earned achievements made permanent. Every trophy
     is a genuine completion (a completed quest / an earned milestone) projected by the pure Trophies engine over
     the live quest view + the durable QuestState memory. Dates are honest — a completion with no knowable date
     (a resumed pre-fix save) renders "date unknown", NEVER 1969 (the whole point of the G3b hydrate fix). An
     empty case shows honest dust, not placeholder trophies. The LIVING TOOLS shelf lists Commander-saved seeds
     with their real lifetime + 7-day run counts (the seed-reuse aggregate). No XP is minted anywhere here. */
  function buildTrophies(body) {
    // fold the live memory first so a just-completed quest is a trophy the instant this opens (buildQuests idiom).
    const QSS = (typeof QuestStateStore !== 'undefined') ? QuestStateStore : null;
    const SQS = (typeof StationQuestStore !== 'undefined') ? StationQuestStore : null;
    if (SQS && SQS.sync) { try { SQS.sync(); } catch (_) {} }
    if (QSS && QSS.sync) { try { QSS.sync(); } catch (_) {} }
    const v = (typeof QuestStore !== 'undefined' && QuestStore.view) ? QuestStore.view() : null;
    const quests = (v && Array.isArray(v.quests)) ? v.quests : [];
    const stateOf = (QSS && QSS.stateOf) ? (id => QSS.stateOf(id)) : (() => null);
    const tools = (typeof SeedReuseStore !== 'undefined' && SeedReuseStore.livingTools) ? SeedReuseStore.livingTools() : [];
    const surf = (typeof Trophies !== 'undefined' && Trophies.build)
      ? Trophies.build({ quests, stateOf, tools })
      : { trophies: [], tools: [], earned: 0, empty: true };

    const KIND = { milestone: 'HITO', 'station-gap': 'CAPACIDAD', station: 'ESTACIÓN', dossier: 'DOSSIER', idea: 'TRABAJO' };
    const fmtDate = at => { if (at == null) return 'fecha desconocida'; try { return new Date(at).toLocaleDateString(); } catch (_) { return 'fecha desconocida'; } };
    const troRow = t =>
      '<div class="gx-tro on">'
      + '<div class="tro-hd"><span class="gl">&#9733;</span><span class="nm">' + esc(t.title) + '</span>'
      + '<span class="gx-tag">' + esc(KIND[t.kind] || 'HONOUR') + '</span></div>'
      + '<div class="sub">' + (t.reward ? '&#9656; ' + esc(t.reward) + ' &middot; ' : '')
      + '<span style="opacity:' + (t.dateKnown ? '1' : '.6') + ';">' + esc(fmtDate(t.completedAt)) + '</span></div></div>';

    const toolRow = tl =>
      '<div class="gx-tro on">'
      + '<div class="tro-hd"><span class="gl">&#9670;</span><span class="nm">' + esc(tl.name) + '</span>'
      + '<span class="gx-tag">' + tl.runs + '&times; TOTAL</span></div>'
      + '<div class="sub">la semilla que guardaste &middot; ' + tl.sevenDay + '&times; en los últimos 7 días</div></div>';

    const trophiesHtml = surf.trophies.length
      ? '<div class="gx-tros">' + surf.trophies.map(troRow).join('') + '</div>'
      : '<div class="gx-tros"><p class="dim" style="font-style:italic;">el vitrín está vacío &mdash; polvo sobre el cristal. entrega trabajo real y tu primer hito aterrizará aquí.</p></div>';

    const toolsHtml = surf.tools.length
      ? '<div class="gx-sec" style="margin-top:14px;"><span class="gx-title">HERRAMIENTAS VIVAS</span> <span class="gx-tag">' + surf.tools.length + '</span></div>'
        + '<div class="gx-tros">' + surf.tools.map(toolRow).join('') + '</div>'
      : '';

    body.innerHTML = '<div class="gx">'
      + '<div class="dim" style="margin:2px 0 10px;">los logros reales de la estación, hechos permanentes. cada hito aquí es una culminación que de verdad ocurrió &mdash; nunca puntos, nunca inventados. ninguna fecha se supone.</div>'
      + '<div class="gx-sec"><span class="gx-title">HITOS</span> <span class="gx-tag">' + surf.earned + ' CONSEGUIDOS</span></div>'
      + trophiesHtml
      + toolsHtml
      + '</div>';
  }

  StationUI.registerWindow('trophies', 'VITRINA DE TROFEOS', buildTrophies, {});   // G3b: the TROPHY CASE prop opens this station-wide surface. PANEL shell — see the two-sizes note in style.css
})();
