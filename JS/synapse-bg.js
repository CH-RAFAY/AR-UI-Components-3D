// Synapse background only - for pages that need the neural network canvas without full timeline
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('synapseCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let bg_nodes = [];
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
            let radius = 3; let fillStyle = 'rgba(14, 165, 233, 0.5)';
            if (mouse.x != null) {
                const dx = mouse.x - this.x; const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    radius += force * 1.5; fillStyle = `rgba(140, 220, 255, ${0.5 + force * 0.3})`;
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
            this.speed = 0.006 + Math.random() * 0.004;
            this.color = `hsl(${190 + Math.random() * 25}, 100%, 75%)`;
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

    function init_bg() {
        bg_nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            bg_nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height));
        }
        bg_nodes.forEach(nodeA => {
            bg_nodes.forEach(nodeB => {
                if (nodeA === nodeB) return;
                const distance = Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
                if (distance < connectionRadius) nodeA.connections.push(nodeB);
            });
        });
    }

    function startNextPulseSequence() {
        if (bg_nodes.length === 0 || currentPulse) return;
        let startNode;
        do { startNode = bg_nodes[Math.floor(Math.random() * bg_nodes.length)]; }
        while (startNode.connections.length === 0 || startNode.isBlinking);
        currentPulse = new Pulse(startNode, startNode.connections[Math.floor(Math.random() * startNode.connections.length)]);
    }

    function animate_bg() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bg_nodes.forEach(node => node.update());
        bg_nodes.forEach(nodeA => {
            nodeA.connections.forEach(nodeB => {
                if (nodeA.x > nodeB.x) return;
                let strokeStyle = 'rgba(14, 165, 233, 0.12)'; let lineWidth = 0.5;
                const isBlinking = nodeA.isBlinking || nodeB.isBlinking;
                const isHovered = mouse.x != null && (
                    Math.sqrt(Math.pow(nodeA.x - mouse.x, 2) + Math.pow(nodeA.y - mouse.y, 2)) < mouse.radius ||
                    Math.sqrt(Math.pow(nodeB.x - mouse.x, 2) + Math.pow(nodeB.y - mouse.y, 2)) < mouse.radius
                );
                if (isBlinking) {
                    const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2;
                    strokeStyle = `rgba(140, 220, 255, ${0.15 + 0.1 * pulseFactor})`;
                    lineWidth = 0.6 + 0.25 * pulseFactor;
                } else if (isHovered) {
                    strokeStyle = 'rgba(140, 220, 255, 0.25)'; lineWidth = 0.6;
                }
                ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth;
                ctx.beginPath(); ctx.moveTo(nodeA.x, nodeA.y); ctx.lineTo(nodeB.x, nodeB.y); ctx.stroke();
            });
        });
        if (currentPulse) currentPulse.draw();
        bg_nodes.forEach(node => node.draw());
        if (currentPulse) {
            currentPulse.update();
            if (currentPulse.progress >= 1) {
                const dest = currentPulse.endNode;
                dest.isBlinking = true;
                currentPulse = null;
                setTimeout(() => { dest.isBlinking = false; startNextPulseSequence(); }, blinkDuration);
            }
        }
        requestAnimationFrame(animate_bg);
    }

    window.addEventListener('mousemove', e => {
        const hovered = document.elementFromPoint(e.clientX, e.clientY);
        if (hovered && (hovered.closest('.panel-button') || hovered.closest('.project-panel'))) {
            mouse.x = null; mouse.y = null;
        } else {
            mouse.x = e.clientX; mouse.y = e.clientY;
        }
    });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('resize', () => { resizeCanvas(); init_bg(); });

    resizeCanvas(); init_bg(); animate_bg(); startNextPulseSequence();
});
