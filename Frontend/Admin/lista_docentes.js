document.addEventListener('DOMContentLoaded', () => {
    cargarDocentes();
});

// Cargar la lista de docentes desde el backend
async function cargarDocentes() {
    const tablaDocentes = document.getElementById('TablaDocentes');

    try {
        const response = await fetch('/api/docentes');
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
                fila.innerHTML = `
                    <td>${doc.ID_MATRICULA}</td>
                    <td>${doc.NAME}</td>
                    <td>${doc.TELEFONO || 'Sin teléfono'}</td>
                    <td>${doc.CORREO}</td>
                    <td style="text-align: center;">
                        <button class="btn-delete" onclick="eliminarDocente('${doc.ID_MATRICULA}', '${doc.NAME}')">
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

// Eliminar un docente por su matrícula
async function eliminarDocente(matricula, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al docente ${nombre} (Matrícula: ${matricula})?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/docentes/${matricula}`, {
            method: 'DELETE'
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

// Exponer la función eliminarDocente de forma global para que el botón de la fila la llame
window.eliminarDocente = eliminarDocente;
