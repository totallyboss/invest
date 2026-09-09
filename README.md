# The Ledger of Ten

A single-page worksheet for deciding whether an individual stock is worth
buying. It distills ten questions from five investing books:

- *The Simple Path to Wealth* — J.L. Collins
- *The Coffeehouse Investor* — Bill Schultheis
- *The Little Book of Common Sense Investing* — John C. Bogle
- *A Random Walk Down Wall Street* — Burton Malkiel
- *Reminiscences of a Stock Operator* — Edwin Lefèvre

Four of these books argue that indexing beats picking stocks; the fifth
tells you what happens when you pick stocks anyway. The worksheet keeps
that tension: the index is the default, and a stock has to clear a real
bar to earn a place outside it.

## Use it

Open `index.html` in a browser. No build step, no server, no dependencies.

Type a company name, answer each of the ten questions (Yes / Unsure / No),
and the ledger scores the case out of 10 and gives a verdict:

- **8–10** — worth the exception, sized like one
- **5.5–7.9** — weak case, re-read your doubts
- **below 5.5** — buy the index instead

Answers are saved per company in the browser's local storage, so you can
revisit or compare tickers later. Nothing is sent anywhere.

This is a worksheet, not financial advice.
