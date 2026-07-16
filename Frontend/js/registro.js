const apiUrl = '/api/auth/register';

const matriculaInput = document.getElementById('matricula');
const maestroGroup = document.getElementById('maestro-group');
const maestroSearchInput = document.getElementById('maestro-search');
const maestrosListDatalist = document.getElementById('maestros-list');

let maestrosCargados = [];

// Mostrar u ocultar el selector de maestro según la longitud de la matrícula
matriculaInput.addEventListener('input', async () => {
    const val = matriculaInput.value.trim();
    // 8 caracteres = Alumno -> Mostrar selector de maestro
    if (val.length === 8) {
        maestroGroup.style.display = 'flex';
        maestroSearchInput.required = true;
        if (maestrosCargados.length === 0) {
            await cargarMaestros();
        }
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
    const contraseña = document.getElementById('contraseña').value;
    const confirmarContraseña = document.getElementById('confirmarContraseña').value;

    // Determinar rol basado en la longitud de la matrícula
    let id_rol;
    if (matricula.length === 8) {
        id_rol = 2; // Alumno
    } else if (matricula.length === 10) {
        id_rol = 1; // Maestro
    } else {
        alert('Formato incorrecto: La matrícula debe tener 8 caracteres (Alumnos) o 10 caracteres (Maestros). Los Administradores no pueden registrarse aquí.');
        return;
    }

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
