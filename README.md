# Naruto Universe Wiki

A responsive Naruto universe encyclopedia built with React, Vite, and Tailwind CSS. Explore characters, clans, villages, anime series, and movies through searchable collections and detailed profiles.

## Features

- Character profiles with abilities, personal details, galleries, and family relationships
- Searchable character, clan, and village collections with pagination
- Village ordering that prioritizes familiar locations and places empty records last
- Connected characters displayed in batches with a “Load more” button
- Anime and movie catalog with format filters, title search, and release-date ordering
- Anime and movie details with posters, synopses, episode counts, runtime, and production information
- Favorite characters saved locally in the browser
- Side-by-side comparison of two characters
- Responsive navigation and layouts
- Shinobi Dash mini game with double jumps, rooftops, rocky terrain, and obstacles
- Loading indicators, error messages, and retry controls

## Technology Stack

- React 19
- React Router 7
- Vite
- Tailwind CSS with custom theme styles
- JavaScript Fetch API
- Canvas 2D for the mini game
- localStorage for favorites, comparison selections, and the highest game score
- Node.js built-in test runner
- Prettier

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Internet access for API requests

## Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Available Commands

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start the development server           |
| `npm run build`        | Create the production build in `dist/` |
| `npm run preview`      | Preview the production build locally   |
| `npm test`             | Run automated tests                    |
| `npm run format`       | Format supported project files         |
| `npm run format:check` | Check code formatting                  |

The production preview requires the same API proxy routing as the deployment environment for Dattebayo requests. Use the development server for local API testing.

## Data Sources

### Dattebayo API

Dattebayo provides the primary character, clan, and village records.

Collection and profile requests use live API responses. Bundled character records are available as a fallback for supported records when a network failure, timeout, rate limit, or server error prevents access. Missing records and cancelled requests do not trigger this fallback.

In development, Vite proxies requests through `/api/naruto`. The Vercel configuration provides the equivalent production routing.

### AniList GraphQL API

AniList provides supplementary character biographies and personal information, along with anime and movie metadata.

Character matches are checked against both the character name and a Naruto or Boruto connection. Supplementary information fills missing personal fields while preserving existing primary data.

Anime and movie entries include available posters, synopses, release dates, formats, episode counts, runtime, studios, genres, and community scores. Titles without a known release date appear after dated entries.

Successful responses are cached temporarily in memory. Supplementary character requests are queued to reduce request frequency.

## Images and Character References

The project includes local character portraits, gallery images, and decorative assets. Character names and aliases are resolved through a shared directory so related profiles link consistently.

Village and clan membership comes from API responses. Existing directory metadata supplies connected-character cards without requiring a separate profile request for every known member. Full character profiles are requested when opened.

Image sources and asset descriptions are documented in `ASSET_NOTES.md`.

## Project Structure

```text
public/
  assets/          Character images, galleries, backgrounds, and decorative assets

src/
  components/      Shared interface components, cards, layout, and character profiles
  context/         Favorites and comparison state
  data/            Character directory, fallback records, and image mappings
  game/            Game physics, terrain, and Canvas rendering
  hooks/           Data-loading and supplementary-information hooks
  pages/           Route-level page components
  services/        API requests and response handling
  utils/           Data formatting, character matching, and asset selection

tests/             Automated tests
```

## Main Routes

| Route             | Content                    |
| ----------------- | -------------------------- |
| `/`               | Home                       |
| `/characters`     | Character collection       |
| `/characters/:id` | Character profile          |
| `/clans`          | Clan collection            |
| `/clans/:id`      | Clan details               |
| `/villages`       | Village collection         |
| `/villages/:id`   | Village details            |
| `/anime`          | Anime and movie collection |
| `/anime/:id`      | Anime or movie details     |
| `/favorites`      | Saved characters           |
| `/compare`        | Character comparison       |
| `/ninja-dash`     | Shinobi Dash mini game     |

## Shinobi Dash

Run through village stages, jump onto rooftops, cross rocky ridges, and avoid obstacles. A second jump is available while airborne.

| Input                      | Action          |
| -------------------------- | --------------- |
| Space / Up Arrow / W / Tap | Jump            |
| Jump again while airborne  | Double jump     |
| P                          | Pause or resume |
| R                          | Restart         |

The highest score is stored locally in the browser.

## Testing

Run the automated tests and production build:

```bash
npm test
npm run format:check
npm run build
```

Tests cover API handling, record normalization, character matching, image assets, village ordering, connected-character preparation, anime metadata, and game physics.

Additional browser checks are described in `TESTING.md`.

## Deployment

The project includes a `vercel.json` configuration for Vercel.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

The configuration forwards Dattebayo requests and supports direct navigation to client-side routes.

## Sources and Attribution

- [Dattebayo API](https://dattebayo-api.onrender.com/characters)
- [AniList API documentation](https://docs.anilist.co/)
- [Narutopedia](https://naruto.fandom.com/wiki/Narutopedia)

This is an independent fan project. Naruto characters, names, artwork, and related material belong to their respective rights holders.
