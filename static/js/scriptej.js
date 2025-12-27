import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyD1yw2AbKAQEnSLfwTIPV8ovvLrfUWOX-w",
      authDomain: "adaptia-cd403.firebaseapp.com",
      projectId: "adaptia-cd403",
      storageBucket: "adaptia-cd403.firebasestorage.app",
      messagingSenderId: "699771313712",
      appId: "1:699771313712:web:afb71f5a6c67b3561617f5",
      measurementId: "G-88XP0867G7"
    };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contenedor = document.getElementById("contenedor-estudiantes");


/* LISTAR ESTUDIANTES */
onSnapshot(collection(db, "estudiantes"), (snap) => {
  contenedor.innerHTML = "";

  snap.forEach(d => {
    const e = d.data();

    const nombre = e.nombre ?? "Sin nombre";
    const curso = e.curso ?? "Sin curso";
    const promedio = e.promedio ?? "—";
    const esPIE = e.pie === true;
    const telefonoPIE = e.telefono_pie?.trim() || "—";

    contenedor.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 shadow-sm h-100">

          <h6 class="fw-bold mb-1">${nombre}</h6>

          <p class="mb-1 text-muted small">
            📘 Curso: ${curso}
          </p>

          <p class="mb-1 small">
            📊 Promedio: ${promedio}
          </p>

          <span class="badge ${esPIE ? "bg-success" : "bg-secondary"} mb-2">
            PIE: ${esPIE ? "Sí" : "No"}
          </span>

          ${esPIE ? `
            <p class="small text-muted mb-2">
              📞 PIE: ${telefonoPIE}
            </p>
          ` : ""}

          <div class="mt-auto text-center">
            <button class="btn btn-primary btn-sm"
              onclick="abrirModal('${d.id}')">
              Ver información
            </button>
          </div>

        </div>
      </div>
    `;
  });
});

/* ABRIR MODAL */
async function abrirModal(id) {
  const ref = doc(db, "estudiantes", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const e = snap.data();

  document.getElementById("modalNombre").innerText = e.nombre ?? "Estudiante";

  /* INFO */
  document.getElementById("info").innerHTML = `
    <p><strong>Diagnóstico principal:</strong><br>${e.diagnostico_principal ?? "—"}</p>
    <p><strong>NEE:</strong><br>${(e.nee ?? []).join(", ")}</p>
    <p><strong>Observaciones:</strong><br>${e.observaciones ?? "—"}</p>
    <p><strong>Fortalezas:</strong><br>${e.fortalezas ?? "—"}</p>
    <p><strong>Obs. socioemocionales:</strong><br>${e.observaciones_socioemocionales ?? "—"}</p>
    <p><strong>Recomendaciones docente:</strong><br>${e.recomendaciones ?? "—"}</p>
    <p><strong>Seguimiento PIE:</strong><br>${e.seguimiento_pie ?? "—"}</p>
  `;

  /* EDITAR */
  document.getElementById("editar").innerHTML = `
    ${campo("Diagnóstico principal", "diagnostico", e.diagnostico_principal)}
    ${campo("NEE (separadas por coma)", "nee", (e.nee ?? []).join(", "))}
    ${textarea("Observaciones", "observaciones", e.observaciones)}
    ${textarea("Fortalezas", "fortalezas", e.fortalezas)}
    ${textarea("Obs. socioemocionales", "socioemocionales", e.observaciones_socioemocionales)}
    ${textarea("Recomendaciones docente", "recomendaciones", e.recomendaciones)}
    ${textarea("Seguimiento PIE", "seguimiento", e.seguimiento_pie)}

    <button class="btn btn-success mt-3"
      onclick="guardar('${id}')">
      Guardar cambios
    </button>
  `;

  /* ELIMINAR */
document.getElementById("eliminar").innerHTML = `
  <div class="text-center">
    <p class="fw-bold text-danger mb-3">
      Eliminar estudiante: ${e.nombre ?? "Estudiante"}
    </p>

    <button class="btn btn-danger px-4"
      onclick="eliminar('${id}')">
      🗑️ Eliminar
    </button>
  </div>
`;

  new bootstrap.Modal(
    document.getElementById("modalEstudiante")
  ).show();
}

window.abrirModal = abrirModal;

/* GUARDAR */
async function guardar(id) {
  await updateDoc(doc(db, "estudiantes", id), {
    diagnostico_principal: v("diagnostico"),
    nee: v("nee").split(",").map(n => n.trim()).filter(Boolean),
    observaciones: v("observaciones"),
    fortalezas: v("fortalezas"),
    observaciones_socioemocionales: v("socioemocionales"),
    recomendaciones: v("recomendaciones"),
    seguimiento_pie: v("seguimiento"),
  });

  alert("Datos actualizados correctamente");
}

window.guardar = guardar;

/* ELIMINAR */
async function eliminar(id) {
  if (!confirm("¿Eliminar este estudiante?")) return;
  await deleteDoc(doc(db, "estudiantes", id));
  alert("Estudiante eliminado");
}

window.eliminar = eliminar;

/* HELPERS */
function v(id) {
  return document.getElementById(id).value.trim();
}

function campo(label, id, value = "") {
  return `
    <div class="mb-2">
      <label class="form-label">${label}</label>
      <input class="form-control" id="${id}" value="${value ?? ""}">
    </div>
  `;
}

function textarea(label, id, value = "") {
  return `
    <div class="mb-2">
      <label class="form-label">${label}</label>
      <textarea class="form-control" id="${id}" rows="2">${value ?? ""}</textarea>
    </div>
  `;
}
