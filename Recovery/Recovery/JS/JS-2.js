// Background Layer Script
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('synapseCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coreElement = document.getElementById('nexus-core');
    let nodes = [];
    let currentPulse = null;
    let nodeCount = 50;
    const connectionRadius = 250;
    const blinkDuration = 2000;
    const nexusContainer = document.querySelector('.nexus-container');
    let mouse = { x: null, y: null, radius: 180 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        nodeCount = window.innerWidth < 768 ? 30 : 50;
    }
    resizeCanvas();

    class Node {
        constructor(x, y) { this.x = x; this.y = y; this.originX = x; this.originY = y; this.connections = []; this.isBlinking = false; this.density = (Math.random() * 20) + 10; }
        draw() {
            ctx.beginPath();
            let radius = 3; let fillStyle = 'rgba(14, 165, 233, 0.5)';
            if (mouse.x != null) { const dx = mouse.x - this.x; const dy = mouse.y - this.y; const distance = Math.sqrt(dx * dx + dy * dy); if (distance < mouse.radius) { const force = (mouse.radius - distance) / mouse.radius; radius += force * 1.5; fillStyle = `rgba(140, 220, 255, ${0.5 + force * 0.3})`; } }
            ctx.fillStyle = fillStyle; ctx.arc(this.x, this.y, radius, 0, Math.PI * 2); ctx.fill();
            if (this.isBlinking) { const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2; const blinkRadius = 5 + (10 * pulseFactor); const blinkAlpha = 0.4 + (0.4 * pulseFactor); const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, blinkRadius); glow.addColorStop(0, `rgba(140, 220, 255, ${blinkAlpha})`); glow.addColorStop(0.7, `rgba(14, 165, 233, ${blinkAlpha * 0.5})`); glow.addColorStop(1, 'rgba(14, 165, 233, 0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(this.x, this.y, blinkRadius, 0, Math.PI * 2); ctx.fill(); }
        }
        update() {
            if (mouse.x != null) { const dx = mouse.x - this.x; const dy = mouse.y - this.y; const distance = Math.sqrt(dx * dx + dy * dy); if (distance < mouse.radius) { const forceDirectionX = dx / distance; const forceDirectionY = dy / distance; const force = (mouse.radius - distance) / mouse.radius; this.x -= forceDirectionX * force * this.density * 0.15; this.y -= forceDirectionY * force * this.density * 0.15; } else { this.returnToOrigin(); } } else { this.returnToOrigin(); }
        }
        returnToOrigin() { if (this.x !== this.originX) { this.x += (this.originX - this.x) / 10; } if (this.y !== this.originY) { this.y += (this.originY - this.y) / 10; } }
    }

    class Pulse {
        constructor(startNode, endNode) { this.startNode = startNode; this.endNode = endNode; this.progress = 0; this.speed = 0.006 + Math.random() * 0.004; this.color = `hsl(${190 + Math.random() * 25}, 100%, 75%)`; }
        update() { this.progress += this.speed; }
        draw() { const currentX = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress; const currentY = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress; ctx.beginPath(); const glow = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 12); glow.addColorStop(0, this.color); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fillRect(currentX - 15, currentY - 15, 30, 30); }
    }

    function init() {
        nodes = [];
        if (!nexusContainer) return;
        const rect = nexusContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const exclusionRadius = rect.width * 0.35;
        for (let i = 0; i < nodeCount; i++) {
            let x, y, distance;
            do {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
                distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            } while (distance < exclusionRadius);
            nodes.push(new Node(x, y));
        }
        nodes.forEach(nodeA => { nodes.forEach(nodeB => { if (nodeA === nodeB) return; const distance = Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)); if (distance < connectionRadius) { nodeA.connections.push(nodeB); } }); });
    }

    function startNextPulseSequence() {
        if (nodes.length === 0 || currentPulse) return;
        let startNode;
        do {
            startNode = nodes[Math.floor(Math.random() * nodes.length)];
        } while (startNode.connections.length === 0 || startNode.isBlinking);
        const endNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
        currentPulse = new Pulse(startNode, endNode);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nodes.forEach(node => node.update());
        if(coreElement) {
            const coreRect = coreElement.getBoundingClientRect();
            const coreCanvasCenterX = coreRect.left + coreRect.width / 2;
            const coreCanvasCenterY = coreRect.top + coreRect.height / 2;
            const exclusionRadius = (coreRect.width / 2) * 1.05;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.arc(coreCanvasCenterX, coreCanvasCenterY, exclusionRadius, 0, Math.PI * 2, true);
            ctx.clip();
        }
        nodes.forEach(nodeA => { nodeA.connections.forEach(nodeB => { if (nodeA.x > nodeB.x) return; let strokeStyle; let lineWidth; const isBlinking = nodeA.isBlinking || nodeB.isBlinking; const isHovered = mouse.x != null && (Math.sqrt(Math.pow(nodeA.x - mouse.x, 2) + Math.pow(nodeA.y - mouse.y, 2)) < mouse.radius || Math.sqrt(Math.pow(nodeB.x - mouse.x, 2) + Math.pow(nodeB.y - mouse.y, 2)) < mouse.radius); if (isBlinking) { const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2; strokeStyle = `rgba(140, 220, 255, ${0.15 + 0.1 * pulseFactor})`; lineWidth = 0.6 + 0.25 * pulseFactor; } else if (isHovered) { strokeStyle = `rgba(140, 220, 255, 0.25)`; lineWidth = 0.6; } else { strokeStyle = 'rgba(14, 165, 233, 0.12)'; lineWidth = 0.5; }
        ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.beginPath(); ctx.moveTo(nodeA.x, nodeA.y); ctx.lineTo(nodeB.x, nodeB.y); ctx.stroke(); }); });
        if (currentPulse) { currentPulse.draw(); }
        nodes.forEach(node => node.draw());
        if(coreElement) ctx.restore();
        if (currentPulse) { currentPulse.update(); if (currentPulse.progress >= 1) { const destinationNode = currentPulse.endNode; destinationNode.isBlinking = true; currentPulse = null; setTimeout(() => { destinationNode.isBlinking = false; startNextPulseSequence(); }, blinkDuration); } }
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => { if (e.target.closest('.skill-node')) { mouse.x = null; mouse.y = null; } else { mouse.x = e.clientX; mouse.y = e.clientY; } });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('resize', () => { resizeCanvas(); init(); });

    init();
    animate();
    startNextPulseSequence();
});

