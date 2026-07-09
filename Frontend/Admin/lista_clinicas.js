document.addEventListener('DOMContentLoaded', () => {
    cargarClinicas();

    // Manejar el submit del formulario de edición de clínica
    const formEditarClinica = document.getElementById('formEditarClinica');
    if (formEditarClinica) {
        formEditarClinica.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-clinica-id').value;
            const nombre = document.getElementById('edit-clinica-nombre').value.trim();
            const encargado = document.getElementById('edit-clinica-encargado').value.trim();
            const ubicacion = document.getElementById('edit-clinica-ubicacion').value.trim();

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/clinicas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre, encargado, ubicacion })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Clínica actualizada exitosamente.');
                    cerrarModalClinica();
                    cargarClinicas(); // Recargar tabla
                } else {
                    alert(`Error al actualizar: ${result.message}`);
                }
            } catch (error) {
                console.error('Error al actualizar clínica:', error);
                alert('Error de conexión con el servidor al intentar actualizar.');
            }
        });
    }
});

// Cargar la lista de clínicas desde el backend
async function cargarClinicas() {
    const tablaClinicas = document.getElementById('TablaClinicas');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clinicas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const clinicas = result.data;
            
            if (clinicas.length === 0) {
                tablaClinicas.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #888893; padding: 20px;">
                        No hay clínicas registradas en este momento.
                    </td>
                </tr>`;
                return;
            }

            tablaClinicas.innerHTML = '';
            clinicas.forEach(clinica => {
                const fila = document.createElement('tr');
                const escapedNombre = (clinica.NOMBRE_CLINICA || '').replace(/'/g, "\\'");
                const escapedEncargado = (clinica.ENCARGADO || '').replace(/'/g, "\\'");
                const escapedUbicacion = (clinica.UBICACION || '').replace(/'/g, "\\'");

                fila.innerHTML = `
                    <td>${clinica.NOMBRE_CLINICA}</td>
                    <td>${clinica.ENCARGADO}</td>
                    <td>${clinica.UBICACION}</td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button class="btn-edit" onclick="abrirEditarClinica(${clinica.ID_CLINICA}, '${escapedNombre}', '${escapedEncargado}', '${escapedUbicacion}')">
                            <i class="ri-edit-line"></i> Editar
                        </button>
                        <button class="btn-delete" onclick="eliminarClinica(${clinica.ID_CLINICA}, '${escapedNombre}')">
                            <i class="ri-delete-bin-line"></i> Eliminar
                        </button>
                    </td>
                `;
                tablaClinicas.appendChild(fila);
            });
        } else {
            console.error('Error al obtener clínicas:', result.message);
            tablaClinicas.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">
                    Error al cargar las clínicas: ${result.message}
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        tablaClinicas.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">
                Error de conexión con el servidor.
            </td>
        </tr>`;
    }
}

// Abrir modal de edición con los datos de la clínica
function abrirEditarClinica(id, nombre, encargado, ubicacion) {
    document.getElementById('edit-clinica-id').value = id;
    document.getElementById('edit-clinica-nombre').value = nombre;
    document.getElementById('edit-clinica-encargado').value = encargado;
    document.getElementById('edit-clinica-ubicacion').value = ubicacion;

    const modal = document.getElementById('modalEditarClinica');
    if (modal) modal.classList.add('active');
}

// Cerrar modal de edición
function cerrarModalClinica() {
    const modal = document.getElementById('modalEditarClinica');
    if (modal) modal.classList.remove('active');
}

// Eliminar una clínica por su ID
async function eliminarClinica(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la clínica "${nombre}"?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clinicas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            alert('Clínica eliminada exitosamente.');
            cargarClinicas(); // Recargar la lista
        } else {
            alert(`Error al eliminar: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar clínica:', error);
        alert('Error al intentar eliminar la clínica del servidor.');
    }
}

// Exponer las funciones de forma global
window.eliminarClinica = eliminarClinica;
window.abrirEditarClinica = abrirEditarClinica;
window.cerrarModalClinica = cerrarModalClinica;
