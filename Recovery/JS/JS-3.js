document.addEventListener('DOMContentLoaded', () => {
    // --- Neural Network Background Animation Script ---
    const canvas = document.getElementById('synapseCanvas');
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
            ctx.fillStyle = fillStyle;
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();

            if (this.isBlinking) {
                const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2;
                const blinkRadius = 5 + (10 * pulseFactor);
                const blinkAlpha = 0.4 + (0.4 * pulseFactor);
                const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, blinkRadius);
                glow.addColorStop(0, `rgba(140, 220, 255, ${blinkAlpha})`);
                glow.addColorStop(0.7, `rgba(14, 165, 233, ${blinkAlpha * 0.5})`);
                glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(this.x, this.y, blinkRadius, 0, Math.PI * 2);
                ctx.fill();
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
            glow.addColorStop(0, this.color);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(currentX - 15, currentY - 15, 30, 30);
        }
    }

    function init_bg() {
        bg_nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            bg_nodes.push(new Node(x, y));
        }
        bg_nodes.forEach(nodeA => {
            bg_nodes.forEach(nodeB => {
                if (nodeA === nodeB) return;
                const distance = Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
                if (distance < connectionRadius) { nodeA.connections.push(nodeB); }
            });
        });
    }

    function startNextPulseSequence() {
        if (bg_nodes.length === 0 || currentPulse) return;
        let startNode;
        do { startNode = bg_nodes[Math.floor(Math.random() * bg_nodes.length)]; } 
        while (startNode.connections.length === 0 || startNode.isBlinking);
        const endNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
        currentPulse = new Pulse(startNode, endNode);
    }

    function animate_bg() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bg_nodes.forEach(node => node.update());
        bg_nodes.forEach(nodeA => {
            nodeA.connections.forEach(nodeB => {
                if (nodeA.x > nodeB.x) return;
                let strokeStyle = 'rgba(14, 165, 233, 0.12)'; let lineWidth = 0.5;
                const isBlinking = nodeA.isBlinking || nodeB.isBlinking;
                const isHovered = mouse.x != null && (Math.sqrt(Math.pow(nodeA.x - mouse.x, 2) + Math.pow(nodeA.y - mouse.y, 2)) < mouse.radius || Math.sqrt(Math.pow(nodeB.x - mouse.x, 2) + Math.pow(nodeB.y - mouse.y, 2)) < mouse.radius);
                if (isBlinking) {
                    const pulseFactor = (Math.sin(Date.now() * 0.005) + 1) / 2;
                    strokeStyle = `rgba(140, 220, 255, ${0.15 + 0.1 * pulseFactor})`;
                    lineWidth = 0.6 + 0.25 * pulseFactor;
                } else if (isHovered) {
                    strokeStyle = `rgba(140, 220, 255, 0.25)`;
                    lineWidth = 0.6;
                }
                ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth;
                ctx.beginPath(); ctx.moveTo(nodeA.x, nodeA.y); ctx.lineTo(nodeB.x, nodeB.y); ctx.stroke();
            });
        });
        if (currentPulse) { currentPulse.draw(); }
        bg_nodes.forEach(node => node.draw());
        if (currentPulse) {
            currentPulse.update();
            if (currentPulse.progress >= 1) {
                const destinationNode = currentPulse.endNode;
                destinationNode.isBlinking = true;
                currentPulse = null;
                setTimeout(() => { destinationNode.isBlinking = false; startNextPulseSequence(); }, blinkDuration);
            }
        }
        requestAnimationFrame(animate_bg);
    }

    window.addEventListener('mousemove', e => {
        const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
        const isInteractiveElement = hoveredElement && (hoveredElement.closest('.panel-button') || hoveredElement.closest('.category-selector') || hoveredElement.closest('.project-panel'));
        if (isInteractiveElement) { mouse.x = null; mouse.y = null; } else { mouse.x = e.clientX; mouse.y = e.clientY; }
    });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('resize', () => { resizeCanvas(); init_bg(); });
    
    resizeCanvas(); init_bg(); animate_bg(); startNextPulseSequence();

    // --- Timeline & Interactive Elements Script ---
    gsap.registerPlugin(ScrollTrigger);

    function startSequentialAnimation() {
        const mainHeading = document.querySelector('.timeline-header h2');
        const subHeading = document.querySelector('.timeline-header p');
        const categoryButton = document.querySelector('.category-selector');
        const timelineContainer = document.querySelector('.timeline-container');
        setTimeout(() => mainHeading.classList.add('animate-in'), 200);
        setTimeout(() => subHeading.classList.add('animate-in'), 800);
        setTimeout(() => categoryButton.classList.add('animate-in'), 1400);
        setTimeout(() => timelineContainer.classList.add('animate-in'), 2000);
    }
    startSequentialAnimation();

    const projectData = {
        "Front-End Development": [
            { title: "ElectroMotion", description: "A high-end electric vehicle showroom interface crafted for seamless UX and dynamic frontend interactions.", tags: ["React.js", "Tailwind CSS", "Framer Motion", "TypeScript", "GSAP"], liveUrl: "https://teslaauto.netlify.app", repoUrl: "https://github.com/CH-RAFAY/Electric-Vehicle-Website" },
            { title: "TeraByte", description: "A sleek audio streaming frontend inspired by modern platforms, built for performance and immersive user experience.", tags: ["React.js", "Tailwind CSS", "Framer Motion", "Redux", "Responsive Design"], liveUrl: "https://tera-byte.netlify.app", repoUrl: "https://github.com/CH-RAFAY/Audio-Streaming-Website" },
            { title: "RestRiser", description: "An elegant hotel reservation platform with full-stack functionality, inspired by the UX of top booking services.", tags: ["React.js", "Tailwind CSS", "Node.js", "Express", "MongoDB"], liveUrl: "https://shorturl.at/bmip7", repoUrl: "https://github.com/CH-RAFAY/Hotel-Reservation-Website" },
            { title: "Math-Odyssey", description: "A visually rich calculator site with 3D themes, animated interactions, and immersive UI using advanced JS animations.", tags: ["Vanilla JavaScript", "GSAP", "Three.js", "ScrollTrigger", "Responsive Design"], liveUrl: "https://mathodesy.netlify.app", repoUrl: "https://github.com/CH-RAFAY/Javascript-Animation-Website" },
            { title: "CampQuest", description: "A vibrant and responsive website designed for a youth summer camp and scouting competition event.", tags: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Accessibility"], liveUrl: "https://ch-rafay.github.io/Michigan-Static-Website", repoUrl: "https://github.com/CH-RAFAY/Michigan-Static-Website" },
        ],
        "UI/UX Design": [
            { title: "RaceHost UI", description: "A premium multi-page UI/UX design for a racing car brand website, crafted with strong visual hierarchy and responsive structure.", tags: ["Wireframing", "HTML5", "CSS3", "Figma to Code", "Responsive Design"], liveUrl: "https://ch-rafay.github.io/Wireframes-Hosting-Website/", repoUrl: "https://github.com/CH-RAFAY/Wireframes-Hosting-Website" },
            { title: "LandingCraft", description: "A curated bundle of modern landing pages including scooter and portfolio layouts, designed for clarity, flow, and clean presentation.", tags: ["UI Design", "HTML5", "CSS3", "Grid Layout", "Responsive Layouts"], liveUrl: "https://ch-rafay.github.io/Wireframes-Hosting-Website/", repoUrl: "https://github.com/CH-RAFAY/Wireframes-Hosting-Website" },
        ],
        "Data Science": [
            { title: "British Airways", description: "A multi-project internship focused on flight analytics, customer segmentation, and predictive modeling to enhance airline operations.", tags: ["Python", "Pandas", "Scikit-learn", "NLP", "Tableau"], liveUrl: "#", repoUrl: "https://github.com/CH-RAFAY/British-Airways-Internship" },
            { title: "Data Automation", description: "An automated system that scrapes hotel data and visualizes key insights through interactive graphs and charts.", tags: ["Python", "Playwright", "BeautifulSoup", "D3.js", "Pandas"], liveUrl: "#", repoUrl: "https://github.com/CH-RAFAY/AutoScraping-and-Visualization" },
        ],
        "Machine Learning": [
            { title: "Guitar Transcriber", description: "A machine learning pipeline that converts raw guitar audio into precise music notes and outputs downloadable PDF sheet music.", tags: ["Python", "Librosa", "PyTorch", "Signal Processing", "Music21"], liveUrl: "#", repoUrl: "https://github.com/CH-RAFAY/Software-Engineering-FYP", status: "in-process" },
        ],
        "Backend & APIs": [
            { title: "AutoHero SMTP", description: "A backend-driven dynamic form with 10k+ dependent dropdowns, integrated with EmailJS to send selected data directly to the client.", tags: ["JavaScript", "REST API", "EmailJS", "Dynamic Forms", "SMTP Integration"], repoUrl: "private" },
        ],
    };

    const categories = Object.keys(projectData);
    let currentCategoryIndex = 0;
    let activeScrollTriggers = [];
    let isAnimating = false;
    const timelineContainer = document.querySelector(".timeline-container");

    function renderTimeline(categoryIndex) {
        if (isAnimating) return;
        isAnimating = true;

        const oldEntries = timelineContainer.querySelectorAll(".project-entry");
        const tl = gsap.timeline({
            onComplete: () => {
                if (activeScrollTriggers.length) { activeScrollTriggers.forEach((st) => st.kill()); activeScrollTriggers = []; }
                timelineContainer.innerHTML = `<svg class="timeline-svg"><line class="timeline-path" x1="2" y1="0" x2="2" y2="100%"/></svg>`;
                const categoryName = categories[categoryIndex];
                const projects = projectData[categoryName];
                if (!projects || projects.length === 0) { isAnimating = false; return; }

                projects.forEach((project, index) => {
                    const alignment = index % 2 === 0 ? "align-left" : "align-right";
                    const entry = document.createElement("div");
                    entry.className = `project-entry ${alignment}`;
                    const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");
                    let buttonsHTML = '';
                    if (project.liveUrl && project.liveUrl !== '#' && project.liveUrl !== 'private') { buttonsHTML += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="panel-button">Live Demo</a>`; }
                    if (project.repoUrl && project.repoUrl !== '#') {
                        const isPrivate = project.repoUrl === 'private';
                        buttonsHTML += `<a href="${isPrivate ? '#' : project.repoUrl}" class="panel-button" ${isPrivate ? 'data-repo-status="private"' : 'target="_blank" rel="noopener noreferrer"'}>View Code</a>`;
                    }
                    if (project.status === 'in-process') { buttonsHTML += `<a href="#" class="panel-button in-process">In-Process</a>`; }
                    
                    entry.innerHTML = `
                        <div class="project-node"><span class="project-fill"></span><div class="ripple"></div><div class="ripple"></div></div>
                        <div class="project-panel">
                            <div class="corner-accent top-left"></div><div class="corner-accent top-right"></div>
                            <div class="corner-accent bottom-left"></div><div class="corner-accent bottom-right"></div>
                            <div class="panel-content">
                                <div class="panel-main">
                                    <div class="panel-text">
                                        <h3 class="panel-title" data-text="${project.title}">${project.title}</h3>
                                        <p class="panel-description">${project.description}</p>
                                        <div class="panel-tags">${tagsHTML}</div>
                                    </div>
                                </div>
                                <div class="panel-actions">${buttonsHTML}</div>
                            </div>
                        </div>`;
                    timelineContainer.appendChild(entry);
                });
                
                const newEntries = timelineContainer.querySelectorAll(".project-entry");
                gsap.set(timelineContainer.querySelectorAll(".project-panel"), { opacity: 1, y: 0 });
                gsap.from(newEntries, {
                    opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: "power3.out",
                    onComplete: () => {
                        gsap.set(timelineContainer.querySelectorAll(".project-panel"), { clearProps: "opacity,transform" });
                        setupAdvancedTimeline(); setupProjectActivation(); setupHeadingGlows();
                        isAnimating = false;
                    },
                });
            },
        });
        if (oldEntries.length > 0) { tl.to(oldEntries, { opacity: 0, y: -30, duration: 0.4, stagger: 0.08, ease: "power3.in" }); } 
        else { tl.play(); }
    }
    
    function initialRender(categoryIndex) {
        timelineContainer.innerHTML = `<svg class="timeline-svg"><line class="timeline-path" x1="2" y1="0" x2="2" y2="100%"/></svg>`;
        const projects = projectData[categories[categoryIndex]];
        if (!projects || projects.length === 0) return;

        projects.forEach((project, index) => {
            const alignment = index % 2 === 0 ? "align-left" : "align-right";
            const entry = document.createElement("div");
            entry.className = `project-entry ${alignment}`;
            const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");
            let buttonsHTML = '';
            if (project.liveUrl && project.liveUrl !== '#' && project.liveUrl !== 'private') { buttonsHTML += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="panel-button">Live Demo</a>`; }
            if (project.repoUrl && project.repoUrl !== '#') {
                const isPrivate = project.repoUrl === 'private';
                buttonsHTML += `<a href="${isPrivate ? '#' : project.repoUrl}" class="panel-button" ${isPrivate ? 'data-repo-status="private"' : 'target="_blank" rel="noopener noreferrer"'}>View Code</a>`;
            }
            if (project.status === 'in-process') { buttonsHTML += `<a href="#" class="panel-button in-process">In-Process</a>`; }
            entry.innerHTML = `
                <div class="project-node"><span class="project-fill"></span><div class="ripple"></div><div class="ripple"></div></div>
                <div class="project-panel">
                    <div class="corner-accent top-left"></div><div class="corner-accent top-right"></div>
                    <div class="corner-accent bottom-left"></div><div class="corner-accent bottom-right"></div>
                    <div class="panel-content">
                        <div class="panel-main">
                            <div class="panel-text">
                                <h3 class="panel-title" data-text="${project.title}">${project.title}</h3>
                                <p class="panel-description">${project.description}</p>
                                <div class="panel-tags">${tagsHTML}</div>
                            </div>
                        </div>
                        <div class="panel-actions">${buttonsHTML}</div>
                    </div>
                </div>`;
            timelineContainer.appendChild(entry);
        });

        setTimeout(() => { setupAdvancedTimeline(); setupProjectActivation(); setupHeadingGlows(); }, 100);
    }
    
    function setupTumblerSelector() {
        const selector = document.querySelector(".category-selector");
        const tumbler = document.querySelector(".tumbler");
        if (!selector || !tumbler) return;

        const sidePrev = tumbler.querySelector(".side-prev");
        const sideNext = tumbler.querySelector(".side-next");
        const angleStep = 360 / categories.length;
        const radius = (selector.offsetWidth / 2) / Math.tan(Math.PI / categories.length);

        tumbler.querySelectorAll(".category-label").forEach((label) => label.remove());

        categories.forEach((cat, i) => {
            const label = document.createElement("div");
            label.className = "category-label";
            label.textContent = cat;
            label.dataset.index = i;
            tumbler.appendChild(label);
            gsap.set(label, { transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px) translateZ(-1px)` });
        });

        updateActiveCategory(currentCategoryIndex);

        function setTumblerAppearance(is3D, hintDirection = null) {
            tumbler.querySelectorAll(".category-label").forEach((label) => {
                const labelIndex = parseInt(label.dataset.index);
                let show = is3D || label.classList.contains("active");
                label.classList.remove("hint-visible");
                if (hintDirection) {
                    const nextIndex = (currentCategoryIndex + 1) % categories.length;
                    const prevIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
                    if ((hintDirection === "next" && labelIndex === nextIndex) || (hintDirection === "prev" && labelIndex === prevIndex)) {
                        label.classList.add("hint-visible");
                        show = true;
                    }
                }
                gsap.to(label, { opacity: show ? 1 : 0, duration: 0.3 });
            });
        }

        const introAnimation = gsap.timeline({
            onComplete: () => {
                setTumblerAppearance(false);
                const hintAnimation = gsap.timeline({ repeat: -1, defaults: { duration: 0.8, ease: "sine.inOut" } });
                const activeLabel = tumbler.querySelector(".category-label.active");
                const hintRotationAngle = window.innerWidth < 480 ? 20 : 35;
                hintAnimation
                    .to(tumbler, { rotationY: -hintRotationAngle, onStart: () => { activeLabel.classList.add("hint-suppressed"); setTumblerAppearance(true, "next"); } }, "+=2")
                    .to(sideNext, { opacity: 1 }, "<")
                    .to(tumbler, { rotationY: 0, onComplete: () => { activeLabel.classList.remove("hint-suppressed"); setTumblerAppearance(false); } }, ">0.6")
                    .to(sideNext, { opacity: 0 }, "<")
                    .to(tumbler, { rotationY: hintRotationAngle, onStart: () => { activeLabel.classList.add("hint-suppressed"); setTumblerAppearance(true, "prev"); } }, "+=2")
                    .to(sidePrev, { opacity: 1 }, "<")
                    .to(tumbler, { rotationY: 0, onComplete: () => { activeLabel.classList.remove("hint-suppressed"); setTumblerAppearance(false); } }, ">0.6")
                    .to(sidePrev, { opacity: 0 }, "<");
                selector.hintAnimation = hintAnimation;
            },
        });
        introAnimation.from(tumbler, { rotationY: "-=360", duration: 2.5, ease: "power3.out", onStart: () => setTumblerAppearance(true) });
        selector.introAnimation = introAnimation;

        let isDragging = false;
        let startX;
        const snapToCategory = () => {
            const currentRotation = gsap.getProperty(tumbler, "rotationY");
            const targetRotation = Math.round(currentRotation / angleStep) * angleStep;
            let newIndex = ((-targetRotation / angleStep) % categories.length + categories.length) % categories.length;
            gsap.to(tumbler, { rotationY: targetRotation, duration: 1.1, ease: "power3.out", onComplete: () => setTumblerAppearance(false) });
            if (newIndex !== currentCategoryIndex) {
                currentCategoryIndex = newIndex;
                renderTimeline(currentCategoryIndex);
            }
            updateActiveCategory(newIndex);
        };

        selector.addEventListener("mousedown", (e) => {
            if (selector.introAnimation) selector.introAnimation.kill();
            if (selector.hintAnimation) selector.hintAnimation.kill();
            gsap.to([sidePrev, sideNext], { opacity: 0, duration: 0.1 });
            document.querySelectorAll(".category-label").forEach((l) => l.classList.remove("hint-suppressed", "hint-visible"));
            setTumblerAppearance(true);
            isDragging = true;
            startX = e.pageX - gsap.getProperty(tumbler, "rotationY") * 2.5;
            gsap.killTweensOf(tumbler);
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            gsap.set(tumbler, { rotationY: (e.pageX - startX) / 2.5 });
        });

        window.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            snapToCategory();
        });
    }

    function updateActiveCategory(activeIndex) {
        document.querySelectorAll(".tumbler .category-label").forEach((label) => {
            label.classList.toggle("active", parseInt(label.dataset.index) === activeIndex);
        });
    }

    function setupAdvancedTimeline() {
        const svg = document.querySelector(".timeline-svg");
        const path = document.querySelector(".timeline-path");
        const projectNodes = document.querySelectorAll(".project-node");
        if (!svg || !path || projectNodes.length < 2) { if (svg) gsap.set(svg, { opacity: 0 }); return; }

        const containerRect = timelineContainer.getBoundingClientRect();
        const firstNodeRect = projectNodes[0].getBoundingClientRect();
        const lastNodeRect = projectNodes[projectNodes.length - 1].getBoundingClientRect();
        const y1 = firstNodeRect.top + firstNodeRect.height / 2 - containerRect.top;
        const height = lastNodeRect.top + lastNodeRect.height / 2 - (firstNodeRect.top + firstNodeRect.height / 2);

        svg.setAttribute("height", height);
        svg.style.top = y1 + "px";
        path.setAttribute("y2", height);

        const pathTotalLength = path.getTotalLength();
        path.style.strokeDasharray = pathTotalLength;
        path.style.strokeDashoffset = pathTotalLength;

        const masterTl = gsap.timeline({ paused: true });
        let lastOffset = pathTotalLength;

        projectNodes.forEach((node, index) => {
            const nodeCenterY = node.getBoundingClientRect().top + node.getBoundingClientRect().height / 2 - (firstNodeRect.top + firstNodeRect.height / 2);
            const currentOffset = pathTotalLength * (1 - (height > 0 ? nodeCenterY / height : 0));
            masterTl.to(path, { strokeDashoffset: currentOffset, duration: Math.abs(currentOffset - lastOffset) / pathTotalLength * 10, ease: "none" });
            masterTl.call(() => { if (!node.classList.contains("connecting-signal")) { node.classList.add("connecting-signal"); setTimeout(() => node.classList.remove("connecting-signal"), 1200); } }, [], ">");
            if (index < projectNodes.length - 1) { masterTl.to({}, { duration: 2 }); }
            lastOffset = currentOffset;
        });

        activeScrollTriggers.push(ScrollTrigger.create({ trigger: ".timeline-container", start: "top center", end: "bottom bottom", scrub: 1.5, animation: masterTl }));
        gsap.to(svg, { opacity: 1, duration: 0.3 });
    }

    function setupProjectActivation() {
        const projectEntries = document.querySelectorAll(".project-entry");
        projectEntries.forEach((entry) => activeScrollTriggers.push(ScrollTrigger.create({ trigger: entry, start: "top center", end: "bottom center", toggleClass: "is-active" })));
        if (projectEntries.length > 0) {
            const lastNode = projectEntries[projectEntries.length - 1].querySelector(".project-node");
            if (lastNode) {
                activeScrollTriggers.push(ScrollTrigger.create({ trigger: projectEntries[projectEntries.length - 1], start: "top center", onLeaveBack: () => { if (!lastNode.classList.contains("connecting-signal")) { lastNode.classList.add("connecting-signal"); setTimeout(() => lastNode.classList.remove("connecting-signal"), 1200); } } }));
            }
        }
    }
    
    function setupHeadingGlows() {
        document.querySelectorAll('.timeline-header h2, .panel-title').forEach(heading => {
            const eventTarget = heading.matches('.timeline-header h2') ? document.body : heading;
            eventTarget.addEventListener('mousemove', (e) => {
                const rect = heading.getBoundingClientRect();
                heading.style.setProperty('--x', `${e.clientX - rect.left}px`);
                heading.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        });
    }

    function setupNotification() {
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.panel-button');
            if (!button || (button.getAttribute('href') !== '#' && !button.dataset.repoStatus)) return;
            e.preventDefault(); 
            const overlay = button.dataset.repoStatus === 'private' ? document.getElementById('private-notification') : document.getElementById('under-development-notification');
            overlay.classList.add('active');
        });

        document.querySelectorAll('.notification-overlay').forEach(overlay => {
            overlay.querySelector('.notification-close').addEventListener('click', () => overlay.classList.remove('active'));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
        });
    }

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    window.addEventListener('resize', debounce(() => location.reload(), 250));
    
    setupTumblerSelector();
    initialRender(currentCategoryIndex);
    setupNotification();
});
