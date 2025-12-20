const WEBHOOK_URL = 'https://madmaxamp.app.n8n.cloud/webhook/753f87b7-7798-47e5-94d0-1b052abb235c/chat';
    
    // Variable para mantener el sessionId
    let sessionId = 'user_' + Math.random().toString(36).substring(7);
    
    function toggleChat() {
        const container = document.getElementById('chat-container');
        container.classList.toggle('active');
        
        if (container.classList.contains('active')) {
            document.getElementById('chatInput').focus();
        }
    }
    
    async function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Agregar mensaje del usuario
        addMessage(message, 'user');
        input.value = '';
        
        // Mostrar indicador de escritura
        showTypingIndicator(true);
        
        // Deshabilitar botón
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = true;
        
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatInput: message,  // Gemini Chat espera este campo
                    sessionId: sessionId  // Para mantener contexto
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Ocultar indicador
            showTypingIndicator(false);
            
            // Extraer la respuesta según la estructura de n8n + Gemini
            let botResponse = '';
            
            if (data.output) {
                botResponse = data.output;
            } else if (data.text) {
                botResponse = data.text;
            } else if (data.message) {
                botResponse = data.message;
            } else if (data.response) {
                botResponse = data.response;
            } else if (typeof data === 'string') {
                botResponse = data;
            } else {
                botResponse = 'Recibí tu mensaje. ¿Cómo puedo ayudarte?';
            }
            
            addMessage(botResponse, 'bot');
            
        } catch (error) {
            console.error('Error completo:', error);
            showTypingIndicator(false);
            
            let errorMessage = 'Lo siento, hubo un problema. ';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += 'No puedo conectarme al servidor. Verifica que el workflow esté activo.';
            } else if (error.message.includes('404')) {
                errorMessage += 'El webhook no existe. Verifica la URL.';
            } else if (error.message.includes('500')) {
                errorMessage += 'Error en el servidor. Revisa la configuración del workflow.';
            } else {
                errorMessage += 'Por favor intenta de nuevo.';
            }
            
            addMessage(errorMessage, 'bot');
        } finally {
            sendBtn.disabled = false;
            input.focus();
        }
    }
    
    function addMessage(text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll al final con animación suave
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
    
    function showTypingIndicator(show) {
        const indicator = document.getElementById('typingIndicator');
        if (show) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
        
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
