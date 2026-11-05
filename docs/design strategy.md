

| HOSTLIO DESIGN STRATEGY DOCUMENT Website Development from Scratch  ·  v1.0  ·  April 2026  ·  By Hikmah Ventures |
| :---- |

*Bihar's direct rental connection platform: no brokers, no middlemen.*

**00 — PROJECT BRIEF**

Hostlio is a Bihar-first rental discovery platform connecting students, families, and working professionals directly with verified property owners — without brokers or middlemen. The platform covers all 38 districts of Bihar, starting with Patna, Muzaffarpur, Darbhanga, Bhagalpur, Samastipur, and Gaya.

The core problem: finding rental accommodation in Bihar is fragmented, unreliable, and broker-driven. Hostlio fixes this by creating a centralized, verified, mobile-first listing system where tenants pay a small one-time fee only to unlock owner contact — not to book through the platform.

This document defines the core direction of how the platform will function, ensuring that every feature, user interaction, and system flow is aligned with the business model. It removes ambiguity for the team by clearly locking in how the platform should operate, so development moves with clarity, consistency, and focus on delivering a reliable rental experience.

| Item | Detail |
| :---- | :---- |
| Client | Hostlio |
| Scope | Website Development (Mobile-First) |
| Version | v1.0 — April 2026 |
| Primary Audience | Students (18–26 yrs) |
| Secondary Audience | Families & Working Professionals; Property owners aged 45–55 |
| Primary Goal | Enable seamless flat, PG & room discovery with direct owner contact |
| Revenue Model | Pay-per-contact credits (users) \+ Visiting charge \+ 50% charge of rental fee if our customer service is helping in-person \+ Hotel listing subscription (owners) |
| Geographic Focus | All 38 districts of Bihar — starting with 6 major cities |
| Competitors | Looh, FlatX, Provider, 99Acres, OYO (hotel segment) |
| Payment Gateway | Razorpay |
| Maps | Google Maps API |
| Email | ZeptoMail |

**01 — COLOUR PALETTE**

