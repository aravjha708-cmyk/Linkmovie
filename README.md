# Links of MoviesHouse4u — Movie Download Link Monetization Platform

**Links of MoviesHouse4u** is a production-oriented, responsive, lightweight link-shortening and movie-download monetization platform inspired by GPLinks. It allows you to paste movie download URLs (Google Drive, Telegram mirrors, cloud storage, etc.) into an admin dashboard, generate short links, share them publicly, display monetization pages with compliant advertisements and countdown timers, and securely redirect visitors to the original destination URL.

Featuring a cinema-inspired **Red & Dark Theme** (`#E50914`, `#08090C`, `#12151D`), built for zero-database deployment on **Netlify** using **Netlify Functions** and **Netlify Blobs** with strong consistency.

---

## 🌟 Highlights & Features

- **Hosting & Infrastructure**: 100% serverless, zero-maintenance architecture designed for Netlify.
- **No External Database Required**: Persistent storage powered natively by `@netlify/blobs` (with local filesystem fallback during local development).
- **Secure Server-Side Authentication**:
  - Protected API endpoints (`/api/*`).
  - Passwords verified with PBKDF2 / SHA-512 with timing-safe comparison.
  - HTTP-only, `SameSite=Strict` cookies.
  - Rate limiting on login attempts (automatic 15-minute lockouts after 5 consecutive failures).
  - CSRF protection on state-changing requests.
- **Configurable Monetization Flows**:
  - **One-Step Flow**: Short Link → Interstitial 1 → Original Destination URL.
  - **Two-Step Flow**: Short Link → Interstitial 1 → Interstitial 2 → Original Destination URL.
  - Cryptographically signed flow tokens prevent skipping countdown timers or inspecting client network payloads to uncover the destination URL prematurely.
- **Compliant Advertisement Management**:
  - Isolated ad slots for Step 1, Step 2, and Sitewide Banner.
  - Sandboxed execution (`sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"`) protects the platform from untrusted third-party ad scripts.
  - Compliant placeholder banners when no ads are active (never counted as fake impressions).
  - Transparent disclosures without deceptive download buttons.
- **Real Click Analytics & Funnel Tracking**:
  - Concurrency-safe event logging (append-only unique event keys avoid lost updates from simultaneous visits).
  - Real metrics: total visits, visits today, trailing 7-day trend, and step-by-step conversion funnels.
  - Automated bot filtering (disregards automated scrapers and crawlers).
  - Privacy-preserving: zero IP addresses or personal identification data stored in logs.
- **Modern Responsive Dark Interface**:
  - Curated dark aesthetic (`#0B0F19`, `#121A2A`, `#263247`, `#6366F1`, `#22C55E`).
  - Mobile-friendly sidebar drawer and responsive tables.
  - Live search, filtering, and pagination.
  - One-click export of link records and settings to JSON and CSV.

---

## 📂 Project Architecture

