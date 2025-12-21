# Flexism App

Realtime-first Fullstack Framework built with [Flexium](https://github.com/Wick-Lim/flexium.js).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run start` - Start production server

## Project Structure

```
my-app/
├── src/
│   ├── page.tsx        # Home page (/)
│   └── layout.tsx      # Root layout (HTML shell)
├── package.json
└── tsconfig.json
```

## File-based Routing

Create pages by adding `page.tsx` files:

```
src/
├── page.tsx              # /
├── about/
│   └── page.tsx          # /about
├── users/
│   └── [id]/
│       └── page.tsx      # /users/:id
└── api/
    └── messages/
        └── route.ts      # /api/messages
```

## Two-function Pattern

Server logic and client component in one function:

```tsx
// src/page.tsx
export default async function HomePage() {
  // Server: fetch data (has DB access)
  const data = await fetchData()

  // Client: interactive component (hydrated in browser)
  return ({ data }) => (
    <div>{data.message}</div>
  )
}
```

## Learn More

- [Flexism Documentation](https://flexium.junhyuk.im)
- [GitHub Repository](https://github.com/Wick-Lim/flexium.js)
