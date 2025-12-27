import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



const contenedor = document.getElementById("contenedor-estudiantes");

function cargarEstudiantes() {
  const ref = collection(window.db, "estudiantes");

  onSnapshot(ref, (querySnapshot) => {
    contenedor.innerHTML = "";

    if (querySnapshot.empty) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">
            No hay estudiantes registrados
          </div>
        </div>
      `;
      return;
    }

    querySnapshot.forEach(docSnap => {
      const e = docSnap.data();

      const nombre = e.nombre ?? "Sin nombre";
      const curso = e.curso ?? "Sin curso";
      const promedio = e.promedio ?? "—";
      const pie = e.pie ? "Sí" : "No";
      const telefonoPIE = e.telefono_pie?.trim() || "—";

      contenedor.innerHTML += `
  <div class="col-12 col-md-6 col-lg-4">
    <div class="card shadow-sm">
      <div class="card-body">

        <h6 class="fw-bold mb-1">${nombre}</h6>
        <p class="mb-1 text-muted small">Curso: ${curso}</p>
        <p class="mb-1 small">Promedio: ${promedio}</p>

        <div class="mt-2">
          <span class="badge ${e.pie ? "bg-success" : "bg-secondary"}">
            PIE: ${pie}
          </span>
        </div>

        ${e.pie
          ? `<p class="mt-2 small text-muted">
                📞 PIE: ${telefonoPIE}
                </p>`
          : ""
        }

        <div class="d-flex justify-content-center mt-3">
<button class="btn btn-primary btn-sm btn-ver-info"
  data-id="${docSnap.id}">
  Ver información
</button>
        </div>

      </div>
    </div>
  </div>
`;

    });
  });
}

window.cargarEstudiantes = cargarEstudiantes;
// 👇 ESTO CARGA AUTOMÁTICAMENTE
cargarEstudiantes();

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-ver-info")) {
    const id = e.target.dataset.id;
    abrirModal(id);
  }
});


async function guardarCambios(id) {

  const ref = doc(window.db, "estudiantes", id);

  await updateDoc(ref, {
    diagnostico_principal: document.getElementById(`diagnostico-${id}`).value.trim(),
    nee: document.getElementById(`nee-${id}`).value
      .split(",")
      .map(n => n.trim())
      .filter(n => n !== ""),
    observaciones: document.getElementById(`observaciones-${id}`).value.trim(),
    fortalezas: document.getElementById(`fortalezas-${id}`).value.trim(),
    observaciones_socioemocionales: document.getElementById(`socio-${id}`).value.trim(),
    recomendaciones: document.getElementById(`recomendaciones-${id}`).value.trim(),
    seguimiento_pie: document.getElementById(`seguimiento-${id}`).value.trim()
  });

  alert("✅ Información PIE actualizada");
}

window.guardarCambios = guardarCambios;



async function eliminarEstudiante(id, nombre) {
  const confirmar = confirm(
    `⚠️ ¿Seguro que deseas eliminar al estudiante:\n\n${nombre}?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmar) return;

  try {
    await deleteDoc(doc(window.db, "estudiantes", id));
    alert("✅ Estudiante eliminado correctamente");
  } catch (error) {
    console.error(error);
    alert("❌ Error al eliminar estudiante");
  }
}

window.eliminarEstudiante = eliminarEstudiante;


function toggleAgregar() {
  const form = document.getElementById("form-agregar");
  const boton = document.getElementById("btn-expandir");

  if (form.classList.contains("d-none")) {
    form.classList.remove("d-none");
    boton.innerHTML = "🔼 Contraer";
  } else {
    form.classList.add("d-none");
    boton.innerHTML = "🔽 Expandir";
  }
}

window.toggleAgregar = toggleAgregar;



async function abrirModal(id) {
  console.log("ABRIENDO MODAL", id);
  const modalEl = document.getElementById("modalEstudiante");
  console.log("MODAL EXISTE?", modalEl);
  console.log("BOOTSTRAP?", typeof bootstrap);

  const ref = doc(window.db, "estudiantes", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const e = snap.data();

  document.getElementById("modalNombre").innerText = e.nombre ?? "Estudiante";

  // TAB INFO
  document.getElementById("tab-info").innerHTML = `
    <p><strong>Diagnóstico:</strong><br>${e.diagnostico_principal ?? "—"}</p>
    <p><strong>NEE:</strong><br>${(e.nee ?? []).join(", ") || "—"}</p>
    <p><strong>Observaciones:</strong></p>
    <p style="white-space:pre-line">${e.observaciones ?? "—"}</p>
  `;

  // TAB EDITAR
  document.getElementById("tab-editar").innerHTML = `
    <label class="form-label">Diagnóstico</label>
    <input class="form-control mb-2" id="edit-diagnostico" value="${e.diagnostico_principal ?? ""}">

    <label class="form-label">NEE</label>
    <input class="form-control mb-2" id="edit-nee" value="${(e.nee ?? []).join(", ")}">

    <label class="form-label">Observaciones</label>
    <textarea class="form-control mb-2" id="edit-observaciones">${e.observaciones ?? ""}</textarea>

    <button class="btn btn-success btn-sm" onclick="guardarDesdeModal('${id}')">
      💾 Guardar cambios
    </button>
  `;

  // TAB ELIMINAR
  document.getElementById("tab-eliminar").innerHTML = `
    <div class="alert alert-danger">
      Esta acción no se puede deshacer.
    </div>

    <button class="btn btn-danger"
      onclick="eliminarDesdeModal('${id}', '${e.nombre ?? "Estudiante"}')">
      🗑️ Eliminar estudiante
    </button>
  `;

  new bootstrap.Modal(document.getElementById("modalEstudiante")).show();
}



async function guardarDesdeModal(id) {

  await updateDoc(doc(window.db, "estudiantes", id), {
    diagnostico_principal: document.getElementById("edit-diagnostico").value.trim(),
    nee: document.getElementById("edit-nee").value
      .split(",")
      .map(n => n.trim())
      .filter(n => n !== ""),
    observaciones: document.getElementById("edit-observaciones").value.trim()
  });

  alert("✅ Información actualizada");
}

window.guardarDesdeModal = guardarDesdeModal;


async function eliminarDesdeModal(id, nombre) {

  const ok = confirm(`¿Eliminar definitivamente a ${nombre}?`);
  if (!ok) return;

  await deleteDoc(doc(window.db, "estudiantes", id));

  alert("✅ Estudiante eliminado");

  bootstrap.Modal.getInstance(
    document.getElementById("modalEstudiante")
  ).hide();
}

window.eliminarDesdeModal = eliminarDesdeModal;
window.abrirModal = abrirModal;

