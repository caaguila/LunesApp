const CHALLENGES = [
  {
    id: "c01", time: "08:00", window: "La llegada", title: "La primera compilación ya protesta", skill: "Java · compilación",
    subtitle: "Tu primer lunes empieza con un error que el compilador ya ha explicado tres veces.",
    situation: "Abres el proyecto Java. La compilación se detiene en `Main.java`: se declara una variable y, una línea después, se escribe su nombre con una errata.",
    evidence: [
      ["Main.java", "String mensaje = \"Lunes, 08:00\";\nSystem.out.println(mensage);"],
      ["Error del compilador", "Main.java:2: error: cannot find symbol\n  symbol: variable mensage"],
      ["Tu objetivo", "Corregir la línea para imprimir el mensaje que ya está declarado."]
    ],
    question: "Escribe la línea Java corregida. No hace falta reescribir el programa.",
    placeholder: "System.out.println(...);",
    hints: ["El error dice que `mensage` no existe.", "La variable declarada se llama `mensaje`, con j."],
    solution: "`System.out.println(mensaje);` Usa exactamente el identificador declarado. Primer bug del lunes resuelto sin abrir un comité.",
    accept: { oneOf: ["System.out.println(mensaje);"] }, reward: { client: 0, prod: 0, job: 2 },
    result: "Compila. El compilador tenía razón; solo le faltaba un café."
  },
  {
    id: "c02", time: "08:00", window: "La llegada", title: "Dos textos iguales que no son iguales", skill: "Java · String",
    subtitle: "El README de 2019 tiene un ejemplo de Java. El test de hoy no está de acuerdo con él.",
    situation: "La comprobación de estado siempre falla aunque el texto recibido se vea exactamente como `PAGADO`. En Java, `==` compara referencias; aquí necesitas comparar el contenido.",
    evidence: [
      ["FacturaService.java", "String estado = new String(\"PAGADO\");\nif (estado == \"PAGADO\") {\n    procesarFactura();\n}"],
      ["Salida del test", "expected: procesarFactura() called once\nactual:   no interactions"],
      ["Nota al margen", "La guía vieja dice que `==` «parece funcionar en mi máquina»."]
    ],
    question: "Escribe la condición Java que compara el contenido de forma correcta y segura frente a null.",
    placeholder: "if ( ... ) {",
    hints: ["No compares referencias con `==`.", "Pon el literal a la izquierda: `\"PAGADO\".equals(estado)`."],
    solution: "`if (\"PAGADO\".equals(estado)) {` compara el contenido y no lanza `NullPointerException` si `estado` es null. La guía de 2019 queda oficialmente jubilada.",
    accept: { oneOf: ["if (\"PAGADO\".equals(estado)) {"] }, reward: { client: 0, prod: 1, job: 2 },
    result: "El test pasa. `==` sigue teniendo usos, pero comparar el contenido de un String no es uno de ellos."
  },
  {
    id: "c03", time: "09:00", window: "Primer incidente", title: "El merge que nadie pidió", skill: "Git · revisión",
    subtitle: "«Era un merge pequeñito», dice el autor. La migración de facturas ahora borra el campo `due_date`.",
    situation: "El merge `8f3a2c1` está en `main`. El padre 1 es la rama estable; el padre 2 es la rama de la funcionalidad. La regresión aparece solo a partir de ese merge. La funcionalidad todavía se necesita, así que no puedes reescribir el historial compartido.",
    evidence: [
      ["git log --graph", "*   8f3a2c1 merge: refactor invoices  (main)\n|\\\n| * 5bf20a4 refactor invoice mapper\n* | 82ad910 release: stable invoices"],
      ["Revisión del PR", "El cambio elimina `due_date` al serializar una factura."],
      ["Regla de equipo", "main es compartida; las correcciones se publican con un commit nuevo."]
    ],
    question: "Escribe el comando que revierte el merge en main conservando el lado estable (primer padre).",
    placeholder: "Ej.: git revert …",
    hints: ["Un merge revert necesita especificar qué padre conservar.", "El padre 1 es la base estable: usa `-m 1`."],
    solution: "`git revert -m 1 8f3a2c1`. Crea un nuevo commit que deshace el merge sin reescribir `main`. Luego corrige el mapeo y vuelve a integrar el cambio con una prueba.",
    accept: { oneOf: ["git revert -m 1 8f3a2c1", "git revert -m 1 8f3a2c1 --no-edit"] }, reward: { client: 1, prod: 3, job: 1 },
    result: "El campo vuelve a la factura y el historial sigue siendo legible. El autor promete que el próximo merge será «de verdad, pequeñito»."
  },
  {
    id: "c04", time: "09:00", window: "Primer incidente", title: "La query que puso la app a meditar", skill: "SQL · diagnóstico",
    subtitle: "La pantalla de facturas tarda tanto que alguien ha intentado refrescarla 37 veces.",
    situation: "Las nuevas escrituras están esperando detrás de una transacción olvidada. Rafa confirma que el proceso es una conexión abandonada y que sus cambios no deben conservarse. Termina solo esa sesión para que PostgreSQL revierta su transacción; no mates a ciegas la base de datos.",
    evidence: [
      ["pg_stat_activity", "pid=1842 · state=idle in transaction · query=UPDATE invoices SET status='sent'"],
      ["Esperas", "pid=2110 (API) espera un bloqueo cuyo blocker es pid=1842"],
      ["runbook / SQL", "`pg_cancel_backend(pid)` cancela una consulta activa. `pg_terminate_backend(pid)` termina la sesión abandonada y revierte su transacción."]
    ],
    question: "Escribe la consulta SQL para terminar únicamente la sesión abandonada identificada.",
    placeholder: "SELECT …",
    hints: ["El PID bloqueante es 1842, no el de la API.", "Como está idle in transaction y se confirmó que es prescindible, termina esa sesión para que se revierta su transacción."],
    solution: "`SELECT pg_terminate_backend(1842);` Termina solo la conexión abandonada y PostgreSQL revierte su transacción, liberando los bloqueos. `pg_cancel_backend` no es suficiente para una sesión idle in transaction; después investiga quién dejó la transacción abierta y añade límites/observabilidad.",
    accept: { oneOf: ["select pg_terminate_backend(1842);", "select pg_terminate_backend(1842)"] }, reward: { client: 0, prod: 4, job: 1 },
    result: "Las escrituras vuelven a fluir. La transacción llevaba abierta desde el viernes; el viernes también tenía reuniones."
  },
  {
    id: "c05", time: "11:00", window: "Crisis inesperada", title: "El null que tumbó la factura", skill: "Java · debugging",
    subtitle: "Una factura importada no tiene cliente asociado. La pantalla de historial acaba de descubrirlo en producción.",
    situation: "El log señala una `NullPointerException` al construir el email de aviso. Los datos antiguos permiten que `pedido` o su cliente sean null; el email también puede faltar.",
    evidence: [
      ["Stack trace", "NullPointerException at AvisoService.enviar(AvisoService.java:42)"],
      ["AvisoService.java", "enviarAviso(pedido.getCliente().getEmail());"],
      ["Regla de datos", "`pedido`, `getCliente()` y `getEmail()` pueden ser null. Si falta alguno, no se envía el aviso."]
    ],
    question: "Escribe una condición Java que compruebe los tres valores antes de llamar a `enviarAviso`.",
    placeholder: "if (pedido != null && ...) {",
    hints: ["Comprueba de izquierda a derecha: Java deja de evaluar `&&` al encontrar false.", "Añade guardas para pedido, cliente y email antes de enviar."],
    solution: "`if (pedido != null && pedido.getCliente() != null && pedido.getCliente().getEmail() != null) { enviarAviso(pedido.getCliente().getEmail()); }` evita desreferenciar null. A más largo plazo, documenta el contrato y modela cuándo se omite el aviso.",
    accept: { allGroups: [["pedido != null"], ["getcliente() != null"], ["getemail() != null"], ["&&"]] }, reward: { client: 0, prod: 1, job: 3 },
    result: "El aviso se envía cuando hay destinatario; si no, el proceso continúa sin tumbar el lote de facturas."
  },
  {
    id: "c06", time: "11:00", window: "Crisis inesperada", title: "La rama sorpresa de Ana", skill: "Git · diagnóstico",
    subtitle: "Ana está de vacaciones. Su rama también. Sus cambios no están comprometidos.",
    situation: "El build de release falla y la terminal está en `release/portal`. Aparecen cambios locales sin commit y un SQL sin seguimiento, creados por Ana. No sabes todavía si pertenecen a este release.",
    evidence: [
      ["git status --short", " M src/portal.ts\n?? db/migration_ana.sql"],
      ["Mensaje de Ana", "«No borres migration_ana.sql, que mañana lo revisamos. Creo que era para portal.»"],
      ["Regla", "No uses `git clean -fd`, `reset --hard` ni cambies de rama hasta proteger el trabajo."]
    ],
    question: "Escribe un comando Git que cree una rama de rescate sin descartar los cambios presentes.",
    placeholder: "Ej.: git switch -c …",
    hints: ["La rama actual es release/portal. No hay conflictos con el nuevo nombre.", "Crear una rama nueva mantiene el árbol de trabajo y captura su contexto."],
    solution: "`git switch -c rescue/ana-cambios`. Comprueba después `git status` y revisa el SQL con Ana antes de integrar nada. Crear la rama conserva el trabajo sin aprobarlo a ciegas.",
    accept: { oneOf: ["git switch -c rescue/ana-cambios", "git checkout -b rescue/ana-cambios"] }, reward: { client: 0, prod: 1, job: 3 },
    result: "Los cambios quedan a salvo en `rescue/ana-cambios`. El SQL misterioso no llega a producción sin revisión."
  },
  {
    id: "c07", time: "13:00", window: "Error en el portal", title: "El filtro de facturas se olvidó de filtrar", skill: "Java · colecciones",
    subtitle: "El resultado mezcla facturas pagadas, pendientes y archivadas. Un stream se quedó a medio escribir antes de comer.",
    situation: "El endpoint recibe una lista de facturas. La pantalla debe mostrar solo las pagadas que no estén archivadas. El código actual filtra por estado nulo, que no es lo mismo que filtrar por estado pagado.",
    evidence: [
      ["Factura.java", "String getEstado()\nboolean isArchivada()"],
      ["Ejemplo recibido", "P-10: estado=PAGADA, archivada=false\nP-11: estado=PENDIENTE, archivada=false\nP-12: estado=PAGADA, archivada=true"],
      ["PortalService.java", "facturas.stream()\n    .filter(f -> f.getEstado() != null)\n    .toList();"]
    ],
    question: "Escribe el stream Java 17 que devuelve solo las pagadas y no archivadas.",
    placeholder: "facturas.stream().filter(...).toList();",
    hints: ["Combina las dos condiciones con `&&` dentro de `filter`.", "Usa `\"PAGADA\".equals(f.getEstado())` y `!f.isArchivada()`."],
    solution: "`facturas.stream().filter(f -> \"PAGADA\".equals(f.getEstado()) && !f.isArchivada()).toList();` excluye pendientes, estados null y archivadas. El literal a la izquierda evita otro susto de null.",
    accept: { allGroups: [["facturas.stream()"], ["filter("], ["\"pagada\""], ["getestado()"], ["!f.isarchivada()"], [".tolist()"]] }, reward: { client: 1, prod: 1, job: 2 },
    result: "La lista contiene solo las facturas pagadas activas. `filter(f -> f.getEstado() != null)` deja de hacerse pasar por una regla de negocio."
  },
  {
    id: "c08", time: "13:00", window: "Error en el portal", title: "La API responde bien… a otra pregunta", skill: "API REST · JSON",
    subtitle: "El endpoint devuelve 200, pero el JSON mezcla estados y registros archivados.",
    situation: "La integración anterior construye una petición sin tenant ni filtros. La guía del endpoint y el log del proxy detallan qué hay que enviar para obtener pedidos pagados y excluir los archivados.",
    evidence: [
      ["Guía vigente", "GET /v2/orders?status={estado}&includeArchived={true|false}"],
      ["Contrato de acceso", "Enviar el encabezado `X-Tenant: acme`."],
      ["Request observado", "GET /v2/orders  → 200 OK"],
      ["Response JSON", "{\"data\":[{\"id\":\"O-1\",\"status\":\"pending\",\"archived\":false}],\"meta\":{\"total\":148}}"]
    ],
    question: "Escribe el método, la URL filtrada, el encabezado requerido y una comprobación del JSON.",
    placeholder: "GET /ruta?filtros\n<encabezado HTTP>\ncomprobación JSON",
    hints: ["Un 200 solo indica que la petición fue atendida; no que el filtro sea correcto.", "Filtra `status=paid`, excluye archivos y conserva el tenant."],
    solution: "`GET /v2/orders?status=paid&includeArchived=false` con `X-Tenant: acme`; comprueba que la respuesta JSON contiene `data` y valida cada fila, por ejemplo `data.every(order => order.status === 'paid' && order.archived === false)`. Considera paginación antes de asegurar que se revisaron todos los resultados.",
    accept: { all: ["status=paid", "includearchived=false", "x-tenant: acme"], allGroups: [["data"], ["every", "todos", "cada"], ["status"]] }, reward: { client: 2, prod: 2, job: 1 },
    result: "El portal recibe pedidos pagados y activos del tenant correcto, no todos los que respondieron «200» por cortesía."
  },
  {
    id: "c09", time: "15:00", window: "Emergencia en producción", title: "El bug solo aparece después de comer", skill: "Java · fechas · logs",
    subtitle: "A las 00:00 UTC, las facturas del día siguiente desaparecen. Solo pasa en producción, porque allí es lunes de verdad.",
    situation: "El código Java interpreta el día con la zona horaria de la máquina. En producción corre en UTC, pero el día contable de este lote corresponde a America/Bogota. Calcula los límites en la zona de negocio y filtra instantes con un intervalo semiabierto.",
    evidence: [
      ["Log, correlation_id=inv-73", "2025-06-16T00:12:03.020Z  invoice.created customer_tz=America/Bogota"],
      ["Código", "LocalDate invoiceDay = instant.atZone(ZoneId.systemDefault()).toLocalDate();"],
      ["Métrica", "Las incidencias empiezan entre 00:00 y 02:00 UTC. No ocurre al usar el emulador local."]
    ],
    question: "Escribe las líneas Java que calculan el comienzo del día y el comienzo del día siguiente en America/Bogota como Instant.",
    placeholder: "ZoneId zone = ...;\nInstant start = ...;\nInstant end = ...;",
    hints: ["No uses `ZoneId.systemDefault()`; el huso debe ser explícito.", "Usa `date.atStartOfDay(zone).toInstant()` y repite con `date.plusDays(1)`."],
    solution: "`ZoneId zone = ZoneId.of(\"America/Bogota\"); Instant start = date.atStartOfDay(zone).toInstant(); Instant end = date.plusDays(1).atStartOfDay(zone).toInstant();` Filtra con `!instant.isBefore(start) && instant.isBefore(end)`. Calcular ambos comienzos locales evita asumir que un día siempre tiene 24 horas.",
    accept: { allGroups: [["zoneid.of(\"america/bogota\")"], ["atstartofday(zone).toinstant()"], ["plusdays(1)"], ["instant"], ["start"], ["end"]] }, reward: { client: 1, prod: 4, job: 1 },
    result: "Aíslas la frontera temporal que provoca el fallo. La zona horaria deja de decidir si un lunes empieza antes o después de la cena."
  },
  {
    id: "c10", time: "15:00", window: "Emergencia en producción", title: "El pipeline verde que entrega aire", skill: "CI/CD · pipeline",
    subtitle: "Tests: verdes. Build: verde. Deploy: rojo. El artefacto que busca despliegue se llama `java-app`; Maven produce un JAR.",
    situation: "El trabajo de build finaliza bien, pero el de deploy informa «artifact java-app not found». El equipo necesita publicar el JAR de la corrección sin saltarse los tests.",
    evidence: [
      ["Build log", "mvn test package → target/portal.jar\nTests: 34 passed"],
      ["Upload", "uses: actions/upload-artifact@v4 · name: portal-jar · path: build/*.jar"],
      ["Deploy", "uses: actions/download-artifact@v4 · name: java-app"]
    ],
    question: "Indica la ruta del JAR y el nombre de artefacto que deben coincidir en upload/download. Responde con dos valores.",
    placeholder: "ruta/*.jar; nombre-artefacto",
    hints: ["El build log indica dónde dejó Maven el JAR.", "Compara `name` en upload y download: deben ser idénticos."],
    solution: "En upload usa `path: target/*.jar` y `name: java-app`; en download usa `name: java-app`. Mantén el orden test → package → upload → download → deploy. Un nombre de artefacto mismatcheado también puede bloquear el release.",
    accept: { oneOf: ["target/*.jar; java-app", "target/*.jar, java-app", "path: target/*.jar; name: java-app"] }, reward: { client: 1, prod: 4, job: 1 },
    result: "El deploy encuentra el JAR de Maven y mantiene los 34 tests verdes. El directorio `build/` queda libre para ser confuso en otro proyecto."
  },
  {
    id: "c11", time: "17:00", window: "Última catástrofe",     title: "El test del instante exacto", skill: "Java · testing",
    subtitle: "La única persona que entendía el módulo se marchó. El comentario `TODO: arreglar algún día` ya vota en la daily.",
    situation: "La función de renovación de suscripciones llama a `Instant.now()` directamente. Una prueba falla justo en la fecha límite y no se puede controlar el reloj. El código se copió de una respuesta de Stack Overflow de 2018 («funciona en mi caso»).",
    evidence: [
      ["RenewalService.java", "boolean debeRenovar(Instant renewalDate, Clock clock) {\n    return Instant.now().isAfter(renewalDate);\n}"],
      ["RenewalTest.java", "La regla es renovar cuando now >= renewalDate, incluido el instante exacto."],
      ["Nota heredada", "`test2FinalBueno` y `TODO: arreglar algún día` siguen sin explicar la regla."]
    ],
    question: "Completa solo la expresión de retorno para usar `clock` y renovar cuando now == renewalDate.",
    placeholder: "return ...;",
    hints: ["El método recibe un `Clock`, pero ahora mismo lo ignora.", "`isAfter` excluye la igualdad; piensa cómo expresar «no es anterior a»."
    ],
    solution: "La expresión es `!clock.instant().isBefore(renewalDate)`. En la prueba, usa `Clock.fixed(renewalDate, ZoneOffset.UTC)` y comprueba el caso exacto, además de uno anterior y otro posterior. Así el test no depende del reloj real ni de cuándo se ejecute.",
    accept: { oneOf: ["!clock.instant().isBefore(renewalDate)"] }, reward: { client: 0, prod: 2, job: 3 },
    result: "La reproducción queda estable en test. El TODO ya tiene un criterio y un dueño; entra en el sprint de verdad, no en el museo de comentarios."
  },
  {
    id: "c12", time: "17:00", window: "Última catástrofe", title: "Las 17:42: el webhook que cobró dos veces", skill: "Integración · SQL · arquitectura",
    subtitle: "Última catástrofe: un cliente ha recibido dos confirmaciones de pedido. El proveedor reintenta cuando no obtiene respuesta a tiempo.",
    situation: "El endpoint crea un pedido antes de confirmar el webhook. La respuesta tardó; el proveedor reenvió el evento. La base de datos no tiene restricción de unicidad para el identificador del evento. Ya sabes de retries, transacciones y cambios seguros; ahora toca combinarlos.",
    evidence: [
      ["access.log", "17:41:58 POST /webhooks/orders event_id=evt_204  → 201 (respuesta tardía)"],
      ["access.log", "17:42:03 POST /webhooks/orders event_id=evt_204  → 201 (reintento del proveedor)"],
      ["Esquema", "`orders(id, provider_event_id, status)` — índice normal, sin UNIQUE"],
      ["Runbook", "No retires pedidos por log. Verifica idempotencia, integridad y resultado persistido antes de responder."]
    ],
    question: "Escribe solo la restricción SQL que impide guardar dos pedidos con el mismo `provider_event_id`.",
    placeholder: "ALTER TABLE ... ADD CONSTRAINT ...;",
    hints: ["Una comprobación previa en Java no evita la carrera entre dos peticiones simultáneas.", "La garantía debe vivir en la base de datos: una restricción de unicidad sobre la columna del evento."],
    solution: "`ALTER TABLE orders ADD CONSTRAINT uq_orders_provider_event_id UNIQUE (provider_event_id);` La unicidad hace segura la concurrencia; después, el handler debe tratar el conflicto como replay idempotente y devolver el resultado ya creado, no insertar otro pedido. Añade un test que envíe dos veces el mismo evento.",
    accept: { oneOf: ["ALTER TABLE orders ADD CONSTRAINT uq_orders_provider_event_id UNIQUE (provider_event_id);"] }, reward: { client: 3, prod: 5, job: 2 },
    result: "Los reintentos dejan de duplicar pedidos, y el equipo concilia los eventos antes de tocar datos reales. A las 17:58, alguien escribe «lo vemos mañana» y esta vez sí es cierto."
  }
];

