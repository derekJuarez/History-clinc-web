const apiUrl = '/api/auth/login';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const matricula = document.getElementById("matricula").value;
    const contraseña = document.getElementById("contraseña").value;

    const response = await
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matricula, contraseña }),
        });

    const result = await response.json();
    const errorContainer = document.getElementById("error-message");

    if (response.ok) {
        // Ocultar mensaje de error si existía
        errorContainer.style.display = "none";
        
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('matricula', result.data.matricula);

        if (result.data.rol === 1) {
            window.location.href = 'Maestro/principal_maestro.html';
        } else if (result.data.rol === 2) {
            window.location.href = 'Alumno/dashboard.html';
        } else {
            errorContainer.textContent = 'Rol desconocido';
            errorContainer.style.display = "block";
        }
    } else {
        // Si hay error (contraseña incorrecta, no encontrado, validación)
        errorContainer.textContent = result.message || "Error al iniciar sesión";
        errorContainer.style.display = "block";
    }
});
