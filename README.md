# Zora Genesis

A minimal autonomous AI agent for Base, Zora, NFTs, and the creator economy.

## Run locally

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Run the public endpoint:

```bash
npm start
```

Run the agent once:

```bash
npm run run:once
```

## Publishing

The agent can publish to Farcaster through Neynar and to X through the X API.

Required for Farcaster:

```bash
NEYNAR_API_KEY=
NEYNAR_SIGNER_UUID=
```

Required for X:

```bash
X_BEARER_TOKEN=
```

`X_BEARER_TOKEN` must be a user OAuth2 token with permission to create posts.

Required for generated Zora image coins:

```bash
OPENAI_API_KEY=
ZORA_CREATOR_NAME=
ZORA_CREATOR_WALLET_ADDRESS=
WALLET_PRIVATE_KEY=
BASE_RPC_URL=
```

The Zora path generates an original image, uploads it as coin metadata, and creates the coin under `ZORA_CREATOR_NAME` and `ZORA_CREATOR_WALLET_ADDRESS`.

### Dry run (safe local test)

This mode skips the external AI service and Farcaster post.

```powershell
$env:DRY_RUN='true'
node dist/cli.js
```

You can also control behavior more granularly:

```powershell
$env:SKIP_AI='true'
$env:SKIP_POST='true'
node dist/cli.js
```

## Deployment

A `Dockerfile` is included for containerized deployment.

### Vercel

This project includes Vercel serverless endpoints for:

- `GET /health`
- `GET /agent/profile`
- `POST /agent/run`

After deployment, set:

```bash
AGENT_PUBLIC_URL=https://your-project.vercel.app
AGENT_ENDPOINT=https://your-project.vercel.app/agent/profile
```

Add your `.env` values in Vercel Project Settings -> Environment Variables.

Build the image:

```bash
docker build -t zora-genesis .
```

Run the container with environment variables from a file:

```bash
docker run --env-file .env zora-genesis
```

## Registration

The repository includes helper scripts to register the agent with a registry broker.

```bash
npm run register
npm run hol:register
```

Those scripts require additional environment variables such as `AGENT_ENDPOINT` and `REGISTRY_BROKER_API_KEY`.

## Activation endpoint

The server exposes:

- `GET /health`
- `GET /agent/profile`
- `POST /agent/run`

`POST /agent/run` requires `AGENT_RUN_TOKEN` and an `Authorization: Bearer <token>` header.
