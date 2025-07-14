// ENHANCED NAVBAR WITH SMART SCROLL & AUTO-MINIMIZE FUNCTIONALITY
// Variables
let lastScrollTop = 0;
let isScrolling = false;
let navbarExpanded = true;
let autoMinimizeTimer = null;
const mobileOverlay = document.getElementById('mobileOverlay');

// Check if device is desktop/big screen (for smart scroll behavior)
function isDesktop() {
    return window.innerWidth > 768;
}

// Check if device is mobile/tablet
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// ENHANCED: Multi-page navigation function
function navigateToPage(section) {
    const pageUrls = {
        'introduction': './index.html',
        'expertise': './Page-2.html',
        'projects': './Page-3.html',
        'certificates': './Page-4.html'
    };
    
    if (pageUrls[section]) {
        // Add loading effect
        document.body.style.opacity = '0.7';
        setTimeout(() => {
            window.location.href = pageUrls[section];
        }, 200);
    }
}

// NEW: Smart show/hide navbar functions for scroll behavior
function showNavbar() {
    if (!navbarExpanded && isDesktop()) {
        // expandNavbar(); // This line is removed as per the edit hint
    } else {
        // navbar.classList.remove('hidden'); // This line is removed as per the edit hint
    }
    
    // Reset auto-minimize timer when navbar is shown
    resetAutoMinimizeTimer();
}

function hideNavbar() {
    if (isDesktop()) {
        // navbar.classList.add('hidden'); // This line is removed as per the edit hint
    }
}

// NEW: Auto-minimize timer management
function resetAutoMinimizeTimer() {
    if (autoMinimizeTimer) {
        clearTimeout(autoMinimizeTimer);
    }
    
    // Only set timer for desktop screens when navbar is expanded
    if (navbarExpanded && isDesktop()) {
        autoMinimizeTimer = setTimeout(() => {
            // rollUpNavbar(); // This line is removed as per the edit hint
        }, 2000);
    }
}

// ENHANCED: Initial page load behavior - Show navbar for 2 seconds then rollup
window.addEventListener('load', () => {
    // Ensure navbar is visible initially
    // navbar.style.transform = 'translateY(0)'; // This line is removed as per the edit hint
    // navbar.style.opacity = '1'; // This line is removed as per the edit hint
    
    // Auto-rollup after 2 seconds only on desktop
    if (isDesktop()) {
        setTimeout(() => {
            // rollUpNavbar(); // This line is removed as per the edit hint
        }, 2000);
    }
});

// NEW: Enhanced scroll behavior with smart hide/show
window.addEventListener('scroll', () => {
    // Only apply scroll behavior on desktop screens
    if (!isDesktop()) return;

    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class for styling
            // navbar.classList.add('scrolled'); // This line is removed as per the edit hint
            // navbar.classList.remove('scrolled'); // This line is removed as per the edit hint
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide navbar
                hideNavbar();
            } else if (scrollTop < lastScrollTop || scrollTop <= 100) {
                // Scrolling up or at top - show navbar
                showNavbar();
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// NEW: Reset timer on user interaction to keep navbar visible
['mousemove', 'keydown', 'click', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
        if (navbarExpanded && isDesktop()) {
            resetAutoMinimizeTimer();
        }
    });
});

// IMPROVED: Smart burger menu toggle functionality
// burgerContainer.addEventListener('click', (e) => { // This line is removed as per the edit hint
//     e.stopPropagation();
//     if (isMobileDevice()) {
//         // Mobile: Toggle burger animation and show overlay
//         burgerContainer.classList.toggle('active');
//         if (burgerContainer.classList.contains('active')) {
//             openMobileMenu();
//         } else {
//             closeMobileMenu();
//         }
//     } else {
//         // Desktop/Laptop: Toggle navbar
//         if (navbarExpanded) {
//             rollUpNavbar();
//         } else {
//             expandNavbar();
//         }
//     }
// });

// Fixed navigation link functionality
function setActiveLink(clickedLink, allLinks) {
    allLinks.forEach(link => link.classList.remove('active'));
    clickedLink.classList.add('active');
}

