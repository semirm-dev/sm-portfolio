/**
 * Reveals a grid's cards as they scroll into view, staggered in DOM order.
 *
 * Returns a template ref for the grid container; the cards are its element
 * children, so nothing has to be wired card by card and a grid that gains an
 * entry gains a reveal with it.
 *
 * The hidden state is added here rather than in the stylesheet. That ordering
 * is the whole safety argument: markup ships visible, and only a script that
 * has actually run can hide it. If this never executes — old browser, blocked
 * bundle, a hydration error two components away — the cards are simply there.
 * The reverse arrangement reads better in CSS and fails by showing a visitor
 * an empty page.
 */
export function useReveal() {
  const root = ref<HTMLElement | null>(null)

  /** Between cards, in ms. Matches the hero's own hand-set delays. */
  const STAGGER = 70

  onMounted(() => {
    const container = root.value

    if (container === null) {
      return
    }

    /*
     * Nothing is hidden when reduced motion is set, because hiding is the half
     * of this that cannot be undone by the global `animation: none` rule in
     * main.css — that rule would cancel the reveal and leave the card at
     * opacity 0. Declining here is the fix; the CSS carries a second guard for
     * the case where the preference changes after this has already run.
     */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const cards = [...container.children] as HTMLElement[]

    cards.forEach(card => card.classList.add('reveal-hidden'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const card = entry.target as HTMLElement

          card.style.animationDelay = `${cards.indexOf(card) * STAGGER}ms`
          card.classList.add('reveal-in')

          // Once revealed it stays revealed; re-playing on every pass back up
          // the page turns a welcome into a tic.
          observer.unobserve(card)
        })
      },
      /*
       * Held back from the very bottom edge, so a card begins its rise once it
       * is properly in the viewport rather than while it is still a sliver.
       */
      { rootMargin: '0px 0px -10% 0px' },
    )

    cards.forEach(card => observer.observe(card))

    onBeforeUnmount(() => observer.disconnect())
  })

  return root
}
