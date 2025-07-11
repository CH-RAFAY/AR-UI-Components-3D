
// Enhanced navbar scroll detection with 3-second timer and smoother animations
let lastScrollTop = 0;
const navbar = document.getElementById('glassmorphicNavbar');
let isScrolling = false;
let hideTimer = null;

function showNavbar() {
    navbar.classList.add('show');
    // Clear existing timer
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    // Set timer to hide navbar after 3 seconds
    hideTimer = setTimeout(() => {
        navbar.classList.remove('show');
    }, 3000);
}

function hideNavbar() {
    navbar.classList.remove('show');
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
}

window.addEventListener('scroll', () => {
    showNavbar();
});

// Active nav link functionality for desktop
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
    });
});

// Set first nav item as active by default
if (navLinks.length > 0) {
    navLinks[0].classList.add('active');
}

// Mobile menu functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

// Toggle mobile menu
mobileMenuToggle.addEventListener('click', function() {
    mobileOverlay.classList.toggle('active');
});

// Close mobile menu when clicking overlay
mobileOverlay.addEventListener('click', function(e) {
    if (e.target === mobileOverlay) {
        mobileOverlay.classList.remove('active');
    }
});

// Mobile nav link functionality
mobileNavLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all mobile links
        mobileNavLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        // Also update desktop nav if it exists
        if (navLinks[index]) {
            navLinks.forEach(l => l.classList.remove('active'));
            navLinks[index].classList.add('active');
        }
        // Close mobile menu
        mobileOverlay.classList.remove('active');
    });
});

// Set first mobile nav item as active by default
if (mobileNavLinks.length > 0) {
    mobileNavLinks[0].classList.add('active');
}

// BorderBeam Class for Animated Buttons
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

// 3D Globe Code with immediate appearance
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
    // Show navbar after page load
    setTimeout(() => {
        showNavbar();
    }, 1000);
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
    }
    if (resumeButton) {
        resumeButtonBeam = new BorderBeam(resumeButton, { speed: 0.8 });
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
