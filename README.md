# SnipQA

A curated snippet library for Playwright and Cypress automation engineers, with AI-powered snippet generation.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
Copy `.env.example` to `.env.local` and add your Anthropic API key:
```bash
cp .env.example .env.local
```
Then edit `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```
Get a key at: https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
src/
  app/
    page.tsx              # Home page
    layout.tsx            # Root layout
    globals.css           # Global styles
    api/
      generate/
        route.ts          # AI snippet generation API
  components/
    layout/
      Header.tsx
      Hero.tsx
    snippets/
      AIGenerator.tsx     # AI generation UI
      SnippetGrid.tsx     # Search + filter grid
      SnippetCard.tsx     # Individual snippet card
  data/
    snippets.ts           # All curated snippets live here
```

## Adding Snippets
Open `src/data/snippets.ts` and add a new entry to the `snippets` array.

## Deployment
Deploy to Vercel in one command:
```bash
npx vercel
```
Add `ANTHROPIC_API_KEY` in your Vercel project environment variables.
