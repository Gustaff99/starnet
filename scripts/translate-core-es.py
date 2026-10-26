#!/usr/bin/env python3
"""MIS-17 — traducción ES de las pantallas core (chat.js, app.js, stationui.js).

Patrón: diccionario explíciTO por archivo, reemplazo exacto de literales entre
comillas simples, con recuento de reemplazos para verificar. Se conservan en
inglés: claves de lógica ('Group chat', valores 'once'/'full'/'happened'),
prompts que se envían al agente (send('Continue the task above...'), la
identidad de sistema de app.js) y nombres de modelos/proveedores.
"""
import sys

def apply(path, mapping, line_specific=None):
    src = open(path, encoding='utf-8').read()
    lines = src.split('\n')
    # line-specific replacements first: (0-based line index, old, new)
    if line_specific:
        for idx, old, new in line_specific:
            if old not in lines[idx]:
                print(f'  !! line {idx+1}: expected {old!r} not found')
                continue
            lines[idx] = lines[idx].replace(old, new)
            print(f'  ok line {idx+1}: {old[:40]!r} -> {new[:40]!r}')
    src = '\n'.join(lines)
    total = 0
    for old, new in mapping:
        o = "'" + old + "'"
        n = "'" + new + "'"
        c = src.count(o)
        if c == 0:
            print(f'  -- missing: {old!r}')
            continue
        src = src.replace(o, n)
        total += c
        print(f'  ok x{c}: {old[:44]!r} -> {new[:44]!r}')
    open(path, 'w', encoding='utf-8').write(src)
    print(f'== {path}: {total} replacements')

