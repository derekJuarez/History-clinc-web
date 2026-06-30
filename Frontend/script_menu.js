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
            <li>
                <a href="#">
                    <i class="ri-file-list-3-fill"></i>
                    Informes
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="#" onclick="logout()" class="logout-btn">
            <i class="ri-logout-box-r-line"></i> Cerrar Sesión
        </a>
    </div>
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
                <a href="nueva_clinica.html">
                    <i class="ri-add-circle-fill"></i>
                    Nueva CLinica
                </a>
            </li>

            <li>
                <a href="#">
                    <i class="ri-file-list-3-fill"></i>
                    Ver historias
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="#" onclick="logout()" class="logout-btn">
            <i class="ri-logout-box-r-line"></i> Cerrar Sesión
        </a>
    </div>
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
                <a href="solicitudes_clinicas.html">
                    <i class="ri-hospital-fill"></i>
                    Solicitudes de Clínicas
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

    <div class="sidebar-footer">
        <a href="#" onclick="logout()" class="logout-btn">
            <i class="ri-logout-box-r-line"></i> Cerrar Sesión
        </a>
    </div>
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
        }

        // Buscamos el nuevo sidebar en el DOM
        const newSidebar = document.getElementById('sidebar');

        if (newSidebar) {
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
    }
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
