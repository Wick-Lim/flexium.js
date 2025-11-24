import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Flexium',
  description: 'A lightweight, signals-based UI framework with cross-platform renderers',
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/primitives/column' },
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
          text: 'Core API',
          items: [
            { text: 'state()', link: '/guide/state' },
            { text: 'effect()', link: '/guide/effects' },
            { text: 'Control Flow', link: '/guide/flow' },
            { text: 'Router', link: '/guide/router' },
            { text: 'JSX & Rendering', link: '/guide/jsx' },
            { text: 'Error Handling', link: '/guide/error-handling' }
          ]
        },
        {
          text: 'Cross-Platform Guides',
          items: [
            { text: 'Primitives Overview', link: '/guide/primitives' },
            { text: 'Canvas Rendering Guide', link: '/guide/canvas' },
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
      '/reference/': [ // New reference sidebar
        {
          text: 'Layout Primitives',
          items: [
            { text: 'Column', link: '/reference/primitives/column' },
            { text: 'Row', link: '/reference/primitives/row' },
            { text: 'ScrollView', link: '/reference/primitives/scrollview' }
          ]
        },
        {
          text: 'Content Primitives',
          items: [
             { text: 'Text', link: '/reference/primitives/text' },
             { text: 'Image', link: '/reference/primitives/image' },
             { text: 'Pressable', link: '/reference/primitives/pressable' },
          ]
        },
        {
          text: 'Canvas API',
          items: [
            { text: 'Canvas', link: '/reference/canvas/canvas' },
            { text: 'Rect', link: '/reference/canvas/rect' },
            { text: 'Circle', link: '/reference/canvas/circle' },
            { text: 'Path', link: '/reference/canvas/path' },
            { text: 'Text', link: '/reference/canvas/text' },
            { text: 'Line', link: '/reference/canvas/line' },
            { text: 'Arc', link: '/reference/canvas/arc' }
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
