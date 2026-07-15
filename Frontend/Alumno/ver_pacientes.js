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

                // Verificar si hay una radiografía reciente y crear el enlace correspondiente
                let botonRadiografia = '<span class="text-danger">No disponible</span>';
                // Aquí asumimos que `radiografia_reciente` es un campo que contiene la URL de la radiografía más reciente
                if (paciente.radiografia_reciente) {
                    botonRadiografia = `<a href="/uploads/radiografias/${paciente.radiografia_reciente}" target="_blank" style="padding: 5px 10px; background-color: 
                    #007bff; color: white; border-radius: 5px; text-decoration: none;">Ver Imagen</a>`;
                }

                const escapedName = (paciente.nombre || '').replace(/'/g, "\\'");
                const fila = `
                <tr>
                    <td>${paciente.curp}</td>

                    <td>${paciente.nombre}</td>
                    <td>${edad} años</td>
                    <td>${paciente.sexo}</td>
                    <td>${paciente.telefono}</td>
                    <td>${paciente.correo}</td>
                    <td>${botonRadiografia}</td>
                    <td style="text-align: center;">
                        <button class="btn-receta" onclick="abrirModalReceta('${escapedName}', ${edad}, '${paciente.sexo}')">
                            <i class="ri-file-list-3-line"></i> Receta
                        </button>
                    </td>
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

// ================= LÓGICA DE RECETAS ================= //

function abrirModalReceta(nombrePaciente, edad, sexo) {
    document.getElementById('receta-paciente').value = nombrePaciente;
    document.getElementById('receta-edad').value = `${edad} años`;
    document.getElementById('receta-sexo').value = sexo || '';
    document.getElementById('receta-diagnostico').value = '';
    document.getElementById('receta-ta').value = '';
    document.getElementById('receta-fc').value = '';
    document.getElementById('receta-talla').value = '';
    document.getElementById('receta-peso').value = '';
    document.getElementById('receta-glumetria').value = '';
    document.getElementById('receta-indicaciones').value = '';
    
    const modal = document.getElementById('modalReceta');
    if (modal) modal.classList.add('active');
}

function cerrarModalReceta() {
    const modal = document.getElementById('modalReceta');
    if (modal) modal.classList.remove('active');
}

async function imprimirReceta() {
    const indicaciones = document.getElementById('receta-indicaciones').value.trim();
    if (!indicaciones) {
        alert('Por favor, escriba los medicamentos y/o indicaciones.');
        return;
    }

    // 1. Obtener los datos del formulario web
    const paciente = document.getElementById('receta-paciente').value;
    const edad = document.getElementById('receta-edad').value;
    const sexo = document.getElementById('receta-sexo').value;
    const diagnostico = document.getElementById('receta-diagnostico').value || 'Ninguno especificado';
    const alumnoNombre = localStorage.getItem('nombre') || 'Alumno Médico';
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    const ta = document.getElementById('receta-ta').value || '___';
    const fc = document.getElementById('receta-fc').value || '___';
    const talla = document.getElementById('receta-talla').value || '___';
    const peso = document.getElementById('receta-peso').value || '___';
    const glumetria = document.getElementById('receta-glumetria').value || '___';

    // 2. Llenar el contenedor de impresión (datos del alumno y paciente)
    document.getElementById('print-alumno').textContent = alumnoNombre;
    document.getElementById('print-paciente').textContent = paciente;
    document.getElementById('print-edad').textContent = edad;
    document.getElementById('print-sexo').textContent = sexo;
    document.getElementById('print-fecha').textContent = fecha;
    document.getElementById('print-diagnostico').textContent = diagnostico;
    document.getElementById('print-indicaciones').textContent = indicaciones;
    
    document.getElementById('print-ta').textContent = ta;
    document.getElementById('print-fc').textContent = fc;
    document.getElementById('print-talla').textContent = talla;
    document.getElementById('print-peso').textContent = peso;
    document.getElementById('print-glumetria').textContent = glumetria;

    // 3. Obtener la info del Maestro desde la API
    const token = localStorage.getItem('token');
    try {
        const btnSubmit = document.querySelector('.btn-submit');
        const textOriginal = btnSubmit.innerHTML;
        btnSubmit.innerHTML = 'Preparando...';
        btnSubmit.disabled = true;

        const response = await fetch('/api/alumnos/mi-maestro-info', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success && result.data) {
            document.getElementById('print-maestro').textContent = result.data.nombre || 'Doctor Encargado';
            document.getElementById('print-clinica').textContent = result.data.clinica_ubicacion || 'Clínica Universitaria';
            document.getElementById('print-telefono').textContent = result.data.telefono || '___';
            document.getElementById('print-cedula').textContent = result.data.clinica_cedula || '______';
        } else {
            document.getElementById('print-maestro').textContent = 'Doctor Encargado';
            document.getElementById('print-clinica').textContent = 'Clínica Universitaria';
            document.getElementById('print-telefono').textContent = '___';
            document.getElementById('print-cedula').textContent = '______';
        }

        btnSubmit.innerHTML = textOriginal;
        btnSubmit.disabled = false;
    } catch (error) {
        console.error('Error obteniendo info del maestro:', error);
        document.getElementById('print-maestro').textContent = 'Doctor Encargado';
        document.getElementById('print-clinica').textContent = 'Clínica Universitaria';
        document.getElementById('print-telefono').textContent = '___';
        document.getElementById('print-cedula').textContent = '______';
    }

    // 4. Imprimir y cerrar modal
    window.print();
    cerrarModalReceta();
}

window.abrirModalReceta = abrirModalReceta;
window.cerrarModalReceta = cerrarModalReceta;
window.imprimirReceta = imprimirReceta;