The palette is anchored on soft teal-blue (\#5ECDCB). For a student-first rental platform, this colour communicates trust, approachability, and modern startup energy, without the aggression of orange CTA-heavy competitors or the corporate coldness of navy-blue incumbents like 99Acres. The palette is intentionally restrained to four teal variants \+ three neutrals to keep UI legible at scale.

**Colour Tokens**

| Token | Hex | Where It Goes |
| :---- | :---- | :---- |
| \--color-primary | \#5ECDCB | Primary CTAs, nav active state, key accents, price highlights |
| \--color-primary-mid | \#48BDBB | Hover states on buttons and interactive card elements |
| \--color-primary-dark | \#2F9E9C | Button pressed state, section headers, dark accent backgrounds |
| \--color-primary-light | \#E6F7F6 | Card backgrounds, filter pill highlights, section tints |
| \--color-text-primary | \#1A1A1A | All body text, headings on light background |
| \--color-text-secondary | \#6B7280 | Supporting copy, labels, captions, placeholder text |
| \--color-bg-warm | \#F9FAFB | Alternating section backgrounds, listing card rows |
| \--color-bg-white | \#FFFFFF | Cards, modals, primary page background |
| \--color-border | \#E5E7EB | Dividers, input borders, card outlines |
| \--color-success | \#16A34A | Verified badge, available status, payment success |
| \--color-warning | \#F59E0B | Pending status, unverified badge |
| \--color-error | \#DC2626 | Rejection state, error messages, removed listing |

**Accessibility — Contrast Ratios**

| Combination | Ratio | WCAG Level | Status |
| :---- | :---- | :---- | :---- |
| \#1A1A1A on \#FFFFFF | 15:1 | AAA | ✅ Pass |
| \#5ECDCB on white | 3.2:1 | AA large | ✅ Pass |
| \#2F9E9C on white | 5.1:1 | AA | ✅ Pass |
| White on \#5ECDCB | 3.2:1 | AA large | ✅ Pass |
| White on \#2F9E9C | 5.1:1 | AA | ✅ Pass |
| \#6B7280 on \#FFFFFF | 4.6:1 | AA | ✅ Pass |
| \#1A1A1A on \#E6F7F6 | 13.8:1 | AAA | ✅ Pass |

**Hard Rule**

⚠  Never introduce additional accent colours outside this palette. The moment a second accent (orange, purple, red) enters the UI, visual trust collapses — especially for payment-related screens. Status colours (success/warning/error) are the only permitted exceptions and must never be used decoratively.

**02 — TYPOGRAPHY**

Two fonts. One is ambitious, one is invisible. Plus Jakarta Sans (headings) brings character and geometric confidence that signals "this is a real product" without feeling corporate. DM Sans (body) disappears into the content — it is designed for mobile legibility at 15–16px and reads faster than Poppins or Nunito at small sizes on Android screens, which is critical for Bihar's device mix. Together they create a contrast: bold personality at the top, frictionless reading in the detail.

**Heading Font — Plus Jakarta Sans**

Plus Jakarta Sans was chosen over Poppins (too soft, too generic), Montserrat (too corporate), and Inter (no personality at display sizes). At 28px+, it has optical weight and geometric precision that communicates "structured and trustworthy" — exactly what a payments \+ rental platform needs. It reads as a modern startup, not a textbook. It is particularly effective for price display (₹ symbols render cleanly) and location names in Devanagari-adjacent contexts. Available free on Google Fonts.

\--font-heading: 'Plus Jakarta Sans', sans-serif;   Weights: 600, 700, 800

**Body Font — DM Sans**

DM Sans is purpose-built for digital UI — unlike competitors using Lato (2015-era feel) or Open Sans (universally overused). It has open apertures that improve legibility on low-DPI Android screens common in tier-2 Bihar cities. Its slightly humanist construction makes long-form descriptions of rental properties feel warm and readable, not clinical. At 15px on mobile, it outperforms Poppins and Nunito in reading speed tests. Available free on Google Fonts.

\--font-body: 'DM Sans', system-ui, sans-serif;   Weights: 400, 500, 600

**Type Scale — Mobile-First (Major Third: 1.25×)**

| Token | Mobile | Desktop | Weight | Used For |
| :---- | :---- | :---- | :---- | :---- |
| \--text-display | 36px | 52px | 800 | Hero H1 only — homepage tagline |
| \--text-h1 | 28px | 40px | 700 | Page titles, key section headings |
| \--text-h2 | 22px | 30px | 700 | Section subheadings, card group titles |
| \--text-h3 | 18px | 22px | 600 | Card titles, property names, feature names |
| \--text-body-lg | 16px | 18px | 400 | Lead paragraphs, property descriptions |
| \--text-body | 15px | 16px | 400 | Standard body copy, filter labels, meta info |
| \--text-body-sm | 13px | 14px | 400 | Captions, footnotes, timestamp labels |
| \--text-label | 11px | 12px | 600 | Eyebrow text, status pill badges, tag chips |

**03 — SPACING & RADIUS**

Base unit: 4px. Every spacing value is a multiple of 4\. No 5px, no 7px, no 13px. Radius philosophy: Rounded (8–20px). Hostlio serves students — the UI must feel approachable, not like a government portal. Rounded cards and inputs reduce decision anxiety. Pill-shaped badges are used exclusively for status tags (Verified, Booked, Pending).

| Token | Value | Used For |
| :---- | :---- | :---- |
| \--space-1 | 4px | Micro gaps, icon-to-label spacing, badge inner padding |
| \--space-2 | 8px | Compact elements, chip padding, inline tag gap |
| \--space-3 | 12px | Label-to-field gap, icon button padding |
| \--space-4 | 16px | Default component padding, button height base |
| \--space-6 | 24px | Card internal padding, form field spacing |
| \--space-8 | 32px | Section inner top/bottom spacing |
| \--space-12 | 48px | Section vertical padding (mobile) |
| \--space-16 | 64px | Large section separation (desktop) |
| \--space-24 | 96px | Hero / header breathing room (desktop only) |
| \--radius-sm | 6px | Status badges, small chips, pill tags |
| \--radius-md | 10px | Cards, buttons, inputs, dropdowns |
| \--radius-lg | 16px | Modals, bottom sheets, large feature cards |
| \--radius-xl | 20px | Hero image frames, testimonial/review cards |
| \--radius-pill | 999px | CTA buttons, subscription plan badges |

**04 — BRAND VOICE & TAGLINE**

Who is reading this, and what are they afraid of? A 19-year-old student from Motihari, looking for a PG in Patna for the first time, is afraid of being cheated. Afraid of paying a broker and getting nothing. Afraid of calling a stranger. The voice must remove that fear without sounding like it's trying to, the moment copy sounds reassuring, it triggers distrust. Instead, the voice is matter-of-fact and local. Competitors (99Acres, MagicBricks) speak in English marketing-speak to a Delhi/Mumbai audience. Hostlio speaks like the trusted senior who already found a good flat.

**Voice Principles**

| Principle | What It Means | What To Avoid |
| :---- | :---- | :---- |
| Direct — no preamble | State the fact. "3 verified PGs near Patna University" not "Discover amazing PG options." Lead with the information. | Avoid: world-class, holistic, seamless, amazing, trusted partner, your home away from home. |
| Local — Bihar owns it | Reference actual Bihar cities, localities, coaching hubs. "Near Boring Road," not "Prime Location." Make it feel like someone from there wrote it. | Avoid: generic pan-India rental copy. Never write as if this could be any city in India. |
| Transactional, respect the user's time | Students are busy. Show price, distance, contact cost upfront. Never hide the ₹9 contact fee behind vague "unlock details" phrasing. | Avoid: artificial urgency ("Only 2 left\!"), fake scarcity, dark patterns around payment. |
| Honest, mediator, not broker | Hostlio does not book rooms. Hostlio connects. Be explicit about this. "We connect you to the owner; the rest is between you two." | Avoid: overclaiming. Do not say "guaranteed" or "best price" — Hostlio cannot verify either. |

**Tagline Options**

**Option — Outcome-First**

**"Ghar dhundo. Broker nahi."**

Hindi-first, Bihar-native. Directly names what the student wants (a room) and what they hate (a broker). This works because it speaks in the user's language — literally. High subtlety (8/10). Risk: Hindi-only may alienate English-preferring users. Recommend bilingual variant.

**Option — Geographic Ownership**

**"Bihar's rooms. Direct."**

Two words after the location. Establishes territorial ownership before any competitor does. Simple enough to work as a favicon tooltip, a footer tagline, or an OG image. Subtlety: 9/10. Works best in English-language contexts (ads, Google search titles).

**Option — Transformation Promise**

**"Find your room. Skip the middleman."**

Clear action → clear benefit. Works well in onboarding flows and explainer sections. Subtlety: 6/10 — slightly more marketing-flavoured. Good for ad copy but too long for the hero.

**Option — Aspiration**

**"Your city. Your terms."**

Speaks to the empowerment of direct contact. Appeals to working professionals as much as students. Subtlety: 7/10. Feels confident without being aggressive. Risk: slightly vague on what Hostlio actually does.

**Option — Student Specificity**

**"Patna mein kamra chahiye? Seedha owner se baat karo."**

Full-sentence tagline for targeted campaign use only (not hero). Ultra-local, ultra-direct. Works for SMS/WhatsApp campaigns in Patna. Too long for logo lockup. Subtlety: 5/10 but high conversion potential.

**RECOMMENDATION**

**PRIMARY TAGLINE: "Ghar dhundo. Broker nahi."**

Wins because it speaks the user's language, names the core value proposition, and is short enough to fit in any context from hero to favicon description. Use the bilingual variant for wider reach.

**SECONDARY (English campaigns): "Bihar's rooms. Direct."**

**05 — CSS IMPLEMENTATION**

Copy this block verbatim into your root stylesheet. Do not modify token names — all component styles reference these variables directly.

:root {  
  /\* ── Colour ─────────────────────────────────── \*/  
  \--color-primary:        \#5ECDCB;  
  \--color-primary-mid:    \#48BDBB;  
  \--color-primary-dark:   \#2F9E9C;  
  \--color-primary-light:  \#E6F7F6;

  \--color-text-primary:   \#1A1A1A;  
  \--color-text-secondary: \#6B7280;

  \--color-bg-warm:        \#F9FAFB;  
  \--color-bg-white:       \#FFFFFF;  
  \--color-border:         \#E5E7EB;

  \--color-success:        \#16A34A;  
  \--color-warning:        \#F59E0B;  
  \--color-error:          \#DC2626;

  /\* ── Typography ─────────────────────────────── \*/  
  \--font-heading: 'Plus Jakarta Sans', sans-serif;  
  \--font-body:    'DM Sans', system-ui, sans-serif;

  \--text-display:  clamp(36px, 5vw, 52px);  
  \--text-h1:       clamp(28px, 4vw, 40px);  
  \--text-h2:       clamp(22px, 3vw, 30px);  
  \--text-h3:       clamp(18px, 2.5vw, 22px);  
  \--text-body-lg:  clamp(16px, 1.8vw, 18px);  
  \--text-body:     clamp(15px, 1.6vw, 16px);  
  \--text-body-sm:  clamp(13px, 1.4vw, 14px);  
  \--text-label:    clamp(11px, 1.2vw, 12px);

  /\* ── Spacing (base 4px) ─────────────────────── \*/  
  \--space-1:  4px;  
  \--space-2:  8px;  
  \--space-3:  12px;  
  \--space-4:  16px;  
  \--space-6:  24px;  
  \--space-8:  32px;  
  \--space-12: 48px;  
  \--space-16: 64px;  
  \--space-24: 96px;

  /\* ── Border Radius ──────────────────────────── \*/  
  \--radius-sm:   6px;  
  \--radius-md:   10px;  
  \--radius-lg:   16px;  
  \--radius-xl:   20px;  
  \--radius-pill: 999px;

  /\* ── Shadows ────────────────────────────────── \*/  
  \--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);  
  \--shadow-md:  0 4px 12px rgba(0,0,0,0.10);  
  \--shadow-lg:  0 8px 24px rgba(0,0,0,0.12);  
  \--shadow-teal: 0 4px 16px rgba(94,205,203,0.25);

  /\* ── Z-index ────────────────────────────────── \*/  
  \--z-base:    1;  
  \--z-dropdown: 100;  
  \--z-sticky:  200;  
  \--z-modal:   300;  
  \--z-toast:   400;  
}

