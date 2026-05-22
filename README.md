# FrameShot Web

> **Your shot. Your gear. Your story.**

FrameShot is a free, browser-based tool that automatically reads EXIF metadata from any photo and renders it as a beautiful, shareable frame — complete with camera body, lens, ISO, shutter speed, aperture, focal length, and date.

**Zero sign-up. Zero upload. Everything processed in your browser.**

---

## Features (v1)

- 📸 Drag-and-drop or click-to-browse photo upload
- 🔍 Client-side EXIF extraction via `exifr` (JPEG, PNG, HEIC)
- 🎨 8 frame styles: Classic, Signature, Shot On, Minimal Line, Fine Art, Editorial, Vintage, Storyteller
- ⚡ Real-time Canvas preview (< 100ms re-render)
- ✏️ Inline EXIF field editing
- 💾 JPEG & PNG download at full original resolution
- 🔒 Privacy-first — photo never leaves your browser

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| EXIF Extraction | `exifr` |
| Frame Rendering | Browser Canvas API |
| HEIC Support | `heic2any` (polyfill for Chrome/Firefox) |
| Hosting | Vercel (free tier) |

---

## Project Structure

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
│       ├── signature.ts      # Signature frame painter
│       ├── shot-on.ts        # Shot On frame painter
│       ├── minimal-line.ts   # Minimal Line frame painter
│       ├── fine-art.ts       # Fine Art frame painter
│       ├── editorial.ts      # Editorial frame painter
│       ├── vintage.ts        # Vintage frame painter
│       └── storyteller.ts    # Storyteller frame painter
└── public/
    ├── logos/                # Camera brand SVGs (30 brands — TODO)
    └── watermark.svg         # FrameShot watermark asset
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Development Milestones

| Milestone | Deliverable |
|---|---|
| W0 — Setup | ✅ Next.js project, architecture scaffolded |
| W1 — Core | Upload zone, EXIF extraction, Classic frame |
| W2 — All Styles | All 6 painters, style picker, live preview |
| W3 — Polish | Inline editing, download, HEIC support |
| W4 — SEO | Meta tags, Open Graph, sitemap |
| W5 — Launch | ProductHunt, community posts |

---

## License

MIT — Free to use and modify.
