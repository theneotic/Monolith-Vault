> A private, browser-only password intelligence workspace that helps people read a password’s strength in context and build a more resilient replacement.

Monolith Vault is a single-page React application for evaluating password quality without sending typed passwords to a server. It combines contextual risk targets, pattern detection, a controlled password builder, guided security education, theme and palette controls, a visual protection DNA rail, and an in-app Low motion preference.

## What It Does

| Area | Interaction | Result |
|---|---|---|
| Password reading | Type or paste a password into the lens. | The score, qualitative strength, character mix, pattern resistance, and contextual fit update in the browser. |
| Context target | Select Email, Phone, App, Instagram, TikTok, or Banking. | The target threshold and guidance adjust to match what the password protects. |
| Strength meter | Read the red-to-green score bar under the password field. | The score marker moves from weak through strong as the password changes. |
| Password builder | Set a target length, keyword, number, and one or more symbols. | A new password is composed locally from the selected preferences. |
| Visibility and copy | Use the eye and copy controls beside the password field. | Reveal or copy the password without a remote request. |
| Palette and theme | Choose one of ten accents or switch between light and dark appearance. | The instrument panel recolors while preserving the workspace layout. |
| Low motion | Turn on **Low motion** in the top navigation. | Decorative DNA, entrance, palette, and theme effects become calm while controls remain responsive. |
| Tutorial | Open **Watch tutorial** in the password panel. | Play the compact visual guide with narration, ambient audio, subtitles, mute, and close controls. |

## Privacy Model

Password scoring, pattern checks, password building, palette choices, theme selection, and the Low motion preference are handled locally in the browser. The application has no password API, database, or authentication flow. The included visual and audio assets are served as static files.

## Technology

| Layer | Choice |
|---|---|
| Interface | React 19 and TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 with custom glass and tactile CSS |
| Components | Radix primitives and Lucide icons |
| Routing | Wouter |
| Package manager | pnpm |

## Run Locally

Install Node.js 20 or newer and pnpm, then run:

```bash
pnpm install
pnpm dev
```

Open the local address printed by Vite. To create a production build, run:

```bash
pnpm build
pnpm preview
```

## Deploy on Netlify

The repository includes `netlify.toml`. Import the repository into Netlify and accept the detected configuration:

| Netlify setting | Value |
|---|---|
| Build command | `pnpm build` |
| Publish directory | `dist` |
| Node version | `20` |

For a manual deployment, use the separate pre-built Netlify archive and follow [NETLIFY-DEPLOY.md](./NETLIFY-DEPLOY.md).

## Project Layout

```text
monolith-vault/
├── client/
│   ├── public/assets/        # Local image, video, and audio files
│   ├── src/components/       # UI primitives and error boundary
│   ├── src/contexts/         # Theme preference
│   ├── src/pages/Home.tsx    # Password reading, builder, DNA, and tutorial
│   ├── src/index.css         # Design tokens, motion, and responsive styles
│   └── index.html            # Application entry document
├── netlify.toml              # Netlify build and SPA redirect rules
├── NETLIFY-DEPLOY.md         # Deployment notes
├── package.json              # Scripts and dependencies
└── vite.config.ts            # Standard Vite configuration
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite development server. |
| `pnpm check` | Run TypeScript validation without emitting files. |
| `pnpm build` | Create an optimized static site in `dist/`. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm format` | Format project files with Prettier. |

## Customization Guide

The central workspace lives in `client/src/pages/Home.tsx`; it contains password analysis, contextual targets, the password builder, the tutorial player, and the Low motion preference. Global colors, tactile glass styling, and the protection DNA behavior live in `client/src/index.css`. Static media is contained in `client/public/assets/`, so it can be replaced without changing the deployment model.

## License

This project is released under the MIT license. Review the licenses of third-party packages before distributing a modified build.
