import type { Metadata } from "next";

export const SITE_URL = "https://getframeshot.com";
export const SITE_NAME = "FrameShot";
export const OG_IMAGE = "/opengraph-image.jpg";
export const SEO_EXAMPLE_IMAGE = "/seo/exif-frame-generator-example.svg";

export type Faq = {
  question: string;
  answer: string;
};

export type SeoSection = {
  title: string;
  body: string;
  items?: string[];
};

export type SeoPage = {
  slug: string;
  path: string;
  section: "tool" | "guide" | "alternative";
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  intent: string;
  keywords: string[];
  intro: string;
  sections: SeoSection[];
  faq: Faq[];
  related: string[];
  cta: string;
};

export const toolPages: SeoPage[] = [
  {
    slug: "exif-frame-generator",
    path: "/exif-frame-generator",
    section: "tool",
    eyebrow: "Free EXIF frame generator",
    title: "Create a clean EXIF frame for any photo",
    metaTitle: "Free EXIF Frame Generator for Photographers",
    description:
      "Use FrameShot to create a beautiful EXIF frame from your photo metadata. Add camera, lens, aperture, shutter speed, ISO, and focal length in your browser.",
    intent: "Users want a fast online tool that reads EXIF data and creates a polished photo frame.",
    keywords: ["EXIF frame generator", "photo EXIF frame", "camera settings frame"],
    intro:
      "FrameShot reads the camera settings already embedded in your image and turns them into a polished frame that is ready for Instagram, portfolios, tutorials, and community posts.",
    sections: [
      {
        title: "Built for photographers, not form filling",
        body: "Upload a JPEG, PNG, or HEIC file and FrameShot extracts the useful shooting details automatically. Missing fields stay editable so screenshots and exported social images still work.",
        items: ["Camera body and lens", "Aperture, shutter speed, ISO", "Focal length, exposure compensation, white balance", "Capture date and optional local GPS fields"],
      },
      {
        title: "Private by design",
        body: "The photo is processed locally in your browser. FrameShot does not need a user account, cloud upload, or server-side photo processing to create the export.",
      },
      {
        title: "Style options that look shareable",
        body: "Choose from clean editorial layouts, darkroom-inspired frames, film border treatments, minimal line styles, and camera-inspired designs without rebuilding the graphic manually.",
      },
    ],
    faq: [
      {
        question: "What is an EXIF frame?",
        answer:
          "An EXIF frame is a photo border or layout that displays camera metadata such as camera model, lens, aperture, shutter speed, ISO, focal length, and capture date.",
      },
      {
        question: "Does FrameShot upload my photo?",
        answer:
          "No. FrameShot processes photos in the browser and generates the framed export on your device.",
      },
      {
        question: "Can I edit the camera settings before exporting?",
        answer:
          "Yes. Extracted EXIF fields can be edited, and missing fields can be filled manually before downloading.",
      },
    ],
    related: ["/exif-watermark-tool", "/add-camera-settings-to-photo", "/guides/what-is-exif-data"],
    cta: "Open the free EXIF frame generator",
  },
  {
    slug: "exif-watermark-tool",
    path: "/exif-watermark-tool",
    section: "tool",
    eyebrow: "EXIF watermark tool",
    title: "Add a camera settings watermark without uploading your photo",
    metaTitle: "Free EXIF Watermark Tool - Camera Settings Overlay",
    description:
      "Add an EXIF watermark to photos online. Show camera, lens, ISO, shutter speed, aperture, and focal length with a private browser-based tool.",
    intent: "Users want to watermark photos with camera metadata instead of a logo.",
    keywords: ["EXIF watermark tool", "camera settings watermark", "photo metadata watermark"],
    intro:
      "Use FrameShot when you want the watermark to show how the image was made: the camera, lens, exposure settings, and capture details that matter to photographers.",
    sections: [
      {
        title: "A watermark for camera data",
        body: "Traditional watermarks show ownership. EXIF watermarks show technique. They help viewers understand the settings behind the image without cluttering the caption.",
      },
      {
        title: "No Photoshop template required",
        body: "FrameShot avoids the slow manual workflow of typing camera details into Canva, Photoshop, or Lightroom overlays for every export.",
      },
      {
        title: "Editable when metadata is missing",
        body: "Social apps and messengers sometimes strip EXIF data. FrameShot keeps the fields editable so you can still create a clean overlay manually.",
      },
    ],
    faq: [
      {
        question: "Is an EXIF watermark the same as a logo watermark?",
        answer:
          "No. A logo watermark marks ownership, while an EXIF watermark displays shooting information such as camera, lens, aperture, shutter speed, ISO, and focal length.",
      },
      {
        question: "Will the watermark include GPS location?",
        answer:
          "Only when a selected style uses it. GPS coordinates are read locally, may be reverse geocoded in the browser, and remain editable before export.",
      },
      {
        question: "Can I download as JPEG or PNG?",
        answer:
          "Yes. FrameShot supports JPEG and PNG export from the browser.",
      },
    ],
    related: ["/exif-frame-generator", "/camera-settings-overlay", "/guides/how-to-add-camera-settings-to-photos"],
    cta: "Create an EXIF watermark",
  },
  {
    slug: "add-camera-settings-to-photo",
    path: "/add-camera-settings-to-photo",
    section: "tool",
    eyebrow: "Camera settings overlay",
    title: "Add camera settings to a photo online",
    metaTitle: "Add Camera Settings to Photo Online - Free Tool",
    description:
      "Add camera settings to a photo automatically from EXIF metadata. Create a clean frame with camera, lens, aperture, shutter speed, ISO, and focal length.",
    intent: "Users search for a direct way to add settings to photos for sharing or teaching.",
    keywords: ["add camera settings to photo", "camera settings on photo", "add EXIF to photo"],
    intro:
      "FrameShot turns the invisible data inside your image into visible camera settings on the final export, with no account and no cloud processing.",
    sections: [
      {
        title: "Great for educational posts",
        body: "Photography educators can show exposure decisions directly under the image, making tutorials easier to scan and reuse.",
      },
      {
        title: "Useful for social captions",
        body: "Instead of typing settings into captions, export a framed photo that carries the important details with the image itself.",
      },
      {
        title: "Works when automatic data is incomplete",
        body: "If a field is missing, use the editor to type the value before exporting the frame.",
      },
    ],
    faq: [
      {
        question: "Which camera settings can FrameShot show?",
        answer:
          "FrameShot can display camera model, lens model, aperture, shutter speed, ISO, focal length, exposure compensation, white balance, and capture time when available.",
      },
      {
        question: "Do I need to install an app?",
        answer:
          "No. FrameShot runs in the browser as an online tool.",
      },
      {
        question: "Can I use phone photos?",
        answer:
          "Yes. Phone photos can be used when the browser can read the image file and available metadata.",
      },
    ],
    related: ["/photo-metadata-overlay", "/shot-on-camera-watermark", "/guides/best-instagram-frame-for-photographers"],
    cta: "Add settings to a photo",
  },
  {
    slug: "camera-settings-overlay",
    path: "/camera-settings-overlay",
    section: "tool",
    eyebrow: "Camera settings overlay",
    title: "Make a camera settings overlay for your photo",
    metaTitle: "Camera Settings Overlay Generator for Photos",
    description:
      "Generate a camera settings overlay for photos using EXIF metadata. Display lens, ISO, shutter speed, aperture, focal length, and camera body.",
    intent: "Users want an overlay layout rather than a full article about EXIF.",
    keywords: ["camera settings overlay", "camera overlay", "photo settings overlay"],
    intro:
      "A camera settings overlay helps viewers learn from your photo without leaving the image. FrameShot creates that overlay from your file metadata and lets you adjust the layout before export.",
    sections: [
      {
        title: "Readable overlays for real posts",
        body: "The frame styles are designed to keep metadata legible while preserving the photograph as the main subject.",
      },
      {
        title: "Fast enough for repeated sharing",
        body: "Upload, review, style, and download without building a new design file for every image.",
      },
      {
        title: "Browser-only workflow",
        body: "The overlay is rendered with Canvas on your device, which keeps the flow private and quick.",
      },
    ],
    faq: [
      {
        question: "Can a camera settings overlay help with photography learning?",
        answer:
          "Yes. Seeing aperture, shutter speed, ISO, and focal length next to the image gives viewers context about the exposure and composition choices.",
      },
      {
        question: "Can I hide fields I do not want?",
        answer:
          "FrameShot lets you adjust metadata display in the editor so the final overlay can stay clean.",
      },
      {
        question: "Is this only for DSLR and mirrorless files?",
        answer:
          "No. FrameShot can work with many image sources as long as the browser and metadata reader can access the file data.",
      },
    ],
    related: ["/exif-frame-generator", "/photo-metadata-overlay", "/exif-watermark-tool"],
    cta: "Generate a camera settings overlay",
  },
  {
    slug: "photo-metadata-overlay",
    path: "/photo-metadata-overlay",
    section: "tool",
    eyebrow: "Photo metadata overlay",
    title: "Turn photo metadata into a clean visual overlay",
    metaTitle: "Photo Metadata Overlay Tool - EXIF FrameShot",
    description:
      "Create a photo metadata overlay from EXIF data. Show useful camera information on a clean export without uploading the image.",
    intent: "Users want to visualize photo metadata, usually for sharing or documentation.",
    keywords: ["photo metadata overlay", "EXIF metadata overlay", "metadata on photo"],
    intro:
      "Photo metadata is useful, but most viewers never see it. FrameShot gives that information a simple, designed place in the final image.",
    sections: [
      {
        title: "Metadata that belongs on the image",
        body: "FrameShot focuses on the details photographers actually share: camera, lens, exposure settings, focal length, white balance, and date.",
      },
      {
        title: "Location stays editable",
        body: "When a style uses location, GPS metadata is read locally and may be converted into a place name in the browser. The result can be edited or removed before export.",
      },
      {
        title: "Export-ready frames",
        body: "The result is a downloadable image that can be posted, archived, or sent without requiring viewers to inspect file metadata.",
      },
    ],
    faq: [
      {
        question: "What photo metadata is useful to show?",
        answer:
          "For most photography posts, the useful metadata is camera body, lens, aperture, shutter speed, ISO, focal length, exposure compensation, white balance, and capture time.",
      },
      {
        question: "Why not show every EXIF field?",
        answer:
          "Most EXIF files contain many technical fields that are not helpful for viewers. FrameShot keeps the overlay focused and readable.",
      },
      {
        question: "Can I use the overlay for portfolio images?",
        answer:
          "Yes, especially when you want to share technical context or create a consistent presentation style.",
      },
    ],
    related: ["/camera-settings-overlay", "/add-camera-settings-to-photo", "/guides/what-is-exif-data"],
    cta: "Create a metadata overlay",
  },
  {
    slug: "shot-on-camera-watermark",
    path: "/shot-on-camera-watermark",
    section: "tool",
    eyebrow: "Shot on camera watermark",
    title: "Create a shot-on-camera watermark from EXIF data",
    metaTitle: "Shot on Camera Watermark Generator - FrameShot",
    description:
      "Create a shot-on-camera style watermark that shows camera body, lens, and exposure settings. Free, private, and browser-based.",
    intent: "Users want a recognizable shot-on style mark with actual camera details.",
    keywords: ["shot on camera watermark", "shot on watermark", "camera watermark generator"],
    intro:
      "FrameShot helps you create a tasteful shot-on-camera mark that feels built for photographers instead of a generic logo stamp.",
    sections: [
      {
        title: "Make the gear visible",
        body: "Show the camera body and lens alongside the final image so the technical story travels with the photo.",
      },
      {
        title: "Useful for creators and reviewers",
        body: "Camera reviewers, educators, and creators can publish examples where the gear and exposure settings are immediately visible.",
      },
      {
        title: "No sign-up gate",
        body: "The watermark workflow is free and runs locally in the browser.",
      },
    ],
    faq: [
      {
        question: "Can I make a shot-on watermark without typing the camera model?",
        answer:
          "Yes, when the image contains EXIF data, FrameShot can read the camera model and lens automatically.",
      },
      {
        question: "Does this add a FrameShot watermark too?",
        answer:
          "Exports can include a small FrameShot mark so people can find the tool, while the main frame focuses on your camera metadata.",
      },
      {
        question: "Is this useful for camera sample photos?",
        answer:
          "Yes. It is especially useful when publishing samples where viewers care about the body, lens, and exposure settings.",
      },
    ],
    related: ["/add-camera-settings-to-photo", "/exif-watermark-tool", "/alternatives/exif-frame"],
    cta: "Create a shot-on-camera watermark",
  },
];

