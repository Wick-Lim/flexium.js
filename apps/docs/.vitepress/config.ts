import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Flexium',
  description: 'A lightweight, signals-based UI framework with cross-platform renderers',
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/state' },
      { text: 'Examples', link: '/examples/counter' },
      { text: 'Showcase', link: '/showcase' },
      {
        text: 'v0.2.4',
        items: [
          { text: 'Changelog', link: 'https://github.com/yourusername/flexium.js/blob/main/CHANGELOG.md' },
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
          text: 'Core Concepts',
          items: [
            { text: 'State Management', link: '/guide/state' },
            { text: 'Router', link: '/guide/router' },
            { text: 'Store', link: '/guide/store' },
            { text: 'JSX & Rendering', link: '/guide/jsx' },
            { text: 'Error Handling', link: '/guide/error-handling' }
          ]
        },
        {
          text: 'Cross-Platform',
          items: [
            { text: 'Primitives', link: '/guide/primitives' },
            { text: 'Canvas Rendering', link: '/guide/canvas' },
            { text: 'Styling', link: '/guide/styling' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Performance', link: '/guide/performance' },
            { text: 'Server-Side Rendering', link: '/guide/ssr' },
            { text: 'TypeScript', link: '/guide/typescript' },
            { text: 'Testing', link: '/guide/testing' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'State', link: '/api/state' }
          ]
        },
        {
          text: 'Primitives',
          items: [
            { text: 'View', link: '/api/primitives/view' },
            { text: 'Text', link: '/api/primitives/text' },
            { text: 'Image', link: '/api/primitives/image' },
            { text: 'Pressable', link: '/api/primitives/pressable' },
            { text: 'ScrollView', link: '/api/primitives/scrollview' }
          ]
        },
        {
          text: 'Canvas',
          items: [
            { text: 'Canvas', link: '/api/canvas/canvas' },
            { text: 'Rect', link: '/api/canvas/rect' },
            { text: 'Circle', link: '/api/canvas/circle' },
            { text: 'Path', link: '/api/canvas/path' },
            { text: 'Text', link: '/api/canvas/text' },
            { text: 'Line', link: '/api/canvas/line' },
            { text: 'Arc', link: '/api/canvas/arc' }
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
      { icon: 'github', link: 'https://github.com/yourusername/flexium.js' }
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