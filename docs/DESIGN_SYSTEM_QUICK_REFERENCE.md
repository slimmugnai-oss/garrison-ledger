# 🎨 DESIGN SYSTEM QUICK REFERENCE CARD

**Use this for quick lookups during development**

---

## 🎨 **COLORS (Most Common)**

```css
/* Text */
text-primary      /* #0F172A - Headings */
text-body         /* #374151 - Body text */
text-muted        /* #6B7280 - Secondary text */

/* Navy Palette */
navy-authority    /* #0F172A - Primary elements */
navy-professional /* #1E40AF - Links, secondary */
navy-light        /* #3B82F6 - Hover states */

/* Status */
success           /* #059669 - Green */
warning           /* #D97706 - Orange */
danger            /* #DC2626 - Red */
info              /* #0284C7 - Blue */

/* Backgrounds */
background        /* #F7F8FA - Page background */
surface           /* #FFFFFF - Card background */
surface-hover     /* #F9FAFB - Hover state */

/* Borders */
border-default    /* #E5E7EB - Standard */
border-strong     /* #D1D5DB - Emphasis */
```

---

## 📝 **TYPOGRAPHY**

```css
/* Headings (Lora serif) */
text-6xl md:text-8xl  /* H1 - Hero titles */
text-4xl md:text-6xl  /* H2 - Section headers */
text-2xl md:text-4xl  /* H3 - Subsections */
text-xl md:text-2xl   /* H4 - Card titles */

/* Body (Inter sans) */
text-xl               /* Large body */
text-base             /* Standard body */
text-sm               /* Small text */
text-xs               /* Captions */

/* Classes */
font-serif            /* Lora - Headings */
font-sans             /* Inter - Body */
font-semibold         /* 600 weight */
font-bold             /* 700 weight */
```

---

## 🧩 **COMPONENTS**

```tsx
/* Buttons */
<button className="btn-primary">       /* Primary action */
<button className="btn-secondary">     /* Secondary action */
<button className="btn-outline">       /* Tertiary action */

/* Badges */
<Badge variant="primary">              /* Blue badge */
<Badge variant="success">              /* Green badge */
<Badge variant="warning">              /* Orange badge */
<Badge variant="danger">               /* Red badge */

/* Cards */
<Card>                                 /* Standard card */
<Card hover={true}>                    /* Interactive card */
<Card variant="elevated">              /* Featured card */

/* Inputs */
<Input label="Name" />                 /* Standard input */
<Input error="Required" />             /* Error state */
```

---

## 📏 **SPACING**

```css
/* Padding/Margin Scale */
p-1    /* 4px */
p-2    /* 8px */
p-3    /* 12px */
p-4    /* 16px */
p-6    /* 24px */
p-8    /* 32px */
p-12   /* 48px */
p-16   /* 64px */

/* Gaps */
gap-2  /* 8px */
gap-4  /* 16px */
gap-6  /* 24px */
gap-8  /* 32px */
```

---

## 🎭 **COMMON PATTERNS**

### **Hero Section:**
```tsx
<section className="bg-gradient-to-br from-background via-surface to-background">
  <div className="max-w-7xl mx-auto px-4 py-16">
    <h1 className="text-6xl font-serif font-black text-primary">
      Title
    </h1>
    <p className="text-xl text-body">
      Description
    </p>
  </div>
</section>
```

### **Card Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card hover={true}>
    <h3 className="text-xl font-semibold text-primary">Title</h3>
    <p className="text-body">Description</p>
  </Card>
</div>
```

### **Button Group:**
```tsx
<div className="flex items-center gap-4">
  <button className="btn-primary">Primary</button>
  <button className="btn-secondary">Secondary</button>
</div>
```

### **Status Badge:**
```tsx
<Badge variant="success" size="sm">
  Active
</Badge>
```

---

## 🔍 **QUICK SEARCH COMMANDS**

```bash
# Find all button usage
grep -r "btn-primary" app/

# Find all text color usage
grep -r "text-primary" app/

# Find specific component
grep -r "ComponentName" app/components/

# Find in TypeScript files only
grep -r "class-name" --include="*.tsx" app/
```

---

## ✅ **BEFORE COMMITTING**

- [ ] Used semantic color classes (not hard-coded)
- [ ] Applied consistent spacing scale
- [ ] Used typography scale
- [ ] Added hover/focus states
- [ ] Tested mobile responsiveness
- [ ] Verified contrast ratios (WCAG AA)
- [ ] No emojis (use icons instead)
- [ ] Professional military tone

---

## 🚫 **DON'T DO THIS**

```tsx
/* ❌ Hard-coded colors */
<div className="text-[#0F172A]">

/* ✅ Use semantic classes */
<div className="text-primary">

/* ❌ Emojis in production */
<span>🎉</span>

/* ✅ Professional icons */
<Icon name="Star" />

/* ❌ Inconsistent spacing */
<div className="p-5 mb-7">

/* ✅ Use scale */
<div className="p-6 mb-8">
```

---

## 📞 **NEED HELP?**

1. Check `DESIGN_SYSTEM_REFERENCE.md` for detailed docs
2. Check `DESIGN_SYSTEM_IMPLEMENTATION_TRACKING.md` for progress
3. Check `app/globals.css` for all available classes
4. Check existing components for examples

---

**Print this and keep it next to your monitor!**
