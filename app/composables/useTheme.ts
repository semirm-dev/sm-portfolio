/**
 * The masthead's appearance, and the reader's choice about it. Precedence is
 * "stored choice, else dark" — no `prefers-color-scheme` anywhere.
 *
 * Two failure modes shape the rest. The flash: pages are prerendered, so the
 * markup cannot know last visit's choice, and by the time Vue hydrates the
 * browser has painted — the inline script in `nuxt.config.ts` stamps
 * `data-theme` before that, and this adopts what it left rather than deciding
 * again. And hydration: reading localStorage during setup would give server and
 * client different answers, so the real value is only read in `onMounted`.
 */
export type Theme = 'light' | 'dark'

/** Shared with the inline script in `nuxt.config.ts`. Changing one changes both. */
const STORAGE_KEY = 'sm-theme'

export function useTheme() {
  // `useState`, not a module-level ref: that would be shared across requests.
  const theme = useState<Theme>('theme', () => 'dark')

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    /*
     * Only ever written by an explicit press, including when the choice matches
     * the default — storing 'dark' records that the reader *chose*, which is
     * what keeps their page still if the default ever changes.
     */
    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // Storage can be denied outright. The theme still applies for this page;
      // it just does not outlive it.
    }
  }

  onMounted(() => {
    // Adopt what the inline script decided rather than deriving it twice. A
    // missing attribute means dark, which is what the stylesheet already shows.
    theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  })

  return { theme: readonly(theme), toggle }
}
