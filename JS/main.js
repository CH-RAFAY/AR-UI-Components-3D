// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// =========== SMART SCROLL & NAVIGATION FUNCTIONALITY ===========
let lastScrollTop = 0;
let isScrolling = false;
let navbarExpanded = true;
let autoMinimizeTimer = null;
const navbar = document.getElementById('glassmorphicNavbar');
const burgerContainer = document.getElementById('burgerContainer');
const mobileOverlay = document.getElementById('mobileOverlay');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

// Device detection
function isDesktop() {
    return window.innerWidth > 768;
}

function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Navbar functionality
function rollUpNavbar() {
    navbar.style.transform = 'translateY(-100%)';
    navbar.style.opacity = '0';
    setTimeout(() => {
        burgerContainer.classList.add('show');
    }, 300);
    navbarExpanded = false;
}

function expandNavbar() {
    burgerContainer.classList.remove('show', 'active');
    setTimeout(() => {
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }, 200);
    navbarExpanded = true;
}

function showNavbar() {
    if (!navbarExpanded && isDesktop()) {
        expandNavbar();
    } else {
        navbar.classList.remove('hidden');
    }
    resetAutoMinimizeTimer();
}

function hideNavbar() {
    if (isDesktop()) {
        navbar.classList.add('hidden');
    }
}

function resetAutoMinimizeTimer() {
    if (autoMinimizeTimer) {
        clearTimeout(autoMinimizeTimer);
    }
    if (navbarExpanded && isDesktop()) {
        autoMinimizeTimer = setTimeout(() => {
            rollUpNavbar();
        }, 2000);
    }
}

// =========== EXPERTISE SECTION FUNCTIONALITY ===========
let skillNodes = [];
let activeNode = null;
const nexusContainer = document.getElementById('nexus');
const nexusCore = document.getElementById('nexus-core');
const coreSkillName = document.getElementById('core-skill-name');
const connectorSvg = document.getElementById('connector-svg');
const connectorLine = document.getElementById('connector-line');

const skillCategories = {
    'Frontend Development': ['React', 'Vue.js', 'Angular', 'TypeScript', 'Tailwind CSS'],
    'Backend Development': ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB'],
    'DevOps & Tools': ['Docker', 'Git', 'AWS', 'Linux', 'CI/CD'],
    'Design & UX': ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping']
};

function createSkillNodes() {
    const categories = Object.keys(skillCategories);
    const angleStep = (2 * Math.PI) / categories.length;
    
    categories.forEach((category, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const skills = skillCategories[category];
        
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'skill-node-container';
        nodeContainer.style.setProperty('--angle', `${angle}rad`);
        
        const node = document.createElement('div');
        node.className = 'skill-node';
        node.dataset.category = category;
        
        const label = document.createElement('span');
        label.className = 'skill-label';
        label.textContent = category;
        
        node.appendChild(label);
        nodeContainer.appendChild(node);
        nexusContainer.appendChild(nodeContainer);
        
        skillNodes.push({
            element: node,
            category: category,
            skills: skills,
            angle: angle
        });
    });
}

// =========== PROJECTS SECTION FUNCTIONALITY ===========
const projects = [
    {
        title: "E-commerce Platform",
        description: "Built a full-stack e-commerce solution with React, Node.js, and MongoDB",
        category: "Web Development",
        technologies: ["React", "Node.js", "MongoDB", "Redux"],
        status: "Completed"
    },
    {
        title: "AI Image Generator",
        description: "Created an AI-powered image generation tool using Python and TensorFlow",
        category: "Machine Learning",
        technologies: ["Python", "TensorFlow", "OpenAI API"],
        status: "In Progress"
    }
];

function initializeTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        timelineContainer.appendChild(projectElement);
    });
}

function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'project-card';
    element.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="tech-stack">
            ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
        </div>
    `;
    return element;
}

// =========== CERTIFICATES SECTION FUNCTIONALITY ===========
const copyBtn = document.getElementById('copyBtn');
const emailText = document.querySelector('.email-text');

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailText.textContent)
        .then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
});

// =========== ANIMATION AND VISUAL EFFECTS ===========
function initializeBackgroundEffects() {
    // Synapse Canvas Effect
    const canvas = document.getElementById('synapseCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation loop for background effects
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Add your animation code here
    }
    
    animate();
}

// =========== INITIALIZATION ===========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all sections
    createSkillNodes();
    initializeTimeline();
    initializeBackgroundEffects();
    
    // Initialize smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Initialize scroll-triggered animations
    gsap.utils.toArray('.section-wrapper').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            onEnter: () => section.classList.add('active')
        });
    });
});

// Add window scroll event listener for navbar behavior
window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    
    if (st > lastScrollTop) {
        // Scrolling down
        hideNavbar();
    } else {
        // Scrolling up
        showNavbar();
    }
    
    if (st > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = st;
});
