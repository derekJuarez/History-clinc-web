
document.getElementById('registroPacienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submitRegistro');
    btn.disabled = true;
    btn.textContent = 'Registrando...';

    const pacienteData = {
        curp: document.getElementById('curp').value.trim().toUpperCase(),
        nombre: document.getElementById('name').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('correo').value.trim(),
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        sexo: document.getElementById('sexo').value,
        estado_civil: document.getElementById('estado_civil').value.trim(),
        ocupacion: document.getElementById('ocupacion').value.trim(),
        residencia: document.getElementById('residencia').value.trim(),
        tel_emergencia: document.getElementById('tel_emergencia').value.trim(),
        contacto_familiar: document.getElementById('contacto_familiar').value.trim(),
        id_estudiante: localStorage.getItem('matricula')
    };

    // Validaciones básicas
    if (!pacienteData.curp || pacienteData.curp.length < 10) {
        mostrarMensaje('error', 'Por favor ingresa una CURP válida.');
        restaurarBtn(btn);
        return;
    }
    if (!pacienteData.fecha_nacimiento) {
        mostrarMensaje('error', 'La fecha de nacimiento es requerida.');
        restaurarBtn(btn);
        return;
    }
    if (!pacienteData.sexo) {
        mostrarMensaje('error', 'El sexo es requerido.');
        restaurarBtn(btn);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/paciente/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pacienteData)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarMensaje('exito', `
                <div class="mb-2">✅ ${result.message}</div>
                <button type="button" class="btn btn-light btn-sm fw-bold text-success mt-2" onclick="window.location.href='historias.html?curp=${pacienteData.curp}'">
                    Continuar a Historia Clínica <i class="ri-arrow-right-line"></i>
                </button>
            `);
            document.getElementById('registroPacienteForm').reset();
            document.getElementById('submitRegistro').style.display = 'none'; // Ocultar el botón original
        } else if (response.status === 409) {
            // Paciente ya registrado — no es un error del servidor, sino un duplicado
            mostrarMensaje('advertencia', `⚠️ ${result.message || 'Este paciente ya está registrado en el sistema.'}`);
        } else {
            mostrarMensaje('error', `❌ Error: ${result.message || 'No se pudo registrar al paciente.'}`);
        }
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        mostrarMensaje('error', '❌ No se pudo conectar con el servidor.');
    } finally {
        restaurarBtn(btn);
    }
});

function restaurarBtn(btn) {
    btn.disabled = false;
    btn.textContent = 'FINALIZAR Y REGISTRAR PACIENTE';
}

function mostrarMensaje(tipo, texto) {
    const anterior = document.getElementById('msg-registro');
    if (anterior) anterior.remove();

    const colores = {
        exito:       { bg: '#064e3b', border: '#10b981', color: '#d1fae5' },
        error:       { bg: '#450a0a', border: '#ef4444', color: '#fee2e2' },
        advertencia: { bg: '#451a03', border: '#f59e0b', color: '#fef3c7' }
    };
    const c = colores[tipo] || colores.error;

    const msg = document.createElement('div');
    msg.id = 'msg-registro';
    msg.style.cssText = `
        margin: 16px 0;
        padding: 14px 18px;
        background: ${c.bg};
        border: 1px solid ${c.border};
        border-radius: 10px;
        color: ${c.color};
        font-size: 14px;
        font-family: 'Poppins', sans-serif;
        text-align: center;
    `;
    msg.innerHTML = texto;

    const form = document.getElementById('registroPacienteForm');
    form.insertAdjacentElement('afterend', msg);

    if (tipo !== 'exito') {
        setTimeout(() => msg.remove(), 5000);
    }
}