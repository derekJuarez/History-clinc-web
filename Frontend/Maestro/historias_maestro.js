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
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/expedientes/maestro/${matricula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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
        const fecha = new Date(inf.FechaRegistro).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const diagnostico = (inf.Diagnostico || '—').substring(0, 60) + (inf.Diagnostico?.length > 60 ? '...' : '');
        const plan = (inf.PlanTratamiento || '—').substring(0, 50) + (inf.PlanTratamiento?.length > 50 ? '...' : '');

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
            <td style="font-size:12px; color:#d1d5db; max-width:200px;" title="${inf.Diagnostico || ''}">${diagnostico}</td>
            <td style="font-size:12px; color:#d1d5db; max-width:180px;" title="${inf.PlanTratamiento || ''}">${plan}</td>
            <td style="text-align:center;">
                <button class="btn btn-sm" style="background: #a68b44; color: #0b1a30; font-weight: 600;" onclick="verDetalle(${inf.Id_Informe})">
                    <i class="bi bi-eye"></i> Ver Detalle
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

    // Buscar en la lista local
    let inf = todosLosInformes.find(i => i.Id_Informe === id);
    if (!inf) return;

    // Llenar campos del modal
    const fecha = new Date(inf.FechaRegistro).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('modal-fecha').textContent = `Registrado el ${fecha}`;
    document.getElementById('modal-alumno').textContent = `${inf.NOMBRE_ALUMNO || '—'} (${inf.MATRICULA_ALUMNO})`;
    document.getElementById('modal-paciente').textContent = inf.NOMBRE_PACIENTE || '—';
    
    let detalles = [];
    if (inf.TELEFONO_PACIENTE) detalles.push(`Tel: ${inf.TELEFONO_PACIENTE}`);
    if (inf.Sexo) detalles.push(`Sexo: ${inf.Sexo}`);
    if (inf.Ocupacion) detalles.push(`Ocupación: ${inf.Ocupacion}`);
    const detDiv = document.getElementById('modal-paciente-det');
    if (detDiv) detDiv.textContent = detalles.join(' | ');

    document.getElementById('modal-higiene').textContent = inf.HigieneOral || '—';
    document.getElementById('modal-habitos').textContent = inf.Habitos || '—';
    document.getElementById('modal-oclusion').textContent = inf.Oclusion || '—';
    document.getElementById('modal-diagnostico').textContent = inf.Diagnostico || 'Sin registro';
    document.getElementById('modal-plan').textContent = inf.PlanTratamiento || 'Sin registro';

    // Abrir Modal de Bootstrap
    const modalEl = document.getElementById('modalDetalleVisita');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}



async function marcarRevisado() {
    if (!informeActualId) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/expedientes/${informeActualId}/revisado`, { 
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            // Actualizar en la lista local
            const inf = todosLosInformes.find(i => i.Id_Informe === informeActualId);
            if (inf) inf.Estado = 'REVISADO';

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
