// HEADER FUNCTIONALITY

class Header {
    constructor() {
        this.header = document.querySelector('.header');
        this.menuToggle = document.getElementById('menuToggle');
        this.navMobile = document.getElementById('navMobile');
        this.navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupActiveStates();
    }

    setupEventListeners() {
        // Toggle mobile menu
        this.menuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.header.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    setupScrollEffect() {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Add scrolled class for styling
            if (currentScrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Hide/show header on scroll (optional)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    setupActiveStates() {
        // Update active states based on scroll position
        window.addEventListener('scroll', () => {
            this.updateActiveStates();
        });

        // Set initial active state
        this.updateActiveStates();
    }

    updateActiveStates() {
        const sections = document.querySelectorAll('.section');
        const currentPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (currentPos >= sectionTop && currentPos < sectionTop + sectionHeight) {
                // Remove active from all links
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active to current section link
                const activeLinks = document.querySelectorAll(`[href="#${sectionId}"]`);
                activeLinks.forEach(link => {
                    link.classList.add('active');
                });
            }
        });
    }

    toggleMobileMenu() {
        this.menuToggle.classList.toggle('active');
        this.navMobile.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (this.navMobile.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        this.menuToggle.classList.remove('active');
        this.navMobile.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Smooth scroll to sections
    smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = this.header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const header = new Header();

    // Add smooth scroll to all nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            header.smoothScrollTo(targetId);
        });
    });
});

// Utility functions
function debounce(func, wait) {
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

// Performance optimization for scroll events
const optimizedScroll = debounce(() => {
    // Additional scroll optimizations can go here
}, 16);