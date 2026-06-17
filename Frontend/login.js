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

    const { data } = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);

        if (data.rol === 1) {
            window.location.href = 'Maestro/principal_maestro.html';
        } else if (data.rol === 2) {
            window.location.href = 'Alumno/dashboard.html';
        } else {
            alert('Rol desconocido');
        }
    } 
});