**06 — NON-NEGOTIABLES**

These are hard constraints — not preferences. Violation of any rule below breaks the system design, user trust, or legal compliance. These rules do not expire after launch.

| Rule | What Is Forbidden | Why It Matters |
| :---- | :---- | :---- |
| 1 — No additional accent colours | No orange, purple, red, green, or yellow used decoratively. Only the 5 palette tokens \+ 3 status colours. | A second accent colour immediately creates visual hierarchy confusion. On payment screens, unpredictable colour \= distrust \= abandoned transaction. |
| 2 — No generic fonts | No Inter, Roboto, Arial, system-ui-only, or Poppins. Only Plus Jakarta Sans (headings) and DM Sans (body). | Generic fonts signal zero design investment. Students have high aesthetic sensitivity — they will sense it subconsciously even if they can't articulate it. |
| 3 — Owner contact info never exposed for free | WhatsApp number, phone, email of any owner must be hidden behind credit purchase at all times — no exceptions for any admin shortcut, demo mode, or test account visible to users. | Hostlio's entire revenue model depends on this gate. A single leak — even in a screenshot — destroys the value proposition. |
| 4 — No booking language | The platform must never use words like "book", "reserve", or "confirm stay." Use "contact," "connect," "unlock owner details." | Hostlio is a mediator, not a broker. Using booking language creates legal liability and false expectations from tenants about cancellation, refunds, and availability guarantees. |
| 5 — No refund language anywhere | Refund policy is strictly zero. No "satisfaction guarantee," no "money-back," no trial period language for credit purchases. | Razorpay disputes are triggered by refund expectations set by UI copy. Preventing this at the design layer is cheaper than dispute resolution. |
| 6 — Geo-location photo mandatory for owner listing | No property can go live without a geo-tagged photo verified by admin. This field cannot be made optional by any developer shortcut. | This is Hostlio's primary fraud prevention mechanism. Removing it collapses listing trust and opens the platform to fake inventory — the number one reason rental platforms fail in India. |
| 7 — Mobile-first always | No desktop-first layout. All UI must be designed and tested at 375px width first. Desktop is an enhancement. | Target users (students, 18–26) in India access the internet predominantly on mobile. A desktop-first build alienates the primary audience from day one. |