const WINDOWS = [
  { time: "08:00", title: "Llegada a la oficina", start: 0, end: 1 },
  { time: "09:00", title: "Primer incidente", start: 2, end: 3 },
  { time: "11:00", title: "Crisis inesperada", start: 4, end: 5 },
  { time: "13:00", title: "Error en el portal", start: 6, end: 7 },
  { time: "15:00", title: "Emergencia en producción", start: 8, end: 9 },
  { time: "17:00", title: "Última catástrofe", start: 10, end: 11 }
];

const DEFAULT_STATE = { started: false, solved: [], hints: {}, attempts: {}, drafts: {}, stats: { client: 62, prod: 60, job: 68 } };
const STORAGE_KEY = document.body.dataset.storageKey || "lunes-en-produccion-v1";
let state = loadState();
let activeView = "game";
let dossierTab = "map";
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.solved) || !saved.stats) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...saved, stats: { ...DEFAULT_STATE.stats, ...saved.stats } };
  } catch (error) {
    console.warn("No se pudo leer el progreso guardado; se inicia una jornada nueva.", error);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("No se pudo guardar el progreso en este navegador.");
    console.error("Error al guardar el progreso.", error);
  }
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function normalize(value) {
  return String(value).trim().toLocaleLowerCase("es").replace(/\s+/g, " ").replace(/;$/, "");
}

