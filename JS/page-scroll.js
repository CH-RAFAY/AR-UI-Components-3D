// Page Scroll Navigation
// Disable scroll-based navigation on mobile at the very top
if (window.innerWidth <= 650) {
    // Do not register any scroll/touch navigation events
    // This disables the entire script for mobile
    // You can optionally export nothing or just return
    // (function(){return;})();
}

document.addEventListener('DOMContentLoaded', function() {
    // Define the pages in order (filenames only)
    const pages = [
        'index.html',
        'Page-2.html',
        'Page-3.html',
        'Page-4.html'
    ];
    

    
    // Get current page index using only the filename (case-insensitive)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPageLower = currentPage.toLowerCase();
    const pagesLower = pages.map(p => p.toLowerCase());
    let currentIndex = pagesLower.indexOf(currentPageLower);
    if (currentIndex === -1) currentIndex = 0;
    // Debug logs
    console.log('page-scroll.js: currentPage =', currentPage, 'currentIndex =', currentIndex, 'pages =', pages);
    
    // Variables for scroll detection
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let scrollTimeout;
    let lastScrollDirection = null;
    let scrollThreshold = 100; // Minimum scroll amount to trigger page change
    let scrollY = 0;
    let scrollDelta = 0;
    
    // Buffer in pixels required after reaching bottom/top before navigating
    const navigationBuffer = 180; // Increased buffer for longer delay, especially on small screens
    let bufferScroll = 0;
    
    // Initialize UI elements
    const pageProgressDots = document.querySelectorAll('.page-progress-dot');
    const scrollIndicator = document.getElementById('scrollIndicator');
    
    // Hide scroll indicator on last page
    if (scrollIndicator && currentIndex === pages.length - 1) {
        scrollIndicator.style.display = 'none';
    }
    
    // Function to check if user has scrolled to the bottom of the page or #hero-section
    function isAtBottom() {
        if (currentIndex === 0) {
            // For index page, check #hero-section scroll
            const heroSection = document.getElementById('hero-section');
            if (heroSection) {
                return heroSection.scrollTop + heroSection.clientHeight >= heroSection.scrollHeight - 20;
            }
        }
        // Default: check window/document
        const totalHeight = document.documentElement.scrollHeight;
        const currentPosition = window.scrollY + window.innerHeight;
        return currentPosition >= totalHeight - 20;
    }

    // Function to check if user is at the bottom of a section (for index page)
    function isAtBottomOfSection() {
        if (currentIndex !== 0) return isAtBottom(); // For other pages, use normal bottom check
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            return heroSection.scrollTop + heroSection.clientHeight >= heroSection.scrollHeight - 20;
        }
        return isAtBottom(); // Fallback
    }

    // Function to check if user has scrolled to the top of the page or #hero-section
    function isAtTop() {
        if (currentIndex === 0) {
            const heroSection = document.getElementById('hero-section');
            if (heroSection) {
                return heroSection.scrollTop <= 0;
            }
        }
        return window.scrollY <= 0;
    }
    

    

    
    // Function to navigate to a page
    function navigateToPage(index) {
        if (index >= 0 && index < pages.length) {
            // Add transition effect
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                window.location.href = pages[index];
            }, 500);
        }
    }
    
    // Function to update progress dots
    function updateProgressDots(activeIndex) {
        pageProgressDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    // Disable scroll-based navigation on mobile
    if (window.innerWidth <= 650) {
        return;
    }

    // Handle wheel events for smooth scrolling between pages/sections
    window.addEventListener('wheel', function(e) {
        // Update scroll values
        scrollDelta += e.deltaY;
        const currentTime = Date.now();
        
        // Determine scroll direction
        const direction = e.deltaY > 0 ? 'down' : 'up';
        
        // Reset if direction changed or enough time passed
        if (direction !== lastScrollDirection || currentTime - lastScrollTime > 1000) {
            scrollDelta = e.deltaY;
            bufferScroll = 0;
        }
        
        lastScrollDirection = direction;
        lastScrollTime = currentTime;
        
        // Check if we should navigate
        if (Math.abs(scrollDelta) > scrollThreshold) {
            if (!isScrolling) {
                isScrolling = true;
                if (scrollDelta > 0) {
                    // Scroll down - go to next page
                    let canNavigate = false;
                    if (currentIndex === 0) {
                        canNavigate = isAtBottomOfSection();
                    } else {
                        canNavigate = isAtBottom();
                    }
                    if (canNavigate && currentIndex < pages.length - 1) {
                        bufferScroll += Math.abs(scrollDelta);
                        if (bufferScroll >= navigationBuffer) {
                            bufferScroll = 0;
                            navigateToPage(currentIndex + 1);
                        } else {
                            // Optionally, add a bounce animation here
                        }
                    } else if (!canNavigate) {
                        bufferScroll = 0;
                    } else {
                        showNoNextPageAnimation();
                        bufferScroll = 0;
                    }
                } else {
                    // Scroll up - go to previous page
                    if (currentIndex > 0 && isAtTop()) {
                        bufferScroll += Math.abs(scrollDelta);
                        if (bufferScroll >= navigationBuffer) {
                            bufferScroll = 0;
                            navigateToPage(currentIndex - 1);
                        } else {
                            // Optionally, add a bounce animation here
                        }
                    } else if (currentIndex === 0 && isAtTop()) {
                        showNoPrevPageAnimation();
                        bufferScroll = 0;
                    } else {
                        bufferScroll = 0;
                    }
                }
                scrollDelta = 0;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        }
    }, { passive: false });
    
    // Handle touch events for mobile devices
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    window.addEventListener('touchend', function(e) {
        if (isScrolling) return;
        
        touchEndY = e.changedTouches[0].screenY;
        const touchDelta = touchStartY - touchEndY;
        
        // Check if swipe is significant enough
        if (Math.abs(touchDelta) > 100) {
            isScrolling = true;
            if (touchDelta > 0) {
                // Swipe up - go to next page
                let canNavigate = false;
                if (currentIndex === 0) {
                    canNavigate = isAtBottomOfSection();
                } else {
                    canNavigate = isAtBottom();
                }
                if (canNavigate && currentIndex < pages.length - 1) {
                    bufferScroll += Math.abs(touchDelta);
                    if (bufferScroll >= navigationBuffer) {
                        bufferScroll = 0;
                        navigateToPage(currentIndex + 1);
                    } else {
                        // Optionally, add a bounce animation here
                    }
                } else if (!canNavigate) {
                    bufferScroll = 0;
                } else {
                    showNoNextPageAnimation();
                    bufferScroll = 0;
                }
            } else {
                // Swipe down - go to previous page
                if (currentIndex > 0 && isAtTop()) {
                    bufferScroll += Math.abs(touchDelta);
                    if (bufferScroll >= navigationBuffer) {
                        bufferScroll = 0;
                        navigateToPage(currentIndex - 1);
                    } else {
                        // Optionally, add a bounce animation here
                    }
                } else if (currentIndex === 0 && isAtTop()) {
                    showNoPrevPageAnimation();
                    bufferScroll = 0;
                } else {
                    bufferScroll = 0;
                }
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }, { passive: true });
    
    // Add click event listeners to page progress dots
    pageProgressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isScrolling && index !== currentIndex) {
                isScrolling = true;
                navigateToPage(index);
            }
        });
        
        // Add hover effect
        dot.addEventListener('mouseenter', () => {
            if (index !== currentIndex) {
                dot.style.transform = 'scale(1.2)';
            }
        });
        
        dot.addEventListener('mouseleave', () => {
            if (index !== currentIndex) {
                dot.style.transform = 'scale(1)';
            }
        });
    });
    
    // Add page transition effect when page loads
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
    
    // Add click event to scroll indicator
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            if (!isScrolling && currentIndex < pages.length - 1) {
                isScrolling = true;
                navigateToPage(currentIndex + 1);
            }
        });
    }
    
    // --- Scroll Hint Animation for Index Page ---
    if (currentIndex === 0) {
        const mainLayout = document.getElementById('mainLayout');
        const globeContainer = document.getElementById('globeContainer');
        const globeOverlay = document.querySelector('.globe-overlay');
        let scrollHintInterval = null;
        let userHasScrolled = false;
        function playScrollHint(times, durationUp = 0.5, durationDown = 0.7) {
            if (mainLayout && globeContainer && globeOverlay && window.gsap) {
                const targets = [mainLayout, globeContainer, globeOverlay];
                const tl = gsap.timeline();
                for (let i = 0; i < times; i++) {
                    tl.to(targets, { y: -40, duration: durationUp, ease: 'power1.out' })
                      .to(targets, { y: 0, duration: durationDown, ease: 'bounce.out' });
                }
            }
        }
        setTimeout(() => {
            playScrollHint(2, 0.5, 0.7); // Initial: 2 times, slightly slower
            // Set up interval for repeating hint every 5 seconds
            scrollHintInterval = setInterval(() => {
                if (!userHasScrolled) {
                    playScrollHint(1, 0.35, 0.5); // Repeat: 1 time, normal speed
                }
            }, 5000);
        }, 900);
        // Listen for user scroll to stop the interval
        function onUserScroll() {
            if (!userHasScrolled) {
                userHasScrolled = true;
                if (scrollHintInterval) clearInterval(scrollHintInterval);
            }
        }
        window.addEventListener('scroll', onUserScroll, { once: true });
        // For keyboard navigation or touch
        window.addEventListener('keydown', onUserScroll, { once: true });
        window.addEventListener('touchstart', onUserScroll, { once: true });
    }


});

function showNoPrevPageAnimation() {
    // Example: shake the main layout or body
    const mainLayout = document.getElementById('mainLayout') || document.body;
    if (window.gsap) {
        gsap.fromTo(mainLayout, { x: 0 }, { x: -30, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut', onComplete: () => {
            gsap.to(mainLayout, { x: 0, duration: 0.1 });
        }});
    } else {
        mainLayout.style.transition = 'transform 0.1s';
        mainLayout.style.transform = 'translateX(-30px)';
        setTimeout(() => {
            mainLayout.style.transform = 'translateX(0)';
        }, 300);
    }
}

function showNoNextPageAnimation() {
    // Example: shake the main layout or body
    const mainLayout = document.getElementById('mainLayout') || document.body;
    if (window.gsap) {
        gsap.fromTo(mainLayout, { x: 0 }, { x: 30, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut', onComplete: () => {
            gsap.to(mainLayout, { x: 0, duration: 0.1 });
        }});
    } else {
        mainLayout.style.transition = 'transform 0.1s';
        mainLayout.style.transform = 'translateX(30px)';
        setTimeout(() => {
            mainLayout.style.transform = 'translateX(0)';
        }, 300);
    }
}