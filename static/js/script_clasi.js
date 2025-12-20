import { collection, getDocs, doc, getDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("contenedor-estudiantes");

async function cargarEstudiantes() {
  contenedor.innerHTML = "";

  const querySnapshot = await getDocs(collection(window.db, "estudiantes"));

  querySnapshot.forEach(docSnap => {
    const e = docSnap.data();

    contenedor.innerHTML += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6>${e.nombre}</h6>
            <small>${e.curso}</small>

            <button class="btn btn-primary btn-sm mt-2"
              onclick="verInformacion('${docSnap.id}')">
              Ver información
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

async function verInformacion(id) {
  const ref = doc(window.db, "estudiantes", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const e = snap.data();
    document.getElementById("tabla-estudiante").innerHTML = `
      <tr><th>Nombre</th><td>${e.nombre}</td></tr>
      <tr><th>Curso</th><td>${e.curso}</td></tr>
      <tr><th>Promedio</th><td>${e.promedio}</td></tr>
      <tr><th>Lenguaje</th><td>${e.lenguaje}</td></tr>
      <tr><th>PIE</th><td>${e.pie ? "Sí" : "No"}</td></tr>
      <tr><th>Teléfono PIE</th><td>${e.telefono_pie}</td></tr>
    `;
  }
}

window.cargarEstudiantes = cargarEstudiantes;
window.verInformacion = verInformacion;

// 👇 ESTO CARGA AUTOMÁTICAMENTE
cargarEstudiantes();