function solvedCount() { return state.solved.length; }
function activeChallengeIndex() { return Math.min(solvedCount(), CHALLENGES.length - 1); }
function isComplete() { return solvedCount() >= CHALLENGES.length; }

function updateSidebar() {
  const count = solvedCount();
  const pct = Math.round((count / CHALLENGES.length) * 100);
  document.getElementById("sidebar-progress").style.width = `${pct}%`;
  document.getElementById("sidebar-progress-text").textContent = `${count} de 12 investigaciones`;
  document.getElementById("sidebar-percent").textContent = `${pct}%`;
  document.getElementById("sidebar-status").textContent = !state.started ? "Aún no has fichado" : isComplete() ? "Jornada completada" : "Incidente en curso";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function render() {
  updateSidebar();
  document.getElementById("game-view").classList.toggle("hidden", activeView !== "game");
  document.getElementById("dossier-view").classList.toggle("hidden", activeView !== "dossier");
  document.getElementById("breadcrumb-view").textContent = activeView === "game" ? "MI ESCRITORIO" : "DOSSIER DEL JUEGO";
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === activeView));
  if (activeView === "game") renderGame();
  else renderDossier();
}

function renderGame() {
  const root = document.getElementById("game-view");
  if (!state.started) {
    root.innerHTML = renderWelcome();
    return;
  }
  if (isComplete()) {
    root.innerHTML = renderCompletion();
    return;
  }
  const index = activeChallengeIndex();
  const challenge = CHALLENGES[index];
  const windowInfo = WINDOWS.find((item) => index >= item.start && index <= item.end);
  const hintCount = state.hints[challenge.id] || 0;
  const attempts = state.attempts[challenge.id] || 0;
  root.innerHTML = `
    <div class="dashboard-head">
      <div><div class="eyebrow">Tu lunes, en tiempo real</div><h1>Sobrevive al lunes.</h1><p>Una cosa a la vez. No hagas deploy con hambre.</p></div>
      <div class="day-clock"><span>HORA DEL INCIDENTE</span><strong>${challenge.time}</strong></div>
    </div>
    <div class="health-grid">
      ${statCard("prod", "Salud de producción", state.stats.prod, "Empieza el runbook, no el pánico.")}
      ${statCard("client", "Confianza del cliente", state.stats.client, "El 200 OK no siempre es la respuesta.")}
      ${statCard("job", "Supervivencia laboral", state.stats.job, "RR. HH. todavía no ha recibido el invite.")}
    </div>
    <div class="workspace-grid">
      <article class="challenge-card">
        <div class="challenge-top"><span class="challenge-count">INVESTIGACIÓN <strong>${String(index + 1).padStart(2, "0")}</strong> / 12</span><span class="challenge-stage"><span>${windowInfo.time}</span> ${esc(windowInfo.title)}</span></div>
        <div class="challenge-body">
          <div class="eyebrow">${esc(challenge.skill)}</div>
          <h2>${esc(challenge.title)}</h2>
          <p class="challenge-subtitle">${esc(challenge.subtitle)}</p>
          <div class="situation-box"><span class="situation-label">El problema</span>${esc(challenge.situation)}</div>
          <div class="section-label">EVIDENCIA EN TU ESCRITORIO</div>
          <div class="evidence-grid">${challenge.evidence.map(([title, body]) => `<div class="evidence-card"><div class="evidence-title">${esc(title)}</div><p>${esc(body)}</p></div>`).join("")}</div>
          <form data-action="answer" data-id="${challenge.id}">
            <label class="question" for="answer-input">${esc(challenge.question)}</label>
            <textarea class="answer-box" id="answer-input" name="answer" autocomplete="off" placeholder="${esc(challenge.placeholder)}">${esc(state.drafts[challenge.id] || "")}</textarea>
            <div class="answer-feedback" id="answer-feedback" role="status" aria-live="polite">${attempts ? `Intentos previos: ${attempts}. Puedes volver a investigar las pistas.` : ""}</div>
            <div class="challenge-actions">
              <div class="challenge-actions-left">
                <button class="button-quiet" type="button" data-action="hint" data-id="${challenge.id}">◎ ${hintCount >= challenge.hints.length ? "Pistas agotadas" : `Pista ${hintCount + 1} de ${challenge.hints.length}`}</button>
                <button class="button-quiet" type="button" data-action="solution" data-id="${challenge.id}">Ver solución</button>
              </div>
              <div class="challenge-actions-right"><button class="button-primary" type="submit">Comprobar respuesta <span>→</span></button></div>
            </div>
            ${hintCount ? `<div class="hint-box"><span class="hint-step">PISTA ${hintCount}</span><span>${esc(challenge.hints[hintCount - 1])}</span></div>` : ""}
            <div class="solution-box" id="solution-${challenge.id}"><p><strong>Resolución de referencia</strong></p><p>${esc(challenge.solution)}</p></div>
          </form>
        </div>
      </article>
      <aside class="side-column">
        ${renderTimeline(index)}
        <div class="pulse-note"><strong>Mensaje del equipo</strong><br><em>${esc(pulseMessage(index))}</em></div>
        ${renderCharacters()}
      </aside>
    </div>`;
}

