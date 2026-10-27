<div align="center">

<img src=".github/media/starnet-logo-glow.png" alt="StarNet" width="560">

**Una estación pixel-art viva donde agentes de IA reales hacen trabajo real.**

[![Descarga](https://img.shields.io/github/v/release/androoAGI/starnet-releases?label=descarga&color=f5a623)](https://github.com/androoAGI/starnet-releases/releases/latest)
[![Plataformas](https://img.shields.io/badge/plataforma-Windows%20%7C%20macOS-4a90d9)](INSTALL.md)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-2ea44f)](LICENSE)
[![Local-first](https://img.shields.io/badge/local--first-tu%20m%C3%A1quina%2C%20tus%20datos-8250df)](PRIVACY.md)

[Descarga](https://github.com/androoAGI/starnet-releases/releases/latest) ·
[Guía de instalación](INSTALL.md) ·
[Ejecutar desde fuente](#ejecutar-desde-fuente) ·
[Documentación](docs/INDEX.md) ·
[Contribuir](CONTRIBUTING.md)

<img src=".github/media/station-iso.png" alt="La estación StarNet — habitaciones, tripulación y puestos de trabajo renderizados desde el estado en vivo del harness" width="540">

</div>

> **Este es el fork en español de StarNet.** La interfaz completa está traducida al
> castellano: menús, botones, diálogos, estados, errores, ayuda y textos de accesibilidad.
> Los identificadores, protocolos, APIs y anglicismos técnicos necesarios se conservan en
> inglés. El repositorio original es [androoAGI/starnet](https://github.com/androoAGI/starnet);
> este fork se sincroniza con él periódicamente.

StarNet es un harness de escritorio local-first donde creas agentes de IA, los organizas en una
estación espacial pixel-art y los ves realizar trabajo real con modelos y herramientas reales.
La estación no es decoración: es una proyección del estado de ejecución en vivo, y el contrato
del producto es literal: **una habitación es un equipo con ámbito de capacidades**,
**un pasillo es** un carril de traspaso autorizado, y **un objeto colocado es una concesión real
de capacidad**.
El layout que dibujas *es* el flujo de trabajo que los agentes ejecutan.

Comienza con un agente, luego coloca bahías o invoca especialistas para ejecutar **más, en
paralelo** — cada uno una **ejecución de agente genuinamente distinta y acotada** con su propio
espacio de trabajo y permisos.
El harness realiza **llamadas de modelo reales, herramientas reales, coste real** en lugar de
animar una simulación.

## Características

| | |
| --- | --- |
| **Una tripulación, no un chatbot** | Crea agentes con clases, personas y equipamientos distintos. Ejecuta varios a la vez — cada uno obtiene su propio espacio de trabajo, transcripción, memoria y permisos acotados. |
| **Trae tus propios modelos** | Pega una clave de OpenRouter, o inicia sesión con cuentas de proveedor soportadas (Anthropic, OpenAI, Google) — las claves viven en el keychain del SO, nunca en el frontend. |
| **Mensaje desde cualquier lugar** | Conecta agentes a Telegram, Discord, Slack, Signal o Matrix y habla con tu estación lejos del escritorio. |
| **Turno de noche** | Deja la estación corriendo y los agentes siguen trabajando dentro de una correa explícita y ajustable — cada acción en ausencia se registra y es revisable. |
| **Recetas, habilidades, horarios** | Lanza recetas probadas de varios pasos, concede habilidades reutilizables y pon trabajo en horarios cron con salida visible. |
| **Pregunta antes de adivinar** | Los Briefings de Tarea convierten la ambigüedad en una pregunta concreta con opciones — por cualquier canal conectado — en lugar de un fallo silencioso. |
| **El trabajo terminado tiene puerta frontal** | Los entregables llegan a la OUTBOX como archivos reales que abres, no como scroll de chat para arqueología. |
| **Conectores MCP** | Conecta servidores Model Context Protocol y conectores de pegar-clave/OAuth para extender lo que los agentes pueden tocar. |
| **Voz** | Dictado push-to-talk de entrada, una voz de estación consistente de salida. |
| **Libros reales** | Gasto, presupuestos e historial de ejecución persisten en disco y se muestran tal cual. |

## Lo que es real

- Las llamadas de modelo fluyen a través del sidecar Node local.
- Las herramientas operan mediante comprobaciones explícitas de capacidad y consentimiento.
- La memoria de agentes, transcripciones, registros de gasto, tareas y horarios persisten en disco.
- Múltiples agentes corren en paralelo con espacios de trabajo separados y permisos acotados.
- La estación visual proyecta el mismo estado de ejecución que el harness puede demostrar.

StarNet no simula ingresos, trabajo completado, actividad de modelo ni gasto. Su ley de producto
central es que **la interfaz nunca debe afirmar un estado que el harness no puede demostrar.**

## Descarga

Las builds de escritorio se publican en la
[página de releases de StarNet](https://github.com/androoAGI/starnet-releases/releases/latest).

| Plataforma | Archivo |
| --- | --- |
| **Windows** (10/11, 64-bit) | `StarNet_<version>_x64-setup.exe` |
| **macOS — Apple Silicon** (M1 o posterior) | `StarNet_<version>_aarch64.dmg` |
| **macOS — Intel** | `StarNet_<version>_x64.dmg` |

> **Nota Apple Silicon:** usa el DMG nativo `aarch64`. Evita el DMG `x64` en Apple Silicon:
> se ejecuta bajo Rosetta 2 en lugar de usar la arquitectura nativa.

El tren de release público soporta Windows y macOS. Se niega a preparar un release a menos que
el instalador de Windows pase la verificación Authenticode y de timestamp, ambas builds de Mac
pasen las comprobaciones de Developer ID y la notarización de Apple, y cada artefacto del
actualizador tenga una firma de actualizador válida. Esos son requisitos de pipeline, no prueba
de que una copia particular descargada o instalada fue probada en tu máquina;
[INSTALL.md](INSTALL.md) explica qué verificar y cuándo detenerse.
Los paquetes Linux son solo artefactos de build interna y no son un objetivo de release público soportado.

> **Release temprano:** Windows es el objetivo de escritorio más probado. macOS tiene menos
> cobertura real. ¿Algo roto? Dinos:
> **androo.agi@gmail.com**.

## Ejecutar desde fuente

Requisitos: Node.js 18+ (Node.js 22 coincide con CI), Git. Rust y los
[prerequisitos de Tauri](https://v2.tauri.app/start/prerequisites/) solo para el shell de escritorio.

El sidecar usa solo módulos core de Node, por lo que se ejecuta sin instalar nada:

```bash
git clone https://github.com/androoAGI/starnet.git
cd starnet
node sidecar/index.js
```

Abre <http://localhost:8787>, luego conecta un proveedor —
**trae tu propia clave API de OpenRouter (BYOK)** o usa un inicio de sesión OAuth soportado. Las
peticiones de proveedor salen de tu máquina cuando ejecutas un agente;
el estado de la estación, transcripciones, memoria y libros permanecen en el espacio de trabajo
local de StarNet a menos que uses explícitamente una herramienta o conector de red. Ver
[PRIVACY.md](PRIVACY.md) para el mapa de datos completo.

### Ejecutar gratis con un modelo local

Sin clave, sin cuenta, sin factura: instala [Ollama](https://ollama.com), descarga un modelo
(`ollama pull qwen3:8b`), y elige **OLLAMA** como proveedor — en la pantalla de primera
ejecución del cerebro, o más tarde en **AJUSTES → PROVEEDORES**. StarNet habla con Ollama en
`127.0.0.1:11434` y solo reporta listo cuando puede listar tus modelos locales. Elige un modelo
que soporte herramientas (`ollama show <model>` las lista): los agentes actúan mediante llamadas
de herramienta. Aclaración honesta: los modelos locales son más pequeños que los de la nube,
así que espera trabajo más lento y menos pulido en tareas largas, y una tarea necesita una
ventana de contexto grande — un modelo de 8B consume unos 10 GB de memoria gráfica mientras
trabaja.

Para desarrollo de escritorio:

```bash
npm ci
npm run desktop:dev     # shell de desarrollo
npm run desktop:build   # build local de instaladores
```

## Modo terminal

La app de escritorio incluye un comando `starnet` junto a ella. Ejecútalo sin argumentos y abre
un dashboard en vivo sobre la estación que la app está ejecutando: la tripulación a la izquierda
(un spinner en quien esté trabajando), la conversación del agente elegido al lado, y cada
aprobación como una tarjeta que respondes con `y` o `n`
(`v` muestra primero la solicitud completa). Lee el mismo estado que la app, así que nunca
muestra trabajo que la estación no puede demostrar.

StarNet no tiene que estar abierto. Con él cerrado, `starnet` lo inicia en segundo plano: la
misma estación con tus claves (permanecen en el keychain de la app), y no se abre ventana; el
icono de bandeja muestra que está corriendo.
Cuando la última sesión de `starnet` termina, se cierra de nuevo, a menos que haya rutinas
armadas o StarNet esté configurado para permanecer en la bandeja (lo mismo que cerrar su
ventana). Abrir StarNet mientras corre muestra esa misma estación; en macOS, ábrelo desde su
icono de barra de menús (Open StarNet), ya que un clic en el Dock aún no trae de vuelta esa
ventana.

| Plataforma | El comando |
| --- | --- |
| **Windows** | `%LOCALAPPDATA%\StarNet\bin\starnet.cmd` |
| **macOS** | `/Applications/StarNet.app/Contents/Resources/bin/starnet` |

Así que solo tienes que escribir `starnet` en un terminal nuevo: el instalador de Windows pone
esa carpeta en tu `PATH` de usuario (el desinstalador la quita), y en macOS StarNet enlaza el
comando en `~/.local/bin` la primera vez que arranca, añadiendo esa carpeta a `~/.zprofile` si
ningún perfil de shell lo tiene aún
(`STARNET_NO_CLI_LINK=1` lo desactiva). Otros comandos: `starnet ls` (cada agente
y sus preguntas abiertas), `starnet approve` / `starnet deny`, `starnet watch` (el flujo de
eventos en vivo, una línea cada uno), `starnet flow` (workflows) y `starnet -p "<tarea>"`
(una ejecución, respuesta en stdout).
`starnet --help` los lista todos. Desde un checkout, usa `node bin/starnet.js`.

## ¿Vienes de OpenClaw o Hermes?

StarNet puede importar un agente existente: apunta a tu home de OpenClaw o Hermes en disco y
crea un agente StarNet desde la persona, instrucciones, memoria y modelo que encuentre. Las
claves API nunca se transfieren — las vuelves a introducir en CONECTAR › HABILIDADES ›
CONECTADOS › CLAVES API.

## Arquitectura

| Ruta | Responsabilidad |
| --- | --- |
| `frontend/` | Mundo de estación JavaScript vanilla y UI de escritorio. |
| `sidecar/` | Runtime local de agentes Node: proveedores, herramientas, persistencia, presupuestos, consentimiento. |
| `shared/` | Contratos aditivos de eventos y esquemas entre fronteras. |
| `src-tauri/` | Shell de escritorio Rust/Tauri y runtime empaquetado. |
| `test/` | Unitarios, de contrato, integración y puertas de release. |
| `qa/` | Recibos de QA en vivo, journeys, libro de hallazgos y autoridad de readiness de release. |

El frontend consume eventos reales del sidecar sobre localhost HTTP/NDJSON y SSE. Los secretos
pertenecen a la autoridad local:
**Los secretos los guarda el sidecar / keychain del SO, nunca en el frontend**.

Comienza con [docs/INDEX.md](docs/INDEX.md) para la documentación viva. Los documentos de
planificación antiguos permanecen en el repositorio como historia de diseño y están etiquetados
como tales.

## Testing

```bash
npm run test:fast          # puerta de merge requerida
npm run test:http          # suite en vivo HTTP/E2E del sidecar
npm test                   # suites de validación + world + fast + HTTP
npm run security:secrets   # escaneo de secretos en todo el historial; requiere Gitleaks en PATH
```

El agregado de release es `npm run qa:ready`. Es vinculante al candidato: cualquier commit nuevo
invalida el recibo READY anterior hasta que las puertas en vivo afectadas se rerunen.

## Contribuir y seguridad

Las contribuciones son bienvenidas — lee [CONTRIBUTING.md](CONTRIBUTING.md) y sigue el
[Código de Conducta](CODE_OF_CONDUCT.md).

No reportes vulnerabilidades en un issue público. Sigue [SECURITY.md](SECURITY.md) para
instrucciones de reporte privado.

## Licencia

StarNet es open source bajo la [Licencia MIT](LICENSE). Los componentes de terceros permanecen
bajo sus licencias originales — ver [NOTICE.md](NOTICE.md).

**La Licencia MIT cubre solo el código.** El nombre **StarNet**, el logo, el arte de la
estación y los sprites, y el resto de la identidad de marca del proyecto son propiedad de
Andrew Sims y **no** están licenciados con ella — no se conceden derechos de marca ni otros
derechos de marca, expresamente ni por implicación.

MIT significa que puedes forkear, modificar y redistribuir el código, incluyendo
comercialmente. Lo que no puedes hacer es distribuirlo como StarNet: los forks y derivados
deben usar su propio nombre, logo y arte, y no pueden presentarse como este proyecto ni como
endosados por él.
