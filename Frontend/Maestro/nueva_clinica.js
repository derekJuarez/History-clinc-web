document.getElementById('registro-clinica-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-clinica').value.trim();
    const encargado = document.getElementById('encargado-clinica').value.trim();

    // Combinar los campos de ubicación en un solo string
    const calle = document.getElementById('calle-clinica').value.trim();
    const colonia = document.getElementById('colonia-clinica').value.trim();
    const numeroCp = document.getElementById('numero-cp-clinica').value.trim();
    const ubicacion = `${calle}, Col. ${colonia}, ${numeroCp}`;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clinicas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, encargado, ubicacion })
        });

        const result = await response.json();

        if (response.ok) {
            alert('¡Solicitud de clínica enviada al administrador para su revisión!');
            this.reset();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al registrar clínica:', error);
        alert('No se pudo conectar con el servidor.');
    }
});