function statCard(key, label, value, note) {
  return `<div class="health-card" data-stat="${key}"><div class="health-label"><span>${esc(label)}</span><span>${Math.max(0, Math.min(100, value))}%</span></div><div class="health-bar"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div></div>`;
}

function pulseMessage(index) {
  const messages = [
    "El compilador ya ha encontrado la errata. Solo falta que la arreglemos.",
    "Javier dejó la empresa hace siete años. Su ejemplo de `==` sigue compilando.",
    "«El merge era trivial». — Últimas palabras antes de la incidencia.",
    "Alguien ha preguntado si reiniciar producción «un momentito».",
    "El stack trace señala la línea 42. La línea 42 señala a `null`.",
    "Ana dice que los cambios estaban casi guardados. Casi.",
    "La lista tiene 148 elementos. El filtro actual filtra por otra cosa.",
    "La API devuelve 200 y un JSON que no pasa ni una mirada rápida.",
    "El fallo ocurre en horario UTC. El reloj de la oficina no está invitado.",
    "La pipeline ha pasado en su máquina, que por desgracia es una máquina.",
    "El módulo heredado tiene 14 TODO y un único test llamado `test2`.",
    "El proveedor ha reintentado el webhook. Esta vez también.",
  ];
  return messages[Math.min(index, messages.length - 1)];
}

