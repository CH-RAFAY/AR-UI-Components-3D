document.addEventListener('DOMContentLoaded', () => {
    // --- Background Synapse Animation ---
    const canvas = document.getElementById('synapseCanvas');
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let currentPulse = null;
    let nodeCount = 50;
    const connectionRadius = 250;
    const blinkDuration = 2000;
    let mouse = { x: null, y: null, radius: 180 };
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        nodeCount = window.innerWidth < 768 ? 30 : 50;
    }
    
    class Node {
        constructor(x, y) { 
            this.x = x; this.y = y; this.originX = x; this.originY = y; 
            this.connections = []; this.isBlinking = false; this.density = (Math.random() * 20) + 10; 
        }
        
        draw() {
            ctx.beginPath();
            let radius = 3; 
            let fillStyle = 'rgba(14, 165, 233, 0.5)';
            if (mouse.x != null) { 
                const dx = mouse.x - this.x; const dy = mouse.y - this.y; 
                const distance = Math.sqrt(dx * dx + dy * dy); 
                if (distance < mouse.radius) { 
                    const force = (mouse.radius - distance) / mouse.radius; 
                    radius += force * 1.5; 
                    fillStyle = `rgba(140, 220, 255, ${0.5 + force * 0.3})`; 
                } 
            }
            ctx.fillStyle = fillStyle; ctx.arc(this.x, this.y, radius, 0, Math.PI * 2); ctx.fill();
            if (this.isBlinking) { 
                const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2; 
                const blinkRadius = 5 + (10 * pulseFactor); 
                const blinkAlpha = 0.4 + (0.4 * pulseFactor); 
                const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, blinkRadius); 
                glow.addColorStop(0, `rgba(140, 220, 255, ${blinkAlpha})`); 
                glow.addColorStop(0.7, `rgba(14, 165, 233, ${blinkAlpha * 0.5})`); 
                glow.addColorStop(1, 'rgba(14, 165, 233, 0)'); 
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(this.x, this.y, blinkRadius, 0, Math.PI * 2); ctx.fill(); 
            }
        }
        
        update() {
            if (mouse.x != null) { 
                const dx = mouse.x - this.x; const dy = mouse.y - this.y; 
                const distance = Math.sqrt(dx * dx + dy * dy); 
                if (distance < mouse.radius) { 
                    const forceDirectionX = dx / distance; const forceDirectionY = dy / distance; 
                    const force = (mouse.radius - distance) / mouse.radius; 
                    this.x -= forceDirectionX * force * this.density * 0.15; 
                    this.y -= forceDirectionY * force * this.density * 0.15; 
                } else { this.returnToOrigin(); } 
            } else { this.returnToOrigin(); }
        }
        
        returnToOrigin() { 
            if (this.x !== this.originX) { this.x += (this.originX - this.x) / 10; } 
            if (this.y !== this.originY) { this.y += (this.originY - this.y) / 10; } 
        }
    }
    
    class Pulse {
        constructor(startNode, endNode) { 
            this.startNode = startNode; this.endNode = endNode; this.progress = 0; 
            this.speed = 0.006 + Math.random() * 0.004; this.color = `hsl(${190 + Math.random() * 25}, 100%, 75%)`; 
        }
        update() { this.progress += this.speed; }
        draw() { 
            const currentX = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress; 
            const currentY = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress; 
            ctx.beginPath(); 
            const glow = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 12); 
            glow.addColorStop(0, this.color); glow.addColorStop(1, 'rgba(0,0,0,0)'); 
            ctx.fillStyle = glow; ctx.fillRect(currentX - 15, currentY - 15, 30, 30); 
        }
    }
    
    function init() {
        nodes = []; 
        for (let i = 0; i < nodeCount; i++) { 
            let x = Math.random() * canvas.width; let y = Math.random() * canvas.height; 
            nodes.push(new Node(x, y)); 
        }
        nodes.forEach(nodeA => { 
            nodes.forEach(nodeB => { 
                if (nodeA === nodeB) return; 
                const distance = Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)); 
                if (distance < connectionRadius) { nodeA.connections.push(nodeB); } 
            }); 
        });
    }
    
    function startNextPulseSequence() { 
        if (nodes.length === 0 || currentPulse) return; 
        let startNode; 
        do { startNode = nodes[Math.floor(Math.random() * nodes.length)]; } 
        while (startNode.connections.length === 0 || startNode.isBlinking); 
        const endNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)]; 
        currentPulse = new Pulse(startNode, endNode); 
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nodes.forEach(node => node.update());
        nodes.forEach(nodeA => { 
            nodeA.connections.forEach(nodeB => { 
                if (nodeA.x > nodeB.x) return; 
                let strokeStyle, lineWidth; 
                const isBlinking = nodeA.isBlinking || nodeB.isBlinking; 
                const isHovered = mouse.x != null && (Math.sqrt(Math.pow(nodeA.x - mouse.x, 2) + Math.pow(nodeA.y - mouse.y, 2)) < mouse.radius || Math.sqrt(Math.pow(nodeB.x - mouse.x, 2) + Math.pow(nodeB.y - mouse.y, 2)) < mouse.radius); 
                if (isBlinking) { 
                    const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2; 
                    strokeStyle = `rgba(140, 220, 255, ${0.15 + 0.1 * pulseFactor})`; lineWidth = 0.6 + 0.25 * pulseFactor; 
                } else if (isHovered) { 
                    strokeStyle = `rgba(140, 220, 255, 0.25)`; lineWidth = 0.6; 
                } else { 
                    strokeStyle = 'rgba(14, 165, 233, 0.12)'; lineWidth = 0.5; 
                }
                ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; 
                ctx.beginPath(); ctx.moveTo(nodeA.x, nodeA.y); ctx.lineTo(nodeB.x, nodeB.y); ctx.stroke(); 
            }); 
        });
        if (currentPulse) { currentPulse.draw(); }
        nodes.forEach(node => node.draw());
        if (currentPulse) {
            currentPulse.update();
            if (currentPulse.progress >= 1) { 
                const destinationNode = currentPulse.endNode; destinationNode.isBlinking = true; 
                currentPulse = null; 
                setTimeout(() => { destinationNode.isBlinking = false; startNextPulseSequence(); }, blinkDuration); 
            }
        }
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('mousemove', e => {
        if (e.target.closest('.certificate-card, .email-field, .social-logo, .copy-button, .verify-button')) {
            mouse.x = null; mouse.y = null;
        } else {
            mouse.x = e.clientX; mouse.y = e.clientY;
        }
    });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    
    resizeCanvas(); init(); animate(); startNextPulseSequence();

    // --- UI Interactions and GSAP Animations ---
    const copyBtn = document.getElementById('copyBtn');
    const githubLogo = document.getElementById('github-logo');
    const linkedinLogo = document.getElementById('linkedin-logo');

    copyBtn.addEventListener('click', () => {
        const email = 'arafaychaudhry@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
        gsap.to(copyBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    });

    githubLogo.addEventListener('click', () => {
        window.open('https://github.com/CH-RAFAY', '_blank');
        gsap.to(githubLogo, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    });

    linkedinLogo.addEventListener('click', () => {
        window.open('https://www.linkedin.com/in/rafay-chaudhry-54b671301/', '_blank');
        gsap.to(linkedinLogo, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    });

    // GSAP Page Load Animation
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();

    tl.fromTo('.section-title', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power2.out" }
    )
    .fromTo('.section-title .underline',
        { width: 0 },
        { width: 'clamp(40px, 8vw, 60px)', duration: 1, stagger: 0.15, ease: "power2.out" },
        "<"
    )
    .fromTo('.certificate-card', 
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" }, 
        "-=0.4"
    )
    .fromTo('.email-field', 
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }, 
        "-=0.3"
    )
    .fromTo('.social-logo', 
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: "back.out(1.2)" }, 
        "-=0.3"
    );
});
