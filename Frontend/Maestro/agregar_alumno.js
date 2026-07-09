document.addEventListener('DOMContentLoaded', () => {
    // Pre-llenar la matrícula del maestro desde localStorage (campo oculto para envío)
    const maestroMatricula = localStorage.getItem('matricula');
    if (!maestroMatricula) {
        mostrarNotificacion('error', 'No se encontró sesión activa. Por favor inicia sesión nuevamente.');
    }
});

document.getElementById('registro-alumno-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-alumno').value.trim();
    const matricula = document.getElementById('matricula-alumno').value.trim();
    const contrasena = document.getElementById('contrasena-alumno').value.trim();
    const maestro_matricula = localStorage.getItem('matricula');

    if (!maestro_matricula) {
        mostrarNotificacion('error', 'No se encontró tu sesión. Por favor inicia sesión nuevamente.');
        return;
    }

    // Deshabilitar botón mientras se procesa
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Procesando...';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/alumnos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, matricula, contrasena, maestro_matricula })
        });

        const result = await response.json();

        if (response.status === 201) {
            // CASO 1: Alumno nuevo registrado y asignado
            mostrarNotificacion('exito', `✅ ¡Alumno registrado exitosamente! <br><strong>${result.data.nombre}</strong> ahora está en tu lista de alumnos.`);
            this.reset();
        } else if (response.status === 200) {
            // CASO 2: Alumno ya existía sin maestro → ahora asignado
            mostrarNotificacion('info', `ℹ️ El alumno ya estaba registrado en el sistema y ahora te fue asignado exitosamente.`);
            this.reset();
        } else if (response.status === 202) {
            // CASO 3: Alumno tiene otro maestro → solicitud enviada al admin
            mostrarNotificacion('advertencia', `⚠️ <strong>${result.data.nombre_alumno}</strong> ya tiene otro maestro asignado (<em>${result.data.maestro_actual}</em>).<br>Se envió una <strong>solicitud de cambio de asesor</strong> al administrador. Recibirás respuesta cuando sea procesada.`);
            this.reset();
        } else {
            mostrarNotificacion('error', `❌ Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al registrar alumno:', error);
        mostrarNotificacion('error', '❌ No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Confirmar Registro';
    }
});

/**
 * Muestra una notificación flotante debajo del formulario.
 * @param {'exito'|'error'|'advertencia'|'info'} tipo
 * @param {string} mensaje - Puede contener HTML básico
 */
function mostrarNotificacion(tipo, mensaje) {
    // Remover notificación anterior si existe
    const anterior = document.getElementById('notificacion-registro');
    if (anterior) anterior.remove();

    const colores = {
        exito:      { bg: '#064e3b', border: '#10b981', icon: '✅' },
        error:      { bg: '#450a0a', border: '#ef4444', icon: '❌' },
        advertencia:{ bg: '#451a03', border: '#f59e0b', icon: '⚠️' },
        info:       { bg: '#0c1a4f', border: '#3b82f6', icon: 'ℹ️' }
    };

    const c = colores[tipo] || colores.info;
    const notif = document.createElement('div');
    notif.id = 'notificacion-registro';
    notif.style.cssText = `
        background: ${c.bg};
        border: 1px solid ${c.border};
        border-radius: 10px;
        padding: 16px 20px;
        margin-top: 20px;
        color: #ffffff;
        font-size: 14px;
        line-height: 1.6;
        animation: fadeInUp 0.4s ease;
    `;
    notif.innerHTML = mensaje;

    // Insertar después del formulario
    const form = document.getElementById('registro-alumno-form');
    form.parentNode.insertBefore(notif, form.nextSibling);

    // Auto-remover después de 8 segundos (excepto advertencia que se queda)
    if (tipo !== 'advertencia') {
        setTimeout(() => notif.remove(), 8000);
    }
}