# ---------------------------------------------------------------- chat.js
chat = [
    ('Jump to newest messages', 'Ir a los mensajes nuevos'),
    ('Scroll to latest', 'Bajar a los últimos'),
    ('It happened', 'Pasó'),
    ('It did not happen', 'No pasó'),
    ('Copy failed', 'No se pudo copiar'),
    ('Copy code block', 'Copiar bloque de código'),
    ('Copy message', 'Copiar mensaje'),
    ('Drop files to attach', 'Suelta archivos para adjuntar'),
    ('This agent', 'Este agente'),
    ('Not relevant', 'No es relevante'),
    ('Refresh suggestions', 'Actualizar sugerencias'),
    ('Close enlarged image', 'Cerrar imagen ampliada'),
    ('What it will do each run', 'Qué hará en cada ejecución'),
    ('What each step will be told', 'Qué se le dirá en cada paso'),
    ('Use your judgment', 'Usa tu criterio'),
    ('Always stops asking for ', 'Siempre dejará de preguntar por '),
    ('Open login window', 'Abrir ventana de acceso'),
    ('Approve once', 'Aprobar una vez'),
    ('Allow just this one', 'Permitir solo esta'),
    ('Full access', 'Acceso total'),
    ('Build it', 'Constrúyelo'),
    ('Save patch file', 'Guardar archivo de parche'),
    ('Implement', 'Implementar'),
    ('Save skill', 'Guardar habilidad'),
    ('Still true', 'Sigue siendo cierto'),
    ('Not anymore', 'Ya no'),
    ('Cancel queued message', 'Cancelar mensaje en cola'),
    ('The run had already finished its work', 'La ejecución ya había terminado su trabajo'),
    ('The run is holding too many notes already', 'La ejecución ya sostiene demasiadas notas'),
    ('The station did not take it', 'La estación no lo aceptó'),
    ('The station did not answer', 'La estación no respondió'),
    ('The run stopped before the agent read ', 'La ejecución se detuvo antes de que el agente leyera '),
    ('The run ended before the agent read ', 'La ejecución terminó antes de que el agente leyera '),
    ('Stop every agent in this chat', 'Detener todos los agentes de este chat'),
    ('Stop the running turn', 'Detener el turno en curso'),
    ('This agent is also running in ', 'Este agente también está corriendo en '),
    ('New session', 'Nueva sesión'),
    ('Renamed this workstream to ', 'Renombra este flujo de trabajo a '),
    ('Background task', 'Tarea en segundo plano'),
    ('Started a fresh workstream', 'Iniciado un flujo de trabajo nuevo'),
    ('Branched from ', 'Bifurcado desde '),
    ('Looping every ', 'Repitiendo cada '),
    ('First run in ', 'Primera ejecución en '),
    # /compress status line (kept whole: it is asserted by test/compress-run-window.test.js)
    ('Chat memory: ', 'Memoria del chat: '),
    (' tokens used (', ' tokens usados ('),
    ('% — a token is roughly ¾ of a word). ', '% — un token equivale a aproximadamente ¾ de una palabra). '),
    ('El modelo puede sostener ', 'El modelo puede sostener '),
    (', but it bills a higher rate for a prompt over ', ', pero cobra un precio más alto para un prompt de más de '),
    (' tokens, so a run works in ', ' tokens, así que una ejecución trabaja en '),
    ('When it nears full, older turns are folded into a summary automatically during the next run; there is nothing you need to do.', 'Cuando se acerca al límite, los turnos antiguos se plegan automáticamente en un resumen durante la siguiente ejecución; no tienes que hacer nada.'),
    ('Chat memory is managed automatically: when a conversation grows past what the model can hold, older turns are folded into a summary during the next run. There is nothing you need to do.', 'La memoria del chat se gestiona automáticamente: cuando una conversación crece más de lo que el modelo puede sostener, los turnos antiguos se plegan en un resumen durante la siguiente ejecución. No tienes que hacer nada.'),
    ('Model set to ', 'Modelo puesto en '),
    ('Personality set to ', 'Personalidad puesta en '),
    ('Reasoning effort is already ', 'El esfuerzo de razonamiento ya es '),
    ('Could not set reasoning effort to ', 'No se pudo poner el esfuerzo de razonamiento en '),
    ('Loaded blueprint ', 'Cargado el plano '),
    ('Suggested Mission', 'Misión sugerida'),
    ('learned from recurring tasks', 'aprendida de tareas recurrentes'),
    ('Routines scheduler ', 'Programador de rutinas '),
    ('Could not update the routines scheduler.', 'No se pudo actualizar el programador de rutinas.'),
    # lowercase display strings
    ('current stream', 'flujo actual'),
    ('copy code', 'copiar código'),
    ('copy message', 'copiar mensaje'),
    ('not selected', 'no seleccionado'),
    ('saved as skill', 'guardado como habilidad'),
    ('kept in memory', 'guardado en memoria'),
]
chat_lines = [
    # "no 'As an AI'" is system-prompt copy (line ~17) — left in English on purpose.
    # 'Group chat' server placeholder (line ~2184) — left in English on purpose.
    # line 2658: 'Three ways to put ' + name + ' to work. Suggestions will become specific as we work together.'
    (2657, "'Three ways to put ' + name + ' to work. Suggestions will become specific as we work together.'",
             "'Tres formas de poner a ' + name + ' a trabajar. Las sugerencias se harán concretas a medida que trabajemos juntos.'"),
    # line 4261: display label only; the answer value stays 'use your judgment' (host matches it)
    (4260, "skip.textContent = 'Use your judgment';", "skip.textContent = 'Usa tu criterio';"),
    # line 4514
    (4513, "mk('Open login window', 'once', 'primary', '✓ window opened', false);",
             "mk('Abrir ventana de acceso', 'once', 'primary', '✓ ventana abierta', false);"),
    # line 4522 / 4526
    (4521, "mk('Approve once', 'once', 'primary', '✓ approved once', false);",
             "mk('Aprobar una vez', 'once', 'primary', '✓ aprobado una vez', false);"),
    (4525, "mk('Approve once', 'once', 'primary', '✓ approved once', false, 'Allow just this one');",
             "mk('Aprobar una vez', 'once', 'primary', '✓ aprobado una vez', false, 'Permitir solo esta');"),
    # line 4528
    (4527, "mk('Full access', 'full', 'danger', '✓ full access', false, 'Give ' + agentName + ' full access: it stops asking before most actions, until you change it back');",
             "mk('Acceso total', 'full', 'danger', '✓ acceso total', false, 'Da a ' + agentName + ' acceso total: dejará de preguntar antes de la mayoría de acciones, hasta que lo cambies');"),
    # line 5919
    (5918, "mkBtn(prop.kind === 'skill' ? 'Save skill' : 'Keep', 'primary', () => submit('keep', null, prop.kind === 'skill' ? 'saved as skill' : 'kept in memory', false));",
             "mkBtn(prop.kind === 'skill' ? 'Guardar habilidad' : 'Mantener', 'primary', () => submit('keep', null, prop.kind === 'skill' ? 'guardado como habilidad' : 'guardado en memoria', false));"),
    # line 9935: display identity line (the SYSTEM prompt 'You are ' in app.js stays English)
    (9934, "localLine('You are ' + name + ' [' + id + '] — ' + klass + lvl + '. Model: ' + (model || 'not selected') + (provider ? ' via ' + provider : '')",
             "localLine('Eres ' + name + ' [' + id + '] — ' + klass + lvl + '. Modelo: ' + (model || 'no seleccionado') + (provider ? ' vía ' + provider : '')"),
    # line 10012
    (10011, "localLine('Personality set to ' + Personas.get(id).name + '.' + (id === 'unhinged' && Personas.effective(id, (activeAgent() || {}).voiceTraits).profanity > 0 ? ' Heads up: this one swears — for real.' : ''));",
             "localLine('Personalidad puesta en ' + Personas.get(id).name + '.' + (id === 'unhinged' && Personas.effective(id, (activeAgent() || {}).voiceTraits).profanity > 0 ? ' Ojo: este jura — de verdad.' : ''));"),
    # line 10246: status reply; 'enabled'/'disabled' display words
    (10245, "return reply(r.ok && j ? ('Routines scheduler ' + (j.enabled ? 'enabled' : 'disabled') + '.') : 'Could not update the routines scheduler.');",
             "return reply(r.ok && j ? ('Programador de rutinas ' + (j.enabled ? 'activado' : 'desactivado') + '.') : 'No se pudo actualizar el programador de rutinas.');"),
]

