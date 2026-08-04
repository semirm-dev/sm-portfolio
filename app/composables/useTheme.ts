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
     * the default — storing 'dark' records that the reader *chose*, which keeps
     * their page still if the default ever changes.
     */
    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // Storage can be denied outright; the theme still applies for this page.
    }
  }

  onMounted(() => {
    // Adopt what the inline script decided rather than deriving it twice.
    // Reading localStorage during setup would break hydration.
    theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  })

  return { theme: readonly(theme), toggle }
}
