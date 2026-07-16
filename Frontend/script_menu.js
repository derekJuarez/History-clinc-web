const menuAlumnoHTML = `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="icon">
            <i class="ri-user-fill"></i>
        </div>
        <div class="title-text">
            <h2>Bienvenido</h2>
            <span>Panel de control</span>
        </div>
    </div>

    <div class="menu-label">Menú Principal</div>

    <nav class="sidebar-menu">
        <ul>
            <li>
                <a href="dashboard.html" class="active">
                    <i class="ri-layout-grid-fill"></i>
                    Panel Principal
                </a>
            </li>
            <li>
                <a href="historias.html">
                    <i class="ri-bar-chart-fill"></i>
                    Historial clinico
                </a>
            </li>
            <li class="has-submenu">
                <a href="#" class="submenu-toggle">
                    <i class="ri-group-fill"></i>
                    Paciente
                    <i class="ri-arrow-down-s-line dropdown-icon" style="margin-left: auto; margin-right: 0; font-size: 18px;"></i>
                </a>
                <ul class="submenu">
                    <li><a href="Registro_Paciente.html">Registrar Paciente</a></li>
                    <li><a href="Ver_Pacientes.html">Ver Pacientes</a></li>
                </ul>
            </li>
            <li class="has-submenu">
                <a href="#" class="submenu-toggle">
                    <i class="ri-shopping-cart-fill"></i>
                    Citas
                    <i class="ri-arrow-down-s-line dropdown-icon" style="margin-left: auto; margin-right: 0; font-size: 18px;"></i>
                </a>
                <ul class="submenu">
                    <li><a href="citas.html">Agendar Cita</a></li>
                    <li><a href="ver_citas.html">Calendario de Citas</a></li>
                </ul>
            </li>
        </ul>
    </nav>
</aside>
`;

const menuMaestroHTML = `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="icon">
            <i class="ri-user-fill"></i>
        </div>
        <div class="title-text">
            <h2>Bienvenido</h2>
            <span>Panel de Maestro</span>
        </div>
    </div>

    <div class="menu-label">Menú Principal</div>

    <nav class="sidebar-menu">
        <ul>
            <li>
                <a href="principal_maestro.html">
                    <i class="ri-layout-grid-fill"></i>
                    Panel Principal
                </a>
            </li>
            <li>
                <a href="conteo_pacientes.html">
                    <i class="ri-bar-chart-box-fill"></i>
                    Conteo de pacientes
                </a>
            </li>
            <li>
                <a href="lista_alumnos.html">
                    <i class="ri-list-check-2"></i>
                    Lista de alumnos
                </a>
            </li>
            <li>
                <a href="agregar_alumno.html">
                    <i class="ri-user-add-fill"></i>
                    Agregar Alumno
                </a>
            </li>
            <li>
                <a href="nueva_clinica.html">
                    <i class="ri-add-circle-fill"></i>
                    Nueva Clínica
                </a>
            </li>
            <li>
                <a href="historias_maestro.html">
                    <i class="ri-file-list-3-fill"></i>
                    Ver historias
                </a>
            </li>
        </ul>
    </nav>
</aside>
`;

const menuAdminHTML = `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="icon">
            <i class="ri-user-fill"></i>
        </div>
        <div class="title-text">
            <h2>Bienvenido</h2>
            <span>Panel de Admin</span>
        </div>
    </div>

    <div class="menu-label">Menú Principal</div>

    <nav class="sidebar-menu">
        <ul>
            <li>
                <a href="principal_admin.html">
                    <i class="ri-bar-chart-box-fill"></i>
                    Panel Principal
                </a>
            </li>
            <li>
                <a href="agregar_docente.html">
                    <i class="ri-user-add-fill"></i>
                    Agregar Docente
                </a>
            </li>
            <li>
                <a href="lista_docentes.html">
                    <i class="ri-list-check-2"></i>
                    Lista de Docentes
                </a>
            </li>
            <li>
                <a href="nueva_clinica.html">
                    <i class="ri-add-circle-fill"></i>
                    Nueva Clínica
                </a>
            </li>
            <li>
                <a href="solicitudes_clinicas.html">
                    <i class="ri-hospital-fill"></i>
                    Solicitudes de Clínicas
                </a>
            </li>
            <li>
                <a href="solicitudes_asesor.html">
                    <i class="ri-user-shared-fill"></i>
                    Solicitudes de Asesor
                </a>
            </li>
            <li>
                <a href="lista_clinicas.html">
                    <i class="ri-hospital-line"></i>
                    Ver clínicas
                </a>
            </li>
        </ul>
    </nav>
</aside>
`;


