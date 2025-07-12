// Page Scroll Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Define the pages in order
    const pages = [
        './index.html',
        './Page-2.html',
        './Page-3.html',
        './Page-4.html'
    ];
    
    // Get current page index
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let currentIndex = pages.findIndex(page => page.includes(currentPage));
    if (currentIndex === -1) currentIndex = 0;
    
    // Variables for scroll detection
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let scrollTimeout;
    let lastScrollDirection = null;
    let scrollThreshold = 100; // Minimum scroll amount to trigger page change
    let scrollY = 0;
    let scrollDelta = 0;
    
    // Initialize UI elements
    const pageProgressDots = document.querySelectorAll('.page-progress-dot');
    const scrollIndicator = document.getElementById('scrollIndicator');
    
    // Hide scroll indicator on last page
    if (currentIndex === pages.length - 1) {
        scrollIndicator.style.display = 'none';
    }
    
    // Function to check if user has scrolled to the bottom of the page
    function isAtBottom() {
        // Get the total height of the page including the part not visible
        const totalHeight = document.documentElement.scrollHeight;
        
        // Get the current scroll position plus the visible height
        const currentPosition = window.scrollY + window.innerHeight;
        
        // Add a small buffer (20px) to account for rounding errors
        return currentPosition >= totalHeight - 20;
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
    
    // Handle wheel events for smooth scrolling between pages
    window.addEventListener('wheel', function(e) {
        // Update scroll values
        scrollDelta += e.deltaY;
        const currentTime = Date.now();
        
        // Determine scroll direction
        const direction = e.deltaY > 0 ? 'down' : 'up';
        
        // If scrolling down and not at the bottom of the page, let normal scroll happen
        if (direction === 'down' && !isAtBottom()) {
            return;
        }
        
        // If scrolling up and not at the top of the page, let normal scroll happen
        if (direction === 'up' && window.scrollY > 0) {
            return;
        }
        
        // Reset if direction changed or enough time passed
        if (direction !== lastScrollDirection || currentTime - lastScrollTime > 1000) {
            scrollDelta = e.deltaY;
        }
        
        lastScrollDirection = direction;
        lastScrollTime = currentTime;
        
        // Check if we should navigate
        if (Math.abs(scrollDelta) > scrollThreshold) {
            // Prevent rapid consecutive scrolls
            if (!isScrolling) {
                isScrolling = true;
                
                if (scrollDelta > 0) {
                    // Scroll down - go to next page only if at bottom
                    if (isAtBottom()) {
                        navigateToPage(currentIndex + 1);
                    }
                } else {
                    // Scroll up - go to previous page only if at top
                    navigateToPage(currentIndex - 1);
                }
                
                // Reset scroll tracking
                scrollDelta = 0;
                
                // Prevent further navigation for a short period
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
                // Swipe up - go to next page only if at bottom
                if (isAtBottom()) {
                    navigateToPage(currentIndex + 1);
                }
            } else {
                // Swipe down - go to previous page only if at top
                if (window.scrollY <= 0) {
                    navigateToPage(currentIndex - 1);
                }
            }
            
            // Prevent further navigation for a short period
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }, { passive: true });
    
    // Add click event listeners to page progress dots
    pageProgressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index !== currentIndex && !isScrolling) {
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
    scrollIndicator.addEventListener('click', () => {
        if (!isScrolling && currentIndex < pages.length - 1) {
            isScrolling = true;
            navigateToPage(currentIndex + 1);
        }
    });
});