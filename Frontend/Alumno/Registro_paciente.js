
document.getElementById('registroPacienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const pacienteData = {
        curp: document.getElementById('curp').value,
        nombre: document.getElementById('name').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('correo').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        sexo: document.getElementById('sexo').value,
        estado_civil: document.getElementById('estado_civil').value,
        ocupacion: document.getElementById('ocupacion').value,
        residencia: document.getElementById('residencia').value,
        tel_emergencia: document.getElementById('tel_emergencia').value,
        contacto_familiar: document.getElementById('contacto_familiar').value,
        id_estudiante: localStorage.getItem('matricula') // Obtener la matrícula del estudiante desde el almacenamiento local
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch("/api/paciente/registrar", {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pacienteData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Paciente registrado exitosamente');
            document.getElementById('registroPacienteForm').reset();
        }
    } catch (error) {
        console.error('Error al registrar paciente:', error);
        alert('Error al registrar paciente');
    }
});