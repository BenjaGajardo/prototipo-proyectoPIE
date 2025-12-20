import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("contenedor-estudiantes");

async function cargarEstudiantes() {
    contenedor.innerHTML = "";

    const querySnapshot = await getDocs(collection(window.db, "estudiantes"));

    querySnapshot.forEach(doc => {
        const e = doc.data();

        contenedor.innerHTML += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-3 bg-white">
          <div class="card-body">

            <h6 class="fw-semibold">${e.nombre}</h6>
            <small>${e.curso}</small>

            <div class="mt-3">
              <button class="btn btn-primary btn-sm"
                onclick="verInformacion('${doc.id}')">
                Ver información
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
    });
}

window.cargarEstudiantes = cargarEstudiantes;
cargarEstudiantes();



import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function verInformacion(id) {
  const ref = doc(window.db, "estudiantes", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const e = snap.data();
    const tabla = document.getElementById("tabla-estudiante");

    tabla.innerHTML = `
      <tr><th>Nombre</th><td>${e.nombre}</td></tr>
      <tr><th>Curso</th><td>${e.curso}</td></tr>
      <tr><th>Promedio</th><td>${e.promedio}</td></tr>
      <tr><th>Lenguaje</th><td>${e.lenguaje}</td></tr>
      <tr><th>PIE</th><td>${e.pie ? "Sí" : "No"}</td></tr>
      <tr><th>Contacto PIE</th><td>${e.telefono_pie}</td></tr>
    `;
  }
}

window.verInformacion = verInformacion;


