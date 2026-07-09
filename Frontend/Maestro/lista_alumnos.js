document.addEventListener('DOMContentLoaded', async () => {
    const tablaAlumnos = document.getElementById('TablaAlumnos');
    const teacherMatricula = localStorage.getItem('matricula');

    if (!teacherMatricula) {
        console.error('No se encontró la matrícula del maestro en localStorage');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/alumnos/maestro/${teacherMatricula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            if (result.data.length === 0) {
                tablaAlumnos.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #888893; padding: 20px;">
                        No tienes alumnos asignados
                    </td>
                </tr>`;
                return;
            }

            tablaAlumnos.innerHTML = '';
            result.data.forEach(alumno => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${alumno.nombre}</td>
                    <td>${alumno.matricula}</td>
                    <td>${alumno.clinica || 'Sin clínica registrada'}</td>
                `;
                tablaAlumnos.appendChild(fila);
            });
        } else {
            console.error('Error al obtener alumnos:', result.message);
            tablaAlumnos.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #ef4444; padding: 20px;">
                    Error al cargar alumnos: ${result.message}
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        tablaAlumnos.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; color: #ef4444; padding: 20px;">
                Error de conexión con el servidor.
            </td>
        </tr>`;
    }
});