// Front Layer (Nexus Skills) Script
document.addEventListener("DOMContentLoaded", function () {
    const nexusContainer = document.getElementById("nexus");
    if(!nexusContainer) return;

    const skillsData = [
        { id: "html", name: "HTML5", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", auraColor: "227, 76, 38" }, { id: "css", name: "CSS3", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", auraColor: "38, 77, 228" }, { id: "js", name: "JavaScript", iconUrl: "https://cdn3d.iconscout.com/3d/free/thumb/free-javascript-3d-icon-download-in-png-blend-fbx-gltf-file-formats--html-logo-vue-angular-coding-lang-pack-logos-icons-7577991.png", auraColor: "247, 223, 30" }, { id: "ts", name: "TypeScript", iconUrl: "https://cdn3d.iconscout.com/3d/free/thumb/free-typescript-9294849-7577992.png", auraColor: "49, 120, 198" }, { id: "react", name: "React", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", auraColor: "97, 218, 251" }, { id: "nextjs", name: "Next.js", iconUrl: "https://cdn.simpleicons.org/nextdotjs/white", auraColor: "255, 255, 255" }, { id: "vuejs", name: "Vue.js", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg", auraColor: "65, 184, 131" }, { id: "solidjs", name: "SolidJS", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg", auraColor: "72, 118, 212" }, { id: "tailwind", name: "Tailwind CSS", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg", auraColor: "56, 189, 248" }, { id: "bootstrap", name: "Bootstrap", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg", auraColor: "121, 82, 179" }, { id: "sass", name: "Sass/SCSS", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg", auraColor: "205, 103, 153" }, { id: "webpack", name: "Webpack", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/webpack/webpack-original.svg", auraColor: "142, 214, 251" }, { id: "vite", name: "Vite", iconUrl: "https://vitejs.dev/logo.svg", auraColor: "189, 52, 246" }, { id: "npm", name: "npm", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg", auraColor: "203, 56, 55" }, { id: "github", name: "GitHub", iconUrl: "https://cdn.simpleicons.org/github/white", auraColor: "255, 255, 255" }, { id: "jest", name: "Jest", iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg", auraColor: "156, 66, 92" }
    ];
    
    const core = document.getElementById("nexus-core");
    const coreSkillName = document.getElementById("core-skill-name");
    const line = document.getElementById("connector-line");
    let isAnimationPaused = false;
    let nodeAngles = skillsData.map((_, index) => (index / skillsData.length) * 2 * Math.PI);
    let orbitRadius, containerCenterX, containerCenterY;
    
    const nodes = skillsData.map((skill) => { const node = document.createElement("div"); node.className = "skill-node"; node.style.setProperty("--aura-color", skill.auraColor); node.innerHTML = `<img src="${skill.iconUrl}" alt="${skill.name}">`; nexusContainer.appendChild(node); node.addEventListener("mouseenter", (e) => handleMouseEnter(skill, e.currentTarget)); node.addEventListener("mouseleave", handleMouseLeave); return { element: node, skillData: skill }; });
    
    function updateDimensionsAndPositions() {
        const containerRect = nexusContainer.getBoundingClientRect();
        containerCenterX = containerRect.width / 2;
        containerCenterY = containerRect.height / 2;
        const coreWidth = core.offsetWidth;
        const coreHeight = core.offsetHeight;
        const nodeSize = nodes.length > 0 ? nodes[0].element.offsetWidth : 0;
        orbitRadius = containerRect.width * 0.35;
        core.style.left = `${containerCenterX - coreWidth / 2}px`;
        core.style.top = `${containerCenterY - coreHeight / 2}px`;
        nodes.forEach((node, index) => { const x = containerCenterX + orbitRadius * Math.cos(nodeAngles[index]) - (nodeSize / 2); const y = containerCenterY + orbitRadius * Math.sin(nodeAngles[index]) - (nodeSize / 2); node.element.style.left = `${x}px`; node.element.style.top = `${y}px`; });
    }
    
    function animateNodes() {
        if (!isAnimationPaused) {
            const nodeSize = nodes.length > 0 ? nodes[0].element.offsetWidth : 0;
            nodes.forEach((node, index) => {
                nodeAngles[index] += 0.0005;
                const x = containerCenterX + orbitRadius * Math.cos(nodeAngles[index]) - (nodeSize / 2);
                const y = containerCenterY + orbitRadius * Math.sin(nodeAngles[index]) - (nodeSize / 2);
                node.element.style.left = `${x}px`;
                node.element.style.top = `${y}px`;
            });
        }
        requestAnimationFrame(animateNodes);
    }
    
    function handleMouseEnter(skill, nodeElement) {
        isAnimationPaused = true;
        const coreRect = core.getBoundingClientRect();
        const nodeRect = nodeElement.getBoundingClientRect();
        const svgRect = nexusContainer.getBoundingClientRect();
        const coreCenterX = coreRect.left + coreRect.width / 2;
        const coreCenterY = coreRect.top + coreRect.height / 2;
        const nodeCenterX = nodeRect.left + nodeRect.width / 2;
        const nodeCenterY = nodeRect.top + nodeRect.height / 2;
        const dx = nodeCenterX - coreCenterX;
        const dy = nodeCenterY - coreCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const startX = coreCenterX + (dx * (core.offsetWidth / 2)) / distance;
        const startY = coreCenterY + (dy * (core.offsetHeight / 2)) / distance;
        const endX = nodeCenterX - (dx * (nodeElement.offsetWidth / 2 * 1.2)) / distance;
        const endY = nodeCenterY - (dy * (nodeElement.offsetHeight / 2 * 1.2)) / distance;
        line.setAttribute("x1", startX - svgRect.left);
        line.setAttribute("y1", startY - svgRect.top);
        line.setAttribute("x2", endX - svgRect.left);
        line.setAttribute("y2", endY - svgRect.top);
        const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = "0";
        line.style.opacity = "1";
        const themeColorRgb = "14, 165, 233";
        line.style.stroke = `rgb(${themeColorRgb})`;
        line.style.setProperty("--line-glow-color", themeColorRgb);
        core.style.boxShadow = `0 0 50px rgba(${themeColorRgb}, 0.9), inset 0 0 35px rgba(${themeColorRgb}, 0.5)`;
        coreSkillName.textContent = skill.name;
        coreSkillName.style.opacity = "1";
    }
    
    function handleMouseLeave() {
        isAnimationPaused = false;
        line.style.opacity = "0";
        coreSkillName.style.opacity = "0";
        core.style.boxShadow = "0 0 30px rgba(14, 165, 233, 0.3), inset 0 0 20px rgba(14, 165, 233, 0.2)";
    }
    
    function animateSequentially(elements, delay) {
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in-scale');
            }, index * delay);
        });
    }
    
    setTimeout(() => {
        core.classList.add('fade-in-scale');
        core.style.boxShadow = "0 0 50px rgba(14, 165, 233, 0.9), inset 0 0 35px rgba(14, 165, 233, 0.5)";
        setTimeout(() => {
            const skillNodeElements = nodes.map(node => node.element);
            animateSequentially(skillNodeElements, 180);
            setTimeout(() => {
                core.style.boxShadow = "0 0 30px rgba(14, 165, 233, 0.3), inset 0 0 20px rgba(14, 165, 233, 0.2)";
            }, skillNodeElements.length * 180 + 600);
        }, 600);
    }, 300);
    
    updateDimensionsAndPositions();
    animateNodes();
    window.addEventListener('resize', updateDimensionsAndPositions);
});
