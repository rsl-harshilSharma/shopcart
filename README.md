# ShopCart

ShopCart is a React, TypeScript, and Vite storefront assignment. Each state
management deliverable lives on its own branch:

- `master`: shared types, mock API configuration, and the storefront UI shell.
- `deliverable-1-context`: cart state with React Context and `useReducer`.
- `deliverable-2-zustand`: the same cart UI backed by Zustand.
- `deliverable-3-jotai`: the same cart UI backed by Jotai.
- `deliverable-4-xstate`: checkout workflow and Zustand synchronization.

## Run locally

Use two terminals from the project directory:

```sh
npm run server
npm run dev
```

Vite runs at `http://localhost:5173` and proxies `/api/*` to json-server on port
3001. json-server serves the catalog and accepts order submissions from
`db.json`, with a 1.5-second response delay.

Run `npm run build` to type-check and create a production build.
