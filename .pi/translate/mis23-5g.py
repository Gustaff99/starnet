#!/usr/bin/env python3
# MIS-23-5 tramo 3: correcciones exactas (5 documentadas) + cadenas visibles
# del barrido manual (carta de consentimiento, etiquetas de tarjeta, linea de
# espera, aviso de modelo de voz). Cada regla: (archivo, viejo, nuevo, n_esperado).
import sys

ROOT = '/home/gus/paperclip-projects/space-station/starnet-es'
CHAT = ROOT + '/frontend/app/chat.js'
SIDE = ROOT + '/sidecar/voice-chat-route.js'
TWAIT = ROOT + '/test/comms-wait-line.test.js'
TSTOP = ROOT + '/test/stop-reason.test.js'
TPOST = ROOT + '/test/task-postconditions-ui.test.js'
TRSEAMS = ROOT + '/test/comms-render-seams.test.js'
TVOICE = ROOT + '/test/voice-live-ui.test.js'

RULES = [
    # ---- 5 correcciones documentadas ----
    (CHAT, "allowCustom: true, customLabel: 'edit the milestones', customPlaceholder: 'your milestones, separated by ; …'",
             "allowCustom: true, customLabel: 'editar los hitos', customPlaceholder: 'tus hitos, separados por ; …'", 1),
    (CHAT, "bits.push(fmtMs(wall - honest) + ' waiting on you')",
             "bits.push(fmtMs(wall - honest) + ' esperándote')", 1),
    (TRSEAMS, "/s\\.held \\? ' · aún no se ejecuta' : ''/.test(phone)",
               "/s\\.held \\? ' · not run yet' : ''/.test(phone)", 1),  # REVERT: phone = relay/app/app.js (fuera de alcance)
    (TRSEAMS, "['▸', 'denied']", "['▸', 'denegada']", 1),
    (TRSEAMS, "['↳ fs_write · 54ms · denied', '↳ fs_read · 3ms · failed']",
               "['↳ fs_write · 54ms · denegada', '↳ fs_read · 3ms · fallida']", 1),
    (TVOICE, "/could not confirm this browser/.test(bare.tokenWithheld)",
               "/no pudo confirmar que este navegador/.test(bare.tokenWithheld)", 1),

    # ---- etiquetas de tarjeta (resolvePresence) ----
    (CHAT, "const byYou = opts.stoppedBy === 'esc' ? '■ STOPPED BY YOU (ESC)' : opts.stoppedBy === 'you' ? '■ STOPPED BY YOU' : '';",
             "const byYou = opts.stoppedBy === 'esc' ? '■ DETENIDA POR TI (ESC)' : opts.stoppedBy === 'you' ? '■ DETENIDA POR TI' : '';", 1),
    (CHAT, "let label = isErr ? '■ RUN FAILED' : needsVerify ? '■ VERIFICATION REQUIRED' : opts.cutShort ? '■ CUT SHORT' : (isStop && byYou) ? byYou : isStop ? '■ RUN STOPPED' : '■ RUN COMPLETE';",
             "let label = isErr ? '■ EJECUCIÓN FALLIDA' : needsVerify ? '■ VERIFICACIÓN REQUERIDA' : opts.cutShort ? '■ RECORTADA' : (isStop && byYou) ? byYou : isStop ? '■ EJECUCIÓN DETENIDA' : '■ EJECUCIÓN COMPLETA';", 1),

    # ---- linea de espera viva (waitNoteText) ----
    (CHAT, "return bare ? (bare.length > 48 ? bare.slice(0, 47) + '…' : bare) : 'the model';",
             "return bare ? (bare.length > 48 ? bare.slice(0, 47) + '…' : bare) : 'el modelo';", 1),
    (CHAT, """  function waitNoteText(n) {
    if (!n) return '';
    const name = waitModelLabel(n);""",
             """  function waitNoteText(n) {
    const WAIT_REASONS_ES = { overloaded: 'sobrecarga', server_error: 'error del servidor', timeout: 'tiempo agotado' };
    if (!n) return '';
    const name = waitModelLabel(n);""", 1),
    (CHAT, "const why = String(r.reason || '').replace(/_/g, ' ').trim();",
             "const whyRaw = String(r.reason || '').trim();\n      const why = WAIT_REASONS_ES[whyRaw] || whyRaw.replace(/_/g, ' ');", 1),
    (CHAT, "return 'retry ' + r.attempt + of + (left > 0 ? ' in ' + fmtElapsed(Math.ceil(left / 1000) * 1000) : ' now') + (why ? ' (' + why + ')' : '') + ' — ' + name;",
             "return 'reintento ' + r.attempt + of + (left > 0 ? ' en ' + fmtElapsed(Math.ceil(left / 1000) * 1000) : ' ahora') + (why ? ' (' + why + ')' : '') + ' — ' + name;", 1),
    (CHAT, "if (n.phase === 'retry_backoff') return 'retry backoff' + (since >= 1000 ? ', ' + fmtElapsed(since) + ' so far' : '') + ' — ' + name;",
             "if (n.phase === 'retry_backoff') return 'reintento en retroceso' + (since >= 1000 ? ', ' + fmtElapsed(since) + ' hasta ahora' : '') + ' — ' + name;", 1),
    (CHAT, "const dur = since >= 1000 ? ' for ' + fmtElapsed(since) : '';",
             "const dur = since >= 1000 ? ' ' + fmtElapsed(since) : '';", 1),
    (CHAT, "if (n.note) return 'waiting' + dur + ' · ' + n.note + ' — ' + name;",
             "if (n.note) return 'esperando' + dur + ' · ' + n.note + ' — ' + name;", 1),
    (CHAT, "if (n.phase === 'connect') return 'connecting' + dur + ' to ' + name;   // (the model id is always LAST: renderPresence splits it off)",
             "if (n.phase === 'connect') return 'conectando' + dur + ' a ' + name;   // (the model id is always LAST: renderPresence splits it off)", 1),
    (CHAT, "return 'waiting' + dur + (n.phase === 'streaming' ? ' (stream open)' : '') + ' on ' + name;",
             "return 'esperando' + dur + (n.phase === 'streaming' ? ' (flujo abierto)' : '') + ' a ' + name;", 1),

    # ---- aviso de modelo de voz (chat.js + sidecar, contrato test-locked) ----
    (CHAT, "const VOICE_ROUTE_REASONS = { not_configured: 'its provider is not connected', too_large: 'this conversation is larger than its context window' };",
             "const VOICE_ROUTE_REASONS = { not_configured: 'su proveedor no está conectado', too_large: 'esta conversación es mayor que su ventana de contexto' };", 1),
    (CHAT, "return 'VOICE MODEL ' + vr.wanted.model + ' not used — ' + VOICE_ROUTE_REASONS[vr.reason] + '; spoken replies use ' + (vr.model || 'the agent’s model');",
             "return 'MODELO DE VOZ ' + vr.wanted.model + ' no usado — ' + VOICE_ROUTE_REASONS[vr.reason] + '; las respuestas habladas usan ' + (vr.model || 'el modelo del agente');", 1),
    (SIDE, "not_configured: 'its provider is not connected',\n  too_large: 'this conversation is larger than its context window'",
             "not_configured: 'su proveedor no está conectado',\n  too_large: 'esta conversación es mayor que su ventana de contexto'", 1),

    # ---- carta de consentimiento ----
    (CHAT, "retireConsentCard(id, '■ the run ended before an answer — nothing was approved');",
             "retireConsentCard(id, '■ la ejecución terminó antes de la respuesta — nada se aprobó');", 1),
    (CHAT, "retireConsentCard(id, '■ no longer waiting on you');",
             "retireConsentCard(id, '■ ya no espera tu respuesta');", 1),
    (CHAT, "retireConsentCard(p.promptId, '■ no longer waiting on you');",
             "retireConsentCard(p.promptId, '■ ya no espera tu respuesta');", 1),
    (CHAT, "doneLabel = '✕ full access was not saved'",
             "doneLabel = '✕ el acceso total no se guardó'", 1),
    (CHAT, "doneLabel = '✕ approval was not applied'",
             "doneLabel = '✕ la aprobación no se aplicó'", 1),
    (CHAT, "decide('deny', '✕ denied', true)",
             "decide('deny', '✕ denegada', true)", 1),
    (CHAT, "return ids.size > 1 ? 'Siempre dejará de preguntar por ' + toolWordsOf(tool) + ' from now on' : '';",
             "return ids.size > 1 ? 'Siempre dejará de preguntar por ' + toolWordsOf(tool) + ' de ahora en adelante' : '';", 1),

    # ---- tests que bloquean las cadenas de arriba ----
    (TWAIT, "'retry 3/6 in 30s (overloaded) — claude-sonnet-4.5', 'retry line: rung/budget, the announced wait, the reason, then the model'",
              "'reintento 3/6 en 30s (sobrecarga) — claude-sonnet-4.5', 'retry line: rung/budget, the announced wait, the reason, then the model'", 1),
    (TWAIT, "'retry 3/6 in 15s (overloaded) — claude-sonnet-4.5'", "'reintento 3/6 en 15s (sobrecarga) — claude-sonnet-4.5'", 1),
    (TWAIT, "'waiting on claude-sonnet-4.5'", "'esperando a claude-sonnet-4.5'", 1),
    (TWAIT, "'waiting for 45s on claude-sonnet-4.5'", "'esperando 45s a claude-sonnet-4.5'", 1),
    (TWAIT, "'waiting for 1:15 (stream open) on claude-sonnet-4.5'", "'esperando 1:15 (flujo abierto) a claude-sonnet-4.5'", 1),
    (TWAIT, "'retry 1/6 in 1s (server error) — m'", "'reintento 1/6 en 1s (error del servidor) — m'", 1),
    (TWAIT, "'retry 2 now (timeout) — m'", "'reintento 2 ahora (tiempo agotado) — m'", 1),
    (TWAIT, "'retry backoff, 30s so far — m'", "'reintento en retroceso, 30s hasta ahora — m'", 1),
    (TWAIT, "'waiting for 15s on the model'", "'esperando 15s a el modelo'", 1),
    (TWAIT, "'connecting for 15s to m'", "'conectando 15s a m'", 1),
    (TWAIT, "A.eq(waitNoteText(n), 'waiting for 1:35 · ' + note + ' — aide-qwen3-8b:latest'",
              "A.eq(waitNoteText(n), 'esperando 1:35 · ' + note + ' — aide-qwen3-8b:latest'", 1),
    (TWAIT, "'waiting for 1:50 (stream open) on aide-qwen3-8b:latest'", "'esperando 1:50 (flujo abierto) a aide-qwen3-8b:latest'", 1),
    (TWAIT, "], 'retry 3/6 in 30s (overloaded)'],", "], 'reintento 3/6 en 30s (sobrecarga)']," , 1),
    (TWAIT, "], 'waiting for 35s'],", "], 'esperando 35s']," , 1),
    (TWAIT, "], 'connecting for 15s'],", "], 'conectando 15s']," , 1),
    (TWAIT, "], 'retry backoff, 30s so far']", "], 'reintento en retroceso, 30s hasta ahora']", 1),
    (TWAIT, "A.eq(lib.waitModelLabel({}), 'the model', 'no model -> \"the model\"')",
              "A.eq(lib.waitModelLabel({}), 'el modelo', 'no model -> \"el modelo\"')", 1),
    (TSTOP, "/■ STOPPED BY YOU \\(ESC\\)/.test(chat)", "/■ DETENIDA POR TI \\(ESC\\)/.test(chat)", 1),
    (TPOST, "A.ok(/VERIFICATION REQUIRED/.test(chat)", "A.ok(/VERIFICACIÓN REQUERIDA/.test(chat)", 1),
]

def main():
    files = {}
    def load(p):
        if p not in files:
            files[p] = open(p, encoding='utf-8').read()
        return files[p]
    ok = True
    for path, old, new, want in RULES:
        s = load(path)
        n = s.count(old)
        if n != want:
            print(f'MISMATCH {path}:{path and ""} count={n} want={want} :: {old[:70]!r}')
            ok = False
            continue
        files[path] = s.replace(old, new)
        print(f'OK x{n} {path.split("/")[-1]} :: {old[:60]!r}')
    if not ok:
        print('FALLO: sin escribir nada')
        sys.exit(1)
    for p, s in files.items():
        open(p, 'w', encoding='utf-8').write(s)
        print('ESCRITO', p)
    print('TOTAL reglas:', len(RULES))

if __name__ == '__main__':
    main()