export const guidePages: SeoPage[] = [
  {
    slug: "what-is-exif-data",
    path: "/guides/what-is-exif-data",
    section: "guide",
    eyebrow: "EXIF guide",
    title: "What is EXIF data in a photo?",
    metaTitle: "What Is EXIF Data? Camera Metadata Explained",
    description:
      "Learn what EXIF data is, which camera settings it stores, why photographers share it, and how to review location metadata before exporting.",
    intent: "Users want a beginner-friendly explanation of EXIF metadata.",
    keywords: ["what is EXIF data", "EXIF metadata", "photo metadata"],
    intro:
      "EXIF data is the technical note your camera or phone can save inside a photo file. It often includes the camera, lens, exposure settings, focal length, and capture time.",
    sections: [
      {
        title: "What EXIF usually contains",
        body: "The most useful EXIF fields for sharing are camera model, lens, aperture, shutter speed, ISO, focal length, exposure compensation, white balance, and date.",
      },
      {
        title: "Why photographers care",
        body: "EXIF data helps explain how an image was made. It is useful for learning, teaching, comparing gear, and remembering your own settings later.",
      },
      {
        title: "Privacy matters",
        body: "Some photos can include location metadata. Review or remove GPS coordinates before exporting a frame that you plan to share publicly.",
      },
    ],
    faq: [
      {
        question: "Does every photo have EXIF data?",
        answer:
          "No. Some apps, screenshots, exports, and social platforms remove metadata before saving or sharing the image.",
      },
      {
        question: "Is EXIF data visible by default?",
        answer:
          "Usually no. It is embedded in the file and needs a viewer, editor, or overlay tool to display it.",
      },
      {
        question: "Should I share GPS EXIF data?",
        answer:
          "Be careful. GPS metadata can reveal where a photo was taken, so review any location fields before exporting or sharing.",
      },
    ],
    related: ["/exif-frame-generator", "/photo-metadata-overlay", "/guides/how-to-add-camera-settings-to-photos"],
    cta: "Turn EXIF data into a frame",
  },
  {
    slug: "how-to-add-camera-settings-to-photos",
    path: "/guides/how-to-add-camera-settings-to-photos",
    section: "guide",
    eyebrow: "Photography workflow",
    title: "How to add camera settings to photos",
    metaTitle: "How to Add Camera Settings to Photos Online",
    description:
      "A practical guide to adding camera settings to photos using EXIF metadata, including camera, lens, aperture, shutter speed, ISO, and focal length.",
    intent: "Users need a step-by-step workflow for adding camera settings.",
    keywords: ["how to add camera settings to photos", "add EXIF settings to photo", "camera settings photo"],
    intro:
      "The easiest workflow is to use the metadata already inside the file, review the extracted fields, choose a frame style, and export the final image.",
    sections: [
      {
        title: "Step 1: Export or choose your image",
        body: "Use the original camera file or a high-quality export from your editing app. Social downloads may have stripped metadata.",
      },
      {
        title: "Step 2: Upload it to FrameShot",
        body: "FrameShot reads the available camera settings in your browser and opens the editor with a preview.",
      },
      {
        title: "Step 3: Review, style, and download",
        body: "Check the camera fields, fill anything missing, pick a visual style, then export as JPEG or PNG.",
      },
    ],
    faq: [
      {
        question: "Why are my camera settings missing?",
        answer:
          "They may have been removed by an export setting, messaging app, screenshot workflow, or social platform.",
      },
      {
        question: "Can I add settings manually?",
        answer:
          "Yes. FrameShot lets you edit or fill fields before exporting.",
      },
      {
        question: "What settings should I show?",
        answer:
          "For most posts, show camera, lens, aperture, shutter speed, ISO, focal length, and capture date.",
      },
    ],
    related: ["/add-camera-settings-to-photo", "/exif-watermark-tool", "/guides/what-is-exif-data"],
    cta: "Add camera settings now",
  },
  {
    slug: "best-instagram-frame-for-photographers",
    path: "/guides/best-instagram-frame-for-photographers",
    section: "guide",
    eyebrow: "Instagram framing",
    title: "Best Instagram frame styles for photographers",
    metaTitle: "Best Instagram Photo Frame for Photographers",
    description:
      "Choose Instagram-friendly frame styles that keep your photo clean while showing camera settings, lens, aperture, shutter speed, ISO, and focal length.",
    intent: "Users want visually appealing photo frames for social sharing.",
    keywords: ["Instagram frame for photographers", "photo frame Instagram", "camera settings Instagram"],
    intro:
      "A good Instagram frame should make the photo feel intentional, keep metadata readable, and avoid covering the image itself.",
    sections: [
      {
        title: "Use clean space for metadata",
        body: "Place camera settings in the border or lower margin so viewers can read them without losing the photograph.",
      },
      {
        title: "Choose the style for the image",
        body: "Minimal frames work well for portraits and street photography. Dark frames suit night scenes. Film-inspired borders can help analog-style edits feel complete.",
      },
      {
        title: "Keep the export sharp",
        body: "Use a high-quality source image and export a format that fits your sharing workflow.",
      },
    ],
    faq: [
      {
        question: "Should Instagram metadata go in the caption or image?",
        answer:
          "Captions are flexible, but placing metadata in the image makes the settings travel with reposts, saves, and screenshots.",
      },
      {
        question: "What frame ratio works best?",
        answer:
          "Square and 4:5 exports are common for feeds, while 9:16 works well for stories and reels covers.",
      },
      {
        question: "Should I show every setting?",
        answer:
          "No. Keep the frame readable by showing the camera details viewers actually care about.",
      },
    ],
    related: ["/camera-settings-overlay", "/shot-on-camera-watermark", "/exif-frame-generator"],
    cta: "Create an Instagram-ready frame",
  },
];

