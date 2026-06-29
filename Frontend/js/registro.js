const apiUrl = '/api/auth/register';

const rolSelect = document.getElementById('rol');
const maestroGroup = document.getElementById('maestro-group');
const maestroSearchInput = document.getElementById('maestro-search');
const maestrosListDatalist = document.getElementById('maestros-list');

let maestrosCargados = [];

rolSelect.addEventListener('change', async () => {
    if (rolSelect.value === '2') {
        maestroGroup.style.display = 'flex';
        maestroSearchInput.required = true;
        await cargarMaestros();
    } else {
        maestroGroup.style.display = 'none';
        maestroSearchInput.required = false;
        maestroSearchInput.value = '';
    }
});

async function cargarMaestros() {
    try {
        const response = await fetch('/api/maestros/todos');
        const result = await response.json();
        if (response.ok && result.success) {
            maestrosCargados = result.data;
            maestrosListDatalist.innerHTML = '';
            maestrosCargados.forEach(maestro => {
                maestrosListDatalist.innerHTML += `<option value="${maestro.Name}"></option>`;
            });
        } else {
            console.error('Error al cargar maestros:', result.message);
        }
    } catch (error) {
        console.error('Error de red al cargar maestros:', error);
    }
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const id_rol = parseInt(rolSelect.value, 10);
    const contraseña = document.getElementById('contraseña').value;
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;
    
    let id_maestro = null;
    if (id_rol === 2) {
        const selectedName = maestroSearchInput.value.trim();
        const selectedTeacher = maestrosCargados.find(m => m.Name.toLowerCase() === selectedName.toLowerCase());
        if (!selectedTeacher) {
            alert('Por favor selecciona un maestro válido de la lista.');
            return;
        }
        id_maestro = selectedTeacher.ID_Matricula;
    }

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
                id_rol,
                id_maestro
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
        alert('No se pudo conectar con el servidor.');
    }
});
