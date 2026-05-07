"use client";

/**
 * StylePicker — F-03: Frame Styles
 *
 * Responsibilities:
 *  - Render a horizontally scrollable row of frame style thumbnail cards
 *  - 6 styles: Classic, Darkroom, Film Border, Minimal Line, Fujifilm Sim, Architect
 *  - Selecting a style triggers an immediate preview re-render (< 100ms)
 *  - All styles are free in v1
 *
 * TODO: Accept props: { selectedStyle, onStyleChange }
 * TODO: Render thumbnail previews (mini canvas renders or static images)
 * TODO: Highlight the active style card
 */

export type FrameStyle =
  | "classic"
  | "darkroom"
  | "film-border"
  | "minimal-line"
  | "fujifilm-sim"
  | "architect";

const FRAME_STYLES: { id: FrameStyle; label: string; description: string }[] =
  [
    {
      id: "classic",
      label: "Classic",
      description: "White bottom bar, metadata on the right, clean and minimal",
    },
    {
      id: "darkroom",
      label: "Darkroom",
      description: "Black frame, light text, monospace font, film-inspired",
    },
    {
      id: "film-border",
      label: "Film Border",
      description: "Film strip edges, warm tones, Kodak-inspired typography",
    },
    {
      id: "minimal-line",
      label: "Minimal Line",
      description: "Hairline border, bottom-center metadata, no icons",
    },
    {
      id: "fujifilm-sim",
      label: "Fujifilm Sim",
      description: "Teal and cream palette, square crop option, print receipt",
    },
    {
      id: "architect",
      label: "Architect",
      description: "Grid lines, technical layout, viewfinder-inspired",
    },
  ];

export default function StylePicker() {
  // TODO: Wire up selectedStyle state + onStyleChange callback
  const selectedStyle: FrameStyle = "classic"; // placeholder

  return (
    <div className="w-full">
      <h2 className="text-sm font-semibold text-neutral-400 mb-3">
        Frame Style
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {FRAME_STYLES.map((style) => (
          <button
            key={style.id}
            title={style.description}
            aria-pressed={selectedStyle === style.id}
            className={`
              flex-shrink-0 w-24 rounded-xl border p-2 text-center text-xs
              transition-colors duration-150 cursor-pointer
              ${
                selectedStyle === style.id
                  ? "border-indigo-500 bg-indigo-950/40 text-white"
                  : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500"
              }
            `}
          >
            {/* TODO: Replace with real thumbnail canvas/image */}
            <div className="w-full aspect-[4/3] bg-neutral-800 rounded mb-1" />
            <span>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
