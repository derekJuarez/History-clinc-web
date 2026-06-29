document.getElementById('registro-alumno-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-alumno').value.trim();
    const matricula = document.getElementById('matricula-alumno').value.trim();
    const unidad_clinica = document.getElementById('unidad-clinica-alumno').value.trim();

    try {
        const response = await fetch('/api/alumnos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, matricula, unidad_clinica })
        });

        const result = await response.json();

        if (response.ok) {
            alert('¡Alumno registrado con éxito!');
            this.reset();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al registrar alumno:', error);
        alert('No se pudo conectar con el servidor.');
    }
});