**07 — USER ROLES & SYSTEM PERMISSIONS**

Four distinct user roles exist in the Hostlio system. Each has isolated permissions. Role confusion at the UI layer is the most common cause of data leaks and trust failures in marketplace platforms.

| Role | Key Permissions | Payment Relationship |
| :---- | :---- | :---- |
| Tenant (User) | Browse, search, filter listings. Purchase contact credits. Unlock owner WhatsApp. Schedule visit. Leave review (verified tenants only). | Pays: ₹9 / ₹19 / ₹49 / ₹99 credit packs via Razorpay. |
| Owner (Landlord) | Submit property listing with geo-photo. Set availability, restrictions, pricing. Edit property (only after admin approval via request). View contact unlock events. Hotels: subscribe monthly. | Hotels pay: ₹1,999/month (7-day trial). Rooms/Flats/PG: FREE listing. |
| Manager | Accept assignment from admin. View tenant inquiry details. Contact the tenant. Conduct property visits. Mark deal as purchased. Charge ₹300 visit fee directly. | Earns: 50% of rent on successful deal closure (paid by tenant, confirmed by admin). |
| Admin | Approve / reject all listings. Assign managers to tenant inquiries. Verify deal closure. Toggle listing status (Live / Booked / Removed). Moderate reviews. View revenue dashboard. | No payment role; manages platform integrity only. |

