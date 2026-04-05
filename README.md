# Warscribe

**Professional Warhammer 40,000 army builder** powered by community [BSData](https://github.com/BSData).

> Built with React + TypeScript + Vite + Tailwind CSS v4. Deployed on Cloudflare Pages.

## Features

- **Live army builder** — browse units, add to roster, track points in real time
- **BSData integration** — pulls directly from community-maintained catalogue repos
- **BattleScribe compatible** — import/export `.ros` and `.rosz` rosters
- **Offline-capable** — catalogues cached in localStorage for fast repeat loads
- **All game modes** — Matched Play, Crusade, Narrative
- **Mobile-first** — responsive UI designed for phone, tablet, and desktop
- **iOS & Android apps** — coming soon

## Supported Game Systems

| System | Edition | Status |
|--------|---------|--------|
| Warhammer 40,000 | 10th Ed | Stable |
| Kill Team | 2024 | Beta |
| Horus Heresy | Age of Darkness | Beta |

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 8
- **Styling**: Tailwind CSS v4 (CSS-first config)
- **State**: Zustand with localStorage persistence
- **Routing**: React Router v7
- **Animation**: Framer Motion
- **XML Parsing**: fast-xml-parser
- **Zip**: jszip (for .catz/.rosz support)
- **Hosting**: Cloudflare Pages

## Development

```bash
npm install
npm run dev
```

## Deployment

The site deploys automatically to Cloudflare Pages on every push to `main`.

To deploy manually:
```bash
npm run build
npx wrangler pages deploy dist --project-name warscribe
```

## Data Sources

All game data comes from the [BSData](https://github.com/BSData) community project.
Data is fetched live from GitHub and cached locally — no backend required.

## Legal

Not affiliated with or endorsed by Games Workshop. Warhammer 40,000 and all related marks are property of Games Workshop Ltd.
