// Configuración
const WEBHOOK_URL = 'https://maxitodiaz.app.n8n.cloud/webhook/753f87b7-7798-47e5-94d0-1b052abb235c/chat';

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
        
        // DEBUG: Ver estructura completa de la respuesta
        console.log('📦 Respuesta completa del servidor:', data);
        console.log('📦 Tipo de respuesta:', typeof data);
        
        // Ocultar indicador
        showTypingIndicator(false);

        // Extraer respuesta con mejor manejo
        let botResponse = extractBotResponse(data);

        // Verificar que no sea null o vacío
        if (!botResponse || botResponse === 'null' || botResponse.trim() === '') {
            console.error('❌ Respuesta vacía o null. Data completa:', data);
            botResponse = '❌ No pude generar una respuesta. La estructura de datos recibida no contiene una respuesta válida.\n\nPor favor, verifica la configuración del nodo "Respond to Webhook" en n8n.';
        }

        addMessage(botResponse, 'bot');

    } catch (error) {
        console.error('❌ Error completo:', error);
        showTypingIndicator(false);

        let errorMessage = '❌ Lo siento, hubo un problema. ';

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'No puedo conectarme al servidor. Por favor verifica tu conexión o contacta al administrador.';
        } else if (error.message.includes('404')) {
            errorMessage += 'El servicio no está disponible (Error 404). Verifica la URL del webhook.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Error en el servidor (Error 500). Revisa el workflow en n8n.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }

        addMessage(errorMessage, 'bot');
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

// Función mejorada para extraer la respuesta del bot
function extractBotResponse(data) {
    console.log('🔍 Intentando extraer respuesta de:', data);
    
    // Si la respuesta es directamente un string
    if (typeof data === 'string' && data.trim() !== '') {
        console.log('✅ Respuesta tipo string directa');
        return data;
    }
    
    // Si no es un objeto, convertir a string
    if (typeof data !== 'object' || data === null) {
        console.log('⚠️ Respuesta no es objeto, convirtiendo a string');
        return String(data);
    }
    
    // Lista ordenada de posibles campos de respuesta
    const possibleFields = [
        'output',           // Formato típico de n8n AI Agent
        'text',            // Formato texto simple
        'message',         // Formato mensaje
        'response',        // Formato respuesta
        'data',            // Formato data wrapper
        'result',          // Formato resultado
        'answer',          // Formato answer
        'reply',           // Formato reply
    ];
    
    // Intentar campos directos
    for (const field of possibleFields) {
        if (data[field] && data[field] !== null && data[field] !== 'null') {
            console.log(`✅ Respuesta encontrada en campo: ${field}`);
            return String(data[field]);
        }
    }
    
    // Intentar estructura anidada content.parts
    if (data.content?.parts) {
        if (Array.isArray(data.content.parts) && data.content.parts.length > 0) {
            const firstPart = data.content.parts[0];
            if (firstPart?.text) {
                console.log('✅ Respuesta encontrada en content.parts[0].text');
                return String(firstPart.text);
            }
        }
        if (data.content.parts.text) {
            console.log('✅ Respuesta encontrada en content.parts.text');
            return String(data.content.parts.text);
        }
    }
    
    // Si hay un array de items, intentar extraer el primer texto
    if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Respuesta es un array, usando primer elemento');
        return extractBotResponse(data[0]);
    }
    
    // Último recurso: buscar cualquier campo que contenga texto largo
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.length > 10 && value !== 'null') {
            console.log(`⚠️ Usando campo genérico: ${key}`);
            return value;
        }
    }
    
    // Si todo falla, mostrar estructura JSON para debugging
    console.error('❌ No se encontró respuesta válida en ningún campo conocido');
    return `Debug - Estructura recibida:\n${JSON.stringify(data, null, 2)}`;
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
        // Si tienes DOMPurify, úsalo. Si no, usar textContent
        if (typeof DOMPurify !== 'undefined') {
            contentDiv.innerHTML = DOMPurify.sanitize(text);
        } else {
            // Convertir saltos de línea a <br> de forma segura
            const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            contentDiv.innerHTML = safeText.replace(/\n/g, '<br>');
        }
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

// Mensaje inicial
console.log('✅ Chat Widget InclusIA iniciado correctamente');
console.log('🔑 Session ID:', sessionId);
console.log('🌐 Webhook URL:', WEBHOOK_URL);    