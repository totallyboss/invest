export type PrincipleType = "evidence" | "personal";

export interface Principle {
  id: number;
  question: string;
  book: string;
  blurb: string;
  type: PrincipleType;
}

export const PRINCIPLES: Principle[] = [
  {
    id: 1,
    question: "Would an index fund already do this for you?",
    book: "Bogle / Collins",
    blurb:
      "Owning the whole market is the default. A single stock has to earn its way out of the index, not the other way around.",
    type: "personal",
  },
  {
    id: 2,
    question: "Do you understand how it actually makes money?",
    book: "Malkiel",
    blurb:
      "Not the story — the mechanism: who pays it, for what, and why they'll keep paying.",
    type: "evidence",
  },
  {
    id: 3,
    question: "Is the price reasonable next to what the business earns?",
    book: "Malkiel",
    blurb:
      "Bubbles form when price detaches from earnings on the hope someone else pays more tomorrow.",
    type: "evidence",
  },
  {
    id: 4,
    question: "Will costs and taxes quietly eat the edge?",
    book: "Bogle",
    blurb:
      "Trading fees, fund expenses, and short-term gains compound against you as reliably as returns compound for you.",
    type: "personal",
  },
  {
    id: 5,
    question: "Does the trend actually agree with your thesis?",
    book: "Lefèvre / Livermore",
    blurb:
      "A great story fighting a falling tape is usually just a falling tape.",
    type: "evidence",
  },
  {
    id: 6,
    question: "Do you know, in advance, what would prove you wrong?",
    book: "Lefèvre / Livermore",
    blurb:
      "Decide your exit before you decide your entry.",
    type: "personal",
  },
  {
    id: 7,
    question: "Is this your judgment, or someone else's tip?",
    book: "Lefèvre / Livermore",
    blurb:
      "A hot tip outsources the one thing that was supposed to be yours: the reasoning.",
    type: "personal",
  },
  {
    id: 8,
    question: "Could you hold this for twenty years, not twenty days?",
    book: "Collins / Schultheis",
    blurb:
      "Money left alone in good businesses compounds quietly for decades.",
    type: "evidence",
  },
  {
    id: 9,
    question: "How much of the portfolio would this actually be?",
    book: "Schultheis",
    blurb:
      "A single stock is a bet, not a plan. Keep it small enough that being wrong is a lesson, not a catastrophe.",
    type: "personal",
  },
  {
    id: 10,
    question: "Could you watch it fall 50% without selling at the bottom?",
    book: "All five",
    blurb:
      "The money isn't lost to bad picks nearly as often as it's lost to panic.",
    type: "personal",
  },
];
