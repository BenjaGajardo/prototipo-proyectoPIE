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
            // Login exitoso
            mostrarExito();
            guardarSesion(usuario);
            
            // Redireccionar después de una breve animación
            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);
        } else {
            mostrarError("Usuario o contraseña incorrectos");
            limpiarCampos();
        }

        return false;
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

    // Mostrar mensaje de éxito
    function mostrarExito() {
        errorMsg.textContent = "✓ Login exitoso! Redirigiendo...";
        errorMsg.style.color = "#4CAF50";
        errorMsg.style.opacity = "1";
        submitBtn.style.pointerEvents = "none";
        submitBtn.style.opacity = "0.6";
    }

    // Limpiar campos del formulario
    function limpiarCampos() {
        passwordInput.value = "";
        passwordInput.focus();
    }

    // Guardar sesión en localStorage
    function guardarSesion(usuario) {
        const sesion = {
            usuario: usuario,
            timestamp: new Date().getTime()
        };
        localStorage.setItem("sesion", JSON.stringify(sesion));
    }

    // Verificar si ya hay una sesión activa
    function verificarSesion() {
        const sesion = localStorage.getItem("sesion");
        if (sesion) {
            const datos = JSON.parse(sesion);
            // Verificar si la sesión tiene menos de 24 horas
            const tiempoTranscurrido = new Date().getTime() - datos.timestamp;
            if (tiempoTranscurrido < 24 * 60 * 60 * 1000) {
                window.location.href = "index.html";
            } else {
                localStorage.removeItem("sesion");
            }
        }
    }

    // Event listeners
    submitBtn.addEventListener("click", function(e) {
        e.preventDefault();
        login(e);
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        login(e);
    });

    // Permitir login con Enter
    passwordInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            login(e);
        }
    });

    usuarioInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // Limpiar error al escribir
    usuarioInput.addEventListener("input", function() {
        if (errorMsg.textContent) {
            errorMsg.style.opacity = "0";
        }
    });

    passwordInput.addEventListener("input", function() {
        if (errorMsg.textContent) {
            errorMsg.style.opacity = "0";
        }
    });

    // Verificar sesión al cargar la página
    verificarSesion();