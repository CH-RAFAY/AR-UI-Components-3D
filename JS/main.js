document.addEventListener('DOMContentLoaded', function() {
    let navTimer;
    let lastInteractionTime = Date.now();

    // Initialize mobile overlay to ensure it's properly set up
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    // Initialize navbar and burger menu based on screen size
    function initializeNavigation() {
        const burgerContainer = document.getElementById('burgerContainer');
        const navbar = document.getElementById('glassmorphicNavbar');
        
        if (window.innerWidth <= 768) {
            // Mobile view
            navbar.classList.add('hidden');
            burgerContainer.classList.add('show');
            burgerContainer.style.opacity = '1';
            burgerContainer.style.pointerEvents = 'auto';
        } else {
            // Desktop view
            navbar.classList.remove('hidden');
            burgerContainer.classList.remove('show');
            if (mobileOverlay.classList.contains('active')) {
                mobileOverlay.classList.remove('active');
                mobileOverlay.style.display = 'none';
                burgerContainer.classList.remove('active');
            }
        }
    }

    // Initialize on page load
    initializeNavigation();
    
    // Show burger menu after 2 seconds of page load (only on larger screens)
    setTimeout(() => {
        if (window.innerWidth > 768) {
            document.getElementById('burgerContainer').classList.add('show');
        }
    }, 2000);
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Smooth scroll to section when clicking nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open - handled by JS-1.js
                if (mobileOverlay && mobileOverlay.classList.contains('active')) {
                    mobileOverlay.classList.remove('active');
                    document.getElementById('burgerContainer').classList.remove('active');
                }

                // Smooth scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });

                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // Handle scroll events for nav highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavOnScroll() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavOnScroll);

    // Initialize section animations
    sections.forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top center+=100',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Handle mobile menu
    const burgerContainer = document.getElementById('burgerContainer');
    // We already defined mobileOverlay at the top
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Mobile nav links are handled by JS-1.js for consistency

    // Mobile menu functions are managed by JS-1.js for better consistency

    // Mobile overlay click handling is managed by JS-1.js for consistency

    // Function to handle navbar interaction
    function handleNavInteraction() {
        // Only handle navbar interactions on larger screens
        if (window.innerWidth <= 768) return;
        
        lastInteractionTime = Date.now();
        const navbar = document.getElementById('glassmorphicNavbar');
        const burgerContainer = document.getElementById('burgerContainer');

        navbar.classList.remove('hidden');
        burgerContainer.classList.remove('show');

        // Clear existing timer
        if (navTimer) clearTimeout(navTimer);

        // Set new timer
        navTimer = setTimeout(() => {
            if (Date.now() - lastInteractionTime >= 2000) {
                navbar.classList.add('hidden');
                burgerContainer.classList.add('show');
            }
        }, 2000);
    }

    // Handle navbar visibility on scroll and interaction
    let lastScrollTop = 0;
    const navbar = document.getElementById('glassmorphicNavbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        handleNavInteraction();

        // Add scrolled class for styling
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });

    // Add interaction listeners to navbar and its elements
    navbar.addEventListener('mouseenter', handleNavInteraction);
    navbar.addEventListener('mousemove', handleNavInteraction);
    navbar.addEventListener('click', handleNavInteraction);

    // Burger menu click handling is now managed by JS-1.js for better mobile/desktop detection
    // This prevents conflicts between different event listeners
    
    // Handle window resize
    window.addEventListener('resize', function() {
        initializeNavigation();
    });
});