```text
asset-download-monetizer/
├── public/
│   ├── favicon.svg              # Brand SVG favicon
│   └── assets/                  # Public static assets
├── src/
│   ├── components/
│   │   ├── AdSlotRenderer.jsx   # Sandboxed ad slot component
│   │   ├── Modal.jsx            # Accessible confirmation & edit modals
│   │   ├── Navbar.jsx           # Admin top header with status indicators
│   │   ├── Sidebar.jsx          # Collapsible responsive sidebar
│   │   └── Toast.jsx            # Toast alert notification context
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Overview metrics, charts, quick shortener
│   │   ├── AdminLogin.jsx       # Secure admin login screen
│   │   ├── AdsSettings.jsx      # Ad slot editor with live sandbox preview
│   │   ├── Analytics.jsx        # Funnel metrics and 7-day traffic chart
│   │   ├── CreateLink.jsx       # Link generator with validation & countdowns
│   │   ├── Interstitial.jsx     # Public visitor monetization flow (steps 1 & 2)
│   │   ├── ManageLinks.jsx      # Searchable, paginated link manager table
│   │   ├── NotFound.jsx         # Custom 404 for unknown codes
│   │   └── Settings.jsx         # Branding, default countdowns, JSON/CSV exports
│   ├── services/
│   │   └── api.js               # Typed client fetch wrapper for Netlify Functions
│   ├── styles/
│   │   └── index.css            # Dark theme CSS design system
│   ├── App.jsx                  # Main router handling admin & public short paths
│   └── main.jsx                 # React root entry point
├── netlify/
│   └── functions/
│       ├── lib/
│       │   ├── analytics.mjs    # Concurrency-safe event logging & rollups
│       │   ├── auth.mjs         # PBKDF2 hashing, rate limits, signed sessions
│       │   ├── flow.mjs         # Cryptographic flow token validation
│       │   ├── handler-helper.mjs # Web Request/Response JSON helpers
│       │   ├── links.mjs        # Short code generation, URL safety checks
│       │   ├── settings.mjs     # Platform settings & ad slots
│       │   └── storage.mjs      # Netlify Blobs & local filesystem storage adapter
│       ├── analytics.mjs        # GET /api/analytics
│       ├── auth-login.mjs       # POST /api/auth-login
│       ├── auth-logout.mjs      # POST /api/auth-logout
│       ├── auth-session.mjs     # GET /api/auth-session
│       ├── flow-continue.mjs    # POST /api/flow-continue
│       ├── links-create.mjs     # POST /api/links-create
│       ├── links-delete.mjs     # POST /api/links-delete
│       ├── links-list.mjs       # GET /api/links-list
│       ├── links-resolve.mjs    # GET /api/links-resolve
│       ├── links-update.mjs     # POST /api/links-update
│       └── settings.mjs         # GET / POST /api/settings
├── netlify.toml                 # Netlify build, functions, and SPA routing config
├── package.json                 # Dependencies and npm scripts
├── test-suite.mjs               # Automated test suite (37 tests across all flows)
├── .env.example                 # Environment variable templates
└── README.md                    # Deployment and management documentation
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js version 18 or higher (Node 20+ recommended).
- npm or yarn.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/admin](http://localhost:5173/admin) in your browser.

> **Default Local Credentials**:
> - Password: `Admin@123456`
> - During local development, the built-in storage adapter persists data automatically to `.blobs-data/` on disk without needing remote Netlify credentials.

### 4. Run the Automated Test Suite
Run the comprehensive test suite verifying 37 security, validation, and flow assertions:
```bash
npm test
```

### 5. Production Build
Verify the production Vite bundle:
```bash
npm run build
```

---

## 🌐 Netlify Deployment Guide

### Option A: Deploy via GitHub / GitLab / Bitbucket (Recommended)

1. Push your repository to your Git provider:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AssetVault"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. Log in to [Netlify](https://app.netlify.com/) and click **Add new site > Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Click **Deploy Site**.

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login and link your site:
   ```bash
   ntl login
   ntl init
   ```
3. Deploy to production:
   ```bash
   ntl deploy --build --prod
   ```

---

## 🔑 Environment Variables Configuration

Set these environment variables in your Netlify site settings:
**Netlify Dashboard > Site configuration > Environment variables > Add a variable**

| Variable | Description | Example Value |
|---|---|---|
| `ADMIN_PASSWORD` | Secure administrator dashboard password | `MySecurePassword!2026` |
| `SESSION_SECRET` | 32+ character key for signing cookies & flow tokens | `b8f9e1a3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0` |
| `ADMIN_PASSWORD_HASH` | *(Optional)* PBKDF2 hash (`salt:hash`) | `salt_hex:hash_hex` |

> [!IMPORTANT]
> Always define `SESSION_SECRET` and `ADMIN_PASSWORD` in production. Do not commit actual secrets to version control.

---

## 💾 Netlify Blobs Setup

Netlify Blobs is enabled automatically on all Netlify sites.

1. When deployed to Netlify, `@netlify/blobs` automatically detects the function context with zero manual API keys required.
2. The application uses strong consistency (`consistency: 'strong'`) across its key stores:
   - `links`: Key-value storage for link definitions.
   - `analytics`: Append-only event blobs and daily rollups.
   - `settings`: Global platform branding and ad codes.
   - `sessions`: Session tracking and revocations.

### Concurrency Protection
Rather than performing vulnerable read-modify-write mutations on a single shared counter, visitor events write isolated append-only blobs:
`event:${YYYY-MM-DD}:${type}:${code}:${uuid}`
The analytics engine summarizes these events into cached rollups (`summary:${YYYY-MM-DD}`), guaranteeing that concurrent traffic spikes never lose visitor counts.

---

## 📢 Configuring Advertisements

1. Navigate to the **Ad Placements** tab in your admin dashboard (`/admin`).
2. You can configure:
   - **Step 1 Slot**: Displayed during the initial countdown.
   - **Step 2 Slot**: Displayed during the second countdown (for 2-step links).
   - **Footer Banner Slot**: Displayed beneath the countdown action button.
3. Supported Ad Types:
   - **Banner Placement**: Provide an image URL and a destination landing page.
   - **HTML / JavaScript Snippet**: Paste ad tags from compliant ad networks (e.g., Google AdSense, PropellerAds, or direct sponsors).
4. **Sandboxed Security**: Custom code snippets execute inside an isolated iframe, protecting admin credentials and session cookies from third-party scripts.

---

## 🌍 Connecting a Custom Domain

To serve short links like `https://go.yourbrand.com/a8k2x`:

1. In the Netlify Dashboard, navigate to **Site configuration > Domain management**.
2. Click **Add a custom domain** and enter your domain (e.g., `go.yourbrand.com`).
3. Add a DNS record with your domain provider:
   - **Type**: `CNAME`
   - **Name / Host**: `go`
   - **Value / Target**: `your-site-name.netlify.app`
4. Netlify will automatically provision a free SSL/TLS certificate via Let's Encrypt.

---

## 🔒 Security & Policy Considerations

- **No Deceptive Controls**: Advertisements are clearly distinguished from download navigation.
- **Timer Integrity**: Flow tokens verify both cryptographic signatures and minimum elapsed time (`iat` to `now`), preventing automated scripts from instantly skipping countdowns.
- **Strict Destination URL Validation**: Accepts only valid `http:` and `https:` schemes. Disallows `javascript:`, `data:`, or `file:` schemes.
- **Data Privacy**: No visitor IP addresses or sensitive browser fingerprinting data are saved in analytics logs.
- **Data Portability**: Full JSON and CSV backups of all links can be exported at any time from the **Website Settings** page.
