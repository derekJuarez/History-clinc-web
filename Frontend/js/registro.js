const apiUrl = 'http://localhost:3001/api/auth/register';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const contraseña = document.getElementById('contraseña').value;
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;

    // Validar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                apellido,
                matricula,
                email,
                telefono,
                contraseña,
                id_rol: 2  // Rol por defecto: Alumno (2). Maestro = 1
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(`¡Registro exitoso! Bienvenido ${nombre}. Ahora puedes iniciar sesión.`);
            window.location.href = 'login.html';
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch (error) {
        console.error('Error al registrar:', error);
        alert('No se pudo conectar con el servidor. ¿Está corriendo?');
    }
});
