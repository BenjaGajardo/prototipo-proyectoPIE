import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let unsuscribeModal = null;
// ================================
// CACHE PARA CONSULTAS
// ================================
let estudiantesCache = [];




const contenedor = document.getElementById("contenedor-estudiantes");
let listaEstudiantes = [];
let listaNavbar = [];



function cargarEstudiantes() {
  const ref = collection(window.db, "estudiantes");

  onSnapshot(ref, (querySnapshot) => {
    estudiantesCache = []; // 👈 LIMPIAR CACHE
    contenedor.innerHTML = "";
    listaEstudiantes = []; // 🔥 reiniciamos la lista

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

      estudiantesCache.push({
        id: docSnap.id,
        ...docSnap.data()
      });

      listaEstudiantes.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // 👇 mostramos todos al inicio
    listaNavbar = [...listaEstudiantes];
    renderizarEstudiantes(listaEstudiantes);
  });
}


function renderizarEstudiantes(estudiantes) {
  contenedor.innerHTML = "";

  if (estudiantes.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          No se encontraron estudiantes
        </div>
      </div>
    `;
    return;
  }

  estudiantes.forEach(e => {
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

            ${e.pie ? `<p class="mt-2 small text-muted">📞 PIE: ${telefonoPIE}</p>` : ""}

            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-primary btn-sm btn-ver-info" data-id="${e.id}">
                Ver información
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
  });
}

const nivelesBasica = [
  "1° Básico", "2° Básico", "3° Básico", "4° Básico",
  "5° Básico", "6° Básico", "7° Básico", "8° Básico"
];

const nivelesMedia = [
  "1° Medio", "2° Medio", "3° Medio", "4° Medio"
];


const inputBuscador = document.getElementById("buscador-estudiantes");
const selectNivel = document.getElementById("filtro-nivel");
const selectLetra = document.getElementById("filtro-letra");

// 👇 oculto al inicio
selectLetra.style.display = "none";


function aplicarFiltrosPrincipales() {

  // 👇 SI AÚN NO HAY DATOS, mostrar todo
  if (listaEstudiantes.length === 0) {
    renderizarEstudiantes(listaEstudiantes);
    return;
  }

  const texto = inputBuscador.value.toLowerCase().trim();
  const nivel = selectNivel.value.toLowerCase();
  const letra = selectLetra.value.toLowerCase();

const filtrados = listaNavbar.filter(e => {

    const nombre = (e.nombre ?? "").toLowerCase();
    const curso = (e.curso ?? "").toLowerCase();

    // 🔍 filtro por nombre
    if (texto && !nombre.includes(texto)) return false;

    // 🎓 filtro por nivel (más flexible)
    if (nivel && !curso.includes(nivel)) return false;

    // 🔤 filtro por letra
    if (letra && !curso.endsWith(` ${letra}`)) return false;


    return true;
  });

  renderizarEstudiantes(filtrados);
}


inputBuscador.addEventListener("input", aplicarFiltrosPrincipales);
selectNivel.addEventListener("change", actualizarFiltroLetra);
selectLetra.addEventListener("change", aplicarFiltrosPrincipales);



function actualizarFiltroLetra() {
  const nivel = selectNivel.value;

  // limpiar letras
  selectLetra.innerHTML = "";

  // ❌ sin nivel → ocultar y deshabilitar
  if (!nivel) {
    selectLetra.style.display = "none";
    selectLetra.disabled = true;
    selectLetra.value = "";
    aplicarFiltrosPrincipales();
    return;
  }

  // ✅ con nivel → mostrar y habilitar
  selectLetra.style.display = "block";
  selectLetra.disabled = false;

  // opción "todas"
  const optionTodas = document.createElement("option");
  optionTodas.value = "";
  optionTodas.textContent = "Todas las letras";
  selectLetra.appendChild(optionTodas);

  // letras
  ["A", "B", "C", "D"].forEach(letra => {
    const option = document.createElement("option");
    option.value = letra;
    option.textContent = letra;
    selectLetra.appendChild(option);
  });

  aplicarFiltrosPrincipales();
}


function actualizarSelectNivel(tipo) {
  selectNivel.innerHTML = "";

  // opción por defecto
  const optionTodos = document.createElement("option");
  optionTodos.value = "";
  optionTodos.textContent = "Todos los niveles";
  selectNivel.appendChild(optionTodos);

  let niveles = [];

  if (tipo === "basica") niveles = nivelesBasica;
  if (tipo === "media") niveles = nivelesMedia;
  if (tipo === "todos") niveles = [...nivelesBasica, ...nivelesMedia];

  niveles.forEach(nivel => {
    const option = document.createElement("option");
    option.value = nivel;
    option.textContent = nivel;
    selectNivel.appendChild(option);
  });

  // resetear letra
  selectLetra.value = "";
  selectLetra.style.display = "none";
  selectLetra.disabled = true;
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


async function agregarEstudiante() {

  await addDoc(collection(window.db, "estudiantes"), {
    nombre: document.getElementById("nombre").value.trim(),
    curso: document.getElementById("curso").value.trim(),
    promedio: Number(document.getElementById("promedio").value),
    telefono_pie: document.getElementById("telefono-pie").value.trim(),

    diagnostico_principal: document.getElementById("diagnostico").value.trim(),
    nee: document.getElementById("nee").value
      .split(",")
      .map(n => n.trim())
      .filter(n => n !== ""),

    observaciones: document.getElementById("observaciones").value.trim(),
    fortalezas: document.getElementById("fortalezas").value.trim(),
    observaciones_socioemocionales: document.getElementById("socio").value.trim(),
    recomendaciones: document.getElementById("recomendaciones").value.trim(),
    seguimiento_pie: document.getElementById("seguimiento").value.trim(),

    pie: true,

    // ⏱ FECHAS
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  alert("✅ Estudiante agregado correctamente");

  limpiarFormularioAgregar();
  document.getElementById("form-agregar").classList.add("d-none");
  document.getElementById("btn-expandir").innerHTML = "🔽 Expandir";
}

window.agregarEstudiante = agregarEstudiante;
window.toggleAgregar = toggleAgregar;

function limpiarFormularioAgregar() {
  document.getElementById("nombre").value = "";
  document.getElementById("curso").value = "";
  document.getElementById("promedio").value = "";
  document.getElementById("telefono-pie").value = "";

  document.getElementById("diagnostico").value = "";
  document.getElementById("nee").value = "";

  document.getElementById("observaciones").value = "";
  document.getElementById("fortalezas").value = "";
  document.getElementById("socio").value = "";
  document.getElementById("recomendaciones").value = "";
  document.getElementById("seguimiento").value = "";
}


function formatearFecha(ts) {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("es-CL");
}

async function abrirModal(id) {

  const ref = doc(window.db, "estudiantes", id);

  // 🔥 cerrar listener anterior si existe
  if (unsuscribeModal) unsuscribeModal();

  unsuscribeModal = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const e = snap.data();

    document.getElementById("modalNombre").innerText =
      e.nombre ?? "Estudiante";

    // TAB INFO
    document.getElementById("tab-info").innerHTML = `
  <p><strong>Fecha de creación:</strong><br>
    ${formatearFecha(e.createdAt)}
  </p>

  <p><strong>Última edición:</strong><br>
    ${formatearFecha(e.updatedAt)}
  </p>


  <p><strong>Diagnóstico:</strong><br>${e.diagnostico_principal ?? "—"}</p>

  <p><strong>NEE:</strong><br>${(e.nee ?? []).join(", ") || "—"}</p>

  <p><strong>Observaciones pedagógicas:</strong></p>
  <p style="white-space:pre-line">${e.observaciones ?? "—"}</p>

  <hr>

  <p><strong>Fortalezas:</strong></p>
  <p style="white-space:pre-line">${e.fortalezas ?? "—"}</p>

  <p><strong>Aspectos socioemocionales:</strong></p>
  <p style="white-space:pre-line">${e.observaciones_socioemocionales ?? "—"}</p>

  <p><strong>Recomendaciones:</strong></p>
  <p style="white-space:pre-line">${e.recomendaciones ?? "—"}</p>

  <p><strong>Seguimiento PIE:</strong></p>
  <p style="white-space:pre-line">${e.seguimiento_pie ?? "—"}</p>
`;


    // TAB EDITAR
    document.getElementById("tab-editar").innerHTML = `
  <label class="form-label">Diagnóstico</label>
  <input class="form-control mb-2" id="edit-diagnostico" value="${e.diagnostico_principal ?? ""}">

  <label class="form-label">NEE</label>
  <input class="form-control mb-2" id="edit-nee" value="${(e.nee ?? []).join(", ")}">

  <label class="form-label">Observaciones</label>
  <textarea class="form-control mb-2" id="edit-observaciones">${e.observaciones ?? ""}</textarea>

  <label class="form-label">Fortalezas</label>
  <textarea class="form-control mb-2" id="edit-fortalezas">${e.fortalezas ?? ""}</textarea>

  <label class="form-label">Aspectos socioemocionales</label>
  <textarea class="form-control mb-2" id="edit-socio">${e.observaciones_socioemocionales ?? ""}</textarea>

  <label class="form-label">Recomendaciones</label>
  <textarea class="form-control mb-2" id="edit-recomendaciones">${e.recomendaciones ?? ""}</textarea>

  <label class="form-label">Seguimiento PIE</label>
  <textarea class="form-control mb-3" id="edit-seguimiento">${e.seguimiento_pie ?? ""}</textarea>

<button
  type="button"
  class="btn btn-success btn-sm"
  onclick="guardarDesdeModal('${id}')">
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
  });
  new bootstrap.Modal(
    document.getElementById("modalEstudiante")
  ).show();
}



