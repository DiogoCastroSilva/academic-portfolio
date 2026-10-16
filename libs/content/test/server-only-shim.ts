// Shim for the `server-only` package in test environments.
// In production, `server-only` is a build-time marker that prevents
// server-only modules from being imported in client components.
// In a Node.js Vitest environment this check is unnecessary.
export {};
