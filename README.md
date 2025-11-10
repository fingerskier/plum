# plum

AI testor operator application

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm 9+

### Environment variables

The Electron renderer is powered by Vite inside `electron/app`. Configuration is driven by
standard `.env` files. Create an `.env` file in `electron/app` (or `.env.local` for local-only
settings) with the variables you need:

```bash
# electron/app/.env
# Switches the renderer between the default SWC-powered React plugin and the React Compiler.
REACT_COMPILER=0

# Exposed to the renderer via import.meta.env.VITE_API_BASE_URL
VITE_API_BASE_URL=https://example.test/api
```

Use `REACT_COMPILER=1` to enable the experimental React Compiler integration when developing or
building the renderer.

### Running the app

Install dependencies and launch both the renderer and the Electron shell in watch mode:

```bash
npm install
npm run dev
```

The renderer dev server is available at [http://localhost:5173](http://localhost:5173).

### Building the renderer

To produce a production build of the renderer bundle (used by Electron in packaged mode):

```bash
npm run build
```

The output will be placed in `electron/app/dist`.
