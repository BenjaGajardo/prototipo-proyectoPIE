// Configuración
const WEBHOOK_URL = 'https://aleoftsushima.app.n8n.cloud/webhook/753f87b7-7798-47e5-94d0-1b052abb235c/chat';

// Generar ID de sesión único
let sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

// Toggle del chat
function toggleChat() {
    const container = document.getElementById('chat-container');
    container.classList.toggle('active');

    if (container.classList.contains('active')) {
        document.getElementById('chat-input').focus();
    }
}

// Manejar Enter
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Enviar mensaje
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Agregar mensaje del usuario
    addMessage(message, 'user');
    input.value = '';

    // Mostrar indicador de escritura
    showTypingIndicator(true);

    // Deshabilitar botón
    const sendBtn = document.getElementById('send-button');
    sendBtn.disabled = true;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatInput: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ocultar indicador
        showTypingIndicator(false);

        // Extraer respuesta - intentar múltiples estructuras
        let botResponse = '';

        // Intentar diferentes estructuras de respuesta
        if (data.output && data.output !== null) {
            botResponse = data.output;
        } else if (data.content && data.content.parts) {
            // Respuesta directa del modelo
            botResponse = data.content.parts[0]?.text || data.content.parts.text;
        } else if (data.text) {
            botResponse = data.text;
        } else if (data.message) {
            botResponse = data.message;
        } else if (data.response) {
            botResponse = data.response;
        } else if (typeof data === 'string') {
            botResponse = data;
        } else {
            // Si ninguna estructura coincide, mostrar error amigable
            console.error('Estructura de respuesta inesperada:', data);
            botResponse = 'Recibí tu mensaje pero hubo un problema al procesar la respuesta. Por favor, contacta al administrador.';
        }

        // Verificar que no sea null o vacío
        if (!botResponse || botResponse === 'null') {
            botResponse = '❌ No pude generar una respuesta. Por favor verifica la configuración del workflow en n8n.';
        }

        addMessage(botResponse, 'bot');

    } catch (error) {
        console.error('Error completo:', error);
        showTypingIndicator(false);

        let errorMessage = '❌ Lo siento, hubo un problema. ';

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'No puedo conectarme al servidor. Por favor verifica tu conexión o contacta al administrador.';
        } else if (error.message.includes('404')) {
            errorMessage += 'El servicio no está disponible. Por favor contacta al administrador.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Error en el servidor. Por favor intenta nuevamente.';
        } else {
            errorMessage += 'Por favor intenta de nuevo en unos momentos.';
        }

        addMessage(errorMessage, 'bot');
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

// Agregar mensaje al chat
function addMessage(text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convertir objetos a string
    if (typeof text === 'object') {
        text = JSON.stringify(text, null, 2);
    }

    // Renderizar de forma segura
    if (type === 'bot') {
        // Sanitizar HTML antes de renderizar (requiere DOMPurify)
        contentDiv.innerHTML = DOMPurify.sanitize(text);
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Scroll al final
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Mostrar/ocultar indicador de escritura
function showTypingIndicator(show) {
    const indicator = document.getElementById('typing-indicator');
    const messagesContainer = document.getElementById('chat-messages');

    if (show) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }

    // Scroll al final
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Mensaje inicial opcional
console.log('Chat Widget InclusIA iniciado correctamente');
console.log('Session ID:', sessionId);