# Flexium SSR Starter

A production-ready Server-Side Rendering (SSR) template for Flexium applications.

## Features

- Server-side rendering for optimal performance and SEO
- Express.js server with compression
- Hot module replacement in development
- Production-ready build setup
- Client-side hydration
- Vite for fast development and optimized builds

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── client/          # Client-side code
│   │   ├── App.js       # Main app component
│   │   └── entry-client.js  # Client entry point (hydration)
│   └── server/          # Server-side code
│       └── entry-server.js  # Server entry point (SSR)
├── server.js            # Express server
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json
```

## How SSR Works

1. **Server renders** the initial HTML with your app's content
2. **Client receives** the pre-rendered HTML (faster initial load)
3. **Client hydrates** the HTML to make it interactive
4. **Benefits**: Better SEO, faster initial page load, improved perceived performance

## Environment Variables

Create a `.env` file for custom configuration:

```env
PORT=5173
NODE_ENV=production
```

## Deployment

This template can be deployed to any Node.js hosting platform:

- Vercel
- Netlify Functions
- Railway
- Heroku
- AWS Lambda

Make sure to:
1. Run `npm run build`
2. Set `NODE_ENV=production`
3. Start with `node server.js`

## Learn More

- [Flexium Documentation](https://github.com/Wick-Lim/flexium.js)
- [Express.js](https://expressjs.com/)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