// Desktop navigation links - maintains existing functionality
// navLinks.forEach((link, index) => { // This line is removed as per the edit hint
//     link.addEventListener('click', (e) => {
//         e.preventDefault();
//         setActiveLink(link, navLinks);
        
//         // Also update mobile nav
//         if (mobileNavLinks[index]) {
//             setActiveLink(mobileNavLinks[index], mobileNavLinks);
//         }
        
//         // Navigate to page
//         const section = link.getAttribute('data-section');
//         if (section) {
//             navigateToPage(section);
//         }
//     });
// });

// Mobile navigation links - maintains existing functionality
// mobileNavLinks.forEach((link, index) => { // This line is removed as per the edit hint
//     link.addEventListener('click', (e) => {
//         e.preventDefault();
//         setActiveLink(link, mobileNavLinks);
        
//         // Also update desktop nav
//         if (navLinks[index]) {
//             setActiveLink(navLinks[index], navLinks);
//         }
        
//         // Close mobile menu
//         closeMobileMenu();
        
//         // Navigate to page
//         const section = link.getAttribute('data-section');
//         if (section) {
//             navigateToPage(section);
//         }
//     });
// });

// Enhanced mobile menu functions
function openMobileMenu() {
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileOverlay.classList.remove('active');
    // burgerContainer.classList.remove('active'); // This line is removed as per the edit hint
    document.body.style.overflow = '';
}

// Close mobile menu when clicking overlay background
mobileOverlay.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) {
        closeMobileMenu();
    }
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Handle window resize to adjust behavior
window.addEventListener('resize', () => {
    // Close mobile menu if window is resized to desktop
    if (!isMobileDevice() && mobileOverlay.classList.contains('active')) {
        closeMobileMenu();
    }
    
    // Reset behavior based on new screen size
    if (!isDesktop() && autoMinimizeTimer) {
        clearTimeout(autoMinimizeTimer);
        autoMinimizeTimer = null;
    }
});

// Set first nav item as active by default
// if (navLinks.length > 0) { // This line is removed as per the edit hint
//     navLinks[0].classList.add('active');
// }
// if (mobileNavLinks.length > 0) { // This line is removed as per the edit hint
//     mobileNavLinks[0].classList.add('active');
// }

// BorderBeam Class for Animated Buttons - maintains existing functionality
class BorderBeam {
    constructor(element, options = {}) {
        this.element = element;
        this.angle = 0;
        this.speed = options.speed || 0.8;
        this.isAnimating = true;
        this.init();
    }
    
    init() {
        this.startAnimation();
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        this.angle = (this.angle + this.speed) % 360;
        this.element.style.setProperty('--angle', `${this.angle}deg`);
        
        requestAnimationFrame(() => this.animate());
    }
    
    stop() {
        this.isAnimating = false;
    }
    
    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }
    
    toggle() {
        if (this.isAnimating) {
            this.stop();
        } else {
            this.startAnimation();
        }
    }
}

// 3D Globe Code - maintains existing functionality
gsap.registerPlugin(ScrollTrigger);
let scene, camera, renderer, globeGroup, infoLights = [];
let globeAnimationStarted = false;

