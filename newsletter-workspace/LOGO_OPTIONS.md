# Modern GL Monogram Logo Options

## Option B1: Hexagon Badge (Tech/Modern)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Hexagon badge -->
  <g transform="translate(5, 10)">
    <path d="M25 25 L40 15 L55 25 L55 45 L40 55 L25 45 Z" 
          fill="url(#grad1)" stroke="#0ea5e9" stroke-width="2.5"/>
    <text x="40" y="38" font-family="Arial, sans-serif" font-size="20" font-weight="900" 
          fill="#0ea5e9" text-anchor="middle" letter-spacing="1">GL</text>
  </g>
  <!-- Text -->
  <text x="75" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b" letter-spacing="0.5">GARRISON LEDGER</text>
  <text x="75" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

## Option B2: Angular Shield (Geometric/Sharp)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Angular shield -->
  <g transform="translate(5, 8)">
    <path d="M22 12 L52 12 L58 18 L58 42 L40 58 L22 42 Z" 
          fill="url(#grad2)" stroke="#0ea5e9" stroke-width="2.5" stroke-linejoin="miter"/>
    <text x="40" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="900" 
          fill="#0ea5e9" text-anchor="middle">GL</text>
  </g>
  <!-- Text -->
  <text x="75" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">GARRISON LEDGER</text>
  <text x="75" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

## Option B3: Split-Tone Badge (Modern Depth)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <!-- Double-layer shield for depth -->
  <g transform="translate(5, 8)">
    <!-- Back layer (shadow) -->
    <path d="M23 13 L51 13 L58 19 L58 40 C58 48, 53 54, 40 60 C27 54, 22 48, 22 40 L22 19 Z" 
          fill="#0f172a" opacity="0.4"/>
    <!-- Front layer -->
    <path d="M20 10 L50 10 L57 16 L57 38 C57 46, 52 52, 39 58 C26 52, 21 46, 21 38 L21 16 Z" 
          fill="#1e293b" stroke="#0ea5e9" stroke-width="3"/>
    <text x="39" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="900" 
          fill="#0ea5e9" text-anchor="middle" letter-spacing="2">GL</text>
  </g>
  <!-- Text -->
  <text x="75" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">GARRISON LEDGER</text>
  <text x="75" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

## Option B4: Minimal Circle Badge (Clean/SaaS)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <!-- Circle badge -->
  <g transform="translate(5, 10)">
    <circle cx="35" cy="30" r="28" fill="#1e293b" stroke="#0ea5e9" stroke-width="3"/>
    <text x="35" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="900" 
          fill="#0ea5e9" text-anchor="middle" letter-spacing="1">GL</text>
  </g>
  <!-- Text -->
  <text x="80" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">GARRISON LEDGER</text>
  <text x="80" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

## Option B5: Gradient Shield (Premium Feel)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.05" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Shield with gradient fill -->
  <g transform="translate(5, 8)">
    <path d="M20 10 L50 10 L58 16 L58 38 C58 46, 53 52, 39 58 C25 52, 20 46, 20 38 L20 16 Z" 
          fill="#1e293b" stroke="#0ea5e9" stroke-width="2.5"/>
    <path d="M20 10 L50 10 L58 16 L58 38 C58 46, 53 52, 39 58 C25 52, 20 46, 20 38 L20 16 Z" 
          fill="url(#grad3)"/>
    <text x="39" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="900" 
          fill="url(#textGrad)" text-anchor="middle" letter-spacing="1">GL</text>
  </g>
  <!-- Text -->
  <text x="75" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">GARRISON LEDGER</text>
  <text x="75" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

## Option B6: Negative Space (Ultra-Modern)
```svg
<svg width="360" height="70" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg">
  <!-- Shield outline only with negative space GL -->
  <g transform="translate(5, 8)">
    <path d="M20 10 L50 10 L58 16 L58 38 C58 46, 53 52, 39 58 C25 52, 20 46, 20 38 L20 16 Z" 
          fill="none" stroke="#1e293b" stroke-width="3.5"/>
    <path d="M20 10 L50 10 L58 16 L58 38 C58 46, 53 52, 39 58 C25 52, 20 46, 20 38 L20 16 Z" 
          fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="39" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="900" 
          fill="#1e293b" text-anchor="middle">GL</text>
  </g>
  <!-- Text -->
  <text x="75" y="30" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">GARRISON LEDGER</text>
  <text x="75" y="50" font-family="Arial, sans-serif" font-size="11" font-weight="400" fill="#64748b">Military Financial Intelligence</text>
</svg>
```

---

## Style Guide

**B1 - Hexagon**: Tech-forward, geometric, startup vibe
**B2 - Angular**: Sharp, aggressive, tactical feel
**B3 - Split-Tone**: 3D depth, premium, layered
**B4 - Circle**: Clean SaaS aesthetic, minimal, approachable
**B5 - Gradient**: Premium fintech feel, sophisticated
**B6 - Negative Space**: Ultra-modern, designer-approved, minimalist

**Brand Colors:**
- Shield fill: #1e293b (slate-800)
- Accent/stroke: #0ea5e9 (sky-500)
- Text: #1e293b (slate-800)
- Subtitle: #64748b (slate-500)

