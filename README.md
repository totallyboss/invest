# The Ledger of Ten

Type in a company or fund. It researches the stock's recent price history
and recent news, then scores the case against ten principles distilled
from five investing books:

- *The Simple Path to Wealth* — J.L. Collins
- *The Coffeehouse Investor* — Bill Schultheis
- *The Little Book of Common Sense Investing* — John C. Bogle
- *A Random Walk Down Wall Street* — Burton Malkiel
- *Reminiscences of a Stock Operator* — Edwin Lefèvre

Four of these books argue that indexing beats picking stocks; the fifth
tells you what happens when you pick stocks anyway. The ledger keeps that
tension: the index is the default, and a stock has to clear a real bar to
earn a place outside it.

## How it works

This is a Next.js app. The `/api/analyze` route sends your query to Claude
(`claude-opus-5`) with web search enabled, instructed to research the
company against the ten principles and return a structured verdict. The
page renders that verdict as a scored ledger, same as the original
worksheet — but the answers now come from live research instead of your
own judgment on the personal questions (which the app still leaves to you:
position size, exit plan, whether it's your own conviction or a tip).

## Run it locally

```bash
npm install
cp .env.example .env.local   # then paste in your Anthropic API key
npm run dev
```

Open http://localhost:3000. Get an API key at
[console.anthropic.com](https://console.anthropic.com/).

## Deploy to Vercel

Push this repo to GitHub, import it in Vercel, and add `ANTHROPIC_API_KEY`
as an environment variable in the project settings. No other config is
needed — the API route is already set to `maxDuration = 60` to give
research time to finish.

## The original worksheet

The manual, no-network version — fill in your own Yes/Unsure/No per
question — still lives at `public/manual/index.html`. Open it directly in
a browser; it needs nothing else.

## Notes

- Answers on the "evidence" principles (understanding the business, price
  vs. earnings, trend, long-term durability) are scored automatically from
  what Claude finds. The "personal" principles (position size, exit plan,
  tips vs. judgment, temperament) are never scored — the app explains what
  to weigh and leaves the call to you.
- This is a research tool, not financial advice, and it can be wrong —
  verify anything material before acting on it.
