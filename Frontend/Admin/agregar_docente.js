document.getElementById('registro-docente-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre-docente').value.trim();
    const apellido = document.getElementById('apellido-docente').value.trim();
    const matricula = document.getElementById('matricula-docente').value.trim(); 
    const email = document.getElementById('email-docente').value.trim();
    const telefono = document.getElementById('telefono-docente').value.trim();
    const contraseña = document.getElementById('contrasena-docente').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/docentes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre,
                apellido,
                matricula,
                email,
                telefono,
                contraseña
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('¡Docente registrado con éxito!');
            this.reset();
        } else {
            alert(`Error: ${result.message || 'No se pudo registrar el docente.'}`);
        }
    } catch (error) {
        console.error('Error al registrar docente:', error);
        alert('No se pudo conectar con el servidor.');
    }
});
