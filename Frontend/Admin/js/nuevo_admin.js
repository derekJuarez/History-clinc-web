const apiUrl = '/api/auth/register';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const contraseña = document.getElementById('contraseña').value;
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;

    // Forzar el rol a 4 (Administrador)
    const id_rol = 4;

    // Validar contraseñas
    if (contraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                apellido,
                matricula,
                email,
                telefono,
                contraseña,
                id_rol,
                id_maestro: null // Administradores no tienen maestro asignado
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(`¡Registro de Administrador exitoso! Bienvenido ${nombre}.`);
            window.location.href = 'principal_admin.html';
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch (error) {
        console.error('Error al registrar administrador:', error);
        alert('No se pudo conectar con el servidor.');
    }
});
