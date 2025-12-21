# create-flexism

[![npm version](https://img.shields.io/npm/v/create-flexism.svg)](https://www.npmjs.com/package/create-flexism)
[![license](https://img.shields.io/npm/l/create-flexism.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

Scaffold a new Flexism project - the realtime-first fullstack framework.

## Usage

```bash
npm create flexism@latest my-app
cd my-app
npm install
npm run dev
```

Or with other package managers:

```bash
# pnpm
pnpm create flexism my-app

# Yarn
yarn create flexism my-app

# Bun
bun create flexism my-app
```

## What You Get

- **Flexism** - Realtime-first fullstack framework with SSR
- **Flexium** - Fine-grained reactive UI framework
- **Stream API** - Real-time SSE with reactive subscriptions
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling (via CDN)

### Key Features

- **Two-function Pattern** - Server loader + Client component in one file
- **File-based Routing** - page.tsx, route.ts, layout.tsx conventions
- **SSE Streaming** - Real-time data with automatic reconnection
- **HMR** - Hot Module Replacement
- **Incremental Builds** - Only changed files recompile

## Project Structure

```
my-app/
├── src/
│   ├── page.tsx          # Home page (/)
│   └── layout.tsx        # Root layout
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run start    # Start production server
```

## Example: Two-function Pattern

```tsx
// src/page.tsx
export default async function HomePage() {
  const data = await fetchData()  // Server-side

  return ({ data }) => (           // Client-side
    <div>{data.message}</div>
  )
}
```

## Example: Real-time Stream

```tsx
// src/chat/page.tsx
import { Stream } from 'flexism/stream'

export default async function ChatPage({ params }) {
  const Messages = new Stream(() => db.messages.subscribe(params.roomId))

  return ({ Messages }) => {
    const [messages] = use(Messages)
    return <ul>{messages?.map(m => <li>{m.text}</li>)}</ul>
  }
}
```

## Requirements

- Node.js 18.0.0 or higher

## License

MIT