async function guardarDesdeModal(id) {
  try {
    await updateDoc(doc(window.db, "estudiantes", id), {
      diagnostico_principal: document.getElementById("edit-diagnostico").value.trim(),
      nee: document.getElementById("edit-nee").value
        .split(",")
        .map(n => n.trim())
        .filter(n => n !== ""),
      observaciones: document.getElementById("edit-observaciones").value.trim(),
      fortalezas: document.getElementById("edit-fortalezas").value.trim(),
      observaciones_socioemocionales: document.getElementById("edit-socio").value.trim(),
      recomendaciones: document.getElementById("edit-recomendaciones").value.trim(),
      seguimiento_pie: document.getElementById("edit-seguimiento").value.trim(),

      // ⏱ FECHA DE EDICIÓN
      updatedAt: serverTimestamp()
    });

    alert("✅ Información PIE actualizada");
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("❌ No se pudo guardar la información");
  }
}


window.guardarDesdeModal = guardarDesdeModal;


async function eliminarDesdeModal(id, nombre) {

  const ok = confirm(`¿Eliminar definitivamente a ${nombre}?`);
  if (!ok) return;

  await deleteDoc(doc(window.db, "estudiantes", id));

  alert("✅ Estudiante eliminado");

  const modal = window.bootstrap.Modal.getInstance(
    document.getElementById("modalEstudiante")
  );

  if (modal) modal.hide();
}


