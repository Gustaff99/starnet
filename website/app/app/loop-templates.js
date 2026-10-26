/* STARNET — loop-templates.js : the LOOP SHAPES a beginner picks instead of writing a loop from scratch.

   THE PROBLEM THIS SOLVES. A blank "what should it keep doing?" box is the reason loops are confusing: it
   asks someone who has never run one to invent the cycle, the stopping condition, and the guard rails all at
   once. A template supplies all three and leaves two blanks. Picking BUILD · TEST · VERIFY and typing a goal
   should produce a loop that is already shaped correctly.

   Deliberately modelled on recipes.js (`params[]` + token-filled template + a frozen catalog), because that
   pattern is proven here and the marketplace already knows how to render it. The difference is what a loop
   template additionally carries: the CYCLE (`shape`), what ENDS it (`exitOn`), and how strong that ending
   actually is (`rigor`).

   RIGOR IS NOT DECORATION. Only a loop whose exit condition is a real process exit code has a HARD guarantee:
   the station runs the project's own check and reads the code. Everything else — "keep sweeping until you stop
   finding things", "research until nothing new turns up" — rests on the model honestly reporting an empty
   digest each pass, which is a convention, not a proof. Both are useful; presenting them as equally rigorous
   would be a truthful-telemetry violation, so `rigor` rides on the record and the UI must show it.

   PURE: no DOM, no fetch, no clock. Headless-testable (test/loop-templates.test.js).

   Surface:
     list()                          -> Template[]
     get(id)                         -> Template | null
     fillTokens(str, values)         -> string
     requiredMissing(id, values)     -> string[]           // keys still blank
     buildSpec(id, values)           -> spec               // the POST /api/loops body
     rigorNote(t)                    -> string             // the honest one-liner about how this loop ends
*/
'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.LoopTemplates = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* THE DIGEST RULE — lifted from the QA crew's own loop directives (loops/README.md rule 4), because it is
     already proven to work on this project's real 24/7 loops:

       "One digest line minimum per tick, even if 'no findings' — silence is indistinguishable from a dead session."

     This is the convergence mechanism for every SOFT loop, and it is deliberately not a request to concede.
     Asking a model to declare itself finished fails, because models are trained to be helpful and will invent
     work rather than admit there is none. Asking it to FILE A REPORT — including an empty one — is something
     models do reliably. The loop then counts empty reports; three in a row and it parks itself. */
  const DIGEST_RULE =
    'End every single pass with one line in exactly this form:\n' +
    '  DIGEST: <n> findings — <one sentence on what you did, or "nothing new">\n' +
    'File it even when n is 0. An honest "DIGEST: 0 findings" is a correct and valued answer — it is how this ' +
    'loop knows it is finished. Never invent work to avoid reporting zero.';

  const CATALOG = [
    {
      id: 'build-test-verify',
      name: 'Construir · Probar · Verificar',
      emoji: '⊹',
      tagline: 'Trabaja hasta que el propio chequeo del proyecto pase',
      blurb: 'Cada pasada hace un cambio y luego la estación ejecuta TU comando de chequeo y lee el código de ' +
        'salida real. Un chequeo rojo se alimenta directamente en la siguiente pasada con su salida. El loop ' +
        'termina cuando el chequeo pasa de verdad — y puede probar que los tests no se editaron para llegar ahí.',
      shape: ['HACER UN CAMBIO', 'EJECUTAR TU CHEQUEO', 'VERDE → REVISAR'],
      rigor: 'hard',
      needsProject: true,
      params: [
        { key: 'goal', label: '¿Qué debe lograr?', placeholder: 'hacer que los tests de auth fallidos pasen sin cambiar la API', required: true },
        { key: 'check', label: 'El comando que ejecutas para verificarlo', placeholder: 'npm test', required: true, default: 'npm test' }
      ],
      objective:
        'Work in this project until its check passes.\n\nGOAL: {goal}\n\n' +
        'The station runs the check itself after every pass and tells you the real result — you do not run it, ' +
        'and you cannot see or change the command. Work in SMALL steps: one coherent change per pass, then stop ' +
        'and let the check speak. If the check comes back red you will be given its output; fix that before ' +
        'anything else.',
      check: '{check}',
      exitOn: 'check-green',
      gate: 'review',
      queueCap: 2,
      redStopAfter: 10
    },
    {
      id: 'sweep-and-fix',
      name: 'Barrer y Corregir',
      emoji: '⌗',
      tagline: 'Caza una clase de problema hasta que no quede ninguno',
      blurb: 'Cada pasada encuentra UNA instancia, la corrige y reporta. Cambios pequeños y revisables, no una ' +
        'barrida gigante que no puedes leer. Termina cuando tres pasadas seguidas vuelven vacías.',
      shape: ['ENCONTRAR UNA', 'CORRIGIRLA', 'REPORTAR'],
      rigor: 'soft',
      needsProject: true,
      params: [
        { key: 'hunting', label: '¿Qué está cazando?', placeholder: 'rechazos de promesas sin manejar', required: true },
        { key: 'where', label: '¿Dónde debe buscar?', placeholder: 'la carpeta src/', required: false, default: 'the whole project' }
      ],
      objective:
        'Sweep this project for one specific class of problem and fix them one at a time.\n\n' +
        'HUNTING: {hunting}\nSCOPE: {where}\n\n' +
        'Each pass: find ONE real instance, fix that one, and stop. Do not batch a dozen fixes into a single ' +
        'pass — small changes are reviewable, large ones are not. If you cannot find a real instance, say so ' +
        'rather than stretching the definition to keep busy.\n\n' + DIGEST_RULE,
      check: null,
      exitOn: 'empty-digests',
      gate: 'review',
      queueCap: 3,
      dryStopAfter: 3
    },
    {
      id: 'research',
      name: 'Loop de Investigación',
      emoji: '◈',
      tagline: 'Profundiza en una pregunta hasta que deje de dar frutos',
      blurb: 'Cada pasada reúne material nuevo sobre una pregunta, saltando todo lo ya cubierto, y redacta lo ' +
        'que es genuinamente nuevo. Termina cuando tres pasadas seguidas no encuentran nada nuevo.',
      shape: ['REUNIR', 'PROFUNDIZAR', 'REDACTAR'],
      rigor: 'soft',
      needsProject: false,
      params: [
        { key: 'question', label: '¿Qué intentas descubrir?', placeholder: '¿cómo fijan precios los competidores en productos de agentes IA?', required: true },
        { key: 'angle', label: '¿Algo en que enfocarse o evitar?', placeholder: 'enfócate en precios self-serve; salta enterprise', required: false, default: 'no particular constraint' }
      ],
      objective:
        'Research one question, going deeper each pass.\n\nQUESTION: {question}\nFOCUS: {angle}\n\n' +
        'Each pass must add something GENUINELY NEW — a source, an angle, or a contradiction you had not ' +
        'already recorded. Do not restate earlier findings in fresh words; the ledger above already has them. ' +
        'Say plainly when a line of enquiry is exhausted.\n\n' + DIGEST_RULE,
      check: null,
      exitOn: 'empty-digests',
      gate: 'review',
      queueCap: 3,
      dryStopAfter: 3
    }
  ];

  const FROZEN = CATALOG.map(t => Object.freeze(Object.assign({}, t, {
    params: Object.freeze((t.params || []).map(p => Object.freeze(Object.assign({ required: true, default: '' }, p)))),
    shape: Object.freeze((t.shape || []).slice())
  })));

  function list() { return FROZEN.slice(); }
  function get(id) { return FROZEN.find(t => t.id === id) || null; }

  /* fillTokens — substitute {key} from `values`, falling back to a param default. An unfilled token whose
     param is optional AND has no default resolves to empty and the surrounding literal's trailing space is
     trimmed, so the prompt never reads "SCOPE:  \n". A token with no matching param is left verbatim rather
     than silently deleted — an authoring mistake should be visible, not swallowed. */
  function fillTokens(str, values, params) {
    values = values || {};
    const byKey = {};
    for (const p of (params || [])) byKey[p.key] = p;
    return String(str == null ? '' : str).replace(/\{(\w+)\}/g, (m, key) => {
      if (!Object.prototype.hasOwnProperty.call(byKey, key) && values[key] === undefined) return m;
      const raw = values[key];
      const v = (raw == null || String(raw).trim() === '') ? ((byKey[key] && byKey[key].default) || '') : String(raw);
      return v;
    }).replace(/[ \t]+\n/g, '\n');
  }

  function requiredMissing(id, values) {
    const t = typeof id === 'string' ? get(id) : id;
    if (!t) return [];
    values = values || {};
    return t.params.filter(p => p.required && String(values[p.key] == null ? '' : values[p.key]).trim() === '').map(p => p.key);
  }

  /* rigorNote — the honest sentence about how this loop ends. The UI shows it next to the template, because
     "runs until the tests pass" and "runs until it stops finding things" are different promises and a
     beginner has no way to tell them apart from the name alone. */
  function rigorNote(t) {
    t = typeof t === 'string' ? get(t) : t;
    if (!t) return '';
    return t.rigor === 'hard'
      ? 'Termina con un resultado real: la estación ejecuta tu chequeo y lee su código de salida. No se declarará terminada con un chequeo que no puede verificar.'
      : 'Termina con el propio reporte del agente: tres pasadas seguidas sin encontrar nada nuevo. Es una convención, no una prueba — lee lo que produjo antes de fiarte.';
  }

  /* buildSpec — the POST /api/loops body for this template + the Commander's answers. Everything the loop
     needs is decided HERE, once, at creation: the objective text, the check command, the exit condition and
     the guard rails. Nothing about the loop's shape is left for the model to choose later. */
  function buildSpec(id, values, extra) {
    const t = typeof id === 'string' ? get(id) : id;
    if (!t) return null;
    values = values || {}; extra = extra || {};
    const spec = {
      name: extra.name || t.name,
      objective: fillTokens(t.objective, values, t.params),
      exitOn: t.exitOn,
      gate: extra.gate || t.gate,
      queueCap: extra.queueCap != null ? extra.queueCap : t.queueCap,
      meta: { templateId: t.id }
    };
    if (t.dryStopAfter != null) spec.dryStopAfter = t.dryStopAfter;
    if (t.redStopAfter != null) spec.redStopAfter = t.redStopAfter;
    if (t.check) {
      const cmd = fillTokens(t.check, values, t.params).trim();
      if (cmd) spec.checkCmd = cmd;
    }
    if (extra.workdir) spec.workdir = extra.workdir;
    if (extra.agentId) spec.agentId = extra.agentId;
    if (extra.model) spec.model = extra.model;
    if (extra.provider) spec.provider = extra.provider;
    if (extra.perDayUsd != null) spec.perDayUsd = extra.perDayUsd;
    return spec;
  }

  /* readySummary — what this loop will actually do, in plain English, for the final confirm step. Built from
     the SAME spec that gets posted, so it can never describe a loop different from the one created. Answers
     the three things a first-time user is anxious about: what it works on, when it stops, and what it costs. */
  function readySummary(id, values, extra) {
    const t = typeof id === 'string' ? get(id) : id;
    if (!t) return [];
    extra = extra || {};
    const spec = buildSpec(t, values, extra);
    if (!spec) return [];
    const lines = [];
    const where = extra.workdir ? ('en ' + String(extra.workdir).split(/[\/]/).pop()) : 'para ti';
    if (t.id === 'build-test-verify') {
      lines.push({ k: 'Qué hace', v: 'Trabaja ' + where + ', un cambio a la vez, y después de cada pasada la estación ejecuta ' + (spec.checkCmd || 'tu chequeo') + ' ella misma.' });
      lines.push({ k: 'Cuándo se detiene', v: 'Cuando ese chequeo pasa de verdad — y no aceptará un paso logrado editando los tests.' });
    } else if (t.id === 'sweep-and-fix') {
      lines.push({ k: 'Qué hace', v: 'Caza ' + where + ' una cosa a la vez, la corrige y reporta lo que encontró.' });
      lines.push({ k: 'Cuándo se detiene', v: 'Después de ' + (spec.dryStopAfter || 3) + ' pasadas seguidas sin encontrar nada nuevo. Es su propio reporte, no una prueba — lee lo que produjo.' });
    } else {
      lines.push({ k: 'Qué hace', v: 'Profundiza un poco más en tu pregunta en cada pasada, saltando lo que ya cubrió.' });
      lines.push({ k: 'Cuándo se detiene', v: 'Después de ' + (spec.dryStopAfter || 3) + ' pasadas sin encontrar nada nuevo. Es su propio reporte, no una prueba.' });
    }
    lines.push({ k: 'Tu parte', v: spec.gate === 'auto'
      ? 'Nada — le diste acceso total a este loop, así que aplica su propio trabajo. Sigue deteniéndose si se atrapa cambiando el chequeo.'
      : 'Se detiene después de cada pasada y espera que apruebes o rechaces. Tu veredicto es lo que inicia la siguiente, y no gasta nada mientras espera.' });
    lines.push({ k: 'Qué cuesta', v: (extra.perDayUsd ? ('Como máximo $' + Number(extra.perDayUsd).toFixed(2) + ' al día. ') : 'Sin límite diario. ') +
      'Puedes detenerlo en cualquier momento.' });
    return lines;
  }

  return { list, get, fillTokens, requiredMissing, buildSpec, rigorNote, readySummary, DIGEST_RULE };
});
