import type { Preview } from '@storybook/html'
import { render } from 'flexium/dom'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (story) => {
      const container = document.createElement('div')
      container.style.padding = '1rem'
      const result = story()

      if (result && typeof result === 'object' && 'type' in result) {
        render(result, container)
      } else if (typeof result === 'string') {
        container.innerHTML = result
      } else {
        container.appendChild(result as Node)
      }

      return container
    },
  ],
}

export default preview
