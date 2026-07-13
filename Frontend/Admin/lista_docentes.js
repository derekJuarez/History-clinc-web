document.addEventListener('DOMContentLoaded', () => {
    cargarDocentes();

    // Manejar el submit del formulario de edición de docente
    const formEditarDocente = document.getElementById('formEditarDocente');
    if (formEditarDocente) {
        formEditarDocente.addEventListener('submit', async (e) => {
            e.preventDefault();

            const matricula = document.getElementById('edit-docente-matricula').value;
            const nombre = document.getElementById('edit-docente-nombre').value.trim();
            const telefono = document.getElementById('edit-docente-telefono').value.trim();
            const correo = document.getElementById('edit-docente-correo').value.trim();
            const contraseña = document.getElementById('edit-docente-contrasena').value;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/docentes/${matricula}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre, email: correo, telefono, contraseña })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Docente actualizado exitosamente.');
                    cerrarModalDocente();
                    cargarDocentes(); // Recargar tabla
                } else {
                    alert(`Error al actualizar: ${result.message}`);
                }
            } catch (error) {
                console.error('Error al actualizar docente:', error);
                alert('Error de conexión con el servidor al intentar actualizar.');
            }
        });
    }
});

// Cargar la lista de docentes desde el backend
async function cargarDocentes() {
    const tablaDocentes = document.getElementById('TablaDocentes');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/docentes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const docentes = result.data;
            
            if (docentes.length === 0) {
                tablaDocentes.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #888893; padding: 20px;">
                        No hay docentes registrados en este momento.
                    </td>
                </tr>`;
                return;
            }

            tablaDocentes.innerHTML = '';
            docentes.forEach(doc => {
                const fila = document.createElement('tr');
                const escapedName = (doc.Nombre || '').replace(/'/g, "\\'");
                const escapedTel = (doc.Telefono || '').replace(/'/g, "\\'");
                const escapedEmail = (doc.Correo || '').replace(/'/g, "\\'");

                fila.innerHTML = `
                    <td>${doc.ID_MATRICULA}</td>
                    <td>${doc.Nombre}</td>
                    <td>${doc.Telefono || 'Sin teléfono'}</td>
                    <td>${doc.Correo}</td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button class="btn-edit" onclick="abrirEditarDocente('${doc.ID_MATRICULA}', '${escapedName}', '${escapedTel}', '${escapedEmail}')">
                            <i class="ri-edit-line"></i> Editar
                        </button>
                        <button class="btn-delete" onclick="eliminarDocente('${doc.ID_MATRICULA}', '${escapedName}')">
                            <i class="ri-delete-bin-line"></i> Eliminar
                        </button>
                    </td>
                `;
                tablaDocentes.appendChild(fila);
            });
        } else {
            console.error('Error al obtener docentes:', result.message);
            tablaDocentes.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">
                    Error al cargar la lista: ${result.message}
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        tablaDocentes.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">
                Error de conexión con el servidor.
            </td>
        </tr>`;
    }
}

// Abrir modal de edición con los datos del docente
function abrirEditarDocente(matricula, name, telefono, correo) {
    document.getElementById('edit-docente-matricula').value = matricula;
    document.getElementById('edit-docente-nombre').value = name;
    document.getElementById('edit-docente-telefono').value = telefono === 'Sin teléfono' ? '' : telefono;
    document.getElementById('edit-docente-correo').value = correo;
    document.getElementById('edit-docente-contrasena').value = ''; // Vacío por defecto

    const modal = document.getElementById('modalEditarDocente');
    if (modal) modal.classList.add('active');
}

// Cerrar modal de edición
function cerrarModalDocente() {
    const modal = document.getElementById('modalEditarDocente');
    if (modal) modal.classList.remove('active');
}

// Eliminar un docente por su matrícula
async function eliminarDocente(matricula, nombre) {
    if (!await customConfirm(`¿Estás seguro de que deseas eliminar al docente ${nombre} (Matrícula: ${matricula})?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/docentes/${matricula}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            alert('Docente eliminado exitosamente.');
            cargarDocentes(); // Recargar la lista
        } else {
            alert(`Error al eliminar: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar docente:', error);
        alert('Error al intentar eliminar el docente del servidor.');
    }
}

// Exponer las funciones al objeto global window para que funcionen con onclick inline
window.eliminarDocente = eliminarDocente;
window.abrirEditarDocente = abrirEditarDocente;
window.cerrarModalDocente = cerrarModalDocente;
