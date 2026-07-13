let tabActual = 'pendientes';

document.addEventListener('DOMContentLoaded', () => {
    cargarSolicitudes('pendientes');
});

function cambiarTab(tab) {
    tabActual = tab;

    // Actualizar estilos de tabs
    document.getElementById('tab-pendientes').classList.toggle('active', tab === 'pendientes');
    document.getElementById('tab-historial').classList.toggle('active', tab === 'historial');

    // Mostrar/ocultar columna de acciones según tab
    const colAcciones = document.getElementById('col-acciones-header');
    if (colAcciones) {
        colAcciones.style.display = tab === 'pendientes' ? '' : 'none';
    }

    cargarSolicitudes(tab);
}

async function cargarSolicitudes(tab = 'pendientes') {
    const tabla = document.getElementById('TablaSolicitudes');
    tabla.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#cbb26a; padding:20px;">Cargando...</td></tr>`;

    try {
        const url = tab === 'historial'
            ? '/api/solicitudes-asesor?historial=true'
            : '/api/solicitudes-asesor';

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar solicitudes');
        }

        const solicitudes = data.data || [];

        // Actualizar badge de pendientes
        if (tab === 'pendientes') {
            document.getElementById('badge-count').textContent = solicitudes.length;
        }

        if (solicitudes.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="ri-checkbox-circle-line"></i>
                            <p>${tab === 'pendientes'
                                ? 'No hay solicitudes pendientes. ¡Todo está al día!'
                                : 'No hay historial de solicitudes aún.'
                            }</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tabla.innerHTML = '';
        solicitudes.forEach(sol => {
            const fecha = new Date(sol.FechaSolicitud).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const esPendiente = sol.Estado === 'PENDIENTE';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${sol.NombreAlumno || '—'}</strong></td>
                <td><code style="color:#cbb26a; font-size:12px;">${sol.MatriculaAlumno}</code></td>
                <td>
                    <div class="maestro-change">
                        <span class="actual"><i class="ri-user-line"></i> ${sol.NombreMaestroActual || 'Sin maestro'}</span>
                        <span class="arrow">▼ Solicita cambio a ▼</span>
                        <span class="nuevo"><i class="ri-user-star-line"></i> ${sol.NombreMaestroNuevo}</span>
                    </div>
                </td>
                <td style="font-size:12px; color:#6b7280;">${fecha}</td>
                <td>
                    <span class="badge-estado badge-${sol.Estado}">${sol.Estado}</span>
                </td>
                <td style="display: ${tab === 'historial' ? 'none' : ''};">
                    ${esPendiente ? `
                        <div class="acciones-cell">
                            <button class="btn-action btn-accept" 
                                onclick="confirmarAccion(${sol.Id_Solicitud}, 'APROBADO', '${(sol.NombreAlumno || '').replace(/'/g, "\\'")}', '${(sol.NombreMaestroNuevo || '').replace(/'/g, "\\'")}')">
                                <i class="ri-check-line"></i> Aceptar
                            </button>
                            <button class="btn-action btn-reject"
                                onclick="confirmarAccion(${sol.Id_Solicitud}, 'RECHAZADO', '${(sol.NombreAlumno || '').replace(/'/g, "\\'")}', '${(sol.NombreMaestroActual || '').replace(/'/g, "\\'")}')">
                                <i class="ri-close-line"></i> Rechazar
                            </button>
                        </div>
                    ` : `<span style="color:#374151; font-size:12px;">—</span>`}
                </td>
            `;
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#ef4444; padding:20px;">
                    <i class="ri-wifi-off-line"></i> No se pudo conectar con el servidor.
                </td>
            </tr>`;
    }
}

/**
 * Muestra el modal de confirmación antes de aceptar o rechazar
 */
function confirmarAccion(id, estado, nombreAlumno, nombreMaestro) {
    const esAceptar = estado === 'APROBADO';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-confirmacion';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">${esAceptar ? '✅' : '⛔'}</div>
            <div class="modal-title">${esAceptar ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}</div>
            <div class="modal-desc">
                ${esAceptar
                    ? `¿Confirmas que <strong>${nombreAlumno}</strong> será reasignado al maestro <strong>${nombreMaestro}</strong>? Esta acción actualizará su asesor en el sistema.`
                    : `¿Confirmas rechazar la solicitud de cambio de asesor para <strong>${nombreAlumno}</strong>? El alumno permanecerá con su maestro actual (<strong>${nombreMaestro}</strong>).`
                }
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" onclick="cerrarModal()">
                    <i class="ri-close-line"></i> Cancelar
                </button>
                <button class="modal-btn ${esAceptar ? 'confirm-accept' : 'confirm-reject'}" 
                    onclick="procesarAccion(${id}, '${estado}')">
                    <i class="${esAceptar ? 'ri-check-line' : 'ri-close-line'}"></i>
                    ${esAceptar ? 'Sí, Aprobar' : 'Sí, Rechazar'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}

function cerrarModal() {
    const modal = document.getElementById('modal-confirmacion');
    if (modal) modal.remove();
}

async function procesarAccion(id, estado) {
    cerrarModal();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/solicitudes-asesor/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });

        const result = await response.json();

        if (response.ok) {
            mostrarToast('exito', result.message);
            cargarSolicitudes(tabActual);
            // Actualizar badge de pendientes
            cargarBadgePendientes();
        } else {
            mostrarToast('error', result.message || 'Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        mostrarToast('error', 'No se pudo conectar con el servidor.');
    }
}

async function cargarBadgePendientes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/solicitudes-asesor', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('badge-count').textContent = (data.data || []).length;
        }
    } catch (_) {}
}

function mostrarToast(tipo, mensaje) {
    const anterior = document.querySelector('.toast');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
}
