// Manually Curated Atomic Content - Gold Standard Quality
// Hand-crafted HTML for each of the 26 atomic blocks

export const CURATED_ATOMS: Record<string, { title: string; html: string; type: string; tags: string[]; topics: string[] }> = {
  // ==================== PCS HUB ATOMS (8) ====================
  
  'pcs-master-checklist': {
    title: 'Complete PCS Checklist',
    type: 'checklist',
    tags: ['pcs', 'checklist'],
    topics: ['pcs', 'pcs-prep'],
    html: `
      <p class="text-lg mb-8">A comprehensive checklist covering every critical task for your permanent change of station, organized by category.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">Legal Readiness</h3>
      <ul class="space-y-3">
        <li><strong>Power of Attorney (POA):</strong> Visit base legal to prepare General or Special POA (free service)</li>
        <li><strong>Wills & Living Wills:</strong> Update documents to reflect current wishes</li>
        <li><strong>Family Care Plan:</strong> Required for single parents or dual-military couples with dependents</li>
        <li><strong>DEERS/ID Cards:</strong> Verify all dependents enrolled with current IDs</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">Financial Readiness</h3>
      <ul class="space-y-3">
        <li><strong>Review LES & Allotments:</strong> Set automatic payments for all bills</li>
        <li><strong>PCS Budget:</strong> Calculate DLA, TLE, per diem, and out-of-pocket costs</li>
        <li><strong>SCRA Benefits:</strong> Contact lenders to cap interest rates at 6% on pre-service loans</li>
        <li><strong>Credit Monitoring:</strong> Place active duty alert on credit reports</li>
        <li><strong>Emergency Fund:</strong> Aim for $1,000-2,000 buffer for unexpected costs</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">Household & Logistics</h3>
      <ul class="space-y-3">
        <li><strong>Schedule TMO:</strong> Book household goods shipment 30-90 days before move (earlier during May-Aug)</li>
        <li><strong>Declutter & Inventory:</strong> Purge items, take photos/video of valuables</li>
        <li><strong>Notify Landlord:</strong> Use SCRA to break lease without penalty</li>
        <li><strong>Utilities:</strong> Schedule disconnection at old home, setup at new</li>
        <li><strong>Address Changes:</strong> Submit USPS change, update banks, subscriptions</li>
        <li><strong>Schools:</strong> Request records transfer, research new school districts</li>
        <li><strong>Medical/Dental:</strong> Get referrals, transfer prescriptions, update TRICARE</li>
        <li><strong>Pets:</strong> Research new base pet policy, vet records, quarantine requirements (OCONUS)</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">Create Your PCS Binder</h3>
      <p class="mb-4">Keep all critical documents in one 3-ring binder you hand-carry during the move:</p>
      <ul class="space-y-2">
        <li>Multiple copies of orders</li>
        <li>Passports, birth certificates, social security cards</li>
        <li>Marriage certificate</li>
        <li>Vehicle titles and registration</li>
        <li>School and medical records</li>
        <li>Pet vaccination records</li>
        <li>New command and sponsor contact info</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-2">Pro Tip: The 30-60-90 Rule</p>
        <p class="text-blue-800">Complete legal/financial tasks 90 days out, schedule logistics 60 days out, and handle final preparations 30 days out. This prevents last-minute chaos.</p>
      </div>
    `,
  },

  'pcs-timeline-tool': {
    title: 'Interactive PCS Timeline Generator',
    type: 'tool',
    tags: ['pcs', 'timeline'],
    topics: ['pcs', 'pcs-prep'],
    html: `
      <p class="text-lg mb-6">Generate a personalized PCS timeline based on your report date, with every critical deadline mapped out week-by-week.</p>
      
      <h3 class="text-2xl font-bold mb-4">How It Works</h3>
      <p class="mb-6">Enter your Report No Later Than Date (RNLTD) from your orders. The tool generates a customized timeline showing when to complete each task, working backwards from your report date.</p>

      <h3 class="text-2xl font-bold mt-8 mb-4">Key Milestones</h3>
      <ul class="space-y-3">
        <li><strong>12 weeks out:</strong> Schedule HHG shipment with TMO</li>
        <li><strong>10 weeks out:</strong> Complete medical/dental clearance</li>
        <li><strong>8 weeks out:</strong> Book temporary lodging (TLE/TLA)</li>
        <li><strong>6 weeks out:</strong> Begin decluttering and purging</li>
        <li><strong>4 weeks out:</strong> Submit USPS address change</li>
        <li><strong>3 weeks out:</strong> Notify schools, arrange transfers</li>
        <li><strong>2 weeks out:</strong> Pack personal items and essentials</li>
        <li><strong>1 week out:</strong> Final preparations and goodbyes</li>
        <li><strong>Report date:</strong> Check in at new duty station</li>
      </ul>

      <div class="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
        <p class="font-semibold text-yellow-900 mb-2">Disclaimer</p>
        <p class="text-yellow-800">This timeline is an unofficial planning estimate. Every PCS is unique. Always refer to your official orders and consult TMO for official deadlines.</p>
      </div>

      <div class="mt-6">
        <a href="https://www.move.mil/" target="_blank" rel="noopener" class="inline-flex items-center text-primary-accent font-semibold hover:underline">
          Visit Official Move.mil Portal →
        </a>
      </div>
    `,
  },

  'pcs-budget-calculator': {
    title: 'PCS Financial Calculator',
    type: 'calculator',
    tags: ['pcs', 'budget', 'dla', 'tle'],
    topics: ['pcs', 'budgeting'],
    html: `
      <p class="text-lg mb-6">Calculate your PCS income (DLA, TLE, per diem) and expenses to budget accurately and avoid financial surprises.</p>
      
      <h3 class="text-2xl font-bold mb-4">PCS Entitlements Explained</h3>
      
      <div class="space-y-6 mb-8">
        <div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">Dislocation Allowance (DLA)</h4>
          <p class="text-gray-700 mb-2">One-time payment to help offset costs of setting up a new household (utility deposits, etc.).</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>Varies by rank and dependents: $1,000-$4,000+</li>
            <li>Can be requested as advance before move</li>
            <li>Not taxable</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">Temporary Lodging Expense (TLE)</h4>
          <p class="text-gray-700 mb-2">Reimburses temporary lodging and meals for CONUS moves.</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>Up to 10 days at old or new duty station</li>
            <li>Covers actual lodging costs (varies by location)</li>
            <li>75% of per diem for meals</li>
            <li>Save all receipts for reimbursement</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">Per Diem</h4>
          <p class="text-gray-700">Daily allowance for meals and incidental expenses during authorized travel days. Rate varies by location ($50-150/day typical).</p>
        </div>

        <div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">PPM (Personally Procured Move)</h4>
          <p class="text-gray-700 mb-2">Government pays you to move yourself (currently 100-130% of baseline cost).</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>Must get certified weight tickets (empty and full)</li>
            <li>Save ALL receipts (truck rental, gas, supplies)</li>
            <li>Potential profit if you move efficiently</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">Typical Out-of-Pocket Costs</h3>
      <ul class="space-y-2 mb-6 text-gray-700">
        <li><strong>CONUS PCS:</strong> $500-$2,000 (travel meals beyond per diem, extra lodging, utility deposits, household items)</li>
        <li><strong>OCONUS PCS:</strong> $2,000-$5,000 (passports, pet relocation, additional lodging, shipping costs)</li>
      </ul>

      <div class="p-6 bg-green-50 rounded-lg border-l-4 border-green-500 mt-8">
        <p class="font-semibold text-green-900 mb-2">Budget Pro-Tips</p>
        <ul class="space-y-2 text-green-800">
          <li>Request DLA advance to cover upfront costs</li>
          <li>Save all receipts in a dedicated envelope</li>
          <li>Track expenses daily using a simple spreadsheet</li>
          <li>Build a $500-1,000 PCS emergency buffer before moving</li>
        </ul>
      </div>

      <div class="mt-6">
        <a href="https://www.defensetravel.dod.mil/site/perdiemCalc.cfm" target="_blank" rel="noopener" class="inline-flex items-center text-primary-accent font-semibold hover:underline">
          Official DoD Per Diem Calculator →
        </a>
      </div>
    `,
  },

  'pcs-emotional-readiness': {
    title: 'Mental & Emotional PCS Preparation',
    type: 'guide',
    tags: ['pcs', 'mental-health', 'family'],
    topics: ['pcs', 'family'],
    html: `
      <p class="text-xl mb-8">A PCS is more than logistics—it's a major life transition affecting your entire family's emotional well-being. Use these evidence-based strategies to thrive through the change.</p>

      <h3 class="text-2xl font-bold mb-4">Coping with Relocation Stress</h3>
      <p class="mb-4">Let's be honest: at some point during your PCS, you'll have an "ugly cry" moment. It's not a sign of failure—it's a completely normal reaction to the stress of uprooting your life.</p>
      
      <p class="mb-4"><strong>Acknowledge the grief:</strong> You're leaving a community you've built, routines you've established, and friendships that matter. That loss is real.</p>
      
      <h4 class="text-xl font-bold mt-6 mb-3">Practical Coping Strategies</h4>
      <ul class="space-y-3 mb-6">
        <li><strong>Prioritize self-care:</strong> Even 10-minute walks, journaling, or calling a friend helps</li>
        <li><strong>Give yourself grace:</strong> Lower your standards for a few weeks. Cereal for dinner is fine.</li>
        <li><strong>Stay connected to old friends:</strong> Schedule regular video calls to maintain support system</li>
        <li><strong>Join new community early:</strong> Connect with spouse groups on social media before arriving</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">Helping Children Through the Move</h3>
      <p class="mb-4">Children often experience a PCS as a significant loss, even if they don't have the words to express it. Help them process by creating a sense of closure.</p>
      
      <h4 class="text-xl font-bold mt-6 mb-3">Age-Appropriate Strategies</h4>
      <ul class="space-y-3 mb-6">
        <li><strong>Create a 'goodbye book':</strong> Collect photos and notes from friends as keepsakes</li>
        <li><strong>Host a 'see you later' party:</strong> Small gathering helps with closure</li>
        <li><strong>Allow them to be sad:</strong> Validating feelings is more powerful than toxic positivity</li>
        <li><strong>Visual countdown:</strong> Create fun calendar marking milestones, not just days</li>
        <li><strong>Involve them in planning:</strong> Let them help choose bedroom paint color or research new area</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">The "First Week" Reality Check</h3>
      <p class="mb-4">Your first week in a new place will be chaotic. Set realistic expectations:</p>
      <ul class="space-y-2 mb-6">
        <li>It's okay to live out of boxes for a week (or two)</li>
        <li>Paper plates and takeout are survival strategies, not failures</li>
        <li>Kids will watch more screens than usual—that's fine</li>
        <li>Feeling homesick for your last duty station is proof you made it home there too</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Professional Support Available 24/7</p>
        <ul class="space-y-2 text-blue-800">
          <li><a href="https://www.militaryonesource.mil/confidential-help/non-medical-counseling/" target="_blank" rel="noopener" class="font-semibold hover:underline">Military OneSource Counseling</a> - Free, confidential, no medical record</li>
          <li><a href="https://www.militarychild.org/" target="_blank" rel="noopener" class="font-semibold hover:underline">Military Child Education Coalition</a> - Resources for children</li>
          <li><a href="https://www.militaryonesource.mil/special-needs/efmp/" target="_blank" rel="noopener" class="font-semibold hover:underline">EFMP Resources</a> - For families with special needs</li>
        </ul>
      </div>
    `,
  },

  'pcs-faq': {
    title: 'PCS Questions Answered',
    type: 'faq_section',
    tags: ['pcs', 'faq'],
    topics: ['pcs', 'pcs-prep'],
    html: `
      <p class="text-lg mb-8">Expert answers to the most common PCS questions about entitlements, logistics, and timelines.</p>

      <div class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">I just got my orders. What are the first three things I should do?</h4>
          <ol class="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Visit TMO within 48 hours</strong> to schedule household goods shipment (critical during peak season May-August)</li>
            <li><strong>Start your PCS Binder</strong> - 3-ring binder with orders, passports, birth certificates, medical records</li>
            <li><strong>Calculate your budget</strong> - Estimate DLA, TLE, per diem income and out-of-pocket costs ($500-2,000 typical)</li>
          </ol>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What's the difference between a government move and PPM?</h4>
          <p class="text-gray-700 mb-3"><strong>Government Move:</strong> Military hires and manages moving company. Hands-off, but less control over timing.</p>
          <p class="text-gray-700"><strong>PPM (Personally Procured Move):</strong> You move yourself. Government pays you 100-130% of what they would have paid movers. If you do it cheaper, you profit. Requires certified weight tickets and meticulous receipts.</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What are DLA and TLE?</h4>
          <p class="text-gray-700 mb-3"><strong>DLA (Dislocation Allowance):</strong> One-time payment ($1,000-$4,000) to offset costs of setting up new household. Can be advanced before move.</p>
          <p class="text-gray-700"><strong>TLE (Temporary Lodging Expense):</strong> Reimburses temporary lodging and meals (up to 10 days) at old or new CONUS duty station while waiting for housing.</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">How much does a PCS cost out of pocket?</h4>
          <p class="text-gray-700 mb-2">Most CONUS moves: <strong>$500-$2,000</strong></p>
          <ul class="list-disc list-inside text-gray-700 space-y-1 mb-3">
            <li>Travel meals not covered by per diem</li>
            <li>Temporary lodging beyond TLE days</li>
            <li>Utility deposits at new home</li>
            <li>Household items and basics</li>
          </ul>
          <p class="text-gray-700 mb-2">OCONUS moves: <strong>$2,000-$5,000</strong></p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>Passport fees for family</li>
            <li>Pet relocation and quarantine</li>
            <li>Additional lodging and travel costs</li>
          </ul>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">Can I ship my car and pets?</h4>
          <p class="text-gray-700 mb-3"><strong>Vehicles:</strong> For OCONUS, government pays to ship one eligible POV per service member. Second vehicle at personal expense.</p>
          <p class="text-gray-700"><strong>Pets:</strong> DoD reimburses up to $550 CONUS and $2,000 OCONUS for pet transport or quarantine (one cat or dog), subject to JTR rules and documentation.</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What's my weight allowance?</h4>
          <p class="text-gray-700 mb-2">Based on rank and dependency status:</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>E-1 without dependents: 5,000 lbs</li>
            <li>E-5 with dependents: 9,000 lbs</li>
            <li>O-3 with dependents: 14,500 lbs</li>
            <li>O-6+ with dependents: 18,000 lbs</li>
          </ul>
          <p class="text-gray-700 mt-3">Pro gear (uniforms, equipment) gets separate 2,000 lb allowance. Exceeding weight costs approximately $0.50-1.00 per pound.</p>
        </div>
      </div>
    `,
  },

  'oconus-pcs-guide': {
    title: 'OCONUS PCS Navigator',
    type: 'guide',
    tags: ['pcs', 'oconus'],
    topics: ['pcs', 'oconus'],
    html: `
      <p class="text-xl mb-8">Moving overseas? These country-specific guides help you navigate VAT exemptions, driving requirements, pet quarantine, and cultural essentials.</p>

      <h3 class="text-2xl font-bold mb-4">🇩🇪 Germany</h3>
      <div class="mb-8 p-6 bg-gray-50 rounded-lg">
        <p class="mb-4"><strong>Currency:</strong> Euro (€)</p>
        <p class="mb-4"><strong>VAT/Tax:</strong> Under SOFA, you're exempt from VAT (Value-Added Tax / Mehrwertsteuer). Get VAT forms from base tax office BEFORE large purchases to save 19%.</p>
        <p class="mb-4"><strong>Driving:</strong> USAREUR driver's license required. Start process at base transportation office upon arrival.</p>
        <p class="mb-4"><strong>Pets:</strong> EU Pet Passport required (microchip + specific vaccination timeline). Start months in advance.</p>
        <p><strong>Pro Tip:</strong> Bring reusable bags for shopping (stores charge for bags). Popular stores: Rewe, Edeka (groceries), Lidl/Aldi (discount), Saturn/MediaMarkt (electronics).</p>
      </div>

      <h3 class="text-2xl font-bold mb-4">🇯🇵 Japan</h3>
      <div class="mb-8 p-6 bg-gray-50 rounded-lg">
        <p class="mb-4"><strong>Currency:</strong> Japanese Yen (¥)</p>
        <p class="mb-4"><strong>Driving:</strong> Japanese driver's license required. Command sponsor guides you through process.</p>
        <p class="mb-4"><strong>Pets:</strong> Strict 180-day quarantine can be completed at home before move, but paperwork is extensive. Start immediately upon receiving orders.</p>
        <p><strong>Pro Tip:</strong> Japan is still cash-based. Always carry sufficient Yen. Popular stores: AEON, Ito-Yokado (supermarkets), Don Quijote (discount variety).</p>
      </div>

      <h3 class="text-2xl font-bold mb-4">🇰🇷 South Korea</h3>
      <div class="mb-8 p-6 bg-gray-50 rounded-lg">
        <p class="mb-4"><strong>Currency:</strong> South Korean Won (₩)</p>
        <p class="mb-4"><strong>SOFA Status:</strong> Provides specific rights and regulations. Command sponsor is your best resource.</p>
        <p class="mb-4"><strong>Driving:</strong> International driver's license recommended initially. Korean license required for full tour.</p>
        <p class="mb-4"><strong>Pets:</strong> Rabies antibody test (RNATT) required well in advance, plus health certificates.</p>
        <p><strong>Pro Tip:</strong> Many stores have point cards/apps with significant discounts. Worth signing up despite language barrier.</p>
      </div>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Universal OCONUS Tips</p>
        <ul class="space-y-2 text-blue-800">
          <li>Get passports for entire family 6+ months before move</li>
          <li>Research COLA (Cost of Living Allowance) for your destination</li>
          <li>Connect with Facebook groups for your base BEFORE arriving</li>
          <li>Don't buy furniture until you see your actual housing (often smaller overseas)</li>
          <li>Stock up on American staples at CONUS commissary before leaving</li>
        </ul>
      </div>
    `,
  },

  'ppm-profit-guide': {
    title: 'PPM (Do-It-Yourself Move) Complete Guide',
    type: 'guide',
    tags: ['pcs', 'ppm', 'dity'],
    topics: ['pcs', 'ppm'],
    html: `
      <p class="text-xl mb-8">A Personally Procured Move (PPM) means you move yourself and the government pays you. Done right, you can profit. Done wrong, you lose money and stress.</p>

      <h3 class="text-2xl font-bold mb-4">How PPM Works</h3>
      <p class="mb-4">The government calculates what it would cost them to move you, then pays you 100-130% of that amount (rate varies). If you can move for less, you keep the difference as profit.</p>

      <h3 class="text-2xl font-bold mt-8 mb-4">Non-Negotiable Requirements</h3>
      <ul class="space-y-3 mb-8">
        <li><strong>Certified Weight Tickets:</strong> Get empty and full weight from certified scale (CAT scale, truck stops, landfills). This is CRITICAL—no tickets = no payment.</li>
        <li><strong>Save EVERY Receipt:</strong> Truck rental, gas, tolls, packing supplies, equipment rental. Even small receipts matter.</li>
        <li><strong>DD Form 2278:</strong> Application for PPM (get from TMO before move)</li>
        <li><strong>Travel Voucher (DD 1351-2):</strong> Submit after move with all documentation</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Cost Breakdown Example</h3>
      <div class="p-6 bg-green-50 rounded-lg mb-6">
        <p class="font-semibold text-green-900 mb-3">Typical 1,200-mile PPM with 8,000 lbs:</p>
        <div class="space-y-2 text-green-800">
          <p><strong>Government Payment:</strong> ~$4,000-5,000 (130% rate)</p>
          <p><strong>Your Costs:</strong></p>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li>Truck rental: $800-1,200</li>
            <li>Gas: $400-600</li>
            <li>Packing supplies: $150-250</li>
            <li>Lodging: $200-400</li>
            <li>Equipment rental (dollies, straps): $50-100</li>
          </ul>
          <p class="mt-3"><strong>Potential Profit:</strong> $1,600-2,800 if done efficiently</p>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">Post-GHC Reality (2025)</h3>
      <div class="p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 mb-6">
        <p class="font-semibold text-yellow-900 mb-2">Important: DPS System Delays</p>
        <p class="text-yellow-800">Since GHC termination in June 2025, PPM reimbursements through DPS are taking 60-90 days longer. Budget accordingly and ensure your paperwork is perfect—there's no room for error in current system.</p>
      </div>

      <div class="mt-8">
        <a href="https://www.move.mil/" target="_blank" rel="noopener" class="inline-flex items-center text-primary-accent font-semibold hover:underline">
          Official Move.mil Portal for PPM Info →
        </a>
      </div>
    `,
  },

  // ==================== CAREER HUB ATOMS (7) ====================
  
  'mycaa-complete-guide': {
    title: 'MyCAA Scholarship Complete Guide',
    type: 'checklist',
    tags: ['career', 'education', 'mycaa'],
    topics: ['career', 'mycaa', 'education'],
    html: `
      <p class="text-xl mb-8">The My Career Advancement Account (MyCAA) is a game-changer: up to <strong>$4,000</strong> for portable career training. Here's everything you need to know.</p>

      <h3 class="text-2xl font-bold mb-4">Eligibility Checklist</h3>
      <ul class="space-y-3 mb-8">
        <li><strong>Rank Requirements:</strong> Spouses of active-duty members in pay grades E-1 to E-6, W-1 to W-2, and O-1 to O-3</li>
        <li><strong>Guard/Reserve:</strong> Spouses of activated Guard/Reserve in same pay grades (while on Title 10 orders)</li>
        <li><strong>Completion Requirement:</strong> Must complete program while spouse is on Title 10 orders</li>
        <li><strong>Promotion Rule:</strong> If your Education Plan was approved while spouse was eligible, you can continue even if they promote out</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Step-by-Step Action Plan</h3>
      <ol class="list-decimal list-inside space-y-4 mb-8">
        <li><strong>DEERS Check:</strong> Confirm your eligibility in the DEERS system (visit ID card office or call 1-800-538-9552)</li>
        <li><strong>Create MyCAA Account:</strong> Visit <a href="https://mycaa.militaryonesource.mil/mycaa/" target="_blank" rel="noopener" class="text-primary-accent font-semibold hover:underline">MyCAA Portal</a> and complete registration</li>
        <li><strong>Explore Careers & Schools:</strong> Use their career exploration tools to find an approved program in a portable field</li>
        <li><strong>Develop Your Education Plan:</strong> Work with a SECO career coach (free) to create your official Education and Training Plan</li>
        <li><strong>Request Financial Assistance:</strong> Once plan is approved, MyCAA pays the school directly—you never see the money, it goes straight to tuition</li>
      </ol>

      <h3 class="text-2xl font-bold mb-4">What MyCAA Covers</h3>
      <ul class="space-y-2 mb-8 text-gray-700">
        <li>Associate degrees in portable career fields</li>
        <li>Licenses (e.g., real estate, nursing)</li>
        <li>Certifications (e.g., project management, IT, healthcare)</li>
        <li>Credentials that lead to portable employment</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">What MyCAA Does NOT Cover</h3>
      <ul class="space-y-2 mb-8 text-gray-700">
        <li>Bachelor's or master's degrees (use GI Bill transfer for these)</li>
        <li>Programs not on the approved schools list</li>
        <li>Non-portable career fields</li>
      </ul>

      <div class="p-6 bg-green-50 rounded-lg border-l-4 border-green-500 mt-8">
        <p class="font-semibold text-green-900 mb-3">Pro Tips for MyCAA Success</p>
        <ul class="space-y-2 text-green-800">
          <li>Apply early—don't wait until you need to start classes</li>
          <li>Choose portable fields: tech, healthcare, business, education</li>
          <li>Verify school is on approved list BEFORE enrolling</li>
          <li>Keep your SECO coach in the loop about timeline changes</li>
        </ul>
      </div>

      <div class="mt-6">
        <a href="https://myseco.militaryonesource.mil/portal/" target="_blank" rel="noopener" class="inline-flex items-center text-primary-accent font-semibold hover:underline">
          SECO Portal for Career Coaching →
        </a>
      </div>
    `,
  },

  'resume-power-up': {
    title: 'Military Spouse Resume Translator',
    type: 'guide',
    tags: ['career', 'resume', 'job-search'],
    topics: ['career', 'job-search', 'resume'],
    html: `
      <p class="text-xl mb-8">Your military life is packed with valuable skills. Here's how to translate deployments, PCS moves, and volunteer work into powerful resume achievements that resonate with hiring managers.</p>

      <h3 class="text-2xl font-bold mb-4">The Translation Framework</h3>
      <p class="mb-6">Don't just list what you did—frame it as professional achievements with quantifiable results.</p>

      <h4 class="text-xl font-bold mt-8 mb-4">Example 1: Deployment Management</h4>
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
          <p class="font-semibold text-red-900 mb-2">❌ What you might say:</p>
          <p class="text-gray-600 italic">"Managed household during spouse's deployment."</p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <p class="font-semibold text-green-900 mb-2">✅ What a recruiter sees:</p>
          <p class="text-gray-800"><strong>Independently managed all household operations</strong> including budget planning, complex scheduling, and crisis management for a family of four during a 9-month high-stress period.</p>
        </div>
      </div>

      <h4 class="text-xl font-bold mb-4">Example 2: Volunteer Leadership</h4>
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
          <p class="font-semibold text-red-900 mb-2">❌ What you might say:</p>
          <p class="text-gray-600 italic">"Volunteered for the FRG."</p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <p class="font-semibold text-green-900 mb-2">✅ What a recruiter sees:</p>
          <p class="text-gray-800"><strong>Community Engagement Lead:</strong> Coordinated and executed 5 morale-boosting events for over 100 families, managing a $2,000 budget and leading a team of 10 volunteers.</p>
        </div>
      </div>

      <h4 class="text-xl font-bold mb-4">Example 3: PCS Logistics</h4>
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
          <p class="font-semibold text-red-900 mb-2">❌ What you might say:</p>
          <p class="text-gray-600 italic">"Handled a cross-country PCS move."</p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <p class="font-semibold text-green-900 mb-2">✅ What a recruiter sees:</p>
          <p class="text-gray-800"><strong>Logistics & Relocation Manager:</strong> Successfully planned and executed complex, multi-stage 3,000-mile household relocation, coordinating with multiple vendors and ensuring all deadlines and budgetary goals were met.</p>
        </div>
      </div>

      <h3 class="text-2xl font-bold mt-8 mb-4">Key Takeaway: Value Your Volunteer Work</h3>
      <p class="mb-4">Don't discount unpaid experience. Frame volunteer roles like paid jobs, focusing on quantifiable achievements:</p>
      <ul class="space-y-2 mb-6 text-gray-700">
        <li>"Managed a $2,000 budget"</li>
        <li>"Led a team of 10 volunteers"</li>
        <li>"Increased event attendance by 25%"</li>
        <li>"Coordinated logistics for 100+ participants"</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4">Resume Essentials</h3>
      <ul class="space-y-3 text-gray-700">
        <li><strong>Use strong action verbs:</strong> Managed, coordinated, executed, led, developed, implemented</li>
        <li><strong>Quantify everything:</strong> Numbers, budgets, team sizes, percentages</li>
        <li><strong>Highlight adaptability:</strong> Frame multiple PCS moves as "demonstrated flexibility across diverse environments"</li>
        <li><strong>Emphasize remote work skills:</strong> Self-motivation, time management, communication across time zones</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Essential Job Platforms</p>
        <ul class="space-y-2 text-blue-800">
          <li><a href="https://msepjobs.militaryonesource.mil/msep/" target="_blank" rel="noopener" class="font-semibold hover:underline">MSEP</a> - Military Spouse Employment Partnership (500+ vetted employers)</li>
          <li><a href="https://www.hiringourheroes.org/" target="_blank" rel="noopener" class="font-semibold hover:underline">Hiring Our Heroes</a> - Job fairs and fellowships</li>
          <li><a href="https://www.linkedin.com/jobs/search?keywords=remote" target="_blank" rel="noopener" class="font-semibold hover:underline">LinkedIn</a> - Use free premium subscription for military spouses</li>
        </ul>
      </div>
    `,
  },

  'portable-careers-guide': {
    title: 'Portable Career Fields Explorer',
    type: 'guide',
    tags: ['career', 'remote', 'portable'],
    topics: ['career', 'remote-work'],
    html: `
      <p class="text-xl mb-8">Discover in-demand fields that offer flexibility and remote opportunities perfect for military life—careers that travel with you across every PCS.</p>

      <h3 class="text-2xl font-bold mb-4">Tech & IT Careers</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>IT & Cybersecurity:</strong> Network admin, help desk, cybersecurity analyst ($50K-$90K+)</li>
        <li><strong>Web Development:</strong> Build websites and applications. High demand for remote developers ($60K-$120K)</li>
        <li><strong>Digital Marketing:</strong> SEO, social media, content creation. Every business needs online presence ($45K-$80K)</li>
        <li><strong>Data Analysis:</strong> Interpret data for business decisions. Strong remote opportunities ($55K-$95K)</li>
        <li><strong>Cloud Computing:</strong> AWS, Azure, Google Cloud certifications. High demand ($70K-$130K)</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Healthcare Careers</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Healthcare Administration:</strong> Medical billing, coding, transcription. Often remote ($40K-$65K)</li>
        <li><strong>Telehealth Coordinator:</strong> Rapidly growing field managing virtual appointments ($45K-$70K)</li>
        <li><strong>Medical Assistant (CMA):</strong> Clinical skills transferable nationwide ($35K-$50K)</li>
        <li><strong>Health Information Tech:</strong> Manage electronic health records ($45K-$75K)</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Business & Finance</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Project Management:</strong> PMP certification valued in all industries ($65K-$110K)</li>
        <li><strong>Virtual Assistance:</strong> Executive admin, bookkeeping, paralegal. Ultimate portable career ($35K-$65K)</li>
        <li><strong>Human Resources:</strong> Recruiting, onboarding, benefits admin—often remote ($50K-$85K)</li>
        <li><strong>Bookkeeping & Accounting:</strong> Essential for small businesses, fully remote ($40K-$75K)</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Creative Fields</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Graphic Design:</strong> Visual content for marketing, websites, products. Freelance-friendly ($40K-$75K)</li>
        <li><strong>Copywriting & Content:</strong> Write for clients, blogs, marketing materials ($45K-$80K)</li>
        <li><strong>Social Media Management:</strong> Develop and execute strategies for brands. Highly flexible ($40K-$75K)</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Education</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Online Tutoring:</strong> Teach students on your schedule ($20-$60/hour)</li>
        <li><strong>Instructional Design:</strong> Create online learning materials ($55K-$85K)</li>
        <li><strong>Corporate Trainer:</strong> Conduct virtual workshops ($50K-$80K)</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Next Steps</p>
        <ul class="space-y-2 text-blue-800">
          <li>Choose 1-2 fields that align with your interests and skills</li>
          <li>Research MyCAA-approved certification programs in those fields</li>
          <li>Connect with MSEP employers who hire remote in your target field</li>
          <li>Build skills through free resources (Coursera, Khan Academy) while planning</li>
        </ul>
      </div>
    `,
  },

  'federal-employment-guide': {
    title: 'Federal Employment & USAJOBS Mastery',
    type: 'guide',
    tags: ['career', 'federal', 'usajobs'],
    topics: ['career', 'federal-employment'],
    html: `
      <p class="text-xl mb-8">A federal career offers stability, excellent benefits, and transferability across every PCS. But the application process is unique. Here's how to master it.</p>

      <h3 class="text-2xl font-bold mb-4">Federal Resume: It's NOT a Civilian Resume</h3>
      <p class="mb-4">Biggest mistake applicants make: submitting a 1-2 page civilian resume. A federal resume is a detailed, comprehensive document (often 3-5+ pages).</p>
      
      <h4 class="text-xl font-bold mt-6 mb-3">What Makes Federal Resumes Different</h4>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Length:</strong> 3-5+ pages is normal and expected</li>
        <li><strong>Detail:</strong> Must explicitly detail experience as it relates to EVERY qualification in job announcement</li>
        <li><strong>Format:</strong> Use official USAJOBS Resume Builder for compliance</li>
        <li><strong>Hours:</strong> List hours worked per week for each position</li>
        <li><strong>Salary:</strong> Include salary history for each position</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Military Spouse Preference (MSP)</h3>
      <p class="mb-4">MSP gives eligible spouses preference in referrals for many DoD civilian jobs when among the best-qualified.</p>
      
      <h4 class="text-xl font-bold mt-6 mb-3">MSP Eligibility</h4>
      <ul class="space-y-3 mb-6 text-gray-700">
        <li>Must be relocating with active-duty spouse on PCS orders</li>
        <li>Submit copy of PCS orders with application</li>
        <li>Select "Military Spouse" on USAJOBS application</li>
        <li>MSP only applies when you're among best-qualified candidates</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Noncompetitive Hiring Authority</h3>
      <p class="mb-4">Under 5 CFR 315.612, agencies can appoint certain military spouses directly to competitive-service jobs without competition.</p>

      <div class="mt-8 p-6 bg-amber-50 rounded-lg border-l-4 border-amber-500">
        <p class="font-semibold text-amber-900 mb-3">Federal Job Search Pro-Tips</p>
        <ul class="space-y-2 text-amber-800">
          <li>Set up USAJOBS saved searches with email alerts</li>
          <li>Apply to multiple announcements—federal hiring is slow (3-6 months typical)</li>
          <li>Tailor your resume to echo exact language from job announcement</li>
          <li>Network within agencies—personal referrals matter even in federal system</li>
          <li>Be patient—process is bureaucratic but worth it for stability</li>
        </ul>
      </div>

      <div class="mt-6 space-y-3">
        <a href="https://www.usajobs.gov/Help/working-in-government/unique-hiring-paths/military-spouses/" target="_blank" rel="noopener" class="block text-primary-accent font-semibold hover:underline">
          USAJOBS Military Spouses Page →
        </a>
        <a href="https://help.usajobs.gov/en/articles/7075679-military-spouses" target="_blank" rel="noopener" class="block text-primary-accent font-semibold hover:underline">
          How Military Spouse Preference Works →
        </a>
      </div>
    `,
  },

  'entrepreneur-toolkit': {
    title: 'Spouse Entrepreneur Toolkit',
    type: 'checklist',
    tags: ['career', 'business', 'entrepreneur'],
    topics: ['career', 'entrepreneurship'],
    html: `
      <p class="text-xl mb-8">Starting your own business is the ultimate portable career. This toolkit provides the foundational steps to turn your idea into a successful, mobile enterprise.</p>

      <h3 class="text-2xl font-bold mb-4">Step 1: Create a Simple Business Plan</h3>
      <p class="mb-4">You don't need a 50-page document. Start with a one-page plan answering four key questions:</p>
      <ol class="list-decimal list-inside space-y-3 mb-8 text-gray-700">
        <li><strong>What problem does my business solve?</strong> Be specific about customer pain point</li>
        <li><strong>Who is my ideal customer?</strong> Define target market (military families? Local community? Online?)</li>
        <li><strong>How will I reach them?</strong> Marketing strategy (social media? local networking? referrals?)</li>
        <li><strong>What are my basic startup costs?</strong> Equipment, supplies, licenses, website ($500-$5,000 typical)</li>
      </ol>

      <h3 class="text-2xl font-bold mb-4">Step 2: Choose a Legal Structure</h3>
      <p class="mb-4">Two most common structures for spouse-owned businesses:</p>
      
      <div class="space-y-4 mb-8">
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-bold text-gray-900 mb-2">Sole Proprietorship</h4>
          <p class="text-gray-700 mb-2">Simplest option. You and business are same legal entity.</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Pros:</strong> Easy setup, minimal paperwork, low cost</li>
            <li><strong>Cons:</strong> No liability protection, harder to transfer across states</li>
          </ul>
        </div>
        
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-bold text-gray-900 mb-2">LLC (Limited Liability Company)</h4>
          <p class="text-gray-700 mb-2">Provides legal protection between personal assets and business.</p>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Pros:</strong> Liability protection, professional credibility, easier to scale</li>
            <li><strong>Cons:</strong> More paperwork, annual fees ($50-$500/year), must re-register with each PCS</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">Step 3: Find Your First Customers</h3>
      <p class="mb-4">Start with your built-in network: the military community.</p>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Join local spouse groups:</strong> Follow their business promotion rules</li>
        <li><strong>Offer military discount:</strong> 10-15% off builds goodwill</li>
        <li><strong>Focus on exceptional service:</strong> Word-of-mouth is your most powerful marketing</li>
        <li><strong>Create simple social media:</strong> Professional Facebook page or Instagram</li>
        <li><strong>Leverage your network:</strong> Ask happy customers for referrals</li>
      </ul>

      <div class="mt-8 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
        <p class="font-semibold text-purple-900 mb-3">Business Support Resources</p>
        <ul class="space-y-2 text-purple-800">
          <li><a href="https://www.sba.gov/" target="_blank" rel="noopener" class="font-semibold hover:underline">U.S. Small Business Administration</a> - Free business plan templates and guidance</li>
          <li><a href="https://ivmf.syracuse.edu/programs/entrepreneurship/start-up/v-wise/" target="_blank" rel="noopener" class="font-semibold hover:underline">V-WISE Program</a> - Intensive training for female veterans and spouses</li>
        </ul>
      </div>
    `,
  },

  'license-transfer-guide': {
    title: 'Professional License Transfer Guide',
    type: 'guide',
    tags: ['career', 'licensing'],
    topics: ['career', 'license-transfer'],
    html: `
      <p class="text-xl mb-8">For spouses in licensed professions (nursing, teaching, cosmetology, real estate), moving is a major challenge. Here's how to navigate state license transfers.</p>

      <h3 class="text-2xl font-bold mb-4">Interstate License Recognition</h3>
      <p class="mb-4">Many states have enacted laws to help military spouses get licensed faster after a PCS. Your new state may accept your current license or offer expedited processing.</p>

      <h4 class="text-xl font-bold mt-6 mb-3">Check Your State's Rules</h4>
      <p class="mb-6">The Department of Labor maintains a map showing which states have military spouse license recognition laws. <a href="https://www.dol.gov/agencies/vets/veterans/military-spouses/license-recognition" target="_blank" rel="noopener" class="text-primary-accent font-semibold hover:underline">View the DoL Map →</a></p>

      <h3 class="text-2xl font-bold mb-4">$1,000 Licensure Reimbursement</h3>
      <p class="mb-4">Service branches may reimburse up to $1,000 for eligible relicensing/recertification costs after a PCS.</p>
      
      <h4 class="text-xl font-bold mt-6 mb-3">How to Apply</h4>
      <ol class="list-decimal list-inside space-y-3 mb-6 text-gray-700">
        <li>Start with <a href="https://www.militaryonesource.mil/moving-housing/moving/planning-your-move/military-spouse-licensure-reimbursement-policy/" target="_blank" rel="noopener" class="text-primary-accent font-semibold hover:underline">official MOS guide</a></li>
        <li>Follow your branch's specific process:
          <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
            <li><strong>Army:</strong> Through Army Emergency Relief (AER)</li>
            <li><strong>Air Force/Space Force:</strong> Air Force Aid Society</li>
            <li><strong>Navy/Marine Corps:</strong> Navy-Marine Corps Relief Society</li>
          </ul>
        </li>
        <li>Save all receipts for relicensing fees, testing, and required coursework</li>
        <li>Submit claim within required timeframe (varies by branch)</li>
      </ol>

      <h3 class="text-2xl font-bold mb-4">Nursing: Nurse Licensure Compact (NLC)</h3>
      <p class="mb-4">If you're a nurse, the NLC is life-changing. One multi-state license works in 40+ states.</p>
      <ul class="space-y-2 mb-6 text-gray-700">
        <li>Check if your state participates: <a href="https://www.ncsbn.org/nlc/" target="_blank" rel="noopener" class="text-primary-accent font-semibold hover:underline">NLC State List</a></li>
        <li>Apply for compact license in your home state</li>
        <li>Practice in any compact state without additional license</li>
      </ul>

      <div class="mt-8 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
        <p class="font-semibold text-green-900 mb-3">Pro Tips for Licensed Professionals</p>
        <ul class="space-y-2 text-green-800">
          <li>Start relicensing process immediately upon receiving PCS orders</li>
          <li>Join professional associations with nationwide recognition</li>
          <li>Consider pursuing national certifications vs. state-specific licenses</li>
          <li>Keep copies of ALL license documentation in your PCS binder</li>
        </ul>
      </div>
    `,
  },

  'high-impact-certs': {
    title: 'High-Impact Certifications',
    type: 'pro_tip_list',
    tags: ['career', 'certification'],
    topics: ['career', 'certifications', 'mycaa'],
    html: `
      <p class="text-xl mb-8">You don't always need a full degree. These in-demand certifications can be earned in months (often MyCAA-funded) and lead to immediate, portable career opportunities.</p>

      <div class="space-y-8">
        <div class="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
          <h3 class="text-2xl font-bold mb-3">💼 Project Management Professional (PMP)®</h3>
          <p class="text-gray-700 mb-4">Globally recognized certification validating ability to manage projects, teams, and budgets. Applicable in virtually every industry.</p>
          <ul class="space-y-2 text-gray-700 mb-4">
            <li><strong>Salary Range:</strong> $70K-$120K+</li>
            <li><strong>Time to Complete:</strong> 3-6 months of study</li>
            <li><strong>Cost:</strong> $400-$800 (exam + prep course)</li>
            <li><strong>Remote Work:</strong> High demand for remote PM roles</li>
          </ul>
          <a href="https://www.pmi.org/certifications/project-management-pmp" target="_blank" rel="noopener" class="text-rose-700 font-semibold hover:underline">PMI Certification Info →</a>
        </div>

        <div class="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
          <h3 class="text-2xl font-bold mb-3">☁️ Salesforce Administrator</h3>
          <p class="text-gray-700 mb-4">Salesforce is world's #1 CRM platform. Certified admins are in high demand for remote work.</p>
          <ul class="space-y-2 text-gray-700 mb-4">
            <li><strong>Salary Range:</strong> $60K-$95K</li>
            <li><strong>Time to Complete:</strong> 2-4 months (self-paced)</li>
            <li><strong>Cost:</strong> $200 exam + free Trailhead learning</li>
            <li><strong>Remote Work:</strong> Very high—companies need admins globally</li>
          </ul>
          <a href="https://trailhead.salesforce.com/credentials/administrator" target="_blank" rel="noopener" class="text-blue-700 font-semibold hover:underline">Salesforce Trailhead (Free Learning) →</a>
        </div>

        <div class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <h3 class="text-2xl font-bold mb-3">📚 Google Career Certificates</h3>
          <p class="text-gray-700 mb-4">Self-paced online training in high-growth fields: Data Analytics, UX Design, IT Support, Project Management.</p>
          <ul class="space-y-2 text-gray-700 mb-4">
            <li><strong>Salary Range:</strong> $45K-$85K depending on track</li>
            <li><strong>Time to Complete:</strong> 3-6 months (self-paced)</li>
            <li><strong>Cost:</strong> $39/month Coursera subscription</li>
            <li><strong>MyCAA:</strong> Many are MyCAA-approved</li>
          </ul>
          <a href="https://grow.google/certificates/" target="_blank" rel="noopener" class="text-green-700 font-semibold hover:underline">Google Career Certificates →</a>
        </div>

        <div class="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
          <h3 class="text-2xl font-bold mb-3">🔒 CompTIA Security+</h3>
          <p class="text-gray-700 mb-4">Entry-level cybersecurity certification. High demand, especially for remote DoD contractor positions.</p>
          <ul class="space-y-2 text-gray-700 mb-4">
            <li><strong>Salary Range:</strong> $55K-$90K</li>
            <li><strong>Time to Complete:</strong> 2-3 months study</li>
            <li><strong>Cost:</strong> $370 exam + $200-400 study materials</li>
            <li><strong>Remote Work:</strong> Very high for cybersecurity roles</li>
          </ul>
          <a href="https://www.comptia.org/certifications/security" target="_blank" rel="noopener" class="text-purple-700 font-semibold hover:underline">CompTIA Security+ Info →</a>
        </div>
      </div>
    `,
  },

  // ==================== DEPLOYMENT ATOMS (5) ====================
  
  'pre-deployment-checklist': {
    title: 'Pre-Deployment Readiness Checklist',
    type: 'checklist',
    tags: ['deployment', 'preparation'],
    topics: ['deployment', 'pre-deployment'],
    html: `
      <p class="text-xl mb-8">A solid foundation makes deployment smoother. Complete these legal, financial, and household tasks before departure.</p>

      <h3 class="text-2xl font-bold mb-4">Legal Readiness</h3>
      <ul class="space-y-3 mb-8">
        <li><strong>Power of Attorney (POA):</strong> Visit base legal for General or Special POA (free). Decide scope based on needs.</li>
        <li><strong>Wills & Living Wills:</strong> Update to reflect current wishes</li>
        <li><strong>Family Care Plan:</strong> Required for single parents or dual-military with dependents</li>
        <li><strong>DEERS/ID Cards:</strong> Verify all dependents enrolled with current IDs</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Financial Readiness</h3>
      <ul class="space-y-3 mb-8">
        <li><strong>Set Up Allotments:</strong> Automatic payments for all bills—rent, utilities, insurance, car payment</li>
        <li><strong>Deployment Budget:</strong> Account for special pays: Family Separation Allowance ($250/month), Imminent Danger Pay, Hardship Duty Pay</li>
        <li><strong>SCRA Benefits:</strong> Cap interest rates at 6% on pre-service loans</li>
        <li><strong>SDP (Savings Deposit Program):</strong> If deployed to qualifying zone, 10% annual interest up to $10,000</li>
        <li><strong>Combat Zone Tax Exclusion:</strong> Deployed pay is tax-free in combat zones</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Household Readiness</h3>
      <ul class="space-y-3 mb-8">
        <li><strong>Emergency Contacts:</strong> List for at-home spouse with repair services, neighbors, FRG leader</li>
        <li><strong>Vehicle Maintenance:</strong> Service all vehicles, arrange for maintenance during deployment</li>
        <li><strong>Home Preparations:</strong> Winterize, arrange lawn care, pest control</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Critical Documents Checklist</p>
        <ul class="space-y-1 text-blue-800">
          <li>Multiple copies of orders</li>
          <li>POA documents</li>
          <li>Updated will</li>
          <li>Insurance policies</li>
          <li>Bank account information</li>
          <li>SGLI beneficiary designation</li>
        </ul>
      </div>
    `,
  },

  'homefront-survival': {
    title: 'Homefront Survival Guide',
    type: 'guide',
    tags: ['deployment', 'homefront'],
    topics: ['deployment', 'family'],
    html: `
      <p class="text-xl mb-8">The homefront is about thriving, not just surviving. Build resilience with resources for emotional wellness, solo parenting, and operational security.</p>

      <h3 class="text-2xl font-bold mb-4">The 7 Emotional Phases of Deployment</h3>
      <ol class="list-decimal list-inside space-y-3 mb-8 text-gray-700">
        <li><strong>Anticipation of Loss:</strong> Stress, denial, fear as you mentally prepare</li>
        <li><strong>Detachment:</strong> Emotional withdrawal in final days before departure</li>
        <li><strong>Emotional Disorganization:</strong> First few weeks feel overwhelming—this is the hardest phase</li>
        <li><strong>Recovery & Stabilization:</strong> You find your footing and establish "new normal"</li>
        <li><strong>Anticipation of Homecoming:</strong> Excitement mixed with anxiety about changes</li>
        <li><strong>Renegotiation:</strong> First weeks home feel like getting to know a stranger</li>
        <li><strong>Reintegration:</strong> Building your new life together (takes 3-6 months)</li>
      </ol>

      <h3 class="text-2xl font-bold mb-4">Deployment Childcare Crisis</h3>
      <p class="mb-4">For many spouses, childcare is the single greatest challenge. Consistent support is not a luxury—it's essential for mission readiness.</p>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Child Development Centers (CDCs):</strong> Most affordable option. Get on waitlist early via <a href="https://www.militarychildcare.com/" target="_blank" rel="noopener" class="text-primary-accent font-semibold hover:underline">MilitaryChildCare.com</a></li>
        <li><strong>Respite Care:</strong> Armed Services YMCA offers free/low-cost relief (few hours per month)</li>
        <li><strong>Build Trusted Network:</strong> Emergency care swaps with other military parents</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">OPSEC & Social Media</h3>
      <p class="mb-4">Operational Security protects information that could endanger service members or missions.</p>
      <ul class="space-y-2 mb-8 text-gray-700">
        <li><strong>NEVER post:</strong> Specific dates, locations, troop movements, mission details</li>
        <li><strong>NEVER reveal:</strong> Unit morale, equipment status, casualties</li>
        <li><strong>DO:</strong> Set all social media to private</li>
        <li><strong>DO:</strong> Keep posts positive but general</li>
        <li><strong>Rule of thumb:</strong> When in doubt, don't post it</li>
      </ul>

      <div class="mt-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
        <p class="font-semibold text-red-900 mb-3">Immediate Support Available 24/7</p>
        <ul class="space-y-2 text-red-800">
          <li><strong>Military Crisis Line:</strong> Call 988, press 1</li>
          <li><strong>Military OneSource:</strong> 1-800-342-9647 (confidential counseling)</li>
        </ul>
      </div>
    `,
  },

  'reintegration-roadmap': {
    title: 'Reintegration & Homecoming Roadmap',
    type: 'guide',
    tags: ['deployment', 'reintegration'],
    topics: ['deployment', 'reintegration'],
    html: `
      <p class="text-xl mb-8">Homecoming is a process, not a single event. Manage expectations and reconnect thoughtfully to build your new family dynamic.</p>

      <h3 class="text-2xl font-bold mb-4">The 72-Hour Guide</h3>
      <p class="mb-4">The first three days are unique. Prioritize patience and flexibility over picture-perfect reunion.</p>
      
      <div class="space-y-4 mb-8">
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-bold text-gray-900 mb-2">Day 1: Decompression</h4>
          <p class="text-gray-700">Expect exhaustion (yours and theirs). Keep visitors to minimum. Let them sleep and have quiet time. Don't plan huge celebration.</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-bold text-gray-900 mb-2">Day 2: Gentle Re-entry</h4>
          <p class="text-gray-700">Talk about what's changed in low-pressure way. Revisit favorite local spot. Avoid tackling big relationship or financial issues.</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-bold text-gray-900 mb-2">Day 3: Finding Rhythm</h4>
          <p class="text-gray-700">Begin discussing routines and expectations slowly. Acknowledge things feel different. Patience is most important tool.</p>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">Common Reintegration Challenges</h3>
      
      <h4 class="text-xl font-bold mt-6 mb-3">Changes in Communication Styles</h4>
      <p class="mb-4 text-gray-700">Deployed spouse may be more direct/task-focused. At-home spouse developed different patterns. Give each other time to readjust.</p>

      <h4 class="text-xl font-bold mt-6 mb-3">Redefining "Normal"</h4>
      <p class="mb-4 text-gray-700">Family routines, roles, and dynamics have shifted. Goal isn't to go back—it's to build new normal together.</p>
      <ul class="space-y-2 mb-6 text-gray-700">
        <li>Acknowledge everyone has grown and changed</li>
        <li>Discuss new routines rather than assuming old ones work</li>
        <li>Be flexible as you figure out new family rhythms</li>
        <li>Celebrate the independence everyone gained</li>
      </ul>

      <h4 class="text-xl font-bold mt-6 mb-3">Parenting Together Again</h4>
      <p class="mb-4 text-gray-700">Transitioning from solo to co-parenting requires patience from everyone.</p>
      <ul class="space-y-2 mb-8 text-gray-700">
        <li><strong>Returning parent:</strong> Reconnect through play before re-engaging discipline</li>
        <li><strong>At-home parent:</strong> Intentionally create space for returning parent, even if it's not "your way"</li>
        <li><strong>Present united front:</strong> Discuss rules privately, support each other publicly</li>
        <li><strong>Kids' reactions:</strong> Excitement, distance, or acting out are all normal</li>
      </ul>

      <div class="mt-8 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
        <p class="font-semibold text-purple-900 mb-3">When to Seek Professional Help</p>
        <ul class="space-y-2 text-purple-800">
          <li>Arguments are frequent or escalating</li>
          <li>Intimacy feels forced or absent</li>
          <li>Children are struggling significantly</li>
          <li>Either partner shows signs of PTSD, depression, or anxiety</li>
          <li><strong>Resources:</strong> Military OneSource, MFLC, Chaplain services, TRICARE counseling (all free and confidential)</li>
        </ul>
      </div>
    `,
  },

  'deployment-faq': {
    title: 'Deployment Questions Answered',
    type: 'faq_section',
    tags: ['deployment', 'faq'],
    topics: ['deployment'],
    html: `
      <p class="text-lg mb-8">Expert answers to the most common deployment questions about preparation, pay, support, and reintegration.</p>

      <div class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What is a Power of Attorney (POA) and which type do I need?</h4>
          <p class="text-gray-700 mb-3">POA gives designated person (usually spouse) authority to make financial/legal decisions on your behalf.</p>
          <p class="text-gray-700 mb-3"><strong>General POA:</strong> Broad powers for most situations</p>
          <p class="text-gray-700"><strong>Special POA:</strong> Limited to specific actions (selling car, accessing specific accounts)</p>
          <p class="text-gray-700 mt-3">Most families need Special POA. Base legal office prepares for free.</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What pay changes during deployment?</h4>
          <ul class="space-y-2 text-gray-700">
            <li><strong>Family Separation Allowance (FSA):</strong> $250/month when separated 30+ days</li>
            <li><strong>Imminent Danger Pay (IDP) or Hostile Fire Pay (HFP):</strong> Varies by location</li>
            <li><strong>Hardship Duty Pay (HDP):</strong> For difficult locations</li>
            <li><strong>Combat Zone Tax Exclusion (CZTE):</strong> Deployed pay is tax-free in combat zones</li>
          </ul>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">How long does deployment last?</h4>
          <p class="text-gray-700">Standard deployments: 6-12 months (varies by branch and mission). Some specialized deployments: 3-4 months. Others may extend longer. Unit provides specific timeline during pre-deployment briefings.</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">What is OPSEC and what can I post?</h4>
          <p class="text-gray-700 mb-3">OPSEC (Operational Security) protects information that could endanger service members or missions.</p>
          <p class="text-gray-700"><strong>NEVER post:</strong> Specific dates, locations, troop movements, mission details, unit morale, equipment status</p>
          <p class="text-gray-700 mt-2"><strong>Safe to post:</strong> General positive messages, "proud of my service member," non-specific updates</p>
        </div>

        <div class="p-6 bg-gray-50 rounded-xl">
          <h4 class="text-xl font-bold text-gray-900 mb-3">Why does homecoming feel difficult?</h4>
          <p class="text-gray-700">Reintegration is a process. It's normal to feel awkward. Service member lived in highly structured environment. At-home spouse managed everything solo. Takes time to relearn roles, reconnect as couple, and for kids to readjust. Be patient and communicate openly.</p>
        </div>
      </div>
    `,
  },

  'deployment-family-pact': {
    title: 'Family Deployment Communication Planner',
    type: 'tool',
    tags: ['deployment', 'communication'],
    topics: ['deployment', 'family'],
    html: `
      <p class="text-xl mb-8">This is a shared journey. Define your family's goals and communication plan for this time apart. This becomes your "why."</p>

      <h3 class="text-2xl font-bold mb-4">Create Your Family's Deployment Pact</h3>
      <p class="mb-6">Answer these questions together before deployment begins:</p>

      <div class="space-y-8">
        <div>
          <h4 class="text-xl font-bold mb-3">What is our family's "why" for this deployment?</h4>
          <p class="text-gray-700 mb-3">Examples: "Serving our country," "Financial goals to buy a house," "Career advancement," "Paying off debt"</p>
          <p class="text-gray-600 italic">Write your answer and keep it visible during separation as reminder of purpose.</p>
        </div>

        <div>
          <h4 class="text-xl font-bold mb-3">How will we support the mission from home?</h4>
          <p class="text-gray-700 mb-3">Examples: "Sending positive messages," "Creating pride wall of achievements," "Managing finances to reduce deployed spouse's stress"</p>
        </div>

        <div>
          <h4 class="text-xl font-bold mb-3">Our Communication Plan</h4>
          <p class="text-gray-700 mb-4">Set realistic expectations based on deployment location and mission:</p>
          <ul class="space-y-2 text-gray-700">
            <li><strong>Methods:</strong> Email, video calls (when bandwidth allows), phone, letters</li>
            <li><strong>Frequency:</strong> Daily emails? Weekly video calls? Be specific but flexible</li>
            <li><strong>Backup plan:</strong> What if communication blackouts occur?</li>
            <li><strong>Time zones:</strong> Who adjusts schedule for calls?</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
        <p class="font-semibold text-green-900 mb-3">Communication Pro-Tips</p>
        <ul class="space-y-2 text-green-800">
          <li>Under-promise and over-deliver on communication frequency</li>
          <li>Create email/video call templates for when you're exhausted</li>
          <li>Send care packages with photos, drawings, letters from kids</li>
          <li>Record deployed parent reading bedtime stories before leaving</li>
        </ul>
      </div>
    `,
  },

  // ==================== FINANCE/SHOPPING ATOMS (remaining critical ones) ====================
  
  'emergency-fund-builder': {
    title: 'Emergency Fund & Financial Foundation',
    type: 'guide',
    tags: ['finance', 'emergency-fund', 'budget'],
    topics: ['finance', 'budgeting', 'personal-finance'],
    html: `
      <p class="text-xl mb-8">Build your financial shock absorber: a 3-6 month emergency fund that keeps PCS surprises, car repairs, and unexpected expenses from becoming crises.</p>

      <h3 class="text-2xl font-bold mb-4">Why Emergency Funds Matter for Military Families</h3>
      <p class="mb-4">Military life is unpredictable: last-minute flights home, non-reimbursable PCS costs, vehicle breakdowns, medical emergencies. A 3-6 month fund ($3,000-$10,000 typical) is your financial safety net.</p>

      <h3 class="text-2xl font-bold mb-4">How to Calculate Your Target</h3>
      <ol class="list-decimal list-inside space-y-3 mb-8 text-gray-700">
        <li><strong>List essential monthly expenses:</strong> Rent/mortgage, utilities, food, insurance, minimum debt payments</li>
        <li><strong>Multiply by 3-6 months:</strong> Start with 3 months as initial goal, build to 6 months over time</li>
        <li><strong>Don't include:</strong> Entertainment, dining out, subscriptions—emergency fund covers basics only</li>
      </ol>

      <h3 class="text-2xl font-bold mb-4">How to Build It Systematically</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Start small:</strong> $25-50 per paycheck adds up. Consistency matters more than amount.</li>
        <li><strong>Automate via allotments:</strong> Set it and forget it—money goes to savings before you see it</li>
        <li><strong>Use windfalls:</strong> Tax refunds, bonuses, deployment pay all go to fund</li>
        <li><strong>Separate account:</strong> Keep emergency fund in different bank from checking to avoid temptation</li>
        <li><strong>High-yield savings:</strong> Navy Federal, USAA, or online banks offer 4-5% interest</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Debt Management & SCRA</h3>
      <p class="mb-4">The Servicemembers Civil Relief Act (SCRA) is powerful: caps interest rates on pre-service loans at 6%.</p>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>Eligible debts:</strong> Credit cards, auto loans, mortgages taken out before active duty</li>
        <li><strong>How to apply:</strong> Contact lenders with copy of orders</li>
        <li><strong>Impact:</strong> Can save hundreds per month on high-interest debt</li>
      </ul>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Free Financial Counseling</p>
        <p class="text-blue-800 mb-3">Every installation provides free, accredited Personal Financial Management Program (PFMP) counselors. They help with:</p>
        <ul class="space-y-1 text-blue-800">
          <li>Creating zero-based budgets</li>
          <li>Developing debt-reduction plans</li>
          <li>Understanding investments</li>
          <li>All services confidential</li>
        </ul>
        <a href="https://www.militaryonesource.mil/financial-legal/personal-finance/personal-financial-management-counseling/" target="_blank" rel="noopener" class="text-blue-700 font-semibold hover:underline mt-3 inline-block">
          Schedule Free Counseling →
        </a>
      </div>
    `,
  },

  'tsp-brs-essentials': {
    title: 'TSP & BRS Essentials',
    type: 'guide',
    tags: ['finance', 'tsp', 'retirement'],
    topics: ['finance', 'tsp', 'retirement'],
    html: `
      <p class="text-xl mb-8">The Blended Retirement System (BRS) is your path to retirement security. Understanding TSP and the government match is essential for building long-term wealth.</p>

      <h3 class="text-2xl font-bold mb-4">The Two Pillars of BRS</h3>
      
      <div class="space-y-6 mb-8">
        <div class="p-6 bg-green-50 rounded-lg">
          <h4 class="text-xl font-bold text-green-900 mb-3">Pillar 1: Pension (After 20 Years)</h4>
          <p class="text-gray-700">Traditional military retirement: 40% of base pay after 20 years of service (vs. 50% under old system). Reduced from legacy system but paired with TSP matching.</p>
        </div>

        <div class="p-6 bg-blue-50 rounded-lg">
          <h4 class="text-xl font-bold text-blue-900 mb-3">Pillar 2: Thrift Savings Plan (TSP)</h4>
          <p class="text-gray-700 mb-4">Government-managed investment account, like civilian 401(k). Low fees, tax advantages, portable across all federal service.</p>
          <ul class="space-y-2 text-gray-700">
            <li><strong>Automatic 1%:</strong> DoD contributes 1% of base pay automatically (even if you contribute $0)</li>
            <li><strong>Matching 4%:</strong> DoD matches up to 4% when you contribute 5%</li>
            <li><strong>Total:</strong> Contributing 5% gets you 10% total (5% yours + 5% government)</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">The Critical 5% Rule</h3>
      <p class="mb-6 text-lg"><strong>You MUST contribute at least 5% of your base pay to TSP to receive the full government match.</strong> This is free money. Not contributing 5% is leaving thousands of dollars on the table every year.</p>

      <h3 class="text-2xl font-bold mb-4">TSP Fund Options</h3>
      <ul class="space-y-3 mb-8 text-gray-700">
        <li><strong>G Fund:</strong> Government securities (safe, low return ~2-3%)</li>
        <li><strong>C Fund:</strong> S&P 500 index (stocks, higher return ~8-10% long-term)</li>
        <li><strong>S Fund:</strong> Small/mid-cap stocks (higher risk/return)</li>
        <li><strong>I Fund:</strong> International stocks</li>
        <li><strong>F Fund:</strong> Bonds</li>
        <li><strong>L Funds:</strong> Target-date funds (auto-adjust as you age)</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Allocation Strategy by Age</h3>
      <ul class="space-y-2 mb-8 text-gray-700">
        <li><strong>20s-30s:</strong> Aggressive (80-90% C/S funds)</li>
        <li><strong>40s:</strong> Moderate (60-70% C/S funds)</li>
        <li><strong>50s+:</strong> Conservative (40-50% C/S funds, more G/F)</li>
      </ul>

      <div class="mt-8 p-6 bg-amber-50 rounded-lg border-l-4 border-amber-500">
        <p class="font-semibold text-amber-900 mb-3">TSP Action Items TODAY</p>
        <ol class="list-decimal list-inside space-y-2 text-amber-800">
          <li>Log into <a href="https://www.tsp.gov/" target="_blank" rel="noopener" class="font-semibold hover:underline">TSP.gov</a></li>
          <li>Verify you're contributing at least 5%</li>
          <li>Review your fund allocation—adjust if needed</li>
          <li>If contributing 0%, increase to 5% immediately via myPay</li>
        </ol>
      </div>
    `,
  },

  'les-decoder': {
    title: 'LES (Leave & Earnings Statement) Decoder',
    type: 'guide',
    tags: ['finance', 'les', 'pay'],
    topics: ['finance', 'budgeting'],
    html: `
      <p class="text-xl mb-8">Understanding your Leave and Earnings Statement (LES) is the foundation of military budgeting. Here's what every line means.</p>

      <h3 class="text-2xl font-bold mb-4">Key Components of Your LES</h3>
      
      <div class="space-y-6 mb-8">
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="text-lg font-bold text-gray-900 mb-2">Base Pay</h4>
          <p class="text-gray-700">Your taxable salary based on rank and time in service. This is what TSP contributions are calculated from.</p>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="text-lg font-bold text-gray-900 mb-2">BAH (Basic Allowance for Housing)</h4>
          <p class="text-gray-700">Non-taxable allowance for housing. Varies by location, rank, and dependency status. If living on base, BAH goes to housing office. If off-base, you keep difference between BAH and actual rent.</p>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="text-lg font-bold text-gray-900 mb-2">BAS (Basic Allowance for Subsistence)</h4>
          <p class="text-gray-700">Non-taxable money for food. Fixed amount regardless of location (~$300-450/month).</p>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="text-lg font-bold text-gray-900 mb-2">Deductions Section</h4>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li>Federal/State taxes (from base pay only)</li>
            <li>SGLI (Life insurance - $29/month for $400K coverage)</li>
            <li>TSP contributions</li>
            <li>Allotments (automatic payments you've set up)</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">How to Use Your LES for Budgeting</h3>
      <ol class="list-decimal list-inside space-y-3 mb-8 text-gray-700">
        <li><strong>Calculate net income:</strong> Base Pay + BAH + BAS - all deductions = take-home pay</li>
        <li><strong>List fixed expenses:</strong> Rent, utilities, insurance, car payment, minimum debt payments</li>
        <li><strong>Determine discretionary income:</strong> What's left after fixed expenses</li>
        <li><strong>Allocate discretionary:</strong> Savings, debt payoff beyond minimums, lifestyle</li>
      </ol>

      <div class="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p class="font-semibold text-blue-900 mb-3">Official Resource</p>
        <p class="text-blue-800 mb-3">For detailed line-by-line breakdown:</p>
        <a href="https://www.dfas.mil/MilitaryMembers/payentitlements/readingles/" target="_blank" rel="noopener" class="text-blue-700 font-semibold hover:underline">
          DFAS: Reading Your LES Guide →
        </a>
      </div>
    `,
  },

  // Add placeholder for remaining atoms that can be filled in next iteration
  'pcs-timeline-tool': { title: 'Interactive PCS Timeline Generator', type: 'tool', tags: ['pcs'], topics: ['pcs'], html: '<p>Timeline tool content...</p>' },
  'deployment-family-pact': { title: 'Family Deployment Pact', type: 'tool', tags: ['deployment'], topics: ['deployment'], html: '<p>Deployment pact content...</p>' },
  'commissary-savings-calculator': { title: 'Commissary Savings Calculator', type: 'calculator', tags: ['finance'], topics: ['finance'], html: '<p>Calculator content...</p>' },
  'commissary-exchange-basics': { title: 'Commissary & Exchange Guide', type: 'guide', tags: ['finance'], topics: ['finance'], html: '<p>Shopping guide content...</p>' },
  'oconus-shopping-guide': { title: 'OCONUS Shopping Guide', type: 'guide', tags: ['finance'], topics: ['finance', 'oconus'], html: '<p>OCONUS shopping content...</p>' },
  'shopping-pro-tips': { title: 'Shopping Pro-Tips', type: 'pro_tip_list', tags: ['finance'], topics: ['finance'], html: '<p>Shopping tips content...</p>' },
};

// Export helper to get atom by ID
export function getCuratedAtom(id: string) {
  return CURATED_ATOMS[id];
}
