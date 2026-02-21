// Orbital Revolver - 3D draggable category tumbler
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    const selector = document.querySelector('.category-selector');
    const tumbler = document.querySelector('.tumbler');
    if (!selector || !tumbler) return;

    const categories = ['Frontend', 'Backend', 'Design', 'Data', 'AI/ML'];
    let currentCategoryIndex = 0;
    const sidePrev = tumbler.querySelector('.side-prev');
    const sideNext = tumbler.querySelector('.side-next');
    const angleStep = 360 / categories.length;
    const radius = (selector.offsetWidth / 2) / Math.tan(Math.PI / categories.length);

    tumbler.querySelectorAll('.category-label').forEach(l => l.remove());
    categories.forEach((cat, i) => {
        const label = document.createElement('div');
        label.className = 'category-label';
        label.textContent = cat;
        label.dataset.index = i;
        tumbler.appendChild(label);
        gsap.set(label, { transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px) translateZ(-1px)` });
    });

    function updateActiveCategory(activeIndex) {
        tumbler.querySelectorAll('.category-label').forEach(label => {
            label.classList.toggle('active', parseInt(label.dataset.index) === activeIndex);
        });
    }

    function setTumblerAppearance(is3D, hintDirection = null) {
        tumbler.querySelectorAll('.category-label').forEach(label => {
            const labelIndex = parseInt(label.dataset.index);
            let show = is3D || label.classList.contains('active');
            label.classList.remove('hint-visible');
            if (hintDirection) {
                const nextIndex = (currentCategoryIndex + 1) % categories.length;
                const prevIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
                if ((hintDirection === 'next' && labelIndex === nextIndex) || (hintDirection === 'prev' && labelIndex === prevIndex)) {
                    label.classList.add('hint-visible');
                    show = true;
                }
            }
            gsap.to(label, { opacity: show ? 1 : 0, duration: 0.3 });
        });
    }

    const introAnimation = gsap.timeline({
        onComplete: () => {
            setTumblerAppearance(false);
            const hintAnimation = gsap.timeline({ repeat: -1, defaults: { duration: 0.8, ease: 'sine.inOut' } });
            const activeLabel = tumbler.querySelector('.category-label.active');
            const hintRotationAngle = window.innerWidth < 480 ? 20 : 35;
            hintAnimation
                .to(tumbler, { rotationY: -hintRotationAngle, onStart: () => { activeLabel.classList.add('hint-suppressed'); setTumblerAppearance(true, 'next'); } }, '+=2')
                .to(sideNext, { opacity: 1 }, '<')
                .to(tumbler, { rotationY: 0, onComplete: () => { activeLabel.classList.remove('hint-suppressed'); setTumblerAppearance(false); } }, '>0.6')
                .to(sideNext, { opacity: 0 }, '<')
                .to(tumbler, { rotationY: hintRotationAngle, onStart: () => { activeLabel.classList.add('hint-suppressed'); setTumblerAppearance(true, 'prev'); } }, '+=2')
                .to(sidePrev, { opacity: 1 }, '<')
                .to(tumbler, { rotationY: 0, onComplete: () => { activeLabel.classList.remove('hint-suppressed'); setTumblerAppearance(false); } }, '>0.6')
                .to(sidePrev, { opacity: 0 }, '<');
            selector.hintAnimation = hintAnimation;
        },
    });
    introAnimation.from(tumbler, { rotationY: '-=360', duration: 2.5, ease: 'power3.out', onStart: () => setTumblerAppearance(true) });
    selector.introAnimation = introAnimation;

    let isDragging = false; let startX;
    const snapToCategory = () => {
        const currentRotation = gsap.getProperty(tumbler, 'rotationY');
        const targetRotation = Math.round(currentRotation / angleStep) * angleStep;
        let newIndex = ((-targetRotation / angleStep) % categories.length + categories.length) % categories.length;
        gsap.to(tumbler, { rotationY: targetRotation, duration: 1.1, ease: 'power3.out', onComplete: () => setTumblerAppearance(false) });
        if (newIndex !== currentCategoryIndex) currentCategoryIndex = newIndex;
        updateActiveCategory(currentCategoryIndex);
    };

    selector.addEventListener('mousedown', e => {
        if (selector.introAnimation) selector.introAnimation.kill();
        if (selector.hintAnimation) selector.hintAnimation.kill();
        gsap.to([sidePrev, sideNext], { opacity: 0, duration: 0.1 });
        tumbler.querySelectorAll('.category-label').forEach(l => l.classList.remove('hint-suppressed', 'hint-visible'));
        setTumblerAppearance(true);
        isDragging = true;
        startX = e.pageX - gsap.getProperty(tumbler, 'rotationY') * 2.5;
        gsap.killTweensOf(tumbler);
    });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        gsap.set(tumbler, { rotationY: (e.pageX - startX) / 2.5 });
    });
    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        snapToCategory();
    });

    let touchDragging = false; let touchStartX = 0;
    selector.addEventListener('touchstart', e => {
        if (selector.introAnimation) selector.introAnimation.kill();
        if (selector.hintAnimation) selector.hintAnimation.kill();
        gsap.to([sidePrev, sideNext], { opacity: 0, duration: 0.1 });
        tumbler.querySelectorAll('.category-label').forEach(l => l.classList.remove('hint-suppressed', 'hint-visible'));
        setTumblerAppearance(true);
        touchDragging = true;
        touchStartX = e.touches[0].pageX - gsap.getProperty(tumbler, 'rotationY') * 2.5;
        gsap.killTweensOf(tumbler);
    });
    window.addEventListener('touchmove', e => {
        if (!touchDragging) return;
        gsap.set(tumbler, { rotationY: (e.touches[0].pageX - touchStartX) / 2.5 });
    });
    window.addEventListener('touchend', () => {
        if (!touchDragging) return;
        touchDragging = false;
        snapToCategory();
    });

    updateActiveCategory(0);
});
