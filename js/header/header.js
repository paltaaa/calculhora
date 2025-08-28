// HEADER FUNCTIONALITY CON SOPORTE DE TEMAS

class Header {
    constructor() {
        this.header = document.querySelector('.header');
        this.menuToggle = document.getElementById('menuToggle');
        this.navMobile = document.getElementById('navMobile');
        this.navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');
        this.isScrolled = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupActiveStates();
        this.setupThemeIntegration();
    }

    setupEventListeners() {
        // Toggle mobile menu
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.header && !this.header.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Handle resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        }, 250));
    }

    setupScrollEffect() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollState = () => {
            const currentScrollY = window.scrollY;

            // Add scrolled class for styling
            if (currentScrollY > 50 && !this.isScrolled) {
                this.header?.classList.add('scrolled');
                this.isScrolled = true;
            } else if (currentScrollY <= 50 && this.isScrolled) {
                this.header?.classList.remove('scrolled');
                this.isScrolled = false;
            }

            // Hide/show header on scroll (desktop only)
            if (window.innerWidth > 768) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    this.header.style.transform = 'translateY(-100%)';
                } else {
                    this.header.style.transform = 'translateY(0)';
                }
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollState);
                ticking = true;
            }
        });
    }

    setupActiveStates() {
        // Update active states based on scroll position
        const updateActiveStates = this.debounce(() => {
            this.updateActiveStates();
        }, 100);

        window.addEventListener('scroll', updateActiveStates);
        
        // Set initial active state
        this.updateActiveStates();
    }

    setupThemeIntegration() {
        // Listen for theme changes to update header appearance
        document.addEventListener('themeChange', (e) => {
            this.handleThemeChange(e.detail.theme);
        });

        // Update theme-color meta tag when theme changes
        document.addEventListener('themeChange', (e) => {
            this.updateThemeColorMeta(e.detail.theme);
        });
    }

    handleThemeChange(theme) {
        // Additional header-specific theme handling
        if (theme === 'dark') {
            this.header?.classList.add('dark-theme');
        } else {
            this.header?.classList.remove('dark-theme');
        }

        // Update logo filter for better visibility
        const logoImg = this.header?.querySelector('.logo-img');
        if (logoImg) {
            if (theme === 'dark') {
                logoImg.style.filter = 'brightness(1.1) contrast(1.1)';
            } else {
                logoImg.style.filter = '';
            }
        }
    }

    updateThemeColorMeta(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }

        const themeColor = theme === 'dark' ? '#1e1e1e' : '#f0fdfa';
        themeColorMeta.content = themeColor;
    }

    updateActiveStates() {
        const sections = document.querySelectorAll('.section, [id]');
        const currentPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (sectionId && currentPos >= sectionTop && currentPos < sectionTop + sectionHeight) {
                // Remove active from all links
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active to current section link
                const activeLinks = document.querySelectorAll(`[href="#${sectionId}"], [href*="#${sectionId}"]`);
                activeLinks.forEach(link => {
                    link.classList.add('active');
                });
            }
        });
    }

    toggleMobileMenu() {
        if (!this.menuToggle || !this.navMobile) return;

        const isActive = this.menuToggle.classList.contains('active');
        
        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        if (!this.menuToggle || !this.navMobile) return;

        this.menuToggle.classList.add('active');
        this.navMobile.classList.add('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        // Add aria attributes for accessibility
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.navMobile.setAttribute('aria-hidden', 'false');

        // Focus first navigation item
        const firstNavItem = this.navMobile.querySelector('.nav-mobile-link');
        if (firstNavItem) {
            setTimeout(() => firstNavItem.focus(), 100);
        }
    }

    closeMobileMenu() {
        if (!this.menuToggle || !this.navMobile) return;

        this.menuToggle.classList.remove('active');
        this.navMobile.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Update aria attributes
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.navMobile.setAttribute('aria-hidden', 'true');
    }

    // Smooth scroll to sections with header offset
    smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const headerHeight = this.header?.offsetHeight || 80;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Public methods for external access
    getScrollState() {
        return {
            isScrolled: this.isScrolled,
            scrollY: window.scrollY
        };
    }

    forceUpdateActiveStates() {
        this.updateActiveStates();
    }

    // Utility method for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Method to handle page changes (for SPA navigation)
    updateForPageChange(pageName) {
        // Update active states for different pages
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href && href.includes(pageName)) {
                link.classList.add('active');
            }
        });
    }

    // Method to show/hide header programmatically
    showHeader() {
        if (this.header) {
            this.header.style.transform = 'translateY(0)';
        }
    }

    hideHeader() {
        if (this.header) {
            this.header.style.transform = 'translateY(-100%)';
        }
    }

    // Method to temporarily disable scroll hiding
    disableScrollHiding() {
        this.scrollHidingDisabled = true;
    }

    enableScrollHiding() {
        this.scrollHidingDisabled = false;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.updateActiveStates);
        window.removeEventListener('resize', this.handleResize);
        
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.toggleMobileMenu);
        }

        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}

// Enhanced smooth scroll functionality
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Add smooth scroll to all internal anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                this.scrollToElement(targetElement);
            }
        });
    }

    scrollToElement(element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = element.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Global header instance
let headerInstance;
let smoothScrollInstance;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        headerInstance = new Header();
        smoothScrollInstance = new SmoothScroll();
        
        // Make header instance available globally for debugging
        if (typeof window !== 'undefined') {
            window.HeaderInstance = headerInstance;
        }
        
        console.log('Header initialized successfully');
    } catch (error) {
        console.error('Error initializing header:', error);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - might want to pause some animations
        headerInstance?.disableScrollHiding();
    } else {
        // Page is visible - resume normal behavior
        setTimeout(() => {
            headerInstance?.enableScrollHiding();
            headerInstance?.forceUpdateActiveStates();
        }, 100);
    }
});

// Export for ES6 modules if needed
export { Header, SmoothScroll };