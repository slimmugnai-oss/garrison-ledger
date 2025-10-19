# 🎯 START HERE - Optimized Prompt System

**⭐ THE MOST INTELLIGENT ALL-KNOWING PROMPT FILE ⭐**

This file gives you the **exact prompts** to use for maximum AI efficiency with minimal token waste.

---

## 🚀 **THE ULTIMATE PROMPT SYSTEM**

We've created a **3-tier context system** optimized for different task complexities:

| Tier | When to Use | Files Loaded | Tokens | Speed |
|------|-------------|--------------|--------|-------|
| **🔥 Lightning** | Quick fixes, small changes | `.cursor/context.md` | ~2,000 | ⚡⚡⚡ |
| **⚙️ Standard** | Most features, typical work | `QUICK_STATUS.md` + `.cursorrules` | ~8,000 | ⚡⚡ |
| **🎯 Deep Dive** | Major architecture, audits | `SYSTEM_STATUS.md` + all docs | ~50,000+ | ⚡ |

---

## ⚡ **MAGIC PROMPTS - COPY & PASTE**

### **🔥 TIER 1: Lightning Fast (90% of tasks)**

Use for: Bug fixes, small features, UI tweaks, quick changes

```
Check context, Follow .cursorrules, [your task here]
```

**Example:**
```
Check context, Follow .cursorrules, Fix the button alignment on the pricing page
```

**What it loads:**
- `.cursor/context.md` (~2K tokens) - Instant project overview
- `.cursorrules` (auto-loaded) - Coding standards

**Total: ~2,000 tokens** | **Speed: Ultra-fast** ⚡⚡⚡

---

### **⚙️ TIER 2: Standard Power (Most features)**

Use for: New features, component builds, API endpoints, normal development

```
Check QUICK_STATUS, Follow .cursorrules, Use workflow, [your task here]
```

**Example:**
```
Check QUICK_STATUS, Follow .cursorrules, Use workflow, Add a new calculator for VA disability compensation
```

**What it loads:**
- `QUICK_STATUS.md` (~3K tokens) - Current state + recent changes
- `.cursorrules` (auto-loaded) - Coding standards
- `DEVELOPMENT_WORKFLOW.md` (~5K tokens) - Development process

**Total: ~8,000 tokens** | **Speed: Fast** ⚡⚡

---

### **🎯 TIER 3: Deep Dive (Architecture changes)**

Use for: System redesigns, major audits, complex debugging, architectural decisions

```
Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, [your task here], Update docs when done
```

**Example:**
```
Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, Redesign the entire assessment flow with new gamification, Update docs when done
```

**What it loads:**
- `SYSTEM_STATUS.md` (~50K tokens) - Complete system documentation
- `.cursorrules` (auto-loaded) - Coding standards
- `DEVELOPMENT_WORKFLOW.md` (~5K tokens) - Development process
- Relevant docs from `docs/active/` as needed

**Total: ~50,000+ tokens** | **Speed: Comprehensive** ⚡

---

## 🎯 **CHOOSE YOUR PROMPT**

### **Quick Decision Tree:**

```
Is it a quick fix or small change?
  ├─ YES → Use Lightning Prompt (Check context)
  └─ NO → Is it a new feature or component?
      ├─ YES → Use Standard Prompt (Check QUICK_STATUS)
      └─ NO → Must be architecture/audit
          └─ Use Deep Dive Prompt (Check SYSTEM_STATUS first)
```

---

## 📚 **THE 3-FILE SYSTEM**

### **1. `.cursor/context.md` (Lightning Tier)**
**Size:** ~100 lines | **Tokens:** ~2,000

**Contains:**
- Current version and status
- Tech stack overview
- Key directories
- Critical rules
- Quick reference links

**Use when:** You need instant context without the history

---

### **2. `QUICK_STATUS.md` (Standard Tier)**
**Size:** ~200 lines | **Tokens:** ~3,000

