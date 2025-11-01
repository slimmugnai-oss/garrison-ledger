# 🎖️ GARRISON LEDGER

**AI-Powered Financial Planning for Military Life**

Garrison Ledger is an intelligent platform that helps military service members optimize their finances through AI-curated content and personalized planning.

---

## 🚀 QUICK START

### **For Developers**

1. **Read System Status**
   ```bash
   cat SYSTEM_STATUS.md
   ```
   This is your source of truth for the current state of the system.

2. **Review AI Agent Guidelines**
   ```bash
   cat .cursorrules
   ```
   Essential guidelines for working with this codebase.

3. **Check Development Workflow**
   ```bash
   cat docs/DEVELOPMENT_WORKFLOW.md
   ```
   Standard process for building features.

4. **Run Development Server**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 📚 DOCUMENTATION

### **Essential Reading**
- [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md) - Current system state & architecture
- [`.cursorrules`](./.cursorrules) - AI agent guidelines & coding standards
- [`CHANGELOG.md`](./CHANGELOG.md) - Version history & changes
- [`docs/`](./docs/) - Detailed documentation

### **Documentation Structure**
```
docs/
├── active/          # Current system documentation
├── archive/         # Historical documentation
├── guides/          # How-to guides
└── planning/        # Future plans
```

See [`docs/README.md`](./docs/README.md) for complete documentation index.

---

## 🏗️ ARCHITECTURE

### **Core Innovation: Ask Assistant + Premium Tools**

Garrison Ledger provides comprehensive military financial planning through:

1. **Ask Assistant** - Q&A virtual assistant with official DFAS/VA/TSP data sources
2. **Premium Tools Suite** - LES Auditor, PCS Copilot, Base Navigator
3. **Intel Library** - Live BAH/BAS/COLA data with 203 base guides worldwide
4. **Calculator Suite** - 6 military-specific financial calculators

**AI Cost:** ~$0.02 per interaction | **Data Sources:** 100% official military sources

### **Technology Stack**

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Storage)
- **Authentication:** Clerk
- **Payments:** Stripe
- **AI:** Google Gemini 2.0 Flash
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL with RLS)

### **Key Systems**

1. **Ask Assistant** - Q&A virtual assistant with official military data
2. **Premium Tools Suite** - LES Auditor, PCS Copilot, Base Navigator
3. **Intel Library** - Live BAH/BAS/COLA data with 203 base guides
4. **Calculator Suite** - 6 military-specific financial calculators
5. **Admin Dashboard** - Complete 6-tab administrative interface
6. **Premium Subscription** - Stripe-powered monetization

---

## 🎯 FEATURES

### **For Users**
- ✅ Ask Assistant Q&A virtual assistant with official data
- ✅ LES Auditor pay verification and error detection
- ✅ PCS Copilot complete relocation planning
- ✅ Base Navigator with 203 bases worldwide
- ✅ 6 financial calculator tools (TSP, SDP, House Hacking, etc.)
- ✅ Intel Library with live BAH/BAS/COLA data
- ✅ Premium subscription tiers

### **For Developers**
- ✅ TypeScript throughout
- ✅ Server & Client Components
- ✅ Row Level Security (RLS)
- ✅ Automated deployments
- ✅ Comprehensive documentation
- ✅ AI agent guidelines

---

## 🔧 DEVELOPMENT

### **Prerequisites**
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Clerk account
- Stripe account (for payments)
- Google API key (for Gemini)

### **Environment Variables**
See [`docs/guides/ENV_SETUP.md`](./docs/guides/ENV_SETUP.md) for setup instructions.

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
GOOGLE_API_KEY=
```

### **Development Workflow**

1. **Create Feature Branch** (optional)
   ```bash
   git checkout -b feature/name
   ```

2. **Follow Development Workflow**
   See [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md)

3. **Test Thoroughly**
   - Manual testing
   - Check mobile responsive
   - Verify authentication
   - Test edge cases

4. **Deploy**
   ```bash
   npm run lint
   git add -A
   git commit -m "✨ Feature description"
   git push origin main
   ```

### **Database Migrations**

1. Create migration file in `supabase-migrations/`
2. Test locally if possible
3. Apply via Supabase dashboard
4. Update `SYSTEM_STATUS.md`

---

## 📊 PROJECT STATUS

**Version:** 6.0.1 (Domain Migration)  
**Status:** 🟢 Production Ready  
**Domain:** https://www.garrisonledger.com  
**Last Updated:** 2025-10-23

### **Recent Updates**
- ✅ Domain Migration to garrisonledger.com (v6.0.1)
- ✅ Ask Assistant Q&A Virtual Assistant (v6.0.0)
- ✅ LES Auditor Pay Verification Tool
- ✅ PCS Copilot Complete Planning System
- ✅ Base Navigator with 203 Bases Worldwide
- ✅ Ask Military Expert (RAG system with 4,900+ sources)
- ✅ Admin Dashboard Complete (6 tabs)
- ✅ Gemini 2.0 Flash Integration (97% cost reduction)

See [`CHANGELOG.md`](./CHANGELOG.md) for full version history.

---

## 🔒 SECURITY

- ✅ Row Level Security (RLS) on all user tables
- ✅ API endpoints check authentication
- ✅ Environment variables not committed
- ✅ Webhook signature verification
- ✅ Rate limiting on API routes

---

## 📈 PERFORMANCE

- **Page Load:** < 3 seconds
- **AI Response Time:** < 5 seconds
- **Database Queries:** Optimized with indexes
- **Content Blocks:** 410 with complete metadata
- **Content Rating:** 3.30/5.0 average

---

## 🎯 ROADMAP

### **Short-term**
- [ ] Ask Assistant mobile optimization
- [ ] Enhanced LES Auditor PDF parsing
- [ ] PCS Copilot integration improvements
- [ ] Base Navigator API cost optimization

### **Long-term**
- [ ] MyPay/TSP API integration
- [ ] Advanced AI features (what-if scenarios)
- [ ] Mobile app (PWA ready)
- [ ] Custom model training

See `SYSTEM_STATUS.md` for detailed priorities.

---

## 📞 RESOURCES

### **Services**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Stripe Dashboard](https://dashboard.stripe.com)

### **Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 🤝 CONTRIBUTING

1. Read `SYSTEM_STATUS.md`
2. Read `.cursorrules`
3. Read `docs/DEVELOPMENT_WORKFLOW.md`
4. Create feature branch
5. Follow coding standards
6. Test thoroughly
7. Update documentation
8. Submit PR

---

## 📝 LICENSE

Proprietary - All Rights Reserved

---

## 📧 CONTACT

For questions about this codebase, check:
1. `SYSTEM_STATUS.md` - Current state
2. `docs/` - Detailed documentation  
3. `.cursorrules` - Development guidelines

---

**Built with ❤️ for the military community**
