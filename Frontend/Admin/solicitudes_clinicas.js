document.addEventListener('DOMContentLoaded', cargarSolicitudes);

async function cargarSolicitudes() {
    const tabla = document.getElementById('TablaSolicitudes');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clinicas/solicitudes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
            tabla.innerHTML = ''; // Limpiar "Cargando..."
            
            const solicitudes = data.data;
            
            if (solicitudes.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #888893; padding: 20px;">
                            No hay solicitudes pendientes en este momento.
                        </td>
                    </tr>
                `;
                return;
            }
            
            solicitudes.forEach(solicitud => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${solicitud.Nombre}</td>
                    <td>${solicitud.Encargado}</td>
                    <td>${solicitud.Ubicacion}</td>
                    <td style="text-align: center;">
                        <button class="btn-action btn-accept" onclick="actualizarEstado(${solicitud.ID_CLINICA}, 'APROBADO')">
                            <i class="ri-check-line"></i> Aceptar
                        </button>
                        <button class="btn-action btn-reject" onclick="actualizarEstado(${solicitud.ID_CLINICA}, 'RECHAZADO')">
                            <i class="ri-close-line"></i> Rechazar
                        </button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
            
        } else {
            tabla.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">
                        Error: ${data.message}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">
                    No se pudo conectar con el servidor.
                </td>
            </tr>
        `;
    }
}

async function actualizarEstado(id, estado) {
    const accionStr = estado === 'APROBADO' ? 'aceptar' : 'rechazar';
    if (!await customConfirm(`¿Estás seguro de que deseas ${accionStr} esta solicitud?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clinicas/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`Solicitud ${estado.toLowerCase()} con éxito.`);
            cargarSolicitudes(); // Recargar la tabla
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('No se pudo conectar con el servidor.');
    }
}
