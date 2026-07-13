const apiUrl = '/api/auth/register';

const rolSelect = document.getElementById('rol');
const maestroGroup = document.getElementById('maestro-group');
const maestroSearchInput = document.getElementById('maestro-search');
const maestrosListDatalist = document.getElementById('maestros-list');

let maestrosCargados = [];

// Mostrar u ocultar el selector de maestro según el rol elegido
rolSelect.addEventListener('change', async () => {
    // Rol 2 = Alumno
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

// Carga la lista de maestros desde el backend
async function cargarMaestros() {
    try {
        const response = await fetch('/api/maestros/todos');
        const result = await response.json();

        if (response.ok && result.success) {
            maestrosCargados = result.data;
            maestrosListDatalist.innerHTML = '';
            maestrosCargados.forEach(maestro => {
                const name = maestro.Nombre || maestro.Name || maestro.NAME || '';
                const option = document.createElement('option');
                option.value = name;
                maestrosListDatalist.appendChild(option);
            });
        } else {
            console.error('Error al cargar maestros:', result.message);
        }
    } catch (error) {
        console.error('Error de red al cargar maestros:', error);
    }
}

// Maneja el envío del formulario de registro
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

    // Validar contraseñas
    if (contraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Si es alumno, buscar el maestro seleccionado
    let id_maestro = null;
    if (id_rol === 2) {
        const selectedName = maestroSearchInput.value.trim();
        const selectedTeacher = maestrosCargados.find(m => {
            const name = m.Nombre || m.Name || m.NAME || '';
            return name.toLowerCase() === selectedName.toLowerCase();
        });
        if (!selectedTeacher) {
            alert('Por favor selecciona un maestro válido de la lista.');
            return;
        }
        id_maestro = selectedTeacher.ID_Matricula || selectedTeacher.ID_MATRICULA;
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
