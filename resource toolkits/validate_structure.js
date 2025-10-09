#!/usr/bin/env node

/**
 * Shopping.html Structure Validation Script
 * 
 * This script validates the structural integrity of Shopping.html
 * Run with: node validate_structure.js
 */

const fs = require('fs');
const path = require('path');

// Expected structure based on current document
const EXPECTED_STRUCTURE = {
    sections: [
        { id: 'commissary', title: 'Commissary' },
        { id: 'exchange', title: 'Exchange' },
        { id: 'savings', title: 'Savings Hub' },
        { id: 'tips', title: 'Pro-Tips' },
        { id: 'base-hub', title: 'PCS Toolkit' },
        { id: 'oconus', title: 'OCONUS Guide' },
        { id: 'faq', title: 'FAQ' }
    ],
    sponsorSlots: [
        { id: 'sponsor-1', name: 'Family Media', position: 'after-header' },
        { id: 'sponsor-2', name: 'Navy Federal', position: 'after-savings' },
        { id: 'sponsor-3', name: 'USAA', position: 'after-faq' }
    ],
    criticalElements: [
        { id: 'mwrChart', type: 'canvas', required: true },
        { id: 'download-shopping-list', type: 'button', required: true },
        { id: 'commissarySavingsResult', type: 'element', required: true },
        { id: 'exchangeSavingsResult', type: 'element', required: true }
    ]
};

function validateStructure() {
    const filePath = path.join(__dirname, 'Shopping.html');
    
    if (!fs.existsSync(filePath)) {
        console.error('❌ Shopping.html not found');
        return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];
    const warnings = [];
    
    console.log('🔍 Validating Shopping.html structure...\n');
    
    // 1. Check for all expected sections
    console.log('📋 Checking sections...');
    EXPECTED_STRUCTURE.sections.forEach(section => {
        const sectionRegex = new RegExp(`<section[^>]*id="${section.id}"`, 'i');
        if (!sectionRegex.test(content)) {
            errors.push(`Missing section: ${section.id} (${section.title})`);
        } else {
            console.log(`  ✅ ${section.title} (${section.id})`);
        }
    });
    
    // 2. Check navigation consistency
    console.log('\n🧭 Checking navigation...');
    const navLinks = content.match(/href="#([^"]+)"/g) || [];
    const sectionIds = content.match(/id="([^"]+)"/g) || [];
    
    const navTargets = navLinks.map(link => link.match(/#([^"]+)/)[1]);
    const actualIds = sectionIds.map(id => id.match(/"([^"]+)"/)[1]);
    
    // Check if all nav links point to existing sections
    navTargets.forEach(target => {
        if (!actualIds.includes(target)) {
            errors.push(`Navigation link points to non-existent section: ${target}`);
        }
    });
    
    // Check if navigation order matches section order
    const sectionOrder = [];
    EXPECTED_STRUCTURE.sections.forEach(section => {
        const match = content.match(new RegExp(`<section[^>]*id="${section.id}"[^>]*>`, 'i'));
        if (match) {
            sectionOrder.push({ id: section.id, index: content.indexOf(match[0]) });
        }
    });
    
    sectionOrder.sort((a, b) => a.index - b.index);
    const navOrder = navTargets.filter(target => 
        EXPECTED_STRUCTURE.sections.some(s => s.id === target)
    );
    
    if (JSON.stringify(sectionOrder.map(s => s.id)) !== JSON.stringify(navOrder)) {
        warnings.push('Navigation order does not match section order');
    }
    
    console.log(`  ✅ Navigation links: ${navTargets.length}`);
    
    // 3. Check critical interactive elements
    console.log('\n⚙️ Checking interactive elements...');
    EXPECTED_STRUCTURE.criticalElements.forEach(element => {
        const regex = new RegExp(`id="${element.id}"`, 'i');
        if (!regex.test(content)) {
            errors.push(`Missing critical element: ${element.id}`);
        } else {
            console.log(`  ✅ ${element.id}`);
        }
    });
    
    // 4. Check sponsor slots
    console.log('\n💰 Checking sponsor slots...');
    EXPECTED_STRUCTURE.sponsorSlots.forEach(slot => {
        const regex = new RegExp(`SPONSOR SLOT.*${slot.name}`, 'i');
        if (!regex.test(content)) {
            warnings.push(`Sponsor slot may be missing or misnamed: ${slot.name}`);
        } else {
            console.log(`  ✅ ${slot.name}`);
        }
    });
    
    // 5. Check JavaScript dependencies
    console.log('\n🔧 Checking JavaScript dependencies...');
    const jsChecks = [
        { name: 'Chart.js loading', pattern: /chart\.js/i },
        { name: 'jsPDF loading', pattern: /jspdf/i },
        { name: 'DOM event listeners', pattern: /addEventListener/i },
        { name: 'Calculator functions', pattern: /calculateCommissarySavings|calculateExchangeSavings/i }
    ];
    
    jsChecks.forEach(check => {
        if (!check.pattern.test(content)) {
            warnings.push(`JavaScript dependency may be missing: ${check.name}`);
        } else {
            console.log(`  ✅ ${check.name}`);
        }
    });
    
    // 6. Check for common structural issues
    console.log('\n🔍 Checking for structural issues...');
    
    // Check for unclosed tags
    const openTags = content.match(/<[^/][^>]*>/g) || [];
    const closeTags = content.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
        warnings.push('Potential unclosed HTML tags detected');
    }
    
    // Check for duplicate IDs
    const allIds = content.match(/id="([^"]+)"/g) || [];
    const idCounts = {};
    allIds.forEach(id => {
        const idValue = id.match(/"([^"]+)"/)[1];
        idCounts[idValue] = (idCounts[idValue] || 0) + 1;
    });
    
    Object.entries(idCounts).forEach(([id, count]) => {
        if (count > 1) {
            errors.push(`Duplicate ID found: ${id} (${count} times)`);
        }
    });
    
    console.log(`  ✅ HTML tag balance: ${openTags.length} open, ${closeTags.length} close`);
    console.log(`  ✅ Unique IDs: ${Object.keys(idCounts).length}`);
    
    // Results
    console.log('\n📊 Validation Results:');
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
        console.log('\n❌ ERRORS:');
        errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('\n🎉 All structural checks passed!');
        return true;
    }
    
    return errors.length === 0;
}

// Run validation
if (require.main === module) {
    const isValid = validateStructure();
    process.exit(isValid ? 0 : 1);
}

module.exports = { validateStructure, EXPECTED_STRUCTURE };
