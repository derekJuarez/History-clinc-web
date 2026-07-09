//Funcion para calcular la edad
function calcular_edad(fecha_nacimiento) {
    const hoy = new Date(); 
    const nacimiento = new Date(fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--; 
    }
    return edad;
}

//Función para cargar los pacientes
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Realizar la solicitud al backend para obtener los pacientes
        const token = localStorage.getItem('token');
        const response = await fetch('/api/paciente/todos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        const tablaPacientes = document.getElementById('TablaPacientes');

        if (response.ok) {
            tablaPacientes.innerHTML = ''; // Limpiar la tabla antes de llenarla

            result.data.forEach(paciente => {
                const edad = calcular_edad(paciente.fecha_nacimiento);

                const fila = `
                <tr>
                    <td>${paciente.curp}</td>
                    <td>${paciente.nombre}</td>
                    <td>${edad} años</td>
                    <td>${paciente.sexo}</td>
                    <td>${paciente.telefono}</td>
                    <td>${paciente.correo}</td>
                </tr>
                `;
                //insertar la fila en la tabla
                tablaPacientes.innerHTML += fila;
            });
        } else {
            console.error('Error al obtener pacientes:', result.message);
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
    }
});
