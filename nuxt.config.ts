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
       * The theme, resolved before the first paint.
       *
       * Every page here is prerendered, so the HTML on disk is fixed at build
       * time and cannot carry a choice this reader made last visit. Applying it
       * from Vue would mean applying it after hydration, which is after the
       * browser has already painted — the reader would watch a white masthead
       * turn blue. This is the one thing that has to run earlier than the app,
       * and a blocking inline script in <head> is the only place that is.
       *
       * `tagPosition: 'head'` and no `defer`, both load-bearing: the script has
       * to execute where it sits, before <body> is parsed and painted.
       *
       * The precedence — stored choice, else the OS — is the same rule the
       * stylesheet encodes in `:not([data-theme='light'])` and `useTheme`
       * re-reads off the attribute. Three places know it; only this one decides
       * it. 'sm-theme' is shared with `useTheme`; change one, change both.
       *
       * The try/catch is not decorative. Reading localStorage throws outright
       * when storage is blocked, and an uncaught throw in a <head> script stops
       * the parser before anything below it renders — the entire page, lost to
       * a cosmetic preference. Failing to light is a correct answer; failing to
       * blank is not.
       */
      script: [
        {
          tagPosition: 'head',
          innerHTML: `(function(){try{var c=localStorage.getItem('sm-theme');`
            + `var t=c==='dark'||c==='light'?c:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');`
            + `document.documentElement.dataset.theme=t}catch(e){}})()`,
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