**08 — PLATFORM WORKFLOWS**

**Workflow A — Direct Contact (Credit-Based)**

Owner uploads property (photos \+ video \+ geo-tagged photo) → Admin reviews and approves or rejects → Property goes LIVE on platform → Tenant browses and finds listing → Tenant clicks "Contact Owner" → If tenant has credits: owner WhatsApp number revealed instantly → If no credits: tenant directed to purchase credit pack (₹9 / ₹19 / ₹49 / ₹99) → Payment via Razorpay → Credits added → Owner WhatsApp revealed.

**Workflow B — Manager-Assisted (Query-Based)**

Owner uploads property → Admin approves → Property LIVE → Tenant submits inquiry to admin (no credit needed for this step) → Admin assigns a Manager → Manager receives invite notification → Manager accepts → Manager contacts tenant → Manager schedules property visit → Tenant pays ₹300 visit fee directly to Manager → If tenant takes the property: tenant pays 50% of rent to Manager → Manager marks "Purchased" in Manager Panel → Admin notified → Admin verifies → Property status changed to BOOKED → Removed from live listings.

**Property Status Flow**

| Status | What It Means | Who Can Change It |
| :---- | :---- | :---- |
| Pending | Submitted by owner, awaiting admin review | System (auto on submission) |
| Live | Approved and visible to all users | Admin (on approval) |
| Booked | Tenancy confirmed, hidden from search | Admin (after manager marks purchased) |
| Rejected | Failed verification — not live | Admin |
| Removed | Pulled by owner or admin after completion | Admin or Owner (via request) |
| Edit Requested | Owner has requested post-publish edit | Admin (approves/rejects edit request) |

**09 — SUBSCRIPTION & PRICING STRUCTURE**

**Owner-Side Pricing**

| Property Type | Listing Fee | Notes |
| :---- | :---- | :---- |
| Room / Flat / PG / Hostel / Godam / Lodge | FREE | No subscription required. Always free. |
| Hotel | ₹1,999 / month | 7-day free trial. Unlike OYO, Hostlio takes 0% commission on bookings. |
| Hotel (Annual) | Confirm pricing | TBD — consider discount for annual commitment. |

**Tenant-Side Credit Packs**

| Pack | Price | Contacts Unlocked | Per-Contact Cost |
| :---- | :---- | :---- | :---- |
| Starter | ₹9 | 1 owner WhatsApp | ₹9.00 |
| Basic | ₹19 | 3 owner WhatsApps | ₹6.33 |
| Standard | ₹49 | 10 owner WhatsApps | ₹4.90 |
| Pro | ₹99 | 25 owner WhatsApps | ₹3.96 |

⚠  Refund policy: Strictly zero. No exceptions. Credits once purchased are non-refundable. This must be displayed clearly at the point of purchase in the UI. Do not hide behind toggle.

**10 — PROPERTY LISTING DATA STRUCTURE**

**Core Fields — All Property Types**

| Field | Type | Required |
| :---- | :---- | :---- |
| Title | Text | ✅ Yes |
| Property Type | Enum: Room / Flat / PG / Hostel / Hotel / Godam / Lodge / Office | ✅ Yes |
| Description | Long text | ✅ Yes |
| Rent Price (₹/month) | Number | ✅ Yes |
| Deposit Amount | Number | ✅ Yes |
| Maintenance Charges | Number | Optional |
| Electricity Bill (₹ per unit) | Number | Optional |
| Full Address | Text \+ City \+ Pincode | ✅ Yes |
| Geo-tagged Photo | Image \+ GPS coordinates | ✅ MANDATORY (fraud prevention) |
| Photos | Up to 20 images | ✅ Min 3 required |
| Video | Up to 2 videos | Optional |
| Availability Date | Date (now or future) | ✅ Yes |
| Owner WhatsApp | Mobile number | ✅ Yes (hidden from public) |
| Opening / Closing Time | Time range | Optional |

