// Portable launcher; no shell-specific environment assignment required.
process.env.ROADSTER_APP='racing';process.env.ROADSTER_PORT=process.env.ROADSTER_PORT||'4175';
await import('./serve.mjs');
