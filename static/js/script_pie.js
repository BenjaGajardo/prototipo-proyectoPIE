document.addEventListener('DOMContentLoaded', function() {
    const contactItems = document.querySelectorAll('.contact-item');
    const chatTitle = document.getElementById('chat-title');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Función para manejar el cambio de contacto
    function switchContact(contactElement) {
        // 1. Quitar 'active' de todos y ponerlo en el nuevo
        contactItems.forEach(item => item.classList.remove('active'));
        contactElement.classList.add('active');

        // 2. Actualizar el título del chat
        const contactName = contactElement.getAttribute('data-name');
        chatTitle.textContent = `Chat con ${contactName.split(' ')[0]}`;

        // 3. Limpiar y simular el historial de mensajes (en producción, esto se cargaría de una API)
        chatMessages.innerHTML = `
            <div class="message received">
                <div class="message-content">
                    Para iniciar una conversacion con el ${contactName}, escriba su duda o consulta en este chat, se le direccionara automaticamente a un chat mediante via whatsapp web.
                </div>
            </div>
        `;
        // Desplazar al fondo
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event listener para cambiar de contacto al hacer clic
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            switchContact(this);
        });
    });

    // Función para simular el envío de un mensaje
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") {
            return; // No enviar mensajes vacíos
        }

        // Crear el elemento del mensaje enviado
        const sentMessageHTML = `
            <div class="message sent">
                <div class="message-content">
                    ${text}
                </div>
            </div>
        `;

        // Añadir el mensaje al cuerpo del chat
        chatMessages.insertAdjacentHTML('beforeend', sentMessageHTML);

        // Limpiar el input
        messageInput.value = '';

        // Desplazar el chat automáticamente hacia el último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // **SIMULACIÓN DE RESPUESTA DEL DOCENTE (OPCIONAL) **
        setTimeout(() => {
            const contactName = chatTitle.textContent.replace('Chat con ', '');
            const replyHTML = `
                <div class="message received">
                    <div class="message-content">
                        Gracias por tu mensaje. el ${contactName} te responderá a la brevedad.
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', replyHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
    }

    // Event listener para el botón de enviar
    sendButton.addEventListener('click', sendMessage);

    // Event listener para enviar con la tecla Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previene el salto de línea por defecto
            sendMessage();
        }
    });

    // Inicializa el chat al cargar la página con el contacto 'activo' por defecto
    const initialActiveContact = document.querySelector('.contact-item.active');
    if (initialActiveContact) {
        // Ejecutamos switchContact al inicio para asegurarnos de que el título esté correcto.
        // No es necesario llamar switchContact, ya que el contenido inicial está en el HTML,
        // pero verificamos el título:
        const initialName = initialActiveContact.getAttribute('data-name').split(' ')[0];
        chatTitle.textContent = `Chat con ${initialName}`;
        chatMessages.scrollTop = chatMessages.scrollHeight; // Asegurar que inicie al fondo
    }
});