window.eliminarDesdeModal = eliminarDesdeModal;
window.abrirModal = abrirModal;

document.getElementById("modalEstudiante")
  .addEventListener("hidden.bs.modal", () => {
    if (unsuscribeModal) {
      unsuscribeModal();
      unsuscribeModal = null;
    }
  });





// =======================================
// CONSULTAS DE INFORMACIÓN PIE
// =======================================
window.consultarInformacion = function () {

  const campo = document.getElementById("campo-info").value;
  const texto = document.getElementById("texto-info").value
    .trim()
    .toLowerCase();

  const contenedorTabla = document.getElementById("tabla-consulta-body");
  const cardResultado = document.getElementById("resultado-consulta");

  contenedorTabla.innerHTML = "";
  cardResultado.classList.add("d-none");
  document
    .getElementById("card-agregar-estudiante")
    .classList.remove("mt-4");

  if (!campo || texto === "") {
    alert("⚠️ Seleccione un campo y escriba un texto");
    return;
  }

  const resultados = estudiantesCache.filter(e => {

    const valor = e[campo];

    if (!valor) return false;

    // CAMPO ARRAY (NEE)
    if (Array.isArray(valor)) {
      return valor.join(" ").toLowerCase().includes(texto);
    }

    // CAMPO TEXTO
    return valor.toString().toLowerCase().includes(texto);
  });

  if (resultados.length === 0) {
    alert("❌ No se encontraron resultados");
    return;
  }

  resultados.forEach(e => {

    let info = e[campo];

    if (Array.isArray(info)) {
      info = info.join(", ");
    }

    contenedorTabla.innerHTML += `
      <tr>
        <td>${e.nombre ?? "—"}</td>
        <td>${e.curso ?? "—"}</td>
        <td>${campo.replace(/_/g, " ")}</td>
        <td style="white-space:pre-line">${info}</td>
      </tr>
    `;
  });

  cardResultado.classList.remove("d-none");
  document
    .getElementById("card-agregar-estudiante")
    .classList.add("mt-4");

  const btn = document.getElementById("btn-consulta-info");
  btn.innerHTML = "❌ Quitar información";
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-danger");
  btn.onclick = quitarConsulta;
};

// =======================================
// QUITAR RESULTADOS DE CONSULTA
// =======================================
window.quitarConsulta = function () {

  // ocultar tabla
  document
    .getElementById("resultado-consulta")
    .classList.add("d-none");

  // quitar separación
  document
    .getElementById("card-agregar-estudiante")
    .classList.remove("mt-4");

  // limpiar tabla
  document.getElementById("tabla-consulta-body").innerHTML = "";

  // volver botón a estado original
  const btn = document.getElementById("btn-consulta-info");
  btn.innerHTML = "🔍 Consultar información";
  btn.classList.remove("btn-danger");
  btn.classList.add("btn-primary");
  btn.onclick = consultarInformacion;
};


window.filtrarNavbar = function (tipo) {

  if (!listaEstudiantes.length) return;

  // 🔄 actualizar select de nivel
  actualizarSelectNivel(tipo);

  if (tipo === "todos") {
    listaNavbar = [...listaEstudiantes];
    aplicarFiltrosPrincipales();
    return;
  }

  listaNavbar = listaEstudiantes.filter(e => {
    const curso = (e.curso ?? "").toLowerCase();

    if (tipo === "basica") {
      return curso.includes("básico") || curso.includes("basico");
    }

    if (tipo === "media") {
      return curso.includes("medio");
    }

    return true;
  });

  aplicarFiltrosPrincipales();
};