# ---------------------------------------------------------------- app.js
app = [
    ('Goal milestone', 'Hito del objetivo'),
    ('First build', 'Primera construcción'),
    ('Reply needed', 'Respuesta pendiente'),
    ('Approval needed', 'Aprobación pendiente'),
    ('waiting for your answer', 'esperando tu respuesta'),
    ('awaiting your approval', 'esperando tu aprobación'),
    ('Rename', 'Renombrar'),
    ('Unpin', 'Quitar fijado'),
    ('Pin to top', 'Fijar arriba'),
    ('Open project COMMS', 'Abrir COMMS del proyecto'),
    ('Open project', 'Abrir proyecto'),
    ('New session here', 'Nueva sesión aquí'),
    ('Prior station', 'Estación anterior'),
    ('Create your Overseer', 'Crea tu Overseer'),
    ('stored locally - leave blank to keep', 'Guardada localmente — déjala en blanco para conservarla'),
    ('Mistral API key', 'Clave API de Mistral'),
    ('Together API key', 'Clave API de Together'),
    ('Fireworks API key', 'Clave API de Fireworks'),
    ('Cerebras API key', 'Clave API de Cerebras'),
    ('optional API key for this endpoint', 'Clave API opcional para este endpoint'),
    ('Kimi subscription', 'Suscripción a Kimi'),
]
app_lines = [
    # line 2292: provider card copy
    (2291, ": 'Uses the ' + c.sub + ' you already have — no API key, no billing setup. Prefer a key? Switch to OPENROUTER (or any provider) above.';",
             ": 'Usa la ' + c.sub + ' que ya tienes — sin clave API, sin configurar facturación. ¿Prefieres una clave? Cambia a OPENROUTER (o cualquier proveedor) arriba.';"),
    # line 4114
    (4113, "chip.setAttribute('data-tip', 'Showing only ' + name + \"'s sessions — click to show all\");",
             "chip.setAttribute('data-tip', 'Mostrando solo las sesiones de ' + name + ' — clic para ver todas');"),
]