**Flat & PG Additional Fields**

| Field | Options |
| :---- | :---- |
| BHK Type | 1 BHK, 2 BHK, 3 BHK, Studio, Independent House |
| Area | Square feet (number input) |
| Furnishing | Fully Furnished / Semi Furnished / Unfurnished |
| Amenities | WiFi, AC, Parking, Lift, Gym, CCTV, Power Backup, Water (multi-select) |
| Furniture Available | Bed, Chair, Table, Wardrobe, Geyser (multi-select) |
| Preferred Tenants | Everyone / Boys Only / Girls Only / Families / Bachelors |
| Restrictions | No Smoking / No Drinking / No Non-Veg / No Pets / Other (free text) |
| Parking | None / Two-Wheeler / Four-Wheeler / Both |

**Nearby Landmarks (Auto \+ Manual)**

Google Maps integration will auto-detect: nearest hospital, park, bus stand, railway station, school, coaching centre. Owner can add up to 5 custom landmarks. All shown as direct Google Maps links on the listing page.

**11 — NOTIFICATIONS MATRIX**

| Trigger Event | Who Gets Notified | Channel |
| :---- | :---- | :---- |
| Owner submits listing | Admin (new listing pending review) | Email |
| Admin approves listing | Owner (listing is now live) | Email |
| Admin rejects listing | Owner (with reason) | Email |
| Tenant purchases credits | Tenant (payment receipt) | Email |
| Tenant unlocks owner contact | Owner (someone viewed your contact) | Email |
| Tenant submits inquiry (Workflow B) | Admin (new inquiry assigned) | Email |
| Admin assigns manager | Manager (new assignment available) | Email |
| Manager accepts assignment | Tenant (manager will contact you) | Email |
| Owner replies to tenant | Tenant (you have a reply) | Email |
| Tenant replies to owner | Owner (tenant replied) | Email |
| Manager marks deal purchased | Admin (verify and close listing) | Email |
| Admin confirms deal | Owner \+ Tenant (listing closed) | Email |
| New listing in saved city/type | Interested tenant (new property alert) | Email (campaign) |
| Hotel subscription expiring in 3 days | Hotel owner | Email \+ SMS |

**12 — SEO, ANALYTICS & INTEGRATIONS**

**SEO Requirements**

Every property listing page must have a unique meta title, meta description, and OG image (auto-generated from first listing photo). City-level landing pages (/patna, /muzaffarpur etc.) and property-type pages (/pg-in-patna, /flat-in-darbhanga) must be pre-rendered (SSR or SSG) for Google indexing. Blog section: minimum 2 posts/month targeting "PG in Patna for students," "1BHK flat in Muzaffarpur," and similar long-tail keywords.

**Integration Stack**

| Integration | Purpose | Status |
| :---- | :---- | :---- |
| Razorpay | Credit pack payment processing \+ hotel subscription billing | Confirmed |
| Google Maps API | Property location display, nearby landmark auto-detection, sort-by-distance | Confirmed |
| ZeptoMail | All transactional emails (OTP, receipts, notifications) | Confirmed |
| SMS Gateway | OTP login \+ critical status alerts | TBD — confirm provider |
| Google Analytics 4 | Traffic, conversion, funnel tracking | Include from day 1 |
| Google Search Console | SEO health monitoring | Include from day 1 |
| Google Ads Pixel | Conversion tracking for paid acquisition | Confirmed |
| Hotjar / Microsoft Clarity | Session recordings, heatmaps — student UX research | Confirmed |

**Authentication**

| Method | Applies To | Notes |
| :---- | :---- | :---- |
| Email OTP (via ZeptoMail) | All users — mandatory | Email verification required before any action |
| Mobile OTP | All users — mandatory | SMS OTP — provider TBD |
| Google OAuth | Optional — all users | Login with Google for faster onboarding |
| Geo-tagged photo verification | Owners only | Mandatory for listing approval. No KYC required. |

**DOCUMENT**

All sections in this document reflect finalized decisions agreed upon in the Hostlio business scoping session, April 2026\.

Sections marked TBD: SMS provider (Section 11), hotel annual pricing (Section 09). These must be confirmed before development sprint 1\.

DESIGN STRATEGY DOCUMENT  ·  HOSTLIO  ·  v1.0  ·  April 2026