function renderTimeline(currentIndex) {
  const rows = CHALLENGES.map((challenge, i) => {
    const done = state.solved.includes(challenge.id);
    const locked = i > currentIndex;
    const current = i === currentIndex;
    return `<button class="timeline-item ${done ? "done" : ""} ${current ? "current" : ""}" type="button" ${locked ? "disabled" : ""} data-action="jump" data-index="${i}" aria-label="${esc(`${challenge.time} ${challenge.title}${locked ? ", bloqueado" : ""}`)}">
      <span class="timeline-dot"></span><span class="timeline-meta"><span class="timeline-time">${challenge.time}</span><span class="timeline-name">${esc(challenge.title)}</span></span><span class="timeline-mark">${done ? "✓" : locked ? "·" : current ? "↳" : ""}</span></button>`;
  }).join("");
  return `<div class="panel"><div class="panel-title"><span>Mapa del lunes</span><small>${solvedCount()} / 12</small></div><div class="timeline">${rows}</div></div>`;
}

function renderCharacters() {
  return `<div class="panel"><div class="panel-title"><span>En esta oficina</span><small>5 personas · 8 hilos</small></div><div class="characters">
    <div class="character"><span class="avatar">TÚ</span><span class="character-copy"><strong>Tú</strong><small>El que sabe dónde está el runbook</small></span></div>
    <div class="character"><span class="avatar ops">OPS</span><span class="character-copy"><strong>Rafa · Operaciones</strong><small>Conoce el PID. No el autor.</small></span></div>
    <div class="character"><span class="avatar client">QA</span><span class="character-copy"><strong>Lola · QA</strong><small>El test que falla sí era importante</small></span></div>
    <div class="character"><span class="avatar ghost">AN</span><span class="character-copy"><strong>Ana · desarrolladora</strong><small>Su rama tiene cambios sin commit</small></span></div>
    <div class="character"><span class="avatar ghost">?</span><span class="character-copy"><strong>Javier · excompañero</strong><small>Su README sigue en producción</small></span></div>
  </div></div>`;
}

function renderWelcome() {
  return `<div class="welcome">
    <div class="eyebrow">Una Escape Room para gente que ya ha dicho «a mí en local me funciona»</div>
    <h1>Tu lunes va bien.<br><span>Producción opina otra cosa.</span></h1>
    <p class="welcome-intro">Son las 08:00. Tienes hasta las 18:00 para sobrevivir a errores de Java, un merge sospechoso, una query con demasiado tiempo libre y un deploy que no encuentra su artefacto. Una jornada. Doce incidentes. Cero hackers.</p>
    <div class="welcome-details"><span class="detail-pill">12 investigaciones</span><span class="detail-pill">7 franjas horarias</span><span class="detail-pill">Código, Git, SQL y decisiones reales</span><span class="detail-pill">Progreso guardado en este navegador</span></div>
    <div class="welcome-note"><span>▣</span><span><b>Cómo se juega</b><br>Investiga las pruebas, escribe una respuesta técnica o una decisión concreta y compruébala. Las pistas y soluciones están disponibles cuando hacen falta. Los errores cuestan algo de reputación; la jornada nunca se bloquea.</span></div>
    <button class="button-primary" type="button" data-action="start">Fichar y abrir el correo <span>→</span></button>
  </div>`;
}

function renderCompletion() {
  const s = state.stats;
  let verdict;
  let headline;
  let copy;
  if (s.prod >= 65 && s.client >= 65 && s.job >= 65) {
    verdict = "Un lunes sorprendentemente digno";
    headline = "Son las 18:00. Sigues en el canal.";
    copy = "Producción sigue respirando, el cliente tiene un plan verificable y tu manager te ha invitado a una reunión que, por primera vez, puede ser para darte las gracias.";
  } else if (s.prod < 35 || s.client < 35 || s.job < 35) {
    verdict = "Jornada completada (y debidamente postmortemizada)";
    headline = "Llegaste a las seis. Más o menos.";
    copy = "La jornada terminó, pero algún indicador acabó en números rojos. No es un game over: es una retro con acciones concretas, dueños y fecha de seguimiento. El lunes ya era suficientemente realista.";
  } else {
    verdict = "Un lunes con anécdotas para la retro";
    headline = "Son las 18:00. El portátil está cerrado.";
    copy = "Has protegido lo más importante y has dejado un par de cicatrices en los indicadores. No despedido, no incendiado, cliente todavía a bordo. Para un lunes, cuenta como victoria.";
  }
  return `<div class="completion"><div class="eyebrow">${esc(verdict)}</div><h2>${esc(headline)}</h2><p>${esc(copy)}</p>
    <div class="completion-stats"><div class="completion-stat"><strong>${s.prod}%</strong><span>Salud de producción</span></div><div class="completion-stat"><strong>${s.client}%</strong><span>Confianza del cliente</span></div><div class="completion-stat"><strong>${s.job}%</strong><span>Supervivencia laboral</span></div></div>
    <div class="welcome-note"><span>▣</span><span>La última lección del día: contar reintentos, registrar decisiones y actualizar el runbook antes de irse. La fecha del README ya no volverá a ser 2019.</span></div>
    <button class="button-secondary" type="button" data-action="restart">Volver a jugar desde las 08:00</button>
  </div>`;
}

function answerIsCorrect(challenge, value) {
  const normalized = normalize(value);
  if (!normalized) return false;
  if (challenge.accept.oneOf) return challenge.accept.oneOf.some((answer) => normalize(answer) === normalized);
  const matchesAll = challenge.accept.all ? challenge.accept.all.every((part) => normalized.includes(normalize(part))) : true;
  const matchesGroups = challenge.accept.allGroups ? challenge.accept.allGroups.every((group) => group.some((term) => normalized.includes(normalize(term)))) : true;
  return matchesAll && matchesGroups && Boolean(challenge.accept.all || challenge.accept.allGroups);
}

function handleAnswer(form) {
  const challenge = CHALLENGES.find((item) => item.id === form.dataset.id);
  const input = form.elements.answer.value;
  const feedback = document.getElementById("answer-feedback");
  if (answerIsCorrect(challenge, input)) {
    if (!state.solved.includes(challenge.id)) {
      state.solved.push(challenge.id);
      Object.entries(challenge.reward).forEach(([stat, value]) => {
        state.stats[stat] = Math.min(100, state.stats[stat] + value);
      });
    }
    state.drafts[challenge.id] = "";
    saveState();
    render();
    showToast(challenge.result);
    return;
  }
  const count = state.attempts[challenge.id] || 0;
  state.attempts[challenge.id] = count + 1;
  if (count < 2) {
    const penalty = count === 0 ? 3 : 1;
    state.stats.job = Math.max(0, state.stats.job - penalty);
    if (challenge.time >= "15:00") state.stats.prod = Math.max(0, state.stats.prod - penalty);
  }
  saveState();
  feedback.textContent = "Todavía no: contrasta tu respuesta con la evidencia, comprueba los detalles y prueba otra vez. Puedes pedir una pista.";
  feedback.classList.remove("good");
  document.querySelector(".health-grid").outerHTML = `<div class="health-grid">
    ${statCard("prod", "Salud de producción", state.stats.prod, "")}${statCard("client", "Confianza del cliente", state.stats.client, "")}${statCard("job", "Supervivencia laboral", state.stats.job, "")}</div>`;
  document.getElementById("answer-input").value = input;
}

