/**
 * Google Ad Manager (GAM) Integration
 * Handles responsive ad slots with size mapping, lazy loading, and collapse functionality
 */

(function() {
    'use strict';
    
    // Global GPT object
    let googletag = window.googletag || {};
    
    // Track if GPT is loaded
    let gptLoaded = false;
    
    // Store slot definitions
    const slots = [];
    
    /**
     * Load GPT asynchronously
     */
    function loadGPT() {
        if (gptLoaded) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.googletagservices.com/tag/js/gpt.js';
            script.async = true;
            
            script.onload = () => {
                gptLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load GPT'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Parse size arrays from data attributes
     */
    function parseSizes(sizeString) {
        try {
            return JSON.parse(sizeString);
        } catch (e) {
            console.warn('Invalid size data:', sizeString);
            return [];
        }
    }
    
    /**
     * Create size mapping for responsive ads
     */
    function createSizeMapping(desktopSizes, tabletSizes, mobileSizes) {
        const sizeMapping = googletag.sizeMapping();
        
        // Desktop (≥1024px)
        if (desktopSizes && desktopSizes.length > 0) {
            sizeMapping.addSize([1024, 0], desktopSizes);
        }
        
        // Tablet (768-1023px)
        if (tabletSizes && tabletSizes.length > 0) {
            sizeMapping.addSize([768, 0], tabletSizes);
        }
        
        // Mobile (<768px)
        if (mobileSizes && mobileSizes.length > 0) {
            sizeMapping.addSize([0, 0], mobileSizes);
        }
        
        return sizeMapping.build();
    }
    
    /**
     * Initialize a single ad slot
     */
    function initSlot(element) {
        const slotPath = element.dataset.slot;
        const desktopSizes = parseSizes(element.dataset.desktop);
        const tabletSizes = parseSizes(element.dataset.tablet);
        const mobileSizes = parseSizes(element.dataset.mobile);
        const shouldCollapse = element.dataset.collapse === 'true';
        const targeting = element.dataset.targeting ? JSON.parse(element.dataset.targeting) : {};
        
        if (!slotPath) {
            console.warn('No slot path defined for element:', element);
            return;
        }
        
        // Create size mapping
        const sizeMapping = createSizeMapping(desktopSizes, tabletSizes, mobileSizes);
        
        // Define the slot
        const slot = googletag.defineSlot(slotPath, sizeMapping, element.id)
            .addService(googletag.pubads());
        
        // Add targeting
        Object.entries(targeting).forEach(([key, value]) => {
            slot.setTargeting(key, value);
        });
        
        // Store slot reference
        slots.push(slot);
        
        // Mark as initialized
        element.dataset.initialized = 'true';
        
        return slot;
    }
    
    /**
     * Initialize all ad slots
     */
    function initAllSlots() {
        const adSlots = document.querySelectorAll('.ad-slot:not([data-initialized])');
        
        adSlots.forEach(element => {
            initSlot(element);
        });
    }
    
    /**
     * Display all slots
     */
    function displaySlots() {
        if (slots.length === 0) return;
        
        googletag.pubads().enableSingleRequest();
        googletag.pubads().setCentering(true);
        googletag.pubads().enableLazyLoad({
            fetchMarginPercent: 200,
            renderMarginPercent: 150
        });
        
        // Check if any slots should collapse
        const shouldCollapse = document.querySelector('.ad-slot[data-collapse="true"]') !== null;
        if (shouldCollapse) {
            googletag.pubads().collapseEmptyDivs(true);
        }
        
        googletag.enableServices();
        
        // Display all slots
        slots.forEach(slot => {
            googletag.display(slot);
        });
        
        // Mark slots as rendered
        document.querySelectorAll('.ad-slot').forEach(element => {
            element.dataset.rendered = 'true';
        });
    }
    
    /**
     * Handle empty slots - keep placeholder frame
     */
    function handleEmptySlots() {
        setTimeout(() => {
            document.querySelectorAll('.ad-slot').forEach(element => {
                if (element.children.length === 0) {
                    // Keep the placeholder frame visible
                    element.style.minHeight = '90px';
                }
            });
        }, 4000); // 4 second delay
    }
    
    /**
     * Main initialization function
     */
    async function init() {
        try {
            // Load GPT
            await loadGPT();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    initAllSlots();
                    displaySlots();
                    handleEmptySlots();
                });
            } else {
                initAllSlots();
                displaySlots();
                handleEmptySlots();
            }
            
        } catch (error) {
            console.error('Failed to initialize GAM ads:', error);
        }
    }
    
    // Start initialization
    init();
    
})();
