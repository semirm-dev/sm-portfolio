import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      /*
       * The theme, resolved before first paint. Pages are prerendered, so the
       * HTML cannot carry last visit's choice, and applying it from Vue would
       * mean applying it after the browser has already painted. A blocking
       * inline script in <head> is the only thing that runs early enough —
       * hence `tagPosition: 'head'` and no `defer`.
       *
       * The try/catch is not decorative: reading localStorage throws outright
       * when storage is blocked, and an uncaught throw here stops the parser
       * before anything below it renders. Catching leaves the attribute unset,
       * which the stylesheet already treats as dark.
       *
       * 'sm-theme' is shared with `useTheme`; change one, change both.
       */
      script: [
        {
          tagPosition: 'head',
          innerHTML: `(function(){try{var c=localStorage.getItem('sm-theme');`
            + `document.documentElement.dataset.theme=c==='light'?'light':'dark'}catch(e){}})()`,
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',

  // Static today: `nuxt generate` applies Nitro's `_static` preset, which is
  // what actually makes the site static. Going hybrid later is a deploy
  // command change (`nuxt generate` → `nuxt build` + a Node host), not a
  // config change — no component or composable knows the difference either way.
  //
  // Explicit routes here, not `routeRules`. A `routeRules: { '/**': {
  // prerender: true } } ` block *looks* like it should seed the prerender
  // queue under `nuxt build`/`nitro build` too, but Nitro explicitly excludes
  // glob paths when building that queue — the block is inert under the
  // `node-server` preset and contributes nothing. Listing the routes here is
  // honoured regardless of preset, so `npm run build` emits both pages'
  // HTML as well as `npm run generate`. Do not "simplify" this back to a
  // `routeRules` wildcard.
  nitro: {
    prerender: {
      routes: ['/', '/work'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: { stylistic: true },
  },
})