**Contains:**
- Everything from context.md PLUS:
- Recent changes (last 7 days)
- Core systems overview
- Database status
- Economics and metrics
- Known issues
- Active priorities

**Use when:** You need current state + recent history

---

### **3. `SYSTEM_STATUS.md` (Deep Dive Tier)**
**Size:** ~4,600 lines | **Tokens:** ~50,000

**Contains:**
- Everything from QUICK_STATUS.md PLUS:
- Complete deployment history
- Detailed API documentation
- Full architecture diagrams
- All environment variables
- Complete migration history
- Troubleshooting guides

**Use when:** You need the complete picture

---

## 🎯 **REAL-WORLD EXAMPLES**

### **Example 1: Fix a Button**
```
Check context, Follow .cursorrules, The "Upgrade" button on /pricing is misaligned on mobile
```
**Why Lightning:** Simple UI fix, needs basic project context

---

### **Example 2: Build New Calculator**
```
Check QUICK_STATUS, Follow .cursorrules, Use workflow, Build a TSP withdrawal calculator that estimates taxes and penalties for early withdrawal
```
**Why Standard:** New feature, needs current state + workflow

---

### **Example 3: Redesign Assessment System**
```
Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, Completely redesign the assessment flow to use a card-swipe interface instead of forms, Update docs when done
```
**Why Deep Dive:** Major architecture change, needs full context

---

### **Example 4: Debug External API**
```
Check QUICK_STATUS, Follow .cursorrules, The Zillow API is returning errors for some bases, debug and fix
```
**Why Standard:** Needs recent API integration context from QUICK_STATUS

---

### **Example 5: Optimize Performance**
```
Check SYSTEM_STATUS first, Follow .cursorrules, Do a deep performance audit of the base guides page and implement optimizations
```
**Why Deep Dive:** Comprehensive audit needs full system understanding

---

## ⚡ **TOKEN SAVINGS COMPARISON**

| Task | Old Prompt | New Prompt | Token Savings |
|------|-----------|------------|---------------|
| **Quick Fix** | "Check SYSTEM_STATUS..." (50K tokens) | "Check context..." (2K tokens) | **96% savings** |
| **Feature** | "Check SYSTEM_STATUS..." (50K tokens) | "Check QUICK_STATUS..." (8K tokens) | **84% savings** |
| **Architecture** | "Check SYSTEM_STATUS..." (50K tokens) | "Check SYSTEM_STATUS..." (50K tokens) | **0% (but necessary)** |

**Average savings: 60-80% on typical tasks!**

---

## 🚀 **YOUR DAILY WORKFLOW**

### **Start of Session (30 seconds)**
```bash
# Quick health check
cat QUICK_STATUS.md | head -30

# What changed recently?
git log --oneline -5

# Any local changes?
git status
```

---

### **During Work**

Choose your prompt tier based on task complexity:

**90% of tasks → Lightning Prompt**
```
Check context, Follow .cursorrules, [task]
```

**8% of tasks → Standard Prompt**
```
Check QUICK_STATUS, Follow .cursorrules, Use workflow, [task]
```

**2% of tasks → Deep Dive Prompt**
```
Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, [task], Update docs
```

---

### **End of Session (5 minutes)**

For major changes:
```
Update QUICK_STATUS.md and SYSTEM_STATUS.md with today's changes
```

For minor changes:
```
No doc updates needed - it was a small fix
```

---

## 📊 **WHEN TO UPDATE DOCS**

| Change Type | Update QUICK_STATUS? | Update SYSTEM_STATUS? |
|-------------|---------------------|----------------------|
| **Bug fix** | ❌ No | ❌ No |
| **Small feature** | ❌ No | ❌ No |
| **New calculator** | ✅ Yes (add to list) | ✅ Yes (add details) |
| **API integration** | ✅ Yes (add to recent) | ✅ Yes (add full docs) |
| **Architecture change** | ✅ Yes (update state) | ✅ Yes (update everything) |
| **Major deployment** | ✅ Yes (new version) | ✅ Yes (new version) |

