// Conexión con Supabase y funciones compartidas por todas las páginas
const db = window.supabase.createClient(PYRA_CONFIG.supabaseUrl, PYRA_CONFIG.supabaseKey);

async function usuarioActual() {
  const { data } = await db.auth.getSession();
  return data.session ? data.session.user : null;
}

async function pintarNav() {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;
  const usuario = await usuarioActual();
  if (usuario) {
    nav.innerHTML = '<a href="buscar.html">Buscar espacios</a><a href="panel.html">Mi panel</a><button type="button" class="enlace" data-salir>Salir</button>';
    nav.querySelector("[data-salir]").addEventListener("click", async () => {
      await db.auth.signOut();
      location.href = "index.html";
    });
  } else {
    nav.innerHTML = '<a href="buscar.html">Buscar espacios</a><a href="ingresar.html">Ingresar</a><a class="boton boton-bronce" href="ingresar.html?modo=registro">Crear cuenta</a>';
  }
}

function mostrarMensaje(el, texto, tipo) {
  el.textContent = texto || "";
  el.dataset.tipo = tipo || "error";
  el.hidden = !texto;
}

function traducirError(error) {
  const original = (error && error.message) || "";
  if (original.startsWith("PYRA: ")) return original.slice(6);
  const m = original.toLowerCase();
  if (m.includes("invalid login")) return "El mail o la contraseña no coinciden.";
  if (m.includes("already registered")) return "Ya existe una cuenta con ese mail. Ingresá con tu contraseña.";
  if (m.includes("not confirmed")) return "Todavía no confirmaste tu mail. Revisá tu bandeja de entrada y tocá el enlace de activación.";
  if (m.includes("at least")) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (m.includes("rate limit")) return "Se enviaron demasiados mails en poco tiempo. Probá de nuevo en una hora.";
  if (m.includes("not authorized")) return "Este mail todavía no puede recibir mensajes de Pyra (restricción del servidor de envío de prueba).";
  console.error("Error de Supabase:", error);
  return "No se pudo completar la operación. Detalle técnico: " + ((error && (error.message || error.code)) || "sin detalle");
}

// Utilidades de formato
const ZONA = "America/Argentina/Salta";
function urlFoto(ruta) {
  return ruta ? db.storage.from("fotos-espacios").getPublicUrl(ruta).data.publicUrl : "";
}
function pesos(n) {
  return "$" + Math.round(Number(n)).toLocaleString("es-AR");
}
function fechaLarga(iso) {
  return new Date(iso).toLocaleDateString("es-AR", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });
}
function hora(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
}
function textoSeguro(t) {
  const s = document.createElement("span");
  s.textContent = t == null ? "" : String(t);
  return s.innerHTML;
}

function tarjetaEspacio(e) {
  const opiniones = e.cantidad_resenas > 0
    ? `, ${String(e.puntaje).replace(".", ",")} de 5 (${e.cantidad_resenas} ${e.cantidad_resenas == 1 ? "opinión" : "opiniones"})` : "";
  return `
    <a class="tarjeta" href="ver.html?id=${e.id}">
      ${e.portada ? `<img src="${urlFoto(e.portada)}" alt="" loading="lazy">` : '<div class="sin-foto">Sin foto</div>'}
      <div class="tarjeta-texto">
        <p class="tarjeta-tipo">${textoSeguro(e.tipo_nombre)}, ${e.capacidad == 1 ? "1 persona" : "hasta " + e.capacidad + " personas"}</p>
        <h2>${textoSeguro(e.titulo)}</h2>
        <p>${textoSeguro(e.ciudad)}${opiniones}</p>
        <p class="tarjeta-precio"><strong>${pesos(e.precio_hora)}</strong> por hora</p>
      </div>
    </a>`;
}

document.addEventListener("DOMContentLoaded", pintarNav);
