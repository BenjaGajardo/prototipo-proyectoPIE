import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc
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

        <div class="d-flex justify-content-center gap-2 mt-3">
          <button class="btn btn-primary btn-sm"
            onclick="verInformacion('${docSnap.id}', this)">
            Ver información
          </button>

          <button class="btn btn-warning btn-sm"
            onclick="editarEstudiante('${docSnap.id}', this)">
            ✏️ Editar
          </button>

          <button class="btn btn-danger btn-sm"
          style="background-color:#dc3545; color:white;"
            onclick="eliminarEstudiante('${docSnap.id}', '${nombre}')">
            Eliminar
          </button>
        </div>

        <div class="info-estudiante mt-3 d-none"></div>
        <div class="editar-estudiante mt-3 d-none"></div>

      </div>
    </div>
  </div>
`;

    });
  });
}


function verInformacion(id, boton) {

  const cardBody = boton.closest(".card-body");
  const contenedorInfo = cardBody.querySelector(".info-estudiante");

  if (!contenedorInfo.classList.contains("d-none")) {
    contenedorInfo.classList.add("d-none");
    contenedorInfo.innerHTML = "";
    return;
  }

  const ref = doc(window.db, "estudiantes", id);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const e = snap.data();

    contenedorInfo.innerHTML = `
      <div class="border rounded p-3 bg-light small">
        <p><strong>Nombre:</strong> ${e.nombre}</p>
        <p><strong>Curso:</strong> ${e.curso}</p>
        <p><strong>Promedio:</strong> ${e.promedio}</p>
        <p><strong>Lenguaje:</strong> ${e.lenguaje ?? "—"}</p>
        <p><strong>PIE:</strong> ${e.pie ? "Sí" : "No"}</p>
      </div>
    `;

    contenedorInfo.classList.remove("d-none");
  });
}


window.verInformacion = verInformacion;
window.cargarEstudiantes = cargarEstudiantes;
// 👇 ESTO CARGA AUTOMÁTICAMENTE
cargarEstudiantes();

function editarEstudiante(id, boton) {

  const cardBody = boton.closest(".card-body");
  const contenedorEditar = cardBody.querySelector(".editar-estudiante");

  // Toggle (abrir / cerrar)
  if (!contenedorEditar.classList.contains("d-none")) {
    contenedorEditar.classList.add("d-none");
    contenedorEditar.innerHTML = "";
    return;
  }

  const ref = doc(window.db, "estudiantes", id);

  onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const e = snap.data();

    contenedorEditar.innerHTML = `
      <div class="border rounded p-3 bg-light small">
        <div class="mb-2">
          <label class="form-label">Nombre</label>
          <input class="form-control form-control-sm"
            id="nombre-${id}" value="${e.nombre ?? ""}">
        </div>

        <div class="mb-2">
          <label class="form-label">Curso</label>
          <input class="form-control form-control-sm"
            id="curso-${id}" value="${e.curso ?? ""}">
        </div>

        <div class="mb-2">
          <label class="form-label">Promedio</label>
          <input type="number" step="0.1"
            class="form-control form-control-sm"
            id="promedio-${id}" value="${e.promedio ?? ""}">
        </div>

        <div class="mb-2">
          <label class="form-label small">Lenguaje</label>
          <input type="number"
            step="0.1"
            min="1"
            max="7"
            class="form-control form-control-sm"
            id="edit-lenguaje" value="${e.lenguaje ?? ""}">
        </div>

        <div class="form-check mb-2">
          <input class="form-check-input"
            type="checkbox"
            id="pie-${id}" ${e.pie ? "checked" : ""}>
          <label class="form-check-label">PIE</label>
        </div>

        <div class="mb-2">
          <label>Teléfono PIE</label>
          <input type="text"
            class="form-control form-control-sm"
            id="edit-telefono-${id}"
            value="${e.telefono_pie ?? ""}">
        </div>

        <button class="btn btn-success btn-sm"
          onclick="guardarCambios('${id}')">
          💾 Guardar cambios
        </button>
      </div>
    `;

    contenedorEditar.classList.remove("d-none");
  });
}

async function guardarCambios(id) {

  const ref = doc(window.db, "estudiantes", id);

  const nombre = document.getElementById(`nombre-${id}`).value.trim();
  const curso = document.getElementById(`curso-${id}`).value.trim();
  const promedioInput = document.getElementById(`promedio-${id}`).value;
  const pie = document.getElementById(`pie-${id}`).checked;
  const telefonoPIE = document.getElementById(`edit-telefono-${id}`).value.trim();
  const lenguaje = document.getElementById(`edit-lenguaje`).value;

  const promedio = promedioInput === "" ? null : Number(promedioInput);

  await updateDoc(ref, {
    nombre,
    curso,
    promedio,
    lenguaje: lenguaje ? Number(lenguaje) : null,
    pie,
    telefono_pie: telefonoPIE
  });

  alert("✅ Estudiante actualizado");
}

window.editarEstudiante = editarEstudiante;
window.guardarCambios = guardarCambios;



async function agregarEstudiante() {

  const nombre = document.getElementById("nombre").value.trim();
  const curso = document.getElementById("curso").value.trim();
  const promedio = document.getElementById("promedio").value;
  const pie = document.getElementById("pie").value === "true";
  const telefono = document.getElementById("telefono_pie").value.trim();
  const lenguaje = document.getElementById("lenguaje").value;

  // Validación mínima
  if (!nombre || !curso) {
    alert("Nombre y curso son obligatorios");
    return;
  }

  await addDoc(collection(window.db, "estudiantes"), {
    nombre: nombre,
    curso: curso,
    promedio: promedio ? Number(promedio) : null,
    pie: pie,
    telefono_pie: pie ? telefono || null : null,
    lenguaje: lenguaje ? Number(lenguaje) : null,
    creado: new Date()
  });

  // limpiar formulario
  document.getElementById("nombre").value = "";
  document.getElementById("curso").value = "";
  document.getElementById("promedio").value = "";
  document.getElementById("lenguaje").value = "";
  document.getElementById("pie").value = "false";
  document.getElementById("telefono_pie").value = "";
}

window.agregarEstudiante = agregarEstudiante;



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