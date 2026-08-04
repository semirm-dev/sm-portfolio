/**
 * The masthead's appearance, and the reader's choice about it.
 *
 * There are only two things the rest of the app needs: what is currently
 * showing, and a way to flip it. Everything else here is about the two
 * failure modes a theme switch on a *prerendered* site has.
 *
 * The first is the flash. Every page is baked to HTML at build time, so the
 * markup cannot know what this reader picked last visit — by the time Vue
 * hydrates and could apply it, the browser has already painted. The fix is the
 * inline script in `nuxt.config.ts`, which runs before first paint and stamps
 * `data-theme` on `<html>`. That script is the only place the attribute gets
 * set for a first render; this composable adopts what it left rather than
 * deciding again, which is also what keeps the two from disagreeing.
 *
 * The second is hydration. Reading localStorage during setup would give the
 * server one answer and the client another, and Vue would warn and patch. The
 * ref therefore starts on the light default — matching the prerendered HTML
 * exactly — and only reads the real value in `onMounted`, after hydration has
 * finished. `ThemeToggle` is behind `<ClientOnly>` for the same reason.
 */
export type Theme = 'light' | 'dark'

/** Shared with the inline script in `nuxt.config.ts`. Changing one changes both. */
const STORAGE_KEY = 'sm-theme'

export function useTheme() {
  /*
   * `useState`, not a module-level ref: on the server a module-level ref is
   * shared between every request being rendered, which is a cross-request leak
   * even when — as here — the value is only ever the default.
   */
  const theme = useState<Theme>('theme', () => 'light')

  /**
   * What the operating system asks for, for a reader who has never chosen.
   * Absent `matchMedia` — very old browsers, and any non-browser environment —
   * the answer is light, which is the value the HTML was built with.
   */
  function preferred(): Theme {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    /*
     * Written only here, and only ever by an explicit press. A visit that
     * changes nothing must not persist anything: storing the resolved theme on
     * load would freeze whatever the OS happened to say the first time and
     * silently stop following it afterwards.
     */
    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // Storage can be denied outright (Safari private mode, blocked
      // third-party contexts). The theme still applies for this page; it just
      // does not outlive it, which is a better outcome than a thrown error
      // taking the click handler down with it.
    }
  }

  onMounted(() => {
    /*
     * Adopt whatever the inline script decided. Re-deriving it here instead
     * would be a second implementation of the same precedence rule, and the
     * two would eventually disagree about something.
     */
    const stamped = document.documentElement.dataset.theme
    theme.value = stamped === 'dark' || stamped === 'light' ? stamped : preferred()

    /*
     * Follow the OS while it is still following the OS. A reader who has made
     * a choice keeps it — that is the same precedence the stylesheet's
     * `:not([data-theme='light'])` encodes, and the two have to agree.
     */
    const query = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    if (!query) return

    const onChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(STORAGE_KEY)
      }
      catch {
        // Unreadable storage means no stored choice, so the OS wins — which is
        // what this listener is for.
      }
      if (stored === 'dark' || stored === 'light') return
      apply(event.matches ? 'dark' : 'light')
    }

    query.addEventListener('change', onChange)
    onBeforeUnmount(() => query.removeEventListener('change', onChange))
  })

  return { theme: readonly(theme), toggle }
}
