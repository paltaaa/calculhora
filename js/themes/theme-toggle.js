// SISTEMA DE CAMBIO DE TEMA - MODO CLARO/OSCURO

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeKey = 'calculhora-theme';
        this.toggleButton = null;
        this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.createToggleButton();
        this.setupEventListeners();
        this.watchSystemPreference();
        
        // Aplicar tema inicial
        this.applyTheme(this.currentTheme, false);
    }

    // Cargar tema guardado o detectar preferencia del sistema
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Si no hay tema guardado, usar preferencia del sistema
            this.currentTheme = this.prefersDark.matches ? 'dark' : 'light';
        }
    }

    // Crear botón de toggle de tema
    createToggleButton() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Cambiar tema');
        themeToggle.setAttribute('title', 'Cambiar entre modo claro y oscuro');
        
        themeToggle.innerHTML = `
            <span class="theme-icon sun-icon">☀️</span>
            <div class="theme-toggle-switch">
                ${this.currentTheme === 'dark' ? '🌙' : '☀️'}
            </div>
            <span class="theme-icon moon-icon">🌙</span>
        `;

        // Insertar el botón en el header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            // Insertar antes del botón primario
            const primaryBtn = headerActions.querySelector('.btn-primary');
            if (primaryBtn) {
                headerActions.insertBefore(themeToggle, primaryBtn);
            } else {
                headerActions.appendChild(themeToggle);
            }
        }

        this.toggleButton = themeToggle;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Click en botón de toggle
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Atajo de teclado (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
                this.showThemeNotification();
            }
        });

        // Escuchar cambios en el localStorage (para sincronizar entre pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === this.themeKey && e.newValue !== this.currentTheme) {
                this.currentTheme = e.newValue;
                this.applyTheme(this.currentTheme, false);
                this.updateToggleButton();
            }
        });
    }

    // Escuchar cambios en la preferencia del sistema
    watchSystemPreference() {
        this.prefersDark.addEventListener('change', (e) => {
            // Solo cambiar si no hay tema guardado específicamente
            const savedTheme = localStorage.getItem(this.themeKey);
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.currentTheme = newTheme;
                this.applyTheme(newTheme, true);
                this.updateToggleButton();
            }
        });
    }

    // Alternar entre temas
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Establecer tema específico
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Tema inválido. Use "light" o "dark".');
            return;
        }

        this.currentTheme = theme;
        this.applyTheme(theme, true);
        this.saveTheme(theme);
        this.updateToggleButton();
        
        // Disparar evento personalizado
        this.dispatchThemeChange(theme);
    }

    // Aplicar tema al DOM
    applyTheme(theme, animate = true) {
        const html = document.documentElement;
        
        if (animate) {
            html.classList.add('theme-transitioning');
        }

        // Aplicar o quitar atributo de tema
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }

        // Actualizar meta theme-color para dispositivos móviles
        this.updateThemeColor(theme);

        if (animate) {
            // Remover clase de transición después de la animación
            setTimeout(() => {
                html.classList.remove('theme-transitioning');
            }, 300);
        }
    }

    // Actualizar color del tema para móviles
    updateThemeColor(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }

        const themeColor = theme === 'dark' ? '#1e1e1e' : '#f0fdfa';
        themeColorMeta.content = themeColor;
    }

    // Guardar tema en localStorage
    saveTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
    }

    // Actualizar botón de toggle
    updateToggleButton() {
        if (!this.toggleButton) return;

        const switchElement = this.toggleButton.querySelector('.theme-toggle-switch');
        if (switchElement) {
            switchElement.innerHTML = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }

        // Actualizar título del botón
        const newTitle = `Cambiar a modo ${this.currentTheme === 'dark' ? 'claro' : 'oscuro'}`;
        this.toggleButton.setAttribute('title', newTitle);
    }

    // Mostrar notificación de cambio de tema
    showThemeNotification() {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <span>${this.currentTheme === 'dark' ? '🌙' : '☀️'}</span>
            Modo ${this.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado
        `;

        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });

        document.body.appendChild(notification);

        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Remover después de 2 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Disparar evento personalizado de cambio de tema
    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChange', {
            detail: {
                theme: theme,
                previousTheme: theme === 'dark' ? 'light' : 'dark'
            }
        });
        
        document.dispatchEvent(event);
    }

    // Métodos públicos para acceso externo
    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    isLightMode() {
        return this.currentTheme === 'light';
    }

    // Detectar si el usuario prefiere modo oscuro
    prefersSystemDark() {
        return this.prefersDark.matches;
    }

    // Resetear al tema del sistema
    resetToSystemTheme() {
        localStorage.removeItem(this.themeKey);
        const systemTheme = this.prefersDark.matches ? 'dark' : 'light';
        this.setTheme(systemTheme);
    }
}

// Utilidades adicionales para el tema
const ThemeUtils = {
    // Obtener valor de variable CSS actual
    getCSSVar(varName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName).trim();
    },

    // Establecer variable CSS dinámicamente
    setCSSVar(varName, value) {
        document.documentElement.style.setProperty(varName, value);
    },

    // Detectar si un color es claro u oscuro
    isColorLight(color) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return false;
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128;
    },

    // Convertir hex a RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Obtener contraste apropiado para un color
    getContrastColor(backgroundColor) {
        return this.isColorLight(backgroundColor) ? '#000000' : '#ffffff';
    }
};

// Inicialización global
let themeManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // Hacer disponible globalmente para depuración
    window.ThemeManager = themeManager;
    window.ThemeUtils = ThemeUtils;
});

// Escuchar evento de cambio de tema para funcionalidades adicionales
document.addEventListener('themeChange', (e) => {
    console.log(`Tema cambiado a: ${e.detail.theme}`);
    
    // Aquí puedes agregar lógica adicional cuando cambie el tema
    // Por ejemplo: actualizar gráficos, mapas, etc.
});

// Función de acceso rápido
function toggleTheme() {
    if (window.themeManager) {
        window.themeManager.toggleTheme();
    }
}

// Exportar para módulos ES6 si es necesario
export { ThemeManager, ThemeUtils, toggleTheme };