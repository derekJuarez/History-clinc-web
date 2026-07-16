// Custom Alert & Confirm Dialog System
(function() {
    // 1. Inject Styles Dynamically
    const css = `
        /* Custom Alert Dialog Base */
        .custom-alert-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(10, 17, 32, 0.65);
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        
        .custom-alert-backdrop.show {
            opacity: 1;
        }

        .custom-alert-container {
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(212, 175, 55, 0.25);
            border-radius: 16px;
            padding: 28px 24px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transform: scale(0.9);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Poppins', sans-serif;
            color: #f8fafc;
        }

        .custom-alert-backdrop.show .custom-alert-container {
            transform: scale(1);
        }

        /* Icon styling */
        .custom-alert-icon {
            font-size: 52px;
            margin-bottom: 16px;
            display: inline-block;
            line-height: 1;
        }
        
        .custom-alert-icon.success {
            color: #10b981;
            animation: successPulse 0.5s ease-out;
        }
        
        .custom-alert-icon.error {
            color: #ef4444;
            animation: errorShake 0.4s ease-out;
        }
        
        .custom-alert-icon.warning {
            color: #f59e0b;
            animation: successPulse 0.5s ease-out;
        }
        
        .custom-alert-icon.info {
            color: #d4af37;
            animation: successPulse 0.5s ease-out;
        }

        /* Text styling */
        .custom-alert-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: 0.5px;
        }

        .custom-alert-message {
            font-size: 14.5px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 26px;
            word-break: break-word;
        }

        /* Button group */
        .custom-alert-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            width: 100%;
        }

        /* Buttons */
        .custom-alert-btn {
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            border: none;
            outline: none;
            flex: 1;
            max-width: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .custom-alert-btn-confirm {
            background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
            color: #0f172a;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
        }

        .custom-alert-btn-confirm:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
            filter: brightness(1.1);
        }

        .custom-alert-btn-confirm:active {
            transform: translateY(0);
        }

        .custom-alert-btn-cancel {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
        }

        .custom-alert-btn-cancel:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.2);
        }

        /* Animations */
        @keyframes successPulse {
            0% { transform: scale(0.6); opacity: 0; }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes errorShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
    `;

    // Inject styles only in browser environments
    if (typeof document !== 'undefined') {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = css;
        document.head.appendChild(styleEl);
    }

    // Queue structure for alerts
    const queue = [];
    let isShowing = false;

    function processQueue() {
        if (queue.length === 0 || isShowing) return;
        isShowing = true;

        const current = queue.shift();

        // Create DOM structure
        const backdrop = document.createElement('div');
        backdrop.className = 'custom-alert-backdrop';

        const container = document.createElement('div');
        container.className = 'custom-alert-container';

        // Auto-detect title and icon based on message content
        let iconClass = 'ri-information-line info';
        let titleText = 'Aviso';
        const lowerMsg = current.message.toLowerCase();

        if (lowerMsg.includes('error') || lowerMsg.includes('falló') || lowerMsg.includes('incorrect') || lowerMsg.includes('no coinciden') || lowerMsg.includes('obligatorio') || lowerMsg.includes('inválido') || lowerMsg.includes('no se pudo')) {
            iconClass = 'ri-error-warning-line error';
            titleText = 'Atención';
        } else if (lowerMsg.includes('éxito') || lowerMsg.includes('exitosamente') || lowerMsg.includes('correcto') || lowerMsg.includes('bienvenido') || lowerMsg.includes('guardado')) {
            iconClass = 'ri-checkbox-circle-line success';
            titleText = '¡Éxito!';
        } else if (lowerMsg.includes('seguro') || lowerMsg.includes('deseas') || lowerMsg.includes('eliminar') || lowerMsg.includes('cancelar')) {
            iconClass = 'ri-question-line warning';
            titleText = 'Confirmar';
        }

        let buttonsHtml = '';
        if (current.type === 'confirm') {
            buttonsHtml = `
                <button class="custom-alert-btn custom-alert-btn-cancel" id="custom-alert-cancel-btn">Cancelar</button>
                <button class="custom-alert-btn custom-alert-btn-confirm" id="custom-alert-confirm-btn">Aceptar</button>
            `;
        } else {
            buttonsHtml = `
                <button class="custom-alert-btn custom-alert-btn-confirm" id="custom-alert-confirm-btn">Aceptar</button>
            `;
        }

        container.innerHTML = `
            <div class="custom-alert-icon ${iconClass.split(' ')[1]}"><i class="${iconClass.split(' ')[0]}"></i></div>
            <div class="custom-alert-title">${titleText}</div>
            <div class="custom-alert-message">${current.message}</div>
            <div class="custom-alert-buttons">
                ${buttonsHtml}
            </div>
        `;

        backdrop.appendChild(container);
        document.body.appendChild(backdrop);

        // Force browser layout update
        backdrop.offsetHeight;
        backdrop.classList.add('show');

        const confirmBtn = backdrop.querySelector('#custom-alert-confirm-btn');
        const cancelBtn = backdrop.querySelector('#custom-alert-cancel-btn');

        if (confirmBtn) confirmBtn.focus();

        function handleClose(value) {
            backdrop.classList.remove('show');
            document.removeEventListener('keydown', handleKeyDown);
            setTimeout(() => {
                backdrop.remove();
                isShowing = false;
                current.resolve(value);
                processQueue();
            }, 250);
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose(false);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleClose(true);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => handleClose(true));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => handleClose(false));
        }
    }

    // Override window.alert (Returns a Promise, but can be called like window.alert() in legacy code)
    window.alert = function(message) {
        return new Promise((resolve) => {
            queue.push({
                type: 'alert',
                message: String(message),
                resolve: resolve
            });
            processQueue();
        });
    };

    // Add customConfirm
    window.customConfirm = function(message) {
        return new Promise((resolve) => {
            queue.push({
                type: 'confirm',
                message: String(message),
                resolve: resolve
            });
            processQueue();
        });
    };
})();
