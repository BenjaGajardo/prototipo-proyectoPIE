import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyD1yw2AbKAQEnSLfwTIPV8ovvLrfUWOX-w",
    authDomain: "adaptia-cd403.firebaseapp.com",
    projectId: "adaptia-cd403",
    storageBucket: "adaptia-cd403.firebasestorage.app",
    messagingSenderId: "699771313712",
    appId: "1:699771313712:web:afb71f5a6c67b3561617f5",
    measurementId: "G-88XP0867G7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias a elementos del DOM
const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");
const loader = document.getElementById("loginLoader");

// Evitar volver al login con el botón atrás
window.history.pushState(null, "", window.location.href);
window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
};

// Verificar si ya hay sesión activa al cargar la página
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario ya autenticado, redirigir a inicio directamente
        console.log("Sesión activa detectada, redirigiendo...");
        window.location.href = "inicio.html";
    }
});

// Función principal de login con Firebase
async function login(event) {
    if (event) event.preventDefault();

    const email = usuarioInput.value.trim();
    const password = passwordInput.value;

    // Limpiar mensaje de error previo
    errorMsg.textContent = "";
    errorMsg.style.opacity = "0";

    // Validar campos vacíos
    if (!email || !password) {
        mostrarError("Por favor, completa todos los campos");
        return false;
    }

    // Mostrar loader
    mostrarLoader();

    try {
        // Intentar login con Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Esperar 2 segundos para ver la animación completa
        setTimeout(() => {
            window.location.href = "inicio.html";
        }, 2000);

    } catch (error) {
        // Manejar errores de Firebase
        ocultarLoader();

        let mensajeError = "Error al iniciar sesión";

        switch (error.code) {
            case 'auth/user-not-found':
                mensajeError = "Usuario no encontrado";
                break;
            case 'auth/wrong-password':
                mensajeError = "Contraseña incorrecta";
                break;
            case 'auth/invalid-email':
                mensajeError = "Email inválido";
                break;
            case 'auth/user-disabled':
                mensajeError = "Usuario deshabilitado";
                break;
            case 'auth/too-many-requests':
                mensajeError = "Demasiados intentos. Intenta más tarde";
                break;
            case 'auth/invalid-credential':
                mensajeError = "Usuario o contraseña incorrectos";
                break;
            default:
                mensajeError = "Error al iniciar sesión";
        }

        mostrarError(mensajeError);
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
submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    await login(e);
});

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    await login(e);
});

// Permitir login con Enter
passwordInput.addEventListener("keypress", async function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        await login(e);
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