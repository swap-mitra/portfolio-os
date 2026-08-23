/* Deck order for the joke window.

   Fisher-Yates rather than `sort(() => Math.random() - 0.5)`. The sort trick
   is shorter and produces a biased order, which shows up here as the same
   two or three jokes turning up first far more often than the rest. Same
   line count, correct distribution.

   Randomness arrives as a parameter, so the shuffle is testable without
   stubbing a global. */

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const deck = [...items]
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const a = deck[i]
    const b = deck[j]
    // Only for the type checker: both indices are in range by construction.
    if (a === undefined || b === undefined) continue
    deck[i] = b
    deck[j] = a
  }
  return deck
}
