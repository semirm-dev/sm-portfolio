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
       * The theme, resolved before first paint. Pages are prerendered, so a
       * blocking inline script in <head> is the only thing that runs early
       * enough to stop a flash — hence `tagPosition: 'head'` and no `defer`.
       * The try/catch matters: reading localStorage throws when storage is
       * blocked, and an uncaught throw here stops the parser.
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

  // Explicit routes, not `routeRules`. Nitro excludes glob paths when building
  // the prerender queue, so a `routeRules: { '/**': { prerender: true } }`
  // block is inert under the `node-server` preset. Listing routes here is
  // honoured regardless of preset. Do not "simplify" this to a wildcard.
  nitro: {
    prerender: {
      routes: ['/', '/work', '/cv'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: { stylistic: true },
  },
})
