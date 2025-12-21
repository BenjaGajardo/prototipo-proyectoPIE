// Configuración de usuarios válidos
const usuariosValidos = {
    "admin": "1234",
    "user": "pass123",
    "demo": "demo"
};

// Referencias a elementos
const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");
const loader = document.getElementById("loginLoader");

function login(event) {
    if (event) event.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    errorMsg.textContent = "";
    errorMsg.style.opacity = "0";

    if (!usuario || !password) {
        mostrarError("Por favor, completa todos los campos");
        return;
    }

    if (usuariosValidos[usuario] && usuariosValidos[usuario] === password) {

        // ✅ guardar sesión
        localStorage.setItem("sesion", JSON.stringify({
            usuario: usuario,
            timestamp: Date.now()
        }));

        mostrarLoader();

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } else {
        mostrarError("Usuario o contraseña incorrectos");
        limpiarCampos();
    }
}


// Función principal de login
function login(event) {
    if (event) event.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    // Limpiar mensaje de error previo
    errorMsg.textContent = "";
    errorMsg.style.opacity = "0";

    // Validar campos vacíos
    if (!usuario || !password) {
        mostrarError("Por favor, completa todos los campos");
        return false;
    }

    // Validar credenciales
    if (usuariosValidos[usuario] && usuariosValidos[usuario] === password) {
        // Login exitoso - Mostrar loader
        mostrarLoader();

        // Redireccionar después de 2 segundos (para ver la animación completa)
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    } else {
        mostrarError("Usuario o contraseña incorrectos");
        limpiarCampos();
    }

    return false;
}

// Mostrar loader
function mostrarLoader() {
    loader.classList.add('show');
    submitBtn.style.pointerEvents = "none";
    submitBtn.style.opacity = "0.6";
}

// Ocultar loader
function ocultarLoader() {
    loader.classList.remove('show');
    submitBtn.style.pointerEvents = "auto";
    submitBtn.style.opacity = "1";
}

// Mostrar mensaje de error con animación
function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.style.opacity = "1";
    errorMsg.style.color = "#ff6b6b";

    // Efecto de vibración
    usuarioInput.classList.add("shake");
    passwordInput.classList.add("shake");

    setTimeout(() => {
        usuarioInput.classList.remove("shake");
        passwordInput.classList.remove("shake");
    }, 500);
}

// Limpiar campos del formulario
function limpiarCampos() {
    passwordInput.value = "";
    passwordInput.focus();
}

// Event listeners
submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    login(e);
});

form.addEventListener("submit", function (e) {
    e.preventDefault();
    login(e);
});

// Permitir login con Enter
passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        login(e);
    }
});

usuarioInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        passwordInput.focus();
    }
});

// Limpiar error al escribir
usuarioInput.addEventListener("input", function () {
    if (errorMsg.textContent) {
        errorMsg.style.opacity = "0";
    }
});

passwordInput.addEventListener("input", function () {
    if (errorMsg.textContent) {
        errorMsg.style.opacity = "0";
    }
});