function init3DGlobe() {
    const container = document.getElementById('globeContainer');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    globeGroup = new THREE.Group();
    scene.add(globeGroup);
    const geometry = new THREE.SphereGeometry(180, 32, 32);
    const edges = new THREE.EdgesGeometry(geometry);
    const fiberMaterial = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.4, linewidth: 3 });
    const wireframe = new THREE.LineSegments(edges, fiberMaterial);
    globeGroup.add(wireframe);
    const glowEdges = new THREE.EdgesGeometry(new THREE.SphereGeometry(182, 32, 32));
    const glowMaterial = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.15, linewidth: 2 });
    const glowWireframe = new THREE.LineSegments(glowEdges, glowMaterial);
    globeGroup.add(glowWireframe);
    const blueColors = [0x7dd3fc, 0x0ea5e9, 0x0284c7, 0x0369a1];
    const vertices = geometry.attributes.position.array;
    const infoLightGeometry = new THREE.SphereGeometry(2.5, 8, 8);
    for (let i = 0; i < vertices.length; i += 3) {
        const colorIndex = Math.floor(Math.random() * blueColors.length);
        const infoLightMaterial = new THREE.MeshBasicMaterial({ color: blueColors[colorIndex], transparent: true, opacity: 0.8 });
        const infoLight = new THREE.Mesh(infoLightGeometry, infoLightMaterial);
        infoLight.position.set(vertices[i], vertices[i + 1], vertices[i + 2]);
        const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: blueColors[colorIndex], transparent: true, opacity: 0.3 }));
        glowSphere.position.copy(infoLight.position);
        globeGroup.add(infoLight);
        globeGroup.add(glowSphere);
        infoLights.push({ light: infoLight, glow: glowSphere, originalOpacity: 0.8, pulseSpeed: Math.random() * 0.02 + 0.01 });
    }
    const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(178, 32, 32), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.08 }));
    globeGroup.add(innerGlow);
    camera.position.z = 400;
    globeAnimationStarted = true;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (globeAnimationStarted && globeGroup) {
        globeGroup.rotation.y += 0.0015;
        globeGroup.rotation.x += 0.0006;
        infoLights.forEach((lightObj, index) => {
            const pulse = Math.sin(Date.now() * lightObj.pulseSpeed + index) * 0.3 + 0.7;
            lightObj.light.material.opacity = lightObj.originalOpacity * pulse;
            lightObj.glow.material.opacity = 0.3 * pulse;
            if (Math.random() > 0.998) {
                lightObj.light.material.opacity = 1;
                lightObj.glow.material.opacity = 0.6;
            }
        });
    }
    if(renderer) renderer.render(scene, camera);
}

function setupScrollAnimations() {
    if (globeGroup) {
        gsap.to(globeGroup.scale, { scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }, x: 1.2, y: 1.2, z: 1.2 });
    }
    
    // Smooth page load animation
    const tl = gsap.timeline();
    tl.to(".main-layout", { opacity: 1, duration: 1, ease: "power1.out" });
    tl.fromTo("#leftSideBox", { x: -150, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, "-=0.8");
    tl.fromTo("#rightSideBox", { x: 150, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, "-=1");
    tl.to(".button-container", { opacity: 1, duration: 1, ease: "power1.out" }, "-=0.8");
    tl.to(".tech-globe-container", { opacity: 1, duration: 1.5, ease: "power1.out" }, "-=0.8");
}

// Initialize Border Beam Buttons
let projectsButtonBeam, resumeButtonBeam;

document.addEventListener('DOMContentLoaded', () => {
    // Initially hide all components
    gsap.set(".main-layout", { opacity: 0 });
    gsap.set(".tech-globe-container", { opacity: 0 });
    gsap.set(".button-container", { opacity: 0 });
    
    // Initialize globe immediately (no delay)
    init3DGlobe();
    
    // Start page load animations
    setupScrollAnimations();
    
    // Initialize animated border beam buttons
    const projectsButton = document.getElementById('projectsButton');
    const resumeButton = document.getElementById('resumeButton');
    
    if (projectsButton) {
        projectsButtonBeam = new BorderBeam(projectsButton, { speed: 0.8 });
        
        // Add Projects button functionality
        projectsButton.addEventListener('click', () => {
            navigateToPage('projects');
        });
    }
    
    if (resumeButton) {
        resumeButtonBeam = new BorderBeam(resumeButton, { speed: 0.8 });
        
        // Add Resume button functionality
        resumeButton.addEventListener('click', () => {
            // You can replace this with actual resume download link
            const resumeUrl = 'assets/resume.pdf'; // Update with your actual resume path
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = 'Abdul_Rafay_Ather_Resume.pdf';
            link.click();
        });
    }
    
    // Add click effects to buttons
    [projectsButton, resumeButton].forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        const container = document.getElementById('globeContainer');
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
});