function renderDossier() {
  const root = document.getElementById("dossier-view");
  const tabs = [
    ["map", "Mapa y retos"],
    ["story", "Historia y personajes"],
    ["flow", "Flujo y pantallas"],
    ["architecture", "Arquitectura y datos"],
    ["expansion", "Finales y expansión"]
  ];
  root.innerHTML = `<div class="dossier-head"><div class="eyebrow">Documento de diseño · versión 1.0</div><h1>El expediente del lunes.</h1><p>Una primera versión jugable de «Sobrevivir a un día en una empresa de software»: una comedia laboral interactiva con incidentes técnicos verosímiles, decisiones con consecuencias y un límite de jornada muy razonable.</p></div>
    <nav class="dossier-tabs" aria-label="Secciones del dossier">${tabs.map(([id, label]) => `<button type="button" class="dossier-tab ${dossierTab === id ? "active" : ""}" data-action="dossier-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    ${dossierTab === "map" ? renderMapDossier() : ""}
    ${dossierTab === "story" ? renderStoryDossier() : ""}
    ${dossierTab === "flow" ? renderFlowDossier() : ""}
    ${dossierTab === "architecture" ? renderArchitectureDossier() : ""}
    ${dossierTab === "expansion" ? renderExpansionDossier() : ""}`;
}

function renderMapDossier() {
  return `<section class="dossier-section"><h2>Mapa completo del juego</h2><p class="map-intro">Doce retos con respuestas investigables —no de opción múltiple— y una progresión que empieza con comandos conocidos y termina en integridad transaccional. Abre cada investigación en «La jornada»; sus pistas y su resolución están disponibles en pantalla.</p><div class="map-list">${CHALLENGES.map((c, i) => `<div class="map-row"><div class="map-time">${c.time}</div><div><div class="map-title">${String(i + 1).padStart(2, "0")}. ${esc(c.title)}</div><span class="map-summary">${esc(c.subtitle)}</span></div><div class="map-skill">${esc(c.skill)}</div></div>`).join("")}</div>
  <h3>Ritmo por franja</h3><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Hora</th><th>Capítulo</th><th>Retos</th><th>Aprendizaje dramático</th></tr></thead><tbody>
  <tr><td><code>08:00</code></td><td>Llegada a la oficina</td><td>1–2</td><td>Corregir un identificador y comparar el contenido de String; Java básico con pistas.</td></tr>
  <tr><td><code>09:00</code></td><td>Primer incidente</td><td>3–4</td><td>Revertir sin reescribir historial; localizar y cancelar un bloqueo específico.</td></tr>
  <tr><td><code>11:00</code></td><td>Crisis inesperada</td><td>5–6</td><td>Depurar una NullPointerException y proteger cambios locales con Git.</td></tr>
  <tr><td><code>13:00</code></td><td>Error en el portal</td><td>7–8</td><td>Filtrar colecciones con Streams y validar una respuesta REST/JSON.</td></tr>
  <tr><td><code>15:00</code></td><td>Emergencia en producción</td><td>9–10</td><td>Calcular intervalos Java Time con zona horaria; corregir el artefacto Maven.</td></tr>
  <tr><td><code>17:00</code></td><td>Última catástrofe</td><td>11–12</td><td>Caracterizar legado y diseñar idempotencia segura frente a concurrencia y reintentos.</td></tr>
  <tr><td><code>18:00</code></td><td>Cierre</td><td>Final</td><td>Conocer el impacto de las decisiones y salir con un epílogo coherente.</td></tr></tbody></table></div></section>`;
}

function renderStoryDossier() {
  return `<section class="dossier-section"><h2>Historia general</h2><div class="story-grid">
    <div class="story-card"><h3>Introducción</h3><p>Es lunes, 08:00. Llegas como desarrollador/a junior a un equipo Java con una demo importante a las 18:00. La primera compilación ya falla por una errata, el README recomienda un ejemplo de Java de 2019 y hay 14 mensajes en el canal de incidencias. No hay hackers ni conspiraciones: solo código, herramientas y decisiones que se acumularon desde el viernes.</p></div>
    <div class="story-card"><h3>Contexto</h3><p>El equipo mantiene un portal de facturas en Java. Un error de compilación y una comparación de String abren la jornada; después llegan un merge extraño, una transacción bloqueada, datos null, cambios de Git sin commit, un filtro defectuoso, una respuesta JSON incorrecta, una fecha mal calculada y un pipeline que no encuentra el JAR. Cada reto se resuelve leyendo código, logs y pruebas. No hay que escribir historias de usuario ni improvisar conversaciones con clientes.</p></div>
    <div class="story-card"><h3>Objetivo final</h3><p>Llegar a las 18:00 sin que producción se caiga, el proyecto pierda al cliente ni el equipo se quede sin su desarrollador junior. Las decisiones técnicas prudentes protegen los indicadores; los intentos incorrectos tienen un coste pequeño y acotado, y ninguna respuesta equivocada bloquea la partida. No hay un botón para apagar producción «a ver si vuelve».</p></div>
    <div class="story-card"><h3>Tono</h3><p>Humor observacional, no humillación. Los chistes salen de commits ambiguos, reuniones, deuda técnica, artefactos mal nombrados y el clásico «funciona en mi máquina». Las personas son colegas; los malos procesos, no villanos.</p></div>
  </div><h3>Personajes</h3><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Persona</th><th>Rol</th><th>Voz y función dramática</th></tr></thead><tbody>
  <tr><td>Tú</td><td>Desarrollador/a</td><td>Protagonista recién llegado/a; observa evidencia, resuelve incidentes y deja constancia de las decisiones.</td></tr>
  <tr><td>Rafa</td><td>Operaciones</td><td>Conoce el runbook y el PID bloqueante, pero no quién abrió esa transacción el viernes.</td></tr>
  <tr><td>Lola</td><td>QA</td><td>Deja fallos reproducibles y ejemplos de datos para que el bug no se arregle a base de intuición.</td></tr>
  <tr><td>Ana</td><td>Desarrolladora</td><td>Dejó cambios locales sin commit; su trabajo se protege y se revisa antes de integrarlo.</td></tr>
  <tr><td>Javier</td><td>Excompañero</td><td>Su documentación de 2019 y sus TODO son una presencia narrativa; no es posible consultarle.</td></tr>
  </tbody></table></div><div class="note-box"><strong>Regla de verosimilitud:</strong> cada incidente se entiende con las pruebas visibles. Las soluciones recompensan leer el error, reproducirlo, hacer cambios pequeños y preservar datos; las pistas no introducen sorpresas ni exigen conocer herramientas internas de una compañía concreta.</div></section>`;
}

function renderFlowDossier() {
  return `<section class="dossier-section"><h2>Flujo de navegación y pantallas</h2><p>Experiencia individual, de escritorio adaptable a móvil. El progreso se guarda localmente; se puede volver a un reto resuelto para releer su resolución, sin volver a premiar ni penalizar esa respuesta.</p>
    <div class="flow-line"><span class="flow-node">Portada / fichar</span><span class="flow-arrow">→</span><span class="flow-node">Jornada · investigación activa</span><span class="flow-arrow">→</span><span class="flow-node">respuesta / pista / resolución</span><span class="flow-arrow">→</span><span class="flow-node">consecuencia y reto siguiente</span><span class="flow-arrow">→</span><span class="flow-node">18:00 · epílogo</span></div>
    <div class="screens-grid">
      <div class="screen-card"><h3>1. Portada</h3><p>Presenta la premisa, los límites de la ficción y el botón «Fichar y abrir el correo». Sin introducción larga antes de empezar.</p></div>
      <div class="screen-card"><h3>2. Escritorio / jornada</h3><p>Reto actual, reloj dramático, evidencias inspeccionables, respuesta libre, pistas escalonadas, resolución, mapa lateral, personajes y tres indicadores de consecuencia.</p></div>
      <div class="screen-card"><h3>3. Respuesta y consecuencia</h3><p>Validación inmediata en contexto. Respuesta incorrecta orienta sin revelar la solución; una respuesta correcta narra la consecuencia y libera el siguiente caso.</p></div>
      <div class="screen-card"><h3>4. Dossier del juego</h3><p>Mapa, historia, personajes, flujo, arquitectura, datos, pantallas y expansiones; navegable sin perder la investigación actual.</p></div>
      <div class="screen-card"><h3>5. Epílogo · 18:00</h3><p>Final textual según el estado de producción, cliente y empleo; resume los marcadores y permite reiniciar la jornada.</p></div>
      <div class="screen-card"><h3>Estados transversales</h3><p>Guardado/restauración, indicador de progreso, estados bloqueado/en curso/resuelto, errores de guardado comprensibles, accesibilidad por teclado y avisos de resultado.</p></div>
    </div>
    <h3>Navegación de la historia</h3>    <div class="flow-line"><span class="flow-node">08:00 · Java básico</span><span class="flow-arrow">→</span><span class="flow-node">09:00 · merge + SQL</span><span class="flow-arrow">→</span><span class="flow-node">11:00 · null + Git</span><span class="flow-arrow">→</span><span class="flow-node">13:00 · Streams + REST/JSON</span><span class="flow-arrow">→</span><span class="flow-node">15:00 · Java Time + Maven</span><span class="flow-arrow">→</span><span class="flow-node">17:00 · tests + webhook</span><span class="flow-arrow">→</span><span class="flow-node">18:00</span></div>
    <div class="note-box">Cada investigación nueva se desbloquea al resolver la anterior. Las investigaciones anteriores son revisables; las futuras se ven en el mapa pero no se pueden abrir. No existe un camino alternativo oculto que invalide progreso ni un contador de tiempo real que penalice al jugador por ir despacio.</div></section>`;
}

function renderArchitectureDossier() {
  return `<section class="dossier-section"><h2>Arquitectura web recomendada</h2><p>La entrega actual es una app estática sin build ni servicios externos: HTML accesible, CSS adaptable y JavaScript modular en un solo archivo de juego. Se abre con <code>index.html</code> y guarda el estado en <code>localStorage</code>. Es una decisión deliberada para validar premisa, retos y ritmo antes de añadir infraestructura.</p>
    <div class="architecture-grid">
      <div class="architecture-card"><h3>Presentación</h3><p>Ahora: HTML semántico y renderizado cliente. Para crecer: <code>React + TypeScript + Vite</code>, componentes de pantalla, barra de progreso y controles accesibles.</p><div class="pill-row"><span>Responsive</span><span>Teclado</span><span>aria-live</span></div></div>
      <div class="architecture-card"><h3>Dominio de juego</h3><p>Retos como datos: horario, evidencia, consigna, validador, pistas, solución y efectos. Estado explícito para capítulo, desbloqueos, intentos e indicadores; progreso separado de la interfaz.</p><div class="pill-row"><span>TypeScript</span><span>JSON versionado</span><span>validación por reto</span></div></div>
      <div class="architecture-card"><h3>Persistencia MVP</h3><p>Progreso individual y privado del navegador en <code>localStorage</code>, con clave versionada y migración al cambiar el esquema. Mensaje de error visible si no se puede guardar.</p><div class="pill-row"><span>Sin cuenta</span><span>Sin servidor</span><span>Sin telemetría</span></div></div>
      <div class="architecture-card"><h3>API futura</h3><p>Si se añade juego remoto: <code>Node.js + Fastify</code>, endpoints para sesión, progreso y catálogo; validación de DTO, versionado y autorización por jugador.</p><div class="pill-row"><span>REST</span><span>OpenAPI</span><span>rate limits</span></div></div>
      <div class="architecture-card"><h3>Datos futuros</h3><p><code>PostgreSQL</code> para sesiones, intentos y publicación de contenido. No guardar contraseñas de la ficción ni datos personales reales; la primera versión no necesita base de datos.</p><div class="pill-row"><span>PostgreSQL</span><span>migraciones</span><span>retención mínima</span></div></div>
      <div class="architecture-card"><h3>Pruebas y entrega</h3><p>Pruebas unitarias para reglas y desbloqueos; integración para guardar/restaurar; E2E para completar la jornada; CI con lint, tests, build y artefacto <code>dist/</code>.</p><div class="pill-row"><span>Vitest</span><span>Playwright</span><span>CI/CD</span></div></div>
    </div>
    <h3>Modelo de datos del juego</h3><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Entidad</th><th>Campos representativos</th><th>Propósito</th></tr></thead><tbody>
    <tr><td><code>GameDefinition</code></td><td>id, version, title, windows[], challengeIds[]</td><td>Manifiesto y versión del juego.</td></tr>
    <tr><td><code>TimeWindow</code></td><td>id, startTime, title, order</td><td>Capítulo horario; no mide tiempo real.</td></tr>
    <tr><td><code>Challenge</code></td><td>id, windowId, order, title, situation, evidence[], prompt, validator, hints[], solution, effects</td><td>Contenido jugable declarativo; evidencia y respuesta de referencia.</td></tr>
    <tr><td><code>GameSession</code></td><td>id, definitionVersion, currentChallengeId, status, stats, updatedAt</td><td>Estado/progreso de una partida.</td></tr>
    <tr><td><code>ChallengeAttempt</code></td><td>challengeId, submittedAt, result, hintLevel, feedbackCode</td><td>Historial local opcional; en la versión estática solo se necesitan intentos y pistas agregados.</td></tr>
    <tr><td><code>OutcomeStat</code></td><td>productionHealth, clientTrust, jobSafety (0..100)</td><td>Consecuencias narrativas, con límites y regla de final documentados.</td></tr>
    </tbody></table></div>
    <h3>Validación y seguridad</h3><ul><li>La comprobación de respuestas es orientativa para aprendizaje; las soluciones se muestran abiertamente cuando se solicitan.</li><li>No se ejecuta Java, SQL, comandos Git ni peticiones introducidas por el jugador; solo se comparan respuestas con criterios del reto.</li><li>La versión actual no recoge información personal y no transmite el progreso. En una futura tabla de clasificación se requeriría consentimiento, minimización y reglas claras de retención.</li><li>Los nombres, IDs, logs y ejemplos de facturas son ficticios y no contienen datos reales.</li></ul>
    <div class="note-box"><strong>Recomendación de producto:</strong> validar primero en una web estática y una sesión de juego moderada. Pasar a React/API/DB cuando haga falta autoría de retos, analítica consentida o persistencia entre dispositivos; no antes.</div></section>`;
}

function renderExpansionDossier() {
  return `<section class="dossier-section"><h2>Finales, escalado y futuras expansiones</h2><div class="ending-grid">
    <div class="ending-card"><h3>Final A · El lunes digno</h3><p>Producción, cliente y empleo ≥ 65. La demo ocurre; el runbook mejora y la retro tiene acciones con responsable.</p></div>
    <div class="ending-card"><h3>Final B · Anécdotas de retro</h3><p>Los tres indicadores sobreviven pero alguno no llega a 65. Se cierra la jornada y las consecuencias se convierten en trabajo priorizado, no en un game over.</p></div>
    <div class="ending-card"><h3>Final C · Postmortem honesto</h3><p>Algún indicador &lt; 35. La partida termina con impacto visible y un postmortem centrado en procesos, sin culpar al jugador ni convertir a un colega en villano.</p></div>
  </div>
  <h3>Cómo escala la dificultad</h3><ul><li><strong>08:00 — Java básico:</strong> corregir un identificador y comparar String correctamente, con el error del compilador a la vista.</li><li><strong>09:00 — herramientas de equipo:</strong> revertir un merge compartido y desbloquear una transacción SQL concreta.</li><li><strong>11:00 — debugging:</strong> prevenir una NullPointerException y proteger cambios locales con Git.</li><li><strong>13:00 — código e integración:</strong> filtrar una colección con Streams y validar una respuesta REST/JSON.</li><li><strong>15:00 — producción:</strong> calcular límites con Java Time y corregir el artefacto de una build Maven.</li><li><strong>17:00 — síntesis:</strong> hacer determinista un test con Clock y diseñar idempotencia ante concurrencia/reintentos.</li></ul>
  <h3>Expansión Agile · «El sprint que cabe en tres días»</h3><p>Añadir un arco jugable con planning: capacidad real frente a puntos mágicos, refinar una historia sin criterios, detectar dependencias en un tablero, revisar un incremento que no está desplegable y conducir una retrospectiva sin convertirla en una lista de culpables. Mecánica opcional: arrastrar tareas a un sprint limitado y negociar alcance con PO; el éxito premia slicing vertical, WIP razonable y definición de terminado.</p>
  <h3>Expansión Engagement Manager · «La reunión de alineamiento»</h3><p>Capítulo de coordinación de cuenta: mapa de stakeholders, riesgos y decisiones, expectativas contractuales, propuesta de cambio con impacto/estimación, comunicación de incidentes al cliente y preparación de comité ejecutivo. Mecánica opcional: redactar un update corto con estado confirmado, impacto, mitigación, próximo hito y dueño; gestionar confianza mediante claridad, no promesas inventadas.</p>
  <h3>Otras temporadas</h3><div class="pill-row"><span>Viernes de release</span><span>El onboarding que no existe</span><span>La migración eterna</span><span>Incidente de caché</span><span>Code review con 96 comentarios</span><span>Retro de fin de trimestre</span><span>La demo del lunes</span></div>
  <div class="note-box">Para una expansión, reaprovechar el mismo modelo de reto/ventana/efecto y sumar interacciones apropiadas (tablero arrastrable o editor de update) solo si aportan decisión real; no envolver cada reto en un formulario decorativo.</div></section>`;
}

function restartGame() {
  state = structuredClone(DEFAULT_STATE);
  saveState();
  activeView = "game";
  render();
  showToast("Jornada reiniciada. El teclado sigue teniendo secretos.");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) {
    activeView = nav.dataset.view;
    render();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action } = button.dataset;
  if (action === "start") {
    state.started = true;
    saveState();
    render();
  } else if (action === "hint") {
    const challenge = CHALLENGES.find((item) => item.id === button.dataset.id);
    const shown = state.hints[challenge.id] || 0;
    if (shown >= challenge.hints.length) return;
    state.hints[challenge.id] = shown + 1;
    saveState();
    render();
  } else if (action === "solution") {
    document.getElementById(`solution-${button.dataset.id}`)?.classList.toggle("show");
  } else if (action === "jump") {
    const index = Number(button.dataset.index);
    if (index <= activeChallengeIndex()) renderChallenge(index);
  } else if (action === "restart") {
    restartGame();
  } else if (action === "dossier-tab") {
    dossierTab = button.dataset.tab;
    renderDossier();
  }
});

function renderChallenge(index) {
  if (index === activeChallengeIndex()) {
    render();
    return;
  }
  const challenge = CHALLENGES[index];
  const done = state.solved.includes(challenge.id);
  const windowInfo = WINDOWS.find((item) => index >= item.start && index <= item.end);
  const hintCount = state.hints[challenge.id] || 0;
  const root = document.getElementById("game-view");
  root.innerHTML = `<div class="dashboard-head"><div><div class="eyebrow">Archivo de la jornada · ${esc(challenge.time)}</div><h1>Sobrevive al lunes.</h1><p>Estás revisando una investigación ya resuelta.</p></div><div class="day-clock"><span>HORA DEL INCIDENTE</span><strong>${challenge.time}</strong></div></div>
    <div class="workspace-grid"><article class="challenge-card"><div class="challenge-top"><span class="challenge-count">INVESTIGACIÓN <strong>${String(index + 1).padStart(2, "0")}</strong> / 12</span><span class="challenge-stage"><span>${windowInfo.time}</span> ${esc(windowInfo.title)}</span></div><div class="challenge-body">
    <div class="eyebrow">${esc(challenge.skill)}</div><h2>${esc(challenge.title)}</h2><p class="challenge-subtitle">${esc(challenge.subtitle)}</p><div class="situation-box"><span class="situation-label">El problema</span>${esc(challenge.situation)}</div><div class="section-label">EVIDENCIA EN TU ESCRITORIO</div><div class="evidence-grid">${challenge.evidence.map(([title, body]) => `<div class="evidence-card"><div class="evidence-title">${esc(title)}</div><p>${esc(body)}</p></div>`).join("")}</div>
    <div class="resolved-banner">✓ Investigación resuelta. Revisar el archivo no altera tus indicadores.</div>
    <div class="solution-box show"><p><strong>Resolución de referencia</strong></p><p>${esc(challenge.solution)}</p></div>
    <button class="button-primary" type="button" data-action="jump" data-index="${activeChallengeIndex()}">Volver al incidente actual →</button>
    </div></article><aside class="side-column">${renderTimeline(activeChallengeIndex())}${renderCharacters()}</aside></div>`;
}

document.addEventListener("submit", (event) => {
  const form = event.target.closest('form[data-action="answer"]');
  if (!form) return;
  event.preventDefault();
  handleAnswer(form);
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "answer-input") return;
  const current = CHALLENGES[activeChallengeIndex()];
  state.drafts[current.id] = event.target.value;
  saveState();
});

render();
