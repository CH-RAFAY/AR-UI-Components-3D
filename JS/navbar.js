// Navbar Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const navbarContainer = document.querySelector('.navbar-container');
    const navbar = document.getElementById('navbar');
    let lastWidth = window.innerWidth;
    let lastScrollTop = 0;
    let navbarVisible = window.innerWidth <= 650 ? true : false; // Start with navbar visible on mobile
    
    // Debounce function to prevent excessive function calls
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Check if we're on mobile or desktop
    function isMobile() {
        return window.innerWidth <= 650;
    }
    
    // Toggle menu function
    function toggleMenu(e) {
        if (e) e.preventDefault();
        
        if (isMobile()) {
            // On mobile, show/hide the full-screen overlay
            const isMenuOpen = hamburgerBtn.classList.contains('active');
            
            if (isMenuOpen) {
                // Close menu - transform to hamburger
                hamburgerBtn.classList.remove('active');
                menuOverlay.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            } else {
                // Open menu - transform to cross
                hamburgerBtn.classList.add('active');
                menuOverlay.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.classList.add('menu-open');
            }
            
            // Add staggered animation to menu items and logo
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .menu-link');
            const mobileNavLogo = document.querySelector('.mobile-nav-logo, .menu-brand');
            
            if (!isMenuOpen) {
                // Opening menu - animate in
                if (mobileNavLogo) {
                    setTimeout(() => {
                        mobileNavLogo.style.opacity = '1';
                        mobileNavLogo.style.transform = 'translateY(0)';
                    }, 50);
                }
                
                mobileNavLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, 100 * (index + 1));
                });
            } else {
                // Closing menu - animate out
                if (mobileNavLogo) {
                    mobileNavLogo.style.opacity = '0';
                    mobileNavLogo.style.transform = 'translateY(20px)';
                }
                
                mobileNavLinks.forEach(link => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateY(20px)';
                });
            }
        } else {
            // On desktop, show/hide the horizontal navbar
            if (!navbarVisible) {
                // Show navbar
                hamburgerBtn.classList.add('active');
                navbarContainer.classList.add('active');
                navbarVisible = true;
            } else {
                // Hide navbar
                hamburgerBtn.classList.remove('active');
                navbarContainer.classList.remove('active');
                navbarVisible = false;
            }
        }
    }
    
    // Hamburger button click event (for both mobile and desktop)
    hamburgerBtn.addEventListener('click', toggleMenu);

    // New left hamburger button for mobile only (support multiple on all pages)
    const leftHamburgerBtns = document.querySelectorAll('.left-hamburger-btn');
    leftHamburgerBtns.forEach(leftHamburgerBtn => {
        leftHamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            leftHamburgerBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            // Animate mobile nav links and logo
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            const mobileNavLogo = document.querySelector('.mobile-nav-logo');
            if (mobileOverlay.classList.contains('active')) {
                if (mobileNavLogo) {
                    setTimeout(() => {
                        mobileNavLogo.style.opacity = '1';
                        mobileNavLogo.style.transform = 'translateY(0)';
                    }, 50);
                }
                mobileNavLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, 100 * (index + 1));
                });
            } else {
                if (mobileNavLogo) {
                    mobileNavLogo.style.opacity = '0';
                    mobileNavLogo.style.transform = 'translateY(20px)';
                }
                mobileNavLinks.forEach(link => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateY(20px)';
                });
            }
        });
    });
    
    // Close menu when clicking on overlay (mobile only)
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function(e) {
            if (e.target === mobileOverlay) {
                hamburgerBtn.classList.remove('active');
                mobileOverlay.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                
                // Reset mobile nav links and logo
                const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .menu-link');
                const mobileNavLogo = document.querySelector('.mobile-nav-logo, .menu-brand');
                
                if (mobileNavLogo) {
                    mobileNavLogo.style.opacity = '0';
                    mobileNavLogo.style.transform = 'translateY(20px)';
                }
                
                mobileNavLinks.forEach(link => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateY(20px)';
                });
            }
        });
    }
    
    // Close menu when clicking on menu overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                hamburgerBtn.classList.remove('active');
                menuOverlay.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
    
    // Close menu when clicking on menu links
    const menuLinks = document.querySelectorAll('.menu-link, .navbar-link, .mobile-nav-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (isMobile()) {
                hamburgerBtn.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                
                // Reset mobile nav links
                const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .menu-link');
                const mobileNavLogo = document.querySelector('.mobile-nav-logo, .menu-brand');
                
                if (mobileNavLogo) {
                    mobileNavLogo.style.opacity = '0';
                    mobileNavLogo.style.transform = 'translateY(20px)';
                }
                
                mobileNavLinks.forEach(link => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateY(20px)';
                });
            }
        });
    });
    
    // Set active class based on current page
    const currentPath = window.location.pathname;
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Dot navbar logic for mobile
    const dotNavbar = document.getElementById('dotNavbar');
    if (dotNavbar) {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const dots = dotNavbar.querySelectorAll('.dot-nav-dot');
        dots.forEach(dot => {
            if (dot.getAttribute('data-page') === page) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        // Navigation is handled by <a> href, so no extra JS needed for click
    }
    
    // Handle window resize with debounce
    window.addEventListener('resize', debounce(function() {
        // Only take action if width changed (not on height change or scroll)
        if (lastWidth !== window.innerWidth) {
            lastWidth = window.innerWidth;
            
            if (isMobile()) {
                // On mobile, hide navbar container and handle overlay
                if (!hamburgerBtn.classList.contains('active')) {
                    if (mobileOverlay) mobileOverlay.classList.remove('active');
                    menuOverlay.classList.remove('active');
                }
            } else {
                // On desktop, hide overlay
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                menuOverlay.classList.remove('active');
                
                // Reset mobile nav links
                const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .menu-link');
                const mobileNavLogo = document.querySelector('.mobile-nav-logo, .menu-brand');
                
                if (mobileNavLogo) {
                    mobileNavLogo.style.opacity = '0';
                    mobileNavLogo.style.transform = 'translateY(20px)';
                }
                
                mobileNavLinks.forEach(link => {
                    link.style.opacity = '0';
                    link.style.transform = 'translateY(20px)';
                });
            }
        }
    }, 250));
    
    // Prevent touchmove events from refreshing on small movements
    document.addEventListener('touchmove', function(e) {
        if (mobileOverlay.classList.contains('active')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle navbar show/hide on scroll for all screen sizes
    window.addEventListener('scroll', debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide navbar when mobile menu is open
        if ((mobileOverlay && mobileOverlay.classList.contains('active')) || 
            menuOverlay.classList.contains('active')) {
            return;
        }
        
        // Only hide navbar on scroll if it's currently visible
        if (navbarVisible && !hamburgerBtn.classList.contains('active')) {
            // Hide navbar when scrolling down
            if (scrollTop > lastScrollTop && scrollTop > 50) {
                navbarContainer.classList.remove('active');
                navbarVisible = false;
                hamburgerBtn.classList.remove('active');
            }
        }
        
        lastScrollTop = scrollTop;
    }, 100));
    
    // Initialize navbar state based on device
    if (isMobile()) {
        // On mobile, ensure navbar and hamburger button are visible
        navbar.classList.remove('hidden');
        navbar.style.opacity = '1';
        navbar.style.visibility = 'visible';
        navbar.style.transform = 'translateY(0)';
        
        // Make hamburger button visible
        hamburgerBtn.style.display = 'flex';
        hamburgerBtn.style.opacity = '1';
        hamburgerBtn.style.visibility = 'visible';
    } else {
        // On desktop, hide navbar container by default
        navbarContainer.classList.remove('active');
        navbar.classList.remove('hidden');
    }
});

// Add close button functionality for mobile overlay
document.addEventListener('DOMContentLoaded', function() {
    var mobileCloseBtn = document.getElementById('mobileCloseBtn');
    var mobileOverlay = document.getElementById('mobileOverlay');
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    var menuOverlay = document.getElementById('menuOverlay');
    if (mobileCloseBtn && mobileOverlay) {
        mobileCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileOverlay.classList.remove('active');
            if (hamburgerBtn) hamburgerBtn.classList.remove('active'); // Ensure hamburger returns to hamburger icon
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    }
    // Active link styling for mobile nav
    var currentPath = window.location.pathname;
    var mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});