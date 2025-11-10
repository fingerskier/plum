# plum

AI testor operator application

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm 9+

### Environment variables

The Electron renderer is powered by Vite inside `app/`. Configuration is driven by standard
`.env` files that live alongside the renderer source.

1. Create an `.env` (or `.env.local`) file in `app/`.
2. Set any variables you need for the renderer. These are exposed via `import.meta.env` at
   runtime.

```bash
# app/.env
# Switches the renderer between the default SWC-powered React plugin and the React Compiler.
REACT_COMPILER=0

# Example of a renderer-specific variable exposed as import.meta.env.VITE_API_BASE_URL
VITE_API_BASE_URL=https://example.test/api
```

Use `REACT_COMPILER=1` to enable the experimental React Compiler integration when developing or
building the renderer. The Electron main process continues to read from the system environment as
usual.

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

The output will be placed in `app/dist`.
