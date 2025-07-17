// Mobile Guard - Prevent heavy scripts on mobile
(function() {
    if (window.innerWidth <= 650) {
        // Disable GSAP on mobile
        window.gsap = { 
            registerPlugin: function() {},
            from: function() {},
            to: function() {},
            killTweensOf: function() {}
        };
        
        // Disable ScrollTrigger on mobile
        window.ScrollTrigger = {
            getAll: function() { return []; },
            refresh: function() {}
        };
        
        // Prevent Three.js from loading
        window.THREE = {};
        
        // Override problematic functions
        window.addEventListener = (function(original) {
            return function(type, listener, options) {
                // Skip scroll-based animations on mobile
                if (type === 'scroll' && listener.toString().includes('gsap')) {
                    return;
                }
                return original.call(this, type, listener, options);
            };
        })(window.addEventListener);
    }
})();