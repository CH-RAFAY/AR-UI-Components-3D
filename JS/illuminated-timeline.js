// Illuminated Timeline - GSAP scroll-driven line with ripple effect
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    // Simplified card labels per request
    const demoItems = [
        {
            title: 'Card-1',
            description: 'Lorem ipsum dolor sit amet.<br>Lorem ipsum dolor sit amet.',
            tags: []
        },
        {
            title: 'Card-2',
            description: 'Lorem ipsum dolor sit amet.<br>Lorem ipsum dolor sit amet.',
            tags: []
        },
        {
            title: 'Card-3',
            description: 'Lorem ipsum dolor sit amet.<br>Lorem ipsum dolor sit amet.',
            tags: []
        },
        {
            title: 'Card-4',
            description: 'Lorem ipsum dolor sit amet.<br>Lorem ipsum dolor sit amet.',
            tags: []
        },
        {
            title: 'Card-5',
            description: 'Lorem ipsum dolor sit amet.<br>Lorem ipsum dolor sit amet.',
            tags: []
        },
    ];

    const categories = ['Demo'];
    let currentCategoryIndex = 0;
    let activeScrollTriggers = [];

    function startSequentialAnimation() {
        const mainHeading = document.querySelector('.timeline-header h2');
        const subHeading = document.querySelector('.timeline-header p');
        const timelineContainer = document.querySelector('.timeline-container');
        if (mainHeading) setTimeout(() => mainHeading.classList.add('animate-in'), 200);
        if (subHeading) setTimeout(() => subHeading.classList.add('animate-in'), 800);
        if (timelineContainer) setTimeout(() => timelineContainer.classList.add('animate-in'), 1400);
    }

    function renderTimeline() {
        timelineContainer.innerHTML = `<svg class="timeline-svg"><line class="timeline-path" x1="2" y1="0" x2="2" y2="100%"/></svg>`;
        const projects = demoItems;
        projects.forEach((project, index) => {
            const alignment = index % 2 === 0 ? 'align-left' : 'align-right';
            const entry = document.createElement('div');
            entry.className = `project-entry ${alignment}`;
            const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
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
                    </div>
                </div>`;
            timelineContainer.appendChild(entry);
        });
        setTimeout(() => { setupAdvancedTimeline(); setupProjectActivation(); setupHeadingGlows(); }, 100);
    }

    startSequentialAnimation();
    renderTimeline();

    function setupAdvancedTimeline() {
        const svg = timelineContainer.querySelector('.timeline-svg');
        const path = timelineContainer.querySelector('.timeline-path');
        const projectNodes = timelineContainer.querySelectorAll('.project-node');
        if (!svg || !path || projectNodes.length < 2) { if (svg) gsap.set(svg, { opacity: 0 }); return; }

        const containerRect = timelineContainer.getBoundingClientRect();
        const firstNodeRect = projectNodes[0].getBoundingClientRect();
        const lastNodeRect = projectNodes[projectNodes.length - 1].getBoundingClientRect();
        const y1 = firstNodeRect.top + firstNodeRect.height / 2 - containerRect.top;
        const height = lastNodeRect.top + lastNodeRect.height / 2 - (firstNodeRect.top + firstNodeRect.height / 2);

        svg.setAttribute('height', height);
        svg.style.top = y1 + 'px';
        path.setAttribute('y2', height);

        const pathTotalLength = path.getTotalLength();
        path.style.strokeDasharray = pathTotalLength;
        path.style.strokeDashoffset = pathTotalLength;

        const masterTl = gsap.timeline({ paused: true });
        let lastOffset = pathTotalLength;

        projectNodes.forEach((node, index) => {
            const nodeCenterY = node.getBoundingClientRect().top + node.getBoundingClientRect().height / 2 - (firstNodeRect.top + firstNodeRect.height / 2);
            const currentOffset = pathTotalLength * (1 - (height > 0 ? nodeCenterY / height : 0));
            masterTl.to(path, { strokeDashoffset: currentOffset, duration: Math.abs(currentOffset - lastOffset) / pathTotalLength * 10, ease: 'none' });
            masterTl.call(() => {
                if (!node.classList.contains('connecting-signal')) {
                    node.classList.add('connecting-signal');
                    setTimeout(() => node.classList.remove('connecting-signal'), 1200);
                }
            }, [], '>');
            if (index < projectNodes.length - 1) masterTl.to({}, { duration: 2 });
            lastOffset = currentOffset;
        });

        const masterTrigger = ScrollTrigger.create({
            trigger: '.timeline-container',
            start: 'top center',
            end: 'bottom bottom',
            scrub: 1.5,
            animation: masterTl
        });
        activeScrollTriggers.push(masterTrigger);
        // ensure final node becomes active and pulses when timeline reaches the end
        masterTl.eventCallback('onUpdate', () => {
            try {
                const prog = masterTl.progress();
                if (prog >= 0.995) {
                    const lastNode = projectNodes[projectNodes.length - 1];
                    if (lastNode && !lastNode.classList.contains('connecting-signal')) {
                        lastNode.classList.add('connecting-signal');
                        setTimeout(() => lastNode.classList.remove('connecting-signal'), 1400);
                    }
                    const lastEntry = lastNode && lastNode.closest('.project-entry');
                    if (lastEntry && !lastEntry.classList.contains('is-active')) lastEntry.classList.add('is-active');
                }
            } catch (e) { /* defensive */ }
        });
        gsap.to(svg, { opacity: 1, duration: 0.3 });
    }

    function setupProjectActivation() {
        const projectEntries = timelineContainer.querySelectorAll('.project-entry');
        projectEntries.forEach(entry => {
            activeScrollTriggers.push(ScrollTrigger.create({
                trigger: entry,
                start: 'top center',
                end: 'bottom center',
                toggleClass: 'is-active'
            }));
        });
    }

    function setupHeadingGlows() {
        document.querySelectorAll('.timeline-header h2, .panel-title').forEach(heading => {
            const eventTarget = heading.matches('.timeline-header h2') ? document.body : heading;
            eventTarget.addEventListener('mousemove', e => {
                const rect = heading.getBoundingClientRect();
                heading.style.setProperty('--x', `${e.clientX - rect.left}px`);
                heading.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        });
    }
});
