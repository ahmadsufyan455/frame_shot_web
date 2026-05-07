# FrameShot Web — Product Requirements Document

**Tagline:** Your shot. Your gear. Your story.
**Version:** 1.0 | **Status:** Ready for Development
**Date:** May 2026 | **Platform:** Web | **Monetization:** Free

---

## Table of Contents

1. [Document Information](#1-document-information)
2. [Executive Summary](#2-executive-summary)
3. [Problem Statement](#3-problem-statement)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Target Users & Personas](#5-target-users--personas)
6. [Features & Requirements](#6-features--requirements)
7. [Key User Flows](#7-key-user-flows)
8. [Technical Specification](#10-technical-specification)
9. [MVP Scope](#11-mvp-scope)
10. [Risks & Mitigations](#13-risks--mitigations)
11. [Development Milestones](#14-development-milestones)

---

## 1. Document Information

| Field | Value |
|---|---|
| Product Name | FrameShot Web |
| Tagline | Your shot. Your gear. Your story. |
| Version | 1.0 |
| Status | Ready for Development |
| Date | May 2026 |
| Platform | Web (Next.js) |
| Monetization | Free |

---

## 2. Executive Summary

FrameShot Web is a browser-based tool that automatically reads EXIF metadata from any photo and renders it as a beautiful, shareable frame — complete with camera body, lens, ISO, shutter speed, aperture, focal length, date, and location.

The core promise is simplicity: upload a photo, pick a style, download the result. No sign-up. No installation. No manual typing. Everything happens inside the browser — the photo never leaves the user's device.

> **Design principle:** Every decision in this product should reduce steps, not add them. If a feature requires the user to think for more than 3 seconds, it does not belong in v1.

---

## 3. Problem Statement

### 3.1 The Core Pain

Photographers who edit on desktop want to add their camera settings to a photo before sharing it online. The information is already embedded in the file as EXIF metadata — but there is no good tool to surface it visually.

**Current workarounds and their failures:**

**Manual editing in Canva or Photoshop**
- Takes 5–15 minutes per photo
- Requires manually typing every setting by hand
- No automation — the data is in the file but ignored

**EXIF Frame (exif-frame.yuru.cam) and similar tools**
- Only 1–2 rigid templates with no style options
- Outdated UI — feels like a developer tool
- No way to edit or override individual fields

**Lightroom export overlays**
- Only available as plugins, not standalone
- Steep learning curve for non-technical users
- Limited style customization

### 3.2 User Frustration Signals

| Signal | Source | Implication |
|---|---|---|
| Google search "EXIF watermark tool" returns weak results | SEO gap | First good tool to rank here wins significant organic traffic |
| EXIF Frame gets consistent traffic despite a poor UI | Competitor data | Demand is real and unmet |
| Photographers type camera settings manually in Instagram captions | Social behavior | Users want this — they just have no easy way to do it |
| Photography forums frequently ask for "EXIF overlay" tools | Community | Strong existing demand with no dominant solution |

---

## 4. Goals & Success Metrics

### 4.1 Product Goals

- Deliver the fastest path from an uploaded photo to a downloadable EXIF frame — target under 30 seconds end-to-end
- Support photos from any camera: smartphone, mirrorless, DSLR, point-and-shoot
- Rank on Google for EXIF watermark and photo frame related keywords
- Build a tool people recommend to others because it is genuinely the best option available

### 4.2 Success Metrics — 3 Months Post-Launch

| Metric | Target | Rationale |
|---|---|---|
| Monthly unique visitors | 10,000 | Achievable via SEO + community seeding |
| Photos framed per month | 5,000 | Core usage signal — 50% of visitors completing the flow |
| Return visitor rate | >25% | Indicates genuine utility, not just curiosity |
| Task completion rate | >70% | Upload → download without dropping off |
| Google ranking — "EXIF watermark tool" | Top 5 | Primary SEO target keyword |
| Average session duration | >60 seconds | Indicates style exploration, not just bouncing |

---

## 5. Target Users & Personas

### Persona A — "The Desktop Editor"

| | |
|---|---|
| **Name** | Dani, 31 |
| **Device** | MacBook Pro |
| **Camera** | Nikon Z6 III |
| **Behavior** | Shoots RAW, edits in Lightroom on desktop, exports JPEG, wants to add an EXIF frame before posting |
| **Pain** | No good desktop tool exists — existing options are ugly or require manual data entry |
| **Goal** | A clean, fast tool that reads the settings automatically and produces a beautiful output |
| **How they find FrameShot** | Google search: "EXIF watermark tool" or "add camera info to photo online" |

### Persona B — "The Photography Educator"

| | |
|---|---|
| **Name** | Budi, 35 |
| **Camera** | Fujifilm X-T5 |
| **Behavior** | Creates tutorial content on YouTube and Instagram, frequently shares camera settings to teach followers |
| **Pain** | Building settings overlays in Canva takes too long and requires manual data entry every time |
| **Goal** | Fast, repeatable tool that auto-reads settings and looks professional |
| **How they find FrameShot** | Referral from another photographer, or Google search |

### Persona C — "The Casual Discoverer"

| | |
|---|---|
| **Name** | Sinta, 22 |
| **Camera** | Smartphone |
| **Behavior** | Sees a beautifully framed photo on Instagram, wonders how it was made, searches for the tool |
| **Pain** | Every tool she finds is either too complex or too ugly |
| **Goal** | Something that works on the first try without reading any instructions |
| **How they find FrameShot** | Watermark on a shared frame, or word of mouth |

---

## 6. Features & Requirements

### 6.1 Feature List

| Feature | Included in v1 |
|---|---|
| Photo upload — drag-and-drop | ✅ |
| Photo upload — click to browse | ✅ |
| Client-side EXIF extraction | ✅ |
| Manual EXIF field editing | ✅ |
| 6 frame styles | ✅ |
| Real-time frame preview | ✅ |
| JPEG download | ✅ |
| PNG download | ✅ |
| Full original resolution export | ✅ |
| Small FrameShot watermark on export | ✅ |
| Privacy notice (processed in browser) | ✅ |
| Works without sign-up or account | ✅ |
| Batch upload / multiple photos | ❌ v2 |
| Save / share frame via link | ❌ v2 |
| Custom color picker | ❌ v2 |
| Custom font selection | ❌ v2 |

### 6.2 Photo Upload (F-01)

The upload zone is the first thing the user sees. It must be the largest element on the page.

- Accepts: JPEG, PNG, HEIC, DNG, ARW, RAF, NEF, CR3
- Maximum file size: 50MB — show a clear, friendly error if exceeded
- Drag-and-drop onto the zone or click to open the file browser
- No account, no email, no sign-up required at any point

> **Privacy:** Display prominently inside the upload zone — *"Your photo is processed entirely in your browser. Nothing is uploaded to any server."* This is a genuine technical fact and a meaningful differentiator from tools that upload to cloud services.

### 6.3 EXIF Extraction (F-02)

Extraction runs client-side using the `exifr` JavaScript library immediately after the user selects a file. The user should see the extracted data appear in under 1 second for JPEG files.

**Fields extracted and displayed:**

| Field | Example display |
|---|---|
| Camera Make & Model | Sony ILCE-7CM2 |
| Lens Model | FE 35mm F1.8 |
| Aperture | f/1.8 |
| Shutter Speed | 1/500s |
| ISO | ISO 800 |
| Focal Length | 35mm |
| Exposure Compensation | +0.3 EV |
| White Balance | Auto |
| Date & Time | May 3, 2026 · 14:32 |

**Edge cases:**

- If a field is missing from the EXIF data, show an empty editable text input for that field — never show "null" or hide the field silently
- If no EXIF data is found at all (e.g. screenshot, WhatsApp image), show all fields as empty inputs with a banner: *"No camera data found in this photo — you can fill in the fields manually"*
- GPS coordinates, if present in EXIF, are never displayed — location data is silently ignored for privacy

### 6.4 Frame Styles (F-03)

Six frame styles are available. All styles are free.

| Style | Description |
|---|---|
| **Classic** | White bottom bar, metadata on the right, clean and minimal |
| **Darkroom** | Black frame, light text, monospace font, film-inspired layout |
| **Film Border** | Film strip edges, warm tones, Kodak-inspired typography |
| **Minimal Line** | Hairline border, bottom-center metadata, no icons |
| **Fujifilm Sim** | Teal and cream palette, square crop option, print receipt aesthetic |
| **Architect** | Grid lines, technical layout, viewfinder-inspired |

Style selection is a horizontal scrollable row of thumbnail cards. Selecting a style updates the preview instantly — no loading state, no delay.

### 6.5 Frame Preview (F-04)

The preview renders in real-time inside a `<canvas>` element as the user selects styles or edits EXIF fields. It should feel instant — target under 100ms to re-render on any style or field change.

- Preview is shown at a scaled-down display resolution for performance
- The actual download is produced at the full original photo resolution
- The preview canvas is centered on the page with the EXIF panel alongside it

### 6.6 EXIF Field Editing (F-05)

Every EXIF field displayed in the frame is editable. The user can click any field and type a custom value. Changes update the preview in real time.

This covers two use cases:
- Correcting a field that was extracted incorrectly
- Filling in fields that were missing from the EXIF data

No save, no account — edits exist only for the current session.

### 6.7 Download (F-06)

- **Format:** JPEG (default) or PNG — user selects via a toggle
- **Resolution:** Full original photo resolution — not capped or compressed
- **Watermark:** Small FrameShot text logo in the bottom-right corner of every download
- **Filename:** `frameshot-[original-filename].jpg`
- **Trigger:** Single "Download" button — no extra steps, no email gate, no share prompt

---

## 7. Key User Flow

### 7.1 Core Flow — Happy Path

```
Land on frameshot.app
  └─> Upload zone visible immediately, no scroll needed
        └─> Drag photo onto zone (or click to browse)
              └─> EXIF extracted instantly
                    └─> Frame preview renders with Classic style
                          ├─> Browse style carousel → preview updates instantly
                          ├─> Click any EXIF field to edit → preview updates
                          └─> Click "Download"
                                └─> Full-resolution JPEG saved to computer
```

### 7.2 No EXIF Found Flow

```
User uploads a screenshot or WhatsApp photo
  └─> EXIF extraction finds no data
        └─> Banner appears: "No camera data found — fill in the fields below"
              └─> All fields shown as empty text inputs
                    └─> User types their settings manually
                          └─> Preview updates → Download
```

### 7.3 Error Flow

```
User uploads a file over 50MB
  └─> Friendly error shown inside upload zone:
      "This file is too large (max 50MB). Try exporting a smaller JPEG."
        └─> Upload zone remains active — user can try another file immediately
```

---

## 8. Technical Specification

### 8.1 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR for SEO, fast static pages, Vercel deployment |
| **EXIF extraction** | `exifr` (npm) | Best browser-side EXIF library; handles RAW formats without full image decode |
| **Frame rendering** | Browser Canvas API (`<canvas>`) | Native, no dependencies, GPU-accelerated in modern browsers |
| **Styling** | Tailwind CSS | Utility-first, consistent with the design system |
| **File handling** | Client-side only — `FileReader` API | Photo never leaves the browser |
| **Hosting** | Vercel (free tier) | Zero-config Next.js deployment, global CDN, automatic HTTPS |
| **Analytics** | Plausible (privacy-friendly) | No cookie banner required, lightweight |

### 8.2 Key Technical Decisions

**Client-side only — no server upload**
The photo is read using the `FileReader` API and processed entirely in the browser. This is both a privacy feature and a cost feature — no storage, no bandwidth, no server costs at any scale.

**Canvas rendering for frames**
Each frame style is implemented as a drawing function that takes `(canvas, image, exifData)` and paints the composited result. The same function is called for both preview (scaled) and export (full resolution). Style switching = call a different function, same inputs.

**HEIC support**
Safari on macOS handles HEIC natively via Canvas. Chrome and Firefox require the `heic2any` library as a fallback. Detect the browser and load the polyfill only when needed.

**SEO**
Next.js App Router with server-rendered metadata. Target keywords in `<title>`, `<meta description>`, Open Graph, and page headings. Submit sitemap to Google Search Console on launch day.

### 8.3 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full (native HEIC) |
| Edge 90+ | ✅ Full |
| Mobile browsers | ✅ Responsive layout |

### 8.4 Performance Targets

| Operation | Target |
|---|---|
| Initial page load (LCP) | < 2s |
| EXIF extraction after upload | < 1s for JPEG, < 3s for RAW |
| Style switch re-render (preview) | < 100ms |
| Full-resolution export generation | < 3s |

### 8.5 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page — upload zone
│   ├── frame/
│   │   └── page.tsx          # Frame editor — preview + controls + download
│   └── layout.tsx            # Root layout, metadata, analytics
├── components/
│   ├── UploadZone.tsx        # Drag-and-drop + click-to-browse
│   ├── FrameCanvas.tsx       # Canvas preview component
│   ├── StylePicker.tsx       # Horizontal style carousel
│   ├── ExifPanel.tsx         # EXIF fields display + inline editing
│   └── DownloadButton.tsx    # Export trigger + format toggle
├── lib/
│   ├── exif.ts               # exifr wrapper + field normalisation
│   ├── renderer.ts           # Canvas drawing orchestrator
│   └── styles/
│       ├── classic.ts        # Classic frame painter
│       ├── darkroom.ts       # Darkroom frame painter
│       ├── film-border.ts    # Film Border frame painter
│       ├── minimal-line.ts   # Minimal Line frame painter
│       ├── fujifilm-sim.ts   # Fujifilm Sim frame painter
│       └── architect.ts      # Architect frame painter
└── public/
    ├── logos/                # Camera brand SVGs (30 brands)
    └── watermark.svg         # FrameShot watermark asset
```

---

## 9. MVP Scope

### 9.1 What Ships at Launch

- Drag-and-drop and click-to-browse photo upload
- Client-side EXIF extraction (`exifr`) with graceful fallback
- All 6 frame styles — fully free
- Real-time Canvas preview
- Inline EXIF field editing
- JPEG and PNG download at full resolution
- Small FrameShot watermark on every download
- Privacy notice — "processed in your browser"
- SEO-optimised landing page and metadata
- Responsive layout — works on desktop and mobile browsers

### 9.2 Explicitly Out of Scope for v1

| Feature | Reason deferred |
|---|---|
| Batch export | Adds significant complexity; single photo covers 95% of use cases |
| Custom color picker | Too many options for a first session; defer to v2 |
| Custom font selection | Same reason — keep the UI simple |
| Save / shareable frame link | Requires server storage; conflicts with privacy-first approach |
| User accounts | Not needed — no state to persist in v1 |
| Social share buttons | OS share sheet not available on desktop browsers reliably |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| EXIF data missing from many user photos | High | Medium | Show all fields as editable inputs — never block the flow |
| Canvas rendering quality inconsistent across browsers | Medium | Medium | Test on Chrome, Firefox, Safari before launch; define a visual baseline |
| HEIC files fail on non-Safari browsers | Medium | Low | Load `heic2any` as a polyfill; show a friendly error if conversion fails |
| Large RAW files cause browser tab to slow down | Medium | Medium | Cap upload at 50MB; use `exifr`'s metadata-only mode to avoid full image decode |
| Low SEO ranking delays organic traffic | Medium | High | Submit sitemap on Day 1; build links through community posts and directory listings |
| Users drop off before downloading | Medium | High | Minimise steps — preview should appear immediately after upload, no extra clicks |

---

## 11. Development Milestones

| Milestone | Target | Deliverable |
|---|---|---|
| **W0 — Setup** | Week 1 | Next.js project created, Vercel deployed, domain configured, Tailwind and `exifr` installed |
| **W1 — Core** | Week 2–3 | Upload zone working, EXIF extraction running, Classic frame rendering in Canvas |
| **W2 — All Styles** | Week 4–5 | All 6 frame painters implemented, style picker UI, real-time preview switching |
| **W3 — Polish** | Week 6 | Inline EXIF editing, download flow, watermark, HEIC support, error states |
| **W4 — SEO & Launch** | Week 7 | Meta tags, Open Graph, sitemap, Google Search Console, privacy notice |
| **W5 — Launch** | Week 8 | Public launch — community posts, ProductHunt, directory submissions |

---

*FrameShot Web PRD v1.0*
*"Your shot. Your gear. Your story."*