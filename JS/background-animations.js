document.addEventListener('DOMContentLoaded', function() {
    // Initialize background animations for all sections
    const sections = ['synapseCanvas1', 'synapseCanvas2', 'synapseCanvas3'];
    
    sections.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Resize handler
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        // Initial resize
        resizeCanvas();

        // Resize on window change
        window.addEventListener('resize', () => {
            resizeCanvas();
        });
    });

    // Force reflow for canvas elements
    sections.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.style.display = 'none';
            canvas.offsetHeight; // force reflow
            canvas.style.display = '';
        }
    });
});

function initializeCanvasAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let nodes = [];
    const nodeCount = 50;
    const connectionRadius = 250;
    let mouse = { x: null, y: null, radius: 180 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.originX = x;
            this.originY = y;
            this.connections = [];
            this.density = (Math.random() * 20) + 10;
        }

        draw() {
            ctx.beginPath();
            let radius = 3;
            let fillStyle = 'rgba(14, 165, 233, 0.5)';
            
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    radius += force * 1.5;
                    fillStyle = `rgba(140, 220, 255, ${0.5 + force * 0.3})`;
                }
            }
            
            ctx.fillStyle = fillStyle;
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * this.density * 0.15;
                    this.y -= forceDirectionY * force * this.density * 0.15;
                } else {
                    this.returnToOrigin();
                }
            } else {
                this.returnToOrigin();
            }
        }

        returnToOrigin() {
            this.x += (this.originX - this.x) / 10;
            this.y += (this.originY - this.y) / 10;
        }
    }

    function init() {
        nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            nodes.push(new Node(x, y));
        }

        nodes.forEach(nodeA => {
            nodes.forEach(nodeB => {
                if (nodeA === nodeB) return;
                const distance = Math.sqrt(
                    Math.pow(nodeA.x - nodeB.x, 2) + 
                    Math.pow(nodeA.y - nodeB.y, 2)
                );
                if (distance < connectionRadius) {
                    nodeA.connections.push(nodeB);
                }
            });
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        nodes.forEach(node => node.update());
        
        nodes.forEach(nodeA => {
            nodeA.connections.forEach(nodeB => {
                if (nodeA.x > nodeB.x) return;
                
                let strokeStyle;
                let lineWidth;
                const isHovered = mouse.x != null && (
                    Math.sqrt(Math.pow(nodeA.x - mouse.x, 2) + Math.pow(nodeA.y - mouse.y, 2)) < mouse.radius ||
                    Math.sqrt(Math.pow(nodeB.x - mouse.x, 2) + Math.pow(nodeB.y - mouse.y, 2)) < mouse.radius
                );

                if (isHovered) {
                    strokeStyle = 'rgba(140, 220, 255, 0.25)';
                    lineWidth = 0.6;
                } else {
                    strokeStyle = 'rgba(14, 165, 233, 0.12)';
                    lineWidth = 0.5;
                }

                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();
            });
        });

        nodes.forEach(node => node.draw());
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });

    init();
    animate();
}