---

## 💡 **PRO TIPS**

### **Tip 1: Start Small, Scale Up**
If you're unsure which tier to use, start with Lightning. If AI needs more context, it will ask for QUICK_STATUS or SYSTEM_STATUS.

### **Tip 2: The .cursorrules Auto-Load**
You don't need to explicitly mention `.cursorrules` - it's always loaded. But saying "Follow .cursorrules" reminds the AI to apply standards strictly.

### **Tip 3: Use "Check context" for Iterations**
When working on the same feature across multiple prompts, use "Check context" to avoid reloading heavy docs each time.

### **Tip 4: Update Docs Immediately**
Don't wait until Friday. If you made a major change, update docs RIGHT AWAY before you forget the details.

### **Tip 5: Friday Health Check Still Important**
Even with the optimized system, do a weekly 15-minute review to ensure docs are accurate.

---

## 🎓 **MASTERING THE SYSTEM**

### **Week 1: Learn the Prompts**
- Use the decision tree above
- Copy-paste the exact prompts
- Get comfortable with the 3 tiers

### **Week 2: Optimize Your Workflow**
- Notice which tier you use most (probably Lightning)
- Start customizing prompts for your common tasks
- Build muscle memory

### **Week 3: Master It**
- Instinctively know which tier to use
- Update docs without prompting
- Help others learn the system

---

## 🚨 **COMMON MISTAKES TO AVOID**

❌ **Using Deep Dive for everything** → Wastes 50K tokens on simple fixes  
❌ **Using Lightning for architecture** → AI lacks context, makes mistakes  
❌ **Forgetting to update docs** → QUICK_STATUS becomes outdated  
❌ **Not reading QUICK_STATUS before work** → Duplicate existing features  
❌ **Skipping .cursorrules in prompt** → AI might not apply standards strictly  

---

## ✅ **SUCCESS CHECKLIST**

Before you close this file, make sure you understand:

- [ ] The 3-tier system (Lightning, Standard, Deep Dive)
- [ ] Which prompt to use for which task
- [ ] How to use the decision tree
- [ ] When to update docs
- [ ] The token savings you'll get

---

## 🎯 **YOUR OPTIMIZED PROMPTS**

### **Copy these into a note for quick access:**

```
# Lightning (90% of tasks)
Check context, Follow .cursorrules, [task]

# Standard (8% of tasks)
Check QUICK_STATUS, Follow .cursorrules, Use workflow, [task]

# Deep Dive (2% of tasks)
Check SYSTEM_STATUS first, Follow .cursorrules, Use workflow, [task], Update docs when done
```

---

## 📞 **QUICK REFERENCE**

| File | Purpose | Size | When to Read |
|------|---------|------|--------------|
| **THIS FILE** | Prompt guide | ~400 lines | Read once, reference as needed |
| **`.cursor/context.md`** | Instant context | ~100 lines | Every Lightning prompt |
| **`QUICK_STATUS.md`** | Current state | ~200 lines | Every Standard prompt |
| **`SYSTEM_STATUS.md`** | Full details | ~4,600 lines | Only for Deep Dive |
| **`.cursorrules`** | Coding standards | ~740 lines | Auto-loaded by AI |

---

## 🎉 **YOU'RE READY!**

You now have the **most intelligent, all-knowing prompt system** designed specifically for Garrison Ledger.

**Token savings: 60-80% on average**  
**Speed increase: 3-5x faster**  
**Clarity: Perfect context every time**

Just use the decision tree, copy the right prompt, and let the AI do the rest!

---

**Last Updated:** 2025-01-19  
**System Version:** 3.6.0  

**Questions?** Check the decision tree or start with Lightning tier and scale up if needed.