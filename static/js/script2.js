<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>


function mostrarSeccion(nombre) {
    const secciones = ['general', 'planificacion', 'pie', 'intervencion', 'calificaciones', 'documentos', 'emocional'];
    secciones.forEach(s => {
        document.getElementById('seccion-' + s).classList.toggle('d-none', s !== nombre);
        document.getElementById('tab-' + s).classList.toggle('tab-active', s === nombre);
    });
}

function cargarEstudianteDemo() {
    document.getElementById('modalNombre').innerText = 'Ana González';
    document.getElementById('modalCurso').innerText = '1° Básico A · NEE · PIE';
    document.getElementById('modalRut').innerText = '22.222.222-2';
    document.getElementById('modalIniciales').innerText = 'AG';
    mostrarSeccion('general');
}
