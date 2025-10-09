document.addEventListener('DOMContentLoaded', function () {
    // --- Data for Interactive Elements ---
    const emotionalCycleContent = [
        {title: "Phase 1: Anticipation of Loss", description: "This stage begins with deployment orders. You may feel a mix of stress, denial, and fear. It's common to feel distant as you both mentally prepare. Give yourself grace during this chaotic time."},
        {title: "Phase 2: Detachment & Withdrawal", description: "In the final days before departure, you or your service member might feel withdrawn. This is a normal, subconscious way to protect from the pain of the goodbye. Focus on one last positive connection."},
        {title: "Phase 3: Emotional Disorganization", description: "The first few weeks can feel overwhelming. You might feel lonely, sad, and disorganized. This is often the hardest phase. It's okay for things to not be perfect. Focus on a simple routine."},
        {title: "Phase 4: Recovery & Stabilization", description: "You've found your footing. A 'new normal' takes shape as you gain confidence. You feel more in control, and the deployment becomes a manageable part of life. Your resilience is shining."},
        {title: "Phase 5: Anticipation of Homecoming", description: "Excitement builds, but it's often mixed with anxiety about how things have changed. This 'reunion anxiety' is very common. It's okay to feel both thrilled and nervous."},
        {title: "Phase 6: Renegotiation of Relationship", description: "The first few weeks home can feel like getting to know a stranger. You've both changed. Roles and routines need to be renegotiated with patience and open communication."},
        {title: "Phase 7: Reintegration & Stabilization", description: "You've navigated the initial homecoming and are now actively building your new life together. This is a process of rediscovery—creating a new, stronger family dynamic."}
    ];

    // --- Core Interactive Modules ---

    // 1. Accordion Functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const expanded = header.getAttribute('aria-expanded') === 'true' || false;
            header.setAttribute('aria-expanded', !expanded);
        });
    });

    // 2. Parenting Guide Tabs
    const parentingTabs = document.querySelectorAll('.parenting-tab');
    const parentingContents = document.querySelectorAll('.parenting-content');
    parentingTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            parentingTabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('border-blue-600', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('border-blue-600', 'text-blue-600');
            tab.classList.remove('border-transparent', 'text-gray-500');
            parentingContents.forEach((content, cIndex) => {
                content.style.display = index === cIndex ? 'block' : 'none';
            });
        });
    });

    // 3. Interactive Emotional Wellness Timeline
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineContent = document.getElementById('timeline-content');
    const timelineProgress = document.getElementById('timeline-progress');

    function updateTimeline(activeIndex) {
        if (!timelineContent || !timelineProgress) return;
        const item = emotionalCycleContent[activeIndex];
        timelineContent.style.opacity = 0;
        setTimeout(() => {
            timelineContent.innerHTML = `<h4 class="font-bold text-xl text-slate-800 mb-2">${item.title}</h4><p class="text-slate-600 leading-relaxed">${item.description}</p>`;
            timelineContent.style.opacity = 1;
        }, 150);

        timelineDots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < activeIndex) dot.classList.add('completed');
            else if (index === activeIndex) dot.classList.add('active');
        });
        timelineProgress.style.width = `${(activeIndex / (timelineDots.length - 1)) * 100}%`;
    }

    if (timelineDots.length > 0) {
        timelineDots.forEach(dot => {
            dot.addEventListener('click', () => updateTimeline(parseInt(dot.dataset.phase)));
        });
        updateTimeline(0); // Initialize
    }

    // 4. Personal Action Plan
    function updateActionPlan() {
        const sources = document.querySelectorAll('[data-plan-source]');
        sources.forEach(source => {
            const targetId = `plan-summary-${source.dataset.planSource}`;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                if (source.value.trim()) {
                    targetEl.classList.add('has-content');
                    targetEl.innerHTML = `<div class="user-content"><p class="text-left whitespace-pre-wrap">${source.value.trim()}</p></div>`;
                } else {
                    targetEl.classList.remove('has-content');
                    targetEl.innerHTML = `<span class="placeholder-text text-gray-500 italic">Your notes will appear here...</span>`;
                }
            }
        });
    }

    document.querySelectorAll('[data-plan-source]').forEach(el => {
        el.addEventListener('input', updateActionPlan);
    });
    updateActionPlan(); // Initial check

    function printPlan() {
        const why = document.getElementById('plan-summary-why')?.innerHTML || '';
        const support = document.getElementById('plan-summary-support')?.innerHTML || '';
        const comms = document.getElementById('plan-summary-comm')?.innerHTML || '';
        
        const printHTML = `
            <html>
            <head>
                <title>My Deployment Plan</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        line-height: 1.6;
                    }
                    h1 { 
                        color: #1e40af; 
                        border-bottom: 3px solid #1e40af; 
                        padding-bottom: 10px;
                        text-align: center;
                    }
                    .section { 
                        background: #f9fafb; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 20px 0; 
                        border-left: 4px solid #3b82f6;
                    }
                    .section h3 { 
                        color: #1e40af; 
                        margin-top: 0; 
                        font-size: 1.2em;
                    }
                    .date { 
                        color: #6b7280; 
                        font-style: italic; 
                        text-align: center; 
                        margin-bottom: 30px;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                    }
                </style>
            </head>
            <body>
                <h1>My Deployment Action Plan</h1>
                <p class="date">Created: ${new Date().toLocaleDateString()}</p>
                
                <div class="section">
                    <h3>🎯 Our Family's Mission & Purpose</h3>
                    ${why}
                </div>
                
                <div class="section">
                    <h3>🏠 Supporting the Mission from Home</h3>
                    ${support}
                </div>
                
                <div class="section">
                    <h3>💬 Our Communication Plan</h3>
                    ${comms}
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.print();
        }
    }

    document.getElementById('printPlanBtn')?.addEventListener('click', printPlan);
    document.getElementById('generatePrintPlanBtn')?.addEventListener('click', () => {
        document.getElementById('plan-summary')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(printPlan, 700);
    });
    
    // 5. Quick Support Modal
    const quickSupportBtn = document.getElementById('quickSupportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModal = document.getElementById('closeSupportModal');
    if (quickSupportBtn && supportModal && closeSupportModal) {
        const openModal = () => {
            supportModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };
        const closeModal = () => {
            supportModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        };
        quickSupportBtn.addEventListener('click', openModal);
        closeSupportModal.addEventListener('click', closeModal);
        supportModal.addEventListener('click', e => { if (e.target === supportModal) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !supportModal.classList.contains('hidden')) closeModal(); });
    }

    // 6. Welcome Banner
    const welcomeBanner = document.getElementById('welcomeBanner');
    const dismissWelcomeBtn = document.getElementById('dismissWelcome');
    if (localStorage.getItem('fm.deployment.welcomeDismissed') === '1' && welcomeBanner) {
        welcomeBanner.style.display = 'none';
    }
    if (dismissWelcomeBtn && welcomeBanner) {
        dismissWelcomeBtn.addEventListener('click', () => {
            welcomeBanner.style.opacity = '0';
            setTimeout(() => { welcomeBanner.style.display = 'none'; }, 300);
            localStorage.setItem('fm.deployment.welcomeDismissed', '1');
        });
    }
});