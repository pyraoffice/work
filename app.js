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
    nav.innerHTML = '<a href="panel.html">Mi panel</a><button type="button" class="enlace" data-salir>Salir</button>';
    nav.querySelector("[data-salir]").addEventListener("click", async () => {
      await db.auth.signOut();
      location.href = "index.html";
    });
  } else {
    nav.innerHTML = '<a href="ingresar.html">Ingresar</a><a class="boton boton-bronce" href="ingresar.html?modo=registro">Crear cuenta</a>';
  }
}

function mostrarMensaje(el, texto, tipo) {
  el.textContent = texto || "";
  el.dataset.tipo = tipo || "error";
  el.hidden = !texto;
}

function traducirError(error) {
  const m = (error && error.message || "").toLowerCase();
  if (m.includes("invalid login")) return "El mail o la contraseña no coinciden.";
  if (m.includes("already registered")) return "Ya existe una cuenta con ese mail. Ingresá con tu contraseña.";
  if (m.includes("not confirmed")) return "Todavía no confirmaste tu mail. Revisá tu bandeja de entrada y tocá el enlace de activación.";
  if (m.includes("at least")) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (m.includes("rate limit")) return "Se enviaron demasiados mails en poco tiempo. Probá de nuevo en una hora.";
  if (m.includes("not authorized")) return "Este mail todavía no puede recibir mensajes de Pyra (restricción del servidor de envío de prueba).";
  console.error("Error de Supabase:", error);
  return "No se pudo completar la operación. Detalle técnico: " + ((error && (error.message || error.code)) || "sin detalle");
}

document.addEventListener("DOMContentLoaded", pintarNav);
