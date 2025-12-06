import { defineConfig } from 'vitepress'

const siteUrl = 'https://flexium.dev'
const siteName = 'Flexium'
const siteDescription = 'A lightweight, signals-based UI framework with cross-platform renderers. Fine-grained reactivity, unified state API, and universal primitives for Web and Canvas.'

export default defineConfig({
  title: siteName,
  description: siteDescription,
  ignoreDeadLinks: true,
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  // Sitemap configuration
  sitemap: {
    hostname: siteUrl,
    transformItems: (items) => {
      // Add priority based on page depth
      return items.map(item => ({
        ...item,
        changefreq: 'weekly',
        priority: item.url === '' ? 1.0 :
                  item.url.includes('guide/') ? 0.8 :
                  item.url.includes('reference/') ? 0.7 : 0.6
      }))
    }
  },

  // Head meta tags for SEO
  head: [
    // Basic meta tags
    ['meta', { name: 'author', content: 'Flexium Contributors' }],
    ['meta', { name: 'keywords', content: 'flexium, javascript, typescript, ui framework, reactive, signals, fine-grained reactivity, canvas, web components, jsx, frontend, state management' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    ['meta', { name: 'bingbot', content: 'index, follow' }],
    ['meta', { name: 'generator', content: 'VitePress' }],

    // Favicon and icons
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'msapplication-TileColor', content: '#646cff' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: siteName }],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: siteName }],
    ['meta', { property: 'og:title', content: siteName }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.svg` }],
    ['meta', { property: 'og:image:type', content: 'image/svg+xml' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Flexium - Fine-grained Reactive UI Framework' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: siteName }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.svg` }],
    ['meta', { name: 'twitter:image:alt', content: 'Flexium - Fine-grained Reactive UI Framework' }],

    // Canonical URL
    ['link', { rel: 'canonical', href: siteUrl }],

    // Alternate language (for future i18n)
    ['link', { rel: 'alternate', hreflang: 'en', href: siteUrl }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: siteUrl }],

    // JSON-LD structured data
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      author: {
        '@type': 'Organization',
        name: 'Flexium Contributors'
      },
      license: 'https://opensource.org/licenses/MIT'
    })],

    // Additional JSON-LD for documentation
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: `${siteName} Documentation`,
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })]
  ],

  // Transform page meta for better SEO
  transformPageData(pageData) {
    const canonicalUrl = `${siteUrl}/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:url', content: canonicalUrl }]
    )
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Docs', link: '/docs/core/state' },
      { text: 'Showcase', link: '/showcase' },
      {
        text: 'v0.6.5',
        items: [
          { text: 'Changelog', link: 'https://github.com/Wick-Lim/flexium.js/blob/main/CHANGELOG.md' },
          { text: 'Contributing', link: '/guide/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Reactivity', link: '/guide/state' },
            { text: 'JSX & Rendering', link: '/guide/jsx' },
            { text: 'Control Flow', link: '/guide/flow' },
            { text: 'Primitives', link: '/guide/primitives' }
          ]
        },
        {
          text: 'Advanced',
          collapsed: false,
          items: [
            { text: 'Context API', link: '/guide/context' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'Suspense', link: '/guide/suspense' },
            { text: 'Routing', link: '/guide/router' },
            { text: 'Styling', link: '/guide/styling' },
            { text: 'Animation', link: '/guide/animation' },
            { text: 'Forms', link: '/guide/forms' },
            { text: 'Canvas', link: '/guide/canvas' },
            { text: 'Interactive Apps', link: '/guide/interactive' }
          ]
        },
        {
          text: 'In Depth',
          collapsed: true,
          items: [
            { text: 'Effects', link: '/guide/effects' },
            { text: 'Batch API', link: '/guide/batch' },
            { text: 'Portal', link: '/guide/portal' },
            { text: 'Motion', link: '/guide/motion' },
            { text: 'Transitions', link: '/guide/transitions' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'TypeScript', link: '/guide/typescript' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'SSR', link: '/guide/ssr' },
            { text: 'DevTools', link: '/guide/devtools' }
          ]
        },
        {
          text: 'Ecosystem',
          collapsed: true,
          items: [
            { text: 'ESLint Plugin', link: '/guide/eslint-plugin' },
            { text: 'Vite Plugin', link: '/guide/vite-plugin' }
          ]
        }
      ],
      '/docs/': [
        {
          text: 'flexium/core',
          collapsed: false,
          items: [
            { text: 'state()', link: '/docs/core/state' },
            { text: 'computed()', link: '/docs/core/computed' },
            { text: 'effect()', link: '/docs/core/effect' },
            { text: 'batch()', link: '/docs/core/batch' },
            { text: 'createResource()', link: '/docs/core/resource' },
            { text: 'Lifecycle Hooks', link: '/docs/core/lifecycle' },
            { text: '&lt;For /&gt;', link: '/docs/core/for' },
            { text: '&lt;Suspense /&gt;', link: '/docs/core/suspense' },
            { text: '&lt;ErrorBoundary /&gt;', link: '/docs/core/error-boundary' },
            { text: 'Context API', link: '/docs/core/context' }
          ]
        },
        {
          text: 'flexium/dom',
          collapsed: false,
          items: [
            { text: 'render()', link: '/docs/dom/render' },
            { text: 'f()', link: '/docs/dom/f' },
            { text: '&lt;Portal /&gt;', link: '/docs/dom/portal' }
          ]
        },
        {
          text: 'flexium/primitives',
          collapsed: false,
          items: [
            { text: '&lt;Row /&gt;', link: '/docs/primitives/row' },
            { text: '&lt;Column /&gt;', link: '/docs/primitives/column' },
            { text: '&lt;Grid /&gt;', link: '/docs/primitives/grid' },
            { text: '&lt;Stack /&gt;', link: '/docs/primitives/stack' },
            { text: '&lt;Spacer /&gt;', link: '/docs/primitives/spacer' },
            { text: '&lt;ScrollView /&gt;', link: '/docs/primitives/scrollview' },
            { text: '&lt;Text /&gt;', link: '/docs/primitives/text' },
            { text: '&lt;Image /&gt;', link: '/docs/primitives/image' },
            { text: '&lt;Pressable /&gt;', link: '/docs/primitives/pressable' },
            { text: '&lt;Button /&gt;', link: '/docs/primitives/button' },
            { text: '&lt;List /&gt;', link: '/docs/primitives/list' },
            { text: 'createForm()', link: '/docs/primitives/form' },
            { text: 'Motion', link: '/docs/primitives/motion' }
          ]
        },
        {
          text: 'flexium/canvas',
          collapsed: false,
          items: [
            { text: '&lt;Canvas /&gt;', link: '/docs/canvas/canvas' },
            { text: '&lt;DrawRect /&gt;', link: '/docs/canvas/rect' },
            { text: '&lt;DrawCircle /&gt;', link: '/docs/canvas/circle' },
            { text: '&lt;DrawArc /&gt;', link: '/docs/canvas/arc' },
            { text: '&lt;DrawLine /&gt;', link: '/docs/canvas/line' },
            { text: '&lt;DrawPath /&gt;', link: '/docs/canvas/path' },
            { text: '&lt;DrawText /&gt;', link: '/docs/canvas/text' }
          ]
        },
        {
          text: 'flexium/router',
          collapsed: false,
          items: [
            { text: '&lt;Router /&gt;', link: '/docs/router/router' },
            { text: '&lt;Route /&gt;', link: '/docs/router/route' },
            { text: '&lt;Outlet /&gt;', link: '/docs/router/outlet' },
            { text: '&lt;Link /&gt;', link: '/docs/router/link' },
            { text: 'useRouter()', link: '/docs/router/use-router' }
          ]
        },
        {
          text: 'flexium/interactive',
          collapsed: false,
          items: [
            { text: 'useKeyboard()', link: '/docs/interactive/use-keyboard' },
            { text: 'useMouse()', link: '/docs/interactive/use-mouse' },
            { text: 'createLoop()', link: '/docs/interactive/loop' }
          ]
        },
        {
          text: 'Type Reference',
          collapsed: true,
          items: [
            { text: 'Types', link: '/docs/types' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Layout Primitives',
          collapsed: false,
          items: [
            { text: '&lt;Row /&gt;', link: '/reference/primitives/row' },
            { text: '&lt;Column /&gt;', link: '/reference/primitives/column' },
            { text: '&lt;Grid /&gt;', link: '/reference/primitives/grid' },
            { text: '&lt;Stack /&gt;', link: '/reference/primitives/stack' },
            { text: '&lt;Spacer /&gt;', link: '/reference/primitives/spacer' },
            { text: '&lt;ScrollView /&gt;', link: '/reference/primitives/scrollview' }
          ]
        },
        {
          text: 'UI Primitives',
          collapsed: false,
          items: [
            { text: '&lt;Text /&gt;', link: '/reference/primitives/text' },
            { text: '&lt;UIText /&gt;', link: '/reference/primitives/ui-text' },
            { text: '&lt;Image /&gt;', link: '/reference/primitives/image' },
            { text: '&lt;Pressable /&gt;', link: '/reference/primitives/pressable' },
            { text: '&lt;Button /&gt;', link: '/reference/primitives/button' },
            { text: '&lt;List /&gt;', link: '/reference/primitives/list' }
          ]
        },
        {
          text: 'Form Primitives',
          collapsed: false,
          items: [
            { text: 'Form', link: '/reference/primitives/form' }
          ]
        },
        {
          text: 'Motion Primitives',
          collapsed: false,
          items: [
            { text: 'Motion', link: '/reference/primitives/motion' }
          ]
        },
        {
          text: 'Canvas Primitives',
          collapsed: false,
          items: [
            { text: '&lt;Canvas /&gt;', link: '/reference/canvas/canvas' },
            { text: '&lt;DrawRect /&gt;', link: '/reference/canvas/rect' },
            { text: '&lt;DrawCircle /&gt;', link: '/reference/canvas/circle' },
            { text: '&lt;DrawArc /&gt;', link: '/reference/canvas/arc' },
            { text: '&lt;DrawLine /&gt;', link: '/reference/canvas/line' },
            { text: '&lt;DrawPath /&gt;', link: '/reference/canvas/path' },
            { text: '&lt;DrawText /&gt;', link: '/reference/canvas/text' }
          ]
        },
        {
          text: 'Router',
          collapsed: false,
          items: [
            { text: 'Router API', link: '/reference/router' }
          ]
        },
        {
          text: 'Hooks',
          collapsed: false,
          items: [
            { text: 'Hooks API', link: '/reference/hooks' }
          ]
        },
        {
          text: 'Type Reference',
          collapsed: false,
          items: [
            { text: 'Types', link: '/reference/types' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Wick-Lim/flexium.js' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Flexium Contributors'
    },

    search: {
      provider: 'local'
    }
  }
})
