"use client";

import { useState, FormEvent } from "react";

interface PrincipleResult {
  id: number;
  question: string;
  book: string;
  type: "evidence" | "personal";
  answer: "yes" | "no" | "unsure" | "n/a";
  rationale: string;
}

interface Source {
  title: string;
  url: string;
}

interface AnalysisResult {
  company: string;
  resolvedTicker: string | null;
  asOf: string;
  summary: string;
  verdict: { label: string; evidenceScore: number; evidenceMax: number };
  principles: PrincipleResult[];
  risksToWatch: string[];
  sources: Source[];
}

const ANSWER_LABEL: Record<PrincipleResult["answer"], string> = {
  yes: "Yes",
  no: "No",
  unsure: "Unsure",
  "n/a": "Context",
};

const STATUS_MESSAGES = [
  "Pulling recent price history…",
  "Reading through recent news…",
  "Weighing it against the ten principles…",
  "Still digging — this one's taking a moment…",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [prose, setProse] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStatusIdx(0);

    const interval = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1));
    }, 6000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data.result as AnalysisResult);
      setProse(data.prose ?? "");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  const evidencePct = result
    ? Math.round((result.verdict.evidenceScore / Math.max(result.verdict.evidenceMax, 1)) * 100)
    : 0;

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="masthead-title">The Ledger of Ten</div>
        <div className="masthead-date">Feed it a company. Get a verdict.</div>
      </header>

      <p className="dek">
        Type a company or fund, and it researches recent price history and news, then scores
        the case against ten principles from five investing books.{" "}
        <strong>The index is always the default.</strong>
      </p>

      <div className="sources-note">
        <b>Sources.</b> <i>The Simple Path to Wealth</i> (J.L. Collins) &middot;{" "}
        <i>The Coffeehouse Investor</i> (Bill Schultheis) &middot;{" "}
        <i>The Little Book of Common Sense Investing</i> (John C. Bogle) &middot;{" "}
        <i>A Random Walk Down Wall Street</i> (Burton Malkiel) &middot;{" "}
        <i>Reminiscences of a Stock Operator</i> (Edwin Lefèvre).
      </div>

      <form className="query-form" onSubmit={onSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Xero, XRO.AX, Vanguard S&P 500 ETF"
          autoComplete="off"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Researching…" : "Analyze"}
        </button>
      </form>

      {loading && (
        <div className="status-line spinner-line">
          <span className="spinner-dot" />
          <span className="spinner-dot" />
          <span className="spinner-dot" />
          {STATUS_MESSAGES[statusIdx]}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {result && (
        <>
          <div className="result-header">
            <div className="result-company">
              {result.company}
              {result.resolvedTicker ? ` (${result.resolvedTicker})` : ""}
            </div>
            <div className="result-meta">As of {result.asOf}</div>
            <p className="result-summary">{result.summary}</p>
          </div>

          <div className="verdict">
            <div className="verdict-top">
              <div className="verdict-label">{result.verdict.label}</div>
              <div className="verdict-score">
                {result.verdict.evidenceScore.toFixed(1)} / {result.verdict.evidenceMax}{" "}
                evidence-based
              </div>
            </div>
            <div className="verdict-bar">
              <div className="verdict-bar-fill" style={{ width: `${evidencePct}%` }} />
            </div>
          </div>

          {prose && (
            <p className="result-summary" style={{ marginBottom: "1.8rem" }}>
              {prose}
            </p>
          )}

          <ol className="ledger">
            {result.principles.map((p) => (
              <li className="entry" key={p.id}>
                <div className="entry-num" />
                <div className="entry-body">
                  <h3>{p.question}</h3>
                  <div className="cite">
                    <b>{p.book}</b>
                    {p.type === "personal" ? " · for you to weigh" : ""}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span className={`answer-pill ${p.answer === "n/a" ? "na" : p.answer}`}>
                      {ANSWER_LABEL[p.answer]}
                    </span>
                  </div>
                  <p>{p.rationale}</p>
                </div>
              </li>
            ))}
          </ol>

          {result.risksToWatch?.length > 0 && (
            <div className="side-panel">
              <h2>Risks worth watching</h2>
              <ul>
                {result.risksToWatch.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {result.sources?.length > 0 && (
            <div className="side-panel">
              <h2>Sources</h2>
              <ul className="sources-list">
                {result.sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <footer className="app-footer">
        This tool organizes ideas from the five books above; it is not financial advice, and
        none of these authors would want it treated as a signal to trade on.
      </footer>
    </div>
  );
}
