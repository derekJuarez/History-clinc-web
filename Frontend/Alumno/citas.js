//Traenos usuario, pacinete y ubicacion desde la base de datos
const urlPacientes = '/api/paciente/todos';
const urlClinicas = '/api/clinicas/';
const urlMaestros = '/api/maestros/todos';

async function obtenerDatos() {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const resPacientes = await fetch(urlPacientes, { headers });
        const resClinicas = await fetch(urlClinicas, { headers });
        const resMaestros = await fetch(urlMaestros, { headers });

        const Pacientes = await resPacientes.json();
        const Clinicas = await resClinicas.json();
        const Maestros = await resMaestros.json();

        // Llenar los select con los datos obtenidos

        const selectPaciente = document.getElementById('paciente');
        Pacientes.data.forEach(p => {
            selectPaciente.innerHTML += `<option value="${p.id_paciente}">${p.nombre}</option>`;
        });

        const selectClinica = document.getElementById('ubicacion');
        Clinicas.data.forEach(c => {
            selectClinica.innerHTML += `<option value="${c.ID_CLINICA}">${c.UBICACION}</option>`;
        });

        const selectMaestro = document.getElementById('docente');
        Maestros.data.forEach(m => {
            selectMaestro.innerHTML += `<option value="${m.ID_Matricula}">${m.Name}</option>`;
        });

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }

}


document.addEventListener('DOMContentLoaded', obtenerDatos);

//Guardar datos de la cita en la base de datos

document.getElementById('FormCitas').addEventListener('submit', async (e) => {
    e.preventDefault();

    //logica para guardar los datos de la cita en la base de datos
    const citaData = new FormData();
    citaData.append('id_estudiante', localStorage.getItem('matricula'));
    citaData.append('fecha', document.getElementById('fecha').value);
    citaData.append('hora', document.getElementById('hora').value);
    citaData.append('motivo', document.getElementById('motivo').value);
    citaData.append('estatus', 'Pendiente');
    citaData.append('id_paciente', document.getElementById('paciente').value);
    citaData.append('id_clinica', document.getElementById('ubicacion').value);
    citaData.append('id_docente', document.getElementById('docente').value);
    citaData.append('nota', document.getElementById('nota').value);

    const inputRadiografia = document.getElementById('input-archivo');

    if(inputRadiografia.files.length > 0) {
        //importante 'archivo_radiografia' debe coincidir con el nombre del campo en el backend
        citaData.append('radiografia', inputRadiografia.files[0]);
    }

    try {
        const token = localStorage.getItem('token');
        // Lo mandamos a la ruta de guardar cita
        const response = await fetch('/api/citas/registrar', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: citaData
        });
        const result = await response.json();
        if (response.ok) {
            alert('¡Cita registrada exitosamente!');
            document.getElementById('FormCitas').reset(); // Limpia el formulario
        } else {
            alert('Error al guardar: ' + result.message);
        }
    } catch (error) {
        console.error('Error al guardar cita:', error);
        alert('Hubo un error al intentar guardar la cita.');
    }
});