# ------------------------------------------------------------- stationui.js
station = [
    # ONE MENU nav (FAMILIES): labels display, k: keys stay
    ('MY WORK', 'MI TRABAJO'),
    ('TASKS', 'TAREAS'),
    ('DELIVERABLES', 'ENTREGABLES'),
    ('RECIPES', 'RECETAS'),
    ('AUTOMATE', 'AUTOMATIZAR'),
    ('WORKFLOWS', 'FLUJOS'),
    ('SCHEDULES', 'HORARIOS'),
    ('GOAL LOOPS', 'BUCLES DE OBJETIVO'),
    ('AWAY WORK', 'TRABAJO EN AUSENCIA'),
    ('CONNECT', 'CONECTAR'),
    ('ABILITIES', 'HABILIDADES'),
    ('CHANNELS', 'CANALES'),
    ('Ready-made jobs to start', 'Trabajos listos para empezar'),
    # common buttons
    ('Keep', 'Mantener'),
    ('remember this', 'recordar esto'),
    ('Discard', 'Descartar'),
    ('reject it — never propose this again', 'rechazarlo — que nunca lo proponga de nuevo'),
    ('Forget', 'Olvidar'),
    ('Confirm forget', 'Confirmar olvido'),
    ('Cancel', 'Cancelar'),
    ('Done', 'Hecho'),
    ('ALLOW AGAIN', 'PERMITIR OTRA VEZ'),
    ('⚠ UNSAVED — close again to discard, or SAVE first', '⚠ SIN GUARDAR — cierra otra vez para descartar, o guarda primero'),
    # labels / status
    ('Agent model', 'Modelo del agente'),
    ('Station personality', 'Personalidad de la estación'),
    ('Minimized windows', 'Ventanas minimizadas'),
    ('All caught up', 'Todo al día'),
    ('Latest reply', 'Última respuesta'),
    ('All quests', 'Todas las misiones'),
    ('No quests in this category', 'No hay misiones en esta categoría'),
    ('Goal progress', 'Progreso del objetivo'),
    ('Work navigation', 'Navegación de trabajo'),
    ('Start minimized', 'Empezar minimizado'),
    ('Close to tray', 'Cerrar a la bandeja'),
    ('Reload current station', 'Recargar la estación actual'),
    ('Open the fresh station', 'Abrir la estación nueva'),
    ('Jump to settings subsection', 'Ir a la subsección de ajustes'),
    ('Choose a skin', 'Elige un aspecto'),
    ('Unnamed skill', 'Habilidad sin nombre'),
    ('Use preset', 'Usar preajuste'),
    ('Only this agent', 'Solo este agente'),
    ('Whole station', 'Estación completa'),
    ('No current grant', 'Sin permiso actual'),
    ('Access unavailable', 'Acceso no disponible'),
    ('Access could not be checked', 'No se pudo verificar el acceso'),
    ('Skill library unavailable', 'Biblioteca de habilidades no disponible'),
    ('Evaluation receipt', 'Recibo de evaluación'),
    ('Recorded work completion', 'Trabajo completado registrado'),
    ('Run these checks', 'Ejecutar estas comprobaciones'),
    ('Start a guided interview', 'Empezar una entrevista guiada'),
    ('Update through an interview', 'Actualizar mediante una entrevista'),
    ('Define the result you want', 'Define el resultado que quieres'),
    ('Why this step matters', 'Por qué importa este paso'),
    ('Needs a smaller step', 'Necesita un paso más pequeño'),
    ('That did not work', 'Eso no funcionó'),
    ('Saved for tomorrow', 'Guardado para mañana'),
    ('Read instructions', 'Leer instrucciones'),
    ('Hide instructions', 'Ocultar instrucciones'),
    ('Dismiss return shortcut', 'Descartar el acceso directo de retorno'),
    ('Link this station to a StarNet account', 'Vincular esta estación a una cuenta de StarNet'),
    ('Open the STORE', 'Abrir la TIENDA'),
    ('This project', 'Este proyecto'),
    ('Project folder to share with', 'Carpeta del proyecto para compartir con'),
    ('Unpin', 'Quitar fijado'),
    ('Pin to top', 'Fijar arriba'),
]

base = 'frontend/app/'
apply(base + 'chat.js', chat, chat_lines)
apply(base + 'app.js', app, app_lines)
apply(base + 'stationui.js', station, None)
print('DONE')
