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
      { text: 'Examples', link: '/examples/counter' },
      { text: 'Showcase', link: '/showcase' },
      {
        text: 'v0.4.7',
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
          text: 'flexium/core',
          collapsed: false,
          items: [
            { text: 'state()', link: '/guide/state' },
            { text: 'effect()', link: '/guide/effects' },
            { text: '&lt;For /&gt;', link: '/guide/flow#for' },
            { text: '&lt;Show /&gt;', link: '/guide/flow#show' },
            { text: '&lt;Switch /&gt;', link: '/guide/flow#switch' },
            { text: '&lt;Suspense /&gt;', link: '/guide/suspense' },
            { text: '&lt;ErrorBoundary /&gt;', link: '/guide/error-handling' }
          ]
        },
        {
          text: 'flexium/dom',
          collapsed: false,
          items: [
            { text: 'render()', link: '/guide/jsx' },
            { text: '&lt;Portal /&gt;', link: '/guide/portal' },
            { text: '&lt;Row /&gt;', link: '/reference/primitives/row' },
            { text: '&lt;Column /&gt;', link: '/reference/primitives/column' },
            { text: '&lt;Grid /&gt;', link: '/reference/primitives/grid' },
            { text: '&lt;Stack /&gt;', link: '/reference/primitives/stack' },
            { text: '&lt;Spacer /&gt;', link: '/reference/primitives/spacer' },
            { text: '&lt;ScrollView /&gt;', link: '/reference/primitives/scrollview' },
            { text: '&lt;Text /&gt;', link: '/reference/primitives/text' },
            { text: '&lt;Image /&gt;', link: '/reference/primitives/image' },
            { text: '&lt;Pressable /&gt;', link: '/reference/primitives/pressable' }
          ]
        },
        {
          text: 'flexium/canvas',
          collapsed: false,
          items: [
            { text: '&lt;Canvas /&gt;', link: '/guide/canvas' },
            { text: '&lt;DrawRect /&gt;', link: '/reference/canvas/rect' },
            { text: '&lt;DrawCircle /&gt;', link: '/reference/canvas/circle' },
            { text: '&lt;DrawArc /&gt;', link: '/reference/canvas/arc' },
            { text: '&lt;DrawLine /&gt;', link: '/reference/canvas/line' },
            { text: '&lt;DrawPath /&gt;', link: '/reference/canvas/path' },
            { text: '&lt;DrawText /&gt;', link: '/reference/canvas/text' }
          ]
        },
        {
          text: 'flexium/router',
          collapsed: false,
          items: [
            { text: '&lt;Router /&gt;', link: '/guide/router#router' },
            { text: '&lt;Route /&gt;', link: '/guide/router#route' },
            { text: '&lt;Link /&gt;', link: '/guide/router#link' }
          ]
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Context API', link: '/guide/context' },
            { text: 'Styling', link: '/guide/styling' },
            { text: 'Animation', link: '/guide/animation' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'TypeScript', link: '/guide/typescript' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'SSR', link: '/guide/ssr' },
            { text: 'DevTools', link: '/guide/devtools' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'flexium/dom',
          collapsed: false,
          items: [
            { text: '&lt;Row /&gt;', link: '/reference/primitives/row' },
            { text: '&lt;Column /&gt;', link: '/reference/primitives/column' },
            { text: '&lt;Grid /&gt;', link: '/reference/primitives/grid' },
            { text: '&lt;Stack /&gt;', link: '/reference/primitives/stack' },
            { text: '&lt;Spacer /&gt;', link: '/reference/primitives/spacer' },
            { text: '&lt;ScrollView /&gt;', link: '/reference/primitives/scrollview' },
            { text: '&lt;Text /&gt;', link: '/reference/primitives/text' },
            { text: '&lt;Image /&gt;', link: '/reference/primitives/image' },
            { text: '&lt;Pressable /&gt;', link: '/reference/primitives/pressable' }
          ]
        },
        {
          text: 'flexium/canvas',
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
        }
      ],
      '/examples/': [
        {
          text: 'Basic Examples',
          items: [
            { text: 'Counter', link: '/examples/counter' },
            { text: 'Todo List', link: '/examples/todo' },
            { text: 'Form Handling', link: '/examples/form' }
          ]
        },
        {
          text: 'Canvas Examples',
          items: [
            { text: 'Animated Circle', link: '/examples/animated-circle' },
            { text: 'Drawing App', link: '/examples/drawing-app' },
            { text: 'Charts', link: '/examples/charts' }
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
