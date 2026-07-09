let todosLosInformes = [];
let informeActualId = null;

document.addEventListener('DOMContentLoaded', cargarHistorias);

async function cargarHistorias() {
    const tabla = document.getElementById('tablaHistoriasMaestro');
    const matricula = localStorage.getItem('matricula');

    if (!matricula) {
        tabla.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:30px;">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>No se encontró sesión activa. Por favor inicia sesión.
        </td></tr>`;
        return;
    }

    try {
        const response = await fetch(`/api/expedientes/maestro/${matricula}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Error al cargar');

        todosLosInformes = data.data || [];

        if (todosLosInformes.length === 0) {
            tabla.innerHTML = `<tr><td colspan="7">
                <div class="empty-state">
                    <i class="bi bi-journal-x"></i>
                    <p>Ninguno de tus alumnos ha subido informes clínicos aún.</p>
                </div>
            </td></tr>`;
            return;
        }

        renderTabla(todosLosInformes);

    } catch (error) {
        console.error('Error al cargar historias:', error);
        tabla.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:30px;">
            <i class="bi bi-wifi-off me-2"></i>No se pudo conectar con el servidor.
        </td></tr>`;
    }
}

function renderTabla(informes) {
    const tabla = document.getElementById('tablaHistoriasMaestro');
    tabla.innerHTML = '';

    informes.forEach(inf => {
        const fecha = new Date(inf.FECHA_REGISTRO).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const diagnostico = (inf.DIAGNOSTICO || '—').substring(0, 60) + (inf.DIAGNOSTICO?.length > 60 ? '...' : '');
        const plan = (inf.PLAN_TRATAMIENTO || '—').substring(0, 50) + (inf.PLAN_TRATAMIENTO?.length > 50 ? '...' : '');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size:12px; color:#6b7280; white-space:nowrap;">${fecha}</td>
            <td>
                <div style="font-weight:600; color:#e5e7eb; font-size:13px;">${inf.NOMBRE_ALUMNO || '—'}</div>
                <div style="font-size:11px; color:#6b7280;">${inf.MATRICULA_ALUMNO}</div>
            </td>
            <td>
                <div style="font-weight:600; color:#e5e7eb; font-size:13px;">${inf.NOMBRE_PACIENTE}</div>
                <div style="font-size:11px; color:#6b7280;">${inf.TELEFONO_PACIENTE || ''}</div>
            </td>
            <td style="font-size:12px; color:#d1d5db; max-width:200px;" title="${inf.DIAGNOSTICO || ''}">${diagnostico}</td>
            <td style="font-size:12px; color:#d1d5db; max-width:180px;" title="${inf.PLAN_TRATAMIENTO || ''}">${plan}</td>
            <td style="text-align:center;">
                <span class="badge-${inf.ESTADO}">${inf.ESTADO}</span>
            </td>
            <td style="text-align:center;">
                <button class="btn-ver" onclick="verDetalle(${inf.ID_INFORME})">
                    <i class="bi bi-eye me-1"></i> Ver
                </button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

function filtrarTabla() {
    const query = document.getElementById('buscarHistoria').value.toLowerCase();
    const filtrados = todosLosInformes.filter(inf =>
        (inf.NOMBRE_ALUMNO || '').toLowerCase().includes(query) ||
        (inf.NOMBRE_PACIENTE || '').toLowerCase().includes(query) ||
        (inf.MATRICULA_ALUMNO || '').toLowerCase().includes(query)
    );
    renderTabla(filtrados);
}

async function verDetalle(id) {
    informeActualId = id;
    const overlay = document.getElementById('modalOverlay');

    // Buscar en la lista local primero
    let inf = todosLosInformes.find(i => i.ID_INFORME === id);

    // Si no está (raro), pedir al servidor
    if (!inf) {
        try {
            const r = await fetch(`/api/expedientes/${id}`);
            const d = await r.json();
            if (r.ok) inf = d.data;
        } catch (e) { console.error(e); return; }
    }

    if (!inf) return;

    // Llenar campos del modal
    const fecha = new Date(inf.FECHA_REGISTRO).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('modal-fecha').textContent = `Registrado el ${fecha}`;
    document.getElementById('modal-alumno').textContent = `${inf.NOMBRE_ALUMNO || '—'} (${inf.MATRICULA_ALUMNO})`;
    document.getElementById('modal-paciente').textContent = inf.NOMBRE_PACIENTE || '—';
    document.getElementById('modal-paciente-det').textContent = [
        inf.TELEFONO_PACIENTE ? `Tel: ${inf.TELEFONO_PACIENTE}` : '',
        inf.SEXO_PACIENTE ? `Sexo: ${inf.SEXO_PACIENTE}` : '',
        inf.OCUPACION_PACIENTE ? `Ocupación: ${inf.OCUPACION_PACIENTE}` : ''
    ].filter(Boolean).join(' | ');

    document.getElementById('modal-diabetes').textContent = inf.DIABETES || 'No';
    document.getElementById('modal-hipertension').textContent = inf.HIPERTENSION || 'No';
    document.getElementById('modal-cardiacos').textContent = inf.PROBLEMAS_CARDIACOS || 'No';
    document.getElementById('modal-embarazo').textContent = inf.EMBARAZO || 'No';
    document.getElementById('modal-alergias').textContent = inf.ALERGIAS || 'Negadas';
    document.getElementById('modal-medicamentos').textContent = inf.MEDICAMENTOS_ACTUALES || 'Ninguno';
    document.getElementById('modal-otros').textContent = inf.OTROS_PADECIMIENTOS || 'Ninguno';
    document.getElementById('modal-higiene').textContent = inf.HIGIENE_ORAL || '—';
    document.getElementById('modal-habitos').textContent = inf.HABITOS || '—';
    document.getElementById('modal-oclusion').textContent = inf.OCLUSION || '—';
    document.getElementById('modal-atm').textContent = inf.ESTADO_ATM || '—';
    document.getElementById('modal-diagnostico').textContent = inf.DIAGNOSTICO || 'Sin registro';
    document.getElementById('modal-plan').textContent = inf.PLAN_TRATAMIENTO || 'Sin registro';

    // Estado del botón revisar
    const btnRevisar = document.getElementById('btn-marcar-revisado');
    const estadoLabel = document.getElementById('modal-estado-label');
    if (inf.ESTADO === 'REVISADO') {
        btnRevisar.style.display = 'none';
        estadoLabel.innerHTML = '<span style="color:#10b981;"><i class="bi bi-check-circle-fill me-1"></i>Este informe ya fue revisado</span>';
    } else {
        btnRevisar.style.display = 'inline-flex';
        estadoLabel.textContent = '';
    }

    overlay.style.display = 'flex';
}

function cerrarModalDetalle(e) {
    if (!e || e.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').style.display = 'none';
        informeActualId = null;
    }
}

async function marcarRevisado() {
    if (!informeActualId) return;

    try {
        const response = await fetch(`/api/expedientes/${informeActualId}/revisado`, { method: 'PUT' });
        const data = await response.json();

        if (response.ok) {
            // Actualizar en la lista local
            const inf = todosLosInformes.find(i => i.ID_INFORME === informeActualId);
            if (inf) inf.ESTADO = 'REVISADO';

            // Actualizar UI del modal
            document.getElementById('btn-marcar-revisado').style.display = 'none';
            document.getElementById('modal-estado-label').innerHTML =
                '<span style="color:#10b981;"><i class="bi bi-check-circle-fill me-1"></i>Marcado como revisado</span>';

            // Refrescar tabla
            renderTabla(todosLosInformes);

            mostrarToastMaestro('Informe marcado como revisado ✅');
        } else {
            mostrarToastMaestro('Error: ' + data.message, true);
        }
    } catch (error) {
        console.error(error);
        mostrarToastMaestro('No se pudo conectar con el servidor', true);
    }
}

function mostrarToastMaestro(mensaje, esError = false) {
    const anterior = document.getElementById('toast-maestro');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-maestro';
    toast.style.cssText = `
        position: fixed; bottom: 28px; right: 28px;
        background: ${esError ? '#450a0a' : '#064e3b'};
        border: 1px solid ${esError ? '#ef4444' : '#10b981'};
        border-radius: 12px; padding: 14px 20px;
        color: #fff; font-size: 13px; z-index: 99999;
        font-family: 'Poppins', sans-serif;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