export const alternativePages: SeoPage[] = [
  {
    slug: "exif-frame",
    path: "/alternatives/exif-frame",
    section: "alternative",
    eyebrow: "EXIF Frame alternative",
    title: "A modern alternative to basic EXIF frame tools",
    metaTitle: "EXIF Frame Alternative - Free Private FrameShot",
    description:
      "Looking for an EXIF Frame alternative? FrameShot adds modern styles, editable metadata, private browser processing, and JPEG or PNG export.",
    intent: "Users compare existing EXIF frame tools and want a better option.",
    keywords: ["EXIF Frame alternative", "alternative to EXIF Frame", "EXIF frame tool"],
    intro:
      "If a basic EXIF frame tool feels too rigid, FrameShot gives you a more polished browser workflow while keeping the same simple promise: upload a photo, show the camera settings, download the result.",
    sections: [
      {
        title: "Where FrameShot is different",
        body: "FrameShot focuses on multiple visual styles, editable fields, privacy-first local processing, and a clean editor experience for repeat use.",
        items: ["Multiple frame styles", "Editable metadata fields", "JPEG and PNG export", "No account or upload requirement"],
      },
      {
        title: "Compared with Canva or Photoshop",
        body: "Manual design tools are powerful, but they require typing settings, managing templates, and exporting by hand. FrameShot is better for the repeat workflow of adding camera settings to many photos.",
      },
      {
        title: "Compared with rigid EXIF tools",
        body: "Single-template tools can work for quick posts, but FrameShot gives photographers more control over the final presentation.",
      },
    ],
    faq: [
      {
        question: "Is FrameShot free?",
        answer:
          "Yes. The current FrameShot workflow is free to use.",
      },
      {
        question: "Does FrameShot replace Photoshop?",
        answer:
          "No. Photoshop is a full image editor. FrameShot is purpose-built for fast EXIF frame and camera settings overlay exports.",
      },
      {
        question: "Why use FrameShot instead of a manual template?",
        answer:
          "FrameShot can read metadata automatically, keep fields editable, and render export-ready frames much faster than rebuilding a template manually.",
      },
    ],
    related: ["/exif-frame-generator", "/exif-watermark-tool", "/guides/how-to-add-camera-settings-to-photos"],
    cta: "Try FrameShot instead",
  },
];

export const seoPages = [...toolPages, ...guidePages, ...alternativePages];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function getToolPage(slug: string) {
  return toolPages.find((page) => page.slug === slug);
}

export function getGuidePage(slug: string) {
  return guidePages.find((page) => page.slug === slug);
}

export function getAlternativePage(slug: string) {
  return alternativePages.find((page) => page.slug === slug);
}

export function createPageMetadata(page: SeoPage): Metadata {
  return {
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: page.path,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      type: "website",
      url: page.path,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} ${page.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.description,
      images: [OG_IMAGE],
    },
  };
}

export function softwareApplicationJsonLd(path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl(path),
    image: absoluteUrl(OG_IMAGE),
    description:
      "FrameShot is a free browser-based EXIF frame generator for photographers. It reads photo metadata locally and creates shareable camera settings frames.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function faqJsonLd(faq: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(page: SeoPage) {
  const parentPath = page.section === "guide" ? "/guides" : page.section === "alternative" ? "/alternatives" : "/";
  const parentName = page.section === "guide" ? "Guides" : page.section === "alternative" ? "Alternatives" : "FrameShot";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parentName,
        item: absoluteUrl(parentPath),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: absoluteUrl(page.path),
      },
    ],
  };
}
