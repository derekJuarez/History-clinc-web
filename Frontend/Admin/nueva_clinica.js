document.getElementById('registro-clinica-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-clinica').value.trim();
    const encargado = document.getElementById('encargado-clinica').value.trim();
    const ubicacion = document.getElementById('ubicacion-clinica').value.trim();

    try {
        const response = await fetch('/api/clinicas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, encargado, ubicacion })
        });

        const result = await response.json();

        if (response.ok) {
            alert('¡Clínica registrada con éxito!');
            this.reset();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al registrar clínica:', error);
        alert('No se pudo conectar con el servidor.');
    }
});
