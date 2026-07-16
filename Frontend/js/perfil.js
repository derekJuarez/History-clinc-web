document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const form = document.getElementById('perfil-form');
    const inputMatricula = document.getElementById('profile-matricula');
    const inputNombre = document.getElementById('profile-nombre');
    const inputEmail = document.getElementById('profile-email');
    const inputTelefono = document.getElementById('profile-telefono');
    const inputContrasena = document.getElementById('profile-contrasena');
    const inputConfirmarContrasena = document.getElementById('profile-confirmar-contrasena');

    // Cargar perfil actual
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const user = result.data;
            inputMatricula.value = user.matricula;
            inputNombre.value = user.nombre;
            inputEmail.value = user.email || '';
            inputTelefono.value = user.telefono || '';
            
            if (user.maestro) {
                const cajaMaestro = document.getElementById('caja-maestro');
                const inputMaestro = document.getElementById('profile-maestro');
                if (cajaMaestro && inputMaestro) {
                    cajaMaestro.style.display = 'block';
                    inputMaestro.value = user.maestro;
                }
            }
        } else {
            await alert('No se pudo cargar la información del perfil. Inicie sesión de nuevo.');
            localStorage.clear();
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al intentar conectar con el servidor.');
    }

    // Guardar cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = inputNombre.value.trim();
        const email = inputEmail.value.trim();
        const telefono = inputTelefono.value.trim();
        const contraseña = inputContrasena.value;
        const confirmarContraseña = inputConfirmarContrasena.value;

        // Validar contraseñas si el usuario intenta cambiarla
        if (contraseña || confirmarContraseña) {
            if (contraseña !== confirmarContraseña) {
                alert('Las contraseñas nuevas no coinciden.');
                return;
            }
            if (contraseña.length < 6) {
                alert('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
        }

        try {
            const bodyData = { nombre, email, telefono };
            if (contraseña) {
                bodyData.contraseña = contraseña;
            }

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Actualizar local storage para que el sidebar se actualice
                localStorage.setItem('nombre', nombre);
                
                // Actualizar mensaje de bienvenida del sidebar dinámicamente si existe
                const titleText = document.querySelector('.title-text h2');
                if (titleText) {
                    titleText.textContent = `Bienvenido, ${nombre.split(' ')[0]}`;
                }

                await alert('¡Perfil actualizado con éxito!');
                
                // Limpiar campos de contraseña
                inputContrasena.value = '';
                inputConfirmarContrasena.value = '';
            } else {
                alert(`Error: ${result.message || 'No se pudo actualizar el perfil.'}`);
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert('No se pudo conectar con el servidor para actualizar el perfil.');
        }
    });
});
