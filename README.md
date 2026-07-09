# Sharp Planet — Website

A premium, animated marketing site for Sharp Planet, built with plain HTML/CSS/JS,
GSAP (ScrollTrigger) and Lenis for smooth scroll. No build step required.

## Folder structure

```
sharp-planet/
├── index.html          → all page markup (12 sections)
├── style.css            → design tokens + all styling
├── script.js             → smooth scroll, animations, interactions
└── assets/
    ├── images/           → (empty — all art is inline SVG, no files needed)
    └── fonts/            → (empty — fonts load from Google Fonts CDN)
```

GSAP, Lenis, Google Fonts and Lucide icons load from public CDNs, so you need
an internet connection the first time each script loads in the browser.

## Run it in VS Code

1. **Unzip** the downloaded file and open the `sharp-planet` folder in VS Code
   (`File → Open Folder…`).

2. **Install the "Live Server" extension** (by Ritwick Dey) from the
   Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`) — search "Live Server".
   This gives the page real navigation, so relative links and scroll-to-anchor
   behaviour work exactly as intended (opening `index.html` directly by
   double-clicking it also works, but Live Server auto-refreshes on save).

3. **Launch it**: right-click `index.html` in the file explorer and choose
   **"Open with Live Server"**, or click the **"Go Live"** button in the
   bottom-right status bar. Your browser will open the site at something like
   `http://127.0.0.1:5500`.

   No Live Server? You can also just double-click `index.html` to open it
   directly in any browser — everything will still work.

4. **Edit and see changes instantly** — Live Server auto-reloads the page
   whenever you save a file.

### Alternative: run without any extension

If you'd rather use a terminal, from inside the `sharp-planet` folder run
one of these and open the printed local address:

```bash
# Python 3
python -m http.server 5500

# Node.js
npx serve .
```

## Notes

- All illustrations are hand-coded inline SVG — there are no image files to
  swap in, but you can drop your own photos/illustrations into
  `assets/images/` and reference them from `index.html` if you'd like to
  replace any artwork.
- Colors, fonts and spacing are all defined once as CSS variables at the top
  of `style.css` under `:root` — change a value there and it updates
  everywhere.
- The hero and "Future Vision" background animations are plain `<canvas>` +
  JavaScript (no library), so they stay lightweight.
- Reduced-motion is respected: if a visitor has "Reduce motion" enabled in
  their OS, animations are minimized automatically.