document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('sidebar-container');

    if (container) {
        // Obtenemos qué menú cargar según el atributo data-menu
        const menuType = container.getAttribute('data-menu');

        // Inyectamos el HTML correspondiente directamente (sin usar fetch)
        if (menuType === 'alumno') {
            container.outerHTML = menuAlumnoHTML;
        } else if (menuType === 'maestro') {
            container.outerHTML = menuMaestroHTML;
        } else if (menuType === 'admin') {
            container.outerHTML = menuAdminHTML;
        } else {
            console.error('Tipo de menú no reconocido:', menuType);
        }

        // Buscamos el nuevo sidebar en el DOM
        const newSidebar = document.getElementById('sidebar');

        if (newSidebar) {
            // Personalizar el mensaje de bienvenida con el nombre del usuario
            const userName = localStorage.getItem('nombre');
            if (userName) {
                const titleText = newSidebar.querySelector('.title-text h2');
                if (titleText) {
                    titleText.textContent = `Bienvenido, ${userName.split(' ')[0]}`;
                }
            }

            // Lógica para los submenús
            const submenuToggles = newSidebar.querySelectorAll('.submenu-toggle');
            submenuToggles.forEach(toggle => {
                toggle.addEventListener('click', function (e) {
                    e.preventDefault();
                    const parentLi = this.parentElement;
                    parentLi.classList.toggle('active');
                });
            });

            // Resaltar la página actual automáticamente
            const currentUrl = window.location.pathname.split('/').pop();
            const links = newSidebar.querySelectorAll('a');

            links.forEach(link => {
                link.classList.remove('active');

                const href = link.getAttribute('href');
                if (href === currentUrl || (currentUrl === '' && href === 'dashboard.html')) {
                    link.classList.add('active');
                    // Abrir submenú padre si es necesario
                    const parentSubmenu = link.closest('.submenu');
                    if (parentSubmenu) {
                        parentSubmenu.parentElement.classList.add('active');
                    }
                }
            });

            // ========== RESPONSIVE: Botón hamburguesa y overlay para móvil ==========
            setupMobileToggle(newSidebar);
        }
        
        // ========== INYECTAR BOTONES EN TOP HEADER ==========
        const topHeader = document.querySelector('.top-header');
        if (topHeader) {
            topHeader.style.display = 'flex';
            topHeader.style.justifyContent = 'space-between';
            topHeader.style.alignItems = 'center';
            topHeader.style.background = '#0b1a30'; // Solid color same as sidebar
            topHeader.style.borderBottom = 'none';
            topHeader.style.position = 'relative';

            // Badge UMSNH para movil
            const mobileBadge = document.createElement('div');
            mobileBadge.className = 'mobile-umsnh-badge';
            mobileBadge.textContent = 'UMSNH';
            topHeader.appendChild(mobileBadge);

            // Logo central en el header
            const headerLogo = document.createElement('div');
            headerLogo.className = 'header-center-logo';
            headerLogo.innerHTML = '<img src="../Image/logo-umsnh.png" alt="Logo UMSNH">';
            topHeader.appendChild(headerLogo);

            // Contenedor para las acciones del usuario
            const userActions = document.createElement('div');
            userActions.className = 'top-header-actions';
            userActions.style.display = 'flex';
            userActions.style.gap = '15px';
            userActions.style.marginLeft = 'auto'; // Empuja a la derecha si hay otros elementos

            // Botón de perfil
            const profileBtn = document.createElement('a');
            profileBtn.href = 'perfil.html';
            profileBtn.className = 'top-header-btn profile-btn';
            profileBtn.innerHTML = '<i class="ri-user-settings-line"></i> Mi Perfil';
            
            // Botón de cerrar sesión
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'top-header-btn logout-header-btn';
            logoutBtn.innerHTML = '<i class="ri-logout-box-r-line"></i> Cerrar Sesión';
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };

            // Botón de ocultar/mostrar dashboard
            const toggleDashboardBtn = document.createElement('button');
            toggleDashboardBtn.className = 'top-header-btn toggle-dashboard-btn';
            toggleDashboardBtn.innerHTML = '<i class="ri-eye-off-line"></i> Ocultar Módulos';
            toggleDashboardBtn.onclick = function(e) {
                e.preventDefault();
                const cardsContainer = document.querySelector('.admin-cards-container');
                const welcomeSection = document.querySelector('.welcome-section');
                
                if (cardsContainer) {
                    if (cardsContainer.style.display === 'none') {
                        cardsContainer.style.display = ''; // Restore grid
                        if (welcomeSection) welcomeSection.style.display = '';
                        this.innerHTML = '<i class="ri-eye-off-line"></i> Ocultar Módulos';
                    } else {
                        cardsContainer.style.display = 'none';
                        if (welcomeSection) welcomeSection.style.display = 'none';
                        this.innerHTML = '<i class="ri-eye-line"></i> Mostrar Módulos';
                    }
                }
            };

            userActions.appendChild(toggleDashboardBtn);
            userActions.appendChild(profileBtn);
            userActions.appendChild(logoutBtn);
            
            topHeader.appendChild(userActions);
        }
    }

    // ========== FONDO DE LA PÁGINA (ESTABLECIDO EN CSS) ==========
    // El fondo de la página ahora se maneja desde css/alumno.css en la etiqueta body.
});

/**
 * Configura el botón hamburguesa y overlay para pantallas pequeñas.
 * Se inyecta dinámicamente un botón de menú y un overlay oscuro.
 */
function setupMobileToggle(sidebar) {
    // Crear botón hamburguesa
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle-btn';
    toggleBtn.id = 'sidebar-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Abrir menú');
    toggleBtn.innerHTML = '<i class="ri-menu-line"></i>';
    document.body.appendChild(toggleBtn);

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Función para abrir sidebar
    function openSidebar() {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        toggleBtn.innerHTML = '<i class="ri-close-line"></i>';
        toggleBtn.setAttribute('aria-label', 'Cerrar menú');
    }

    // Función para cerrar sidebar
    function closeSidebar() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        toggleBtn.innerHTML = '<i class="ri-menu-line"></i>';
        toggleBtn.setAttribute('aria-label', 'Abrir menú');
    }

    // Evento: click en hamburguesa
    toggleBtn.addEventListener('click', function () {
        if (sidebar.classList.contains('mobile-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Evento: click en overlay cierra sidebar
    overlay.addEventListener('click', closeSidebar);

    // Evento: cerrar sidebar al hacer click en un enlace del menú (en móvil)
    sidebar.querySelectorAll('a:not(.submenu-toggle)').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Cerrar sidebar si se redimensiona a desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
}

// Función de logout global
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirige a la página de inicio (Registro/Login)
}
