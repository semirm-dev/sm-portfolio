/**
 * Reveals a grid's cards as they scroll into view, staggered in DOM order.
 * Returns a template ref for the grid container; the cards are its element
 * children.
 *
 * The hidden state is added here rather than in the stylesheet, so markup ships
 * visible and only a script that has actually run can hide it.
 */
export function useReveal() {
  const root = ref<HTMLElement | null>(null)

  const STAGGER = 70

  onMounted(() => {
    const container = root.value

    if (container === null) {
      return
    }

    /*
     * Nothing is hidden under reduced motion: the global `animation: none` rule
     * in main.css would cancel the reveal and leave the card at opacity 0.
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

          // Once revealed it stays revealed.
          observer.unobserve(card)
        })
      },
      // Held back from the bottom edge, so a card rises once it is properly in
      // the viewport rather than while it is still a sliver.
      { rootMargin: '0px 0px -10% 0px' },
    )

    cards.forEach(card => observer.observe(card))

    onBeforeUnmount(() => observer.disconnect())
  })

  return root
}
