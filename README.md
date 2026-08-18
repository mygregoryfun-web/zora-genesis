# Zora Genesis

A minimal autonomous AI agent for Base, Zora, NFTs, and the creator economy.

## Live demo

Production demo:

https://zora-genesis-t1j9.vercel.app

Public build post:

https://x.com/mygregoryfun/status/2088388638916694508

Public endpoints:

- `GET /`
- `GET /health`
- `GET /agent/profile`
- `GET /agent/opportunities`
- `GET /agent/monetization`
- `GET /agent/builder-code`
- `GET /agent/metrics`
- `POST /agent/run`

`POST /agent/run` is protected with `AGENT_RUN_TOKEN` and `x-user-id`.
`GET /agent/monetization` renders a human-readable revenue model; use
`GET /agent/monetization?format=json` for API JSON.

## Project goal

Zora Genesis helps Base and Zora builders turn creator-economy signals into
usable onchain asset ideas. The agent monitors Base/Zora signals, scores new
asset opportunities, and produces launchpad-lite concepts for creator assets,
consumer discovery, and agent-assisted publishing.

The strongest Base alignment is:

- new asset creation
- token launchpad-lite workflows
- consumer discovery for onchain creator assets
- prediction-market narrative radar for Base attention spikes
- agent-assisted creator publishing
- future x402-style premium creator briefs

## Base grant readiness

Current shipped work:

- live Vercel production demo
- Base mainnet proof contract: `0xc74659ce159b88ef3aae55a61fc3906fe2b1de58`
- Base Builder Code attribution: `bc_lk15eqwc`
- public agent profile endpoint
- Base/Zora opportunity engine
- prediction-market signal layer that converts Base attention spikes into creator asset briefs
- monetization plan endpoint for premium briefs, subscriptions, and done-for-you setup
- AI-generated creator-market post flow
- safety controls for publishing with `SKIP_POST`
- image failure fallback so the agent can continue without OpenAI image credits
- cleanup for malformed AI output, hashtags, and joined words

Current impact signals:

- public demo URL
- public X build post
- BaseScan proof: https://basescan.org/address/0xc74659ce159b88ef3aae55a61fc3906fe2b1de58
- working opportunity endpoint for Base/Zora creator asset ideas
- public metrics endpoint with Base, Zora, Farcaster, and X proofs
- documented safe local and production flows

Next milestone:

- add a creator-facing UI for the opportunity engine
- connect scored opportunities to a Zora-ready asset launch workflow
- create one Base/Zora onchain proof asset tied to Zora Genesis
- track early usage and social engagement metrics

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

The agent can publish to:

- Zora through the Zora Coins SDK
- Farcaster through Neynar
- X through the X API

Use `PUBLISH_CHANNELS` to run only selected channels. Accepted values are
`zora`, `farcaster`, and `x`, separated by commas.

Safe single-channel previews:

```powershell
npm.cmd run build
npm.cmd run preview:x
npm.cmd run preview:farcaster
npm.cmd run preview:zora
```

`check:x`, `check:farcaster`, and `check:zora` are kept as aliases for the same
safe preview flow.

Live single-channel publishing:

```powershell
npm.cmd run publish:x
npm.cmd run publish:farcaster
npm.cmd run publish:zora
```

Manual channel selection:

```powershell
$env:PUBLISH_CHANNELS='x,farcaster'
$env:SKIP_POST='true'
npm.cmd run run:once
```

## Facebook relationship posts

The Facebook flow is separate from the crypto/Zora agent flow. It writes Slovenian
relationship/life posts and publishes them to a Facebook Page when Page settings
are configured.

Dry run:

```powershell
$env:DRY_RUN='true'
$env:SKIP_AI='true'
$env:SKIP_POST='true'
npm.cmd run fb:post
```

Live posting requires:

```env
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_TOPIC=relationships
SKIP_POST=false
SKIP_AI=false
```

Run:

```powershell
npm.cmd run fb:post
```

Required for Farcaster:

```bash
NEYNAR_API_KEY=
NEYNAR_SIGNER_UUID=
```

Required for X:

```bash
X_BEARER_TOKEN=
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REFRESH_TOKEN=
```

`X_BEARER_TOKEN` must be a user OAuth2 token with permission to create posts.

Required for generated Zora image coins:

```bash
OPENAI_API_KEY=
ZORA_CREATOR_NAME=
ZORA_CREATOR_WALLET_ADDRESS=
WALLET_PRIVATE_KEY=
BASE_RPC_URL=
BASE_BUILDER_CODE=bc_lk15eqwc
```

The Zora path generates an original image, uploads it as coin metadata, and creates the coin under `ZORA_CREATOR_NAME` and `ZORA_CREATOR_WALLET_ADDRESS`.

`BASE_BUILDER_CODE` is used for Base Builder Code attribution and analytics. It is not a contract address, wallet private key, payment credential, or transaction hash.

## Base proof contract

Compile-check the proof contract without a wallet or network request:

```bash
npm run proof:check
```

For a testnet deployment, configure `BASE_SEPOLIA_RPC_URL` and run:

```bash
node scripts/deploy-zora-genesis-proof.mjs --network=base-sepolia --confirm-testnet
```

Mainnet deployment requires an explicit confirmation flag:

```bash
node scripts/deploy-zora-genesis-proof.mjs --network=base --confirm-mainnet
```

Before broadcasting, the script verifies the RPC chain ID, estimates the maximum
cost, and checks the wallet balance. Successful deployments write a JSON record
under `deployments/`.

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
- `GET /agent/opportunities`
- `GET /agent/monetization`
- `GET /agent/builder-code`
- `GET /agent/metrics`
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

The container starts the HTTP server. To run the agent as a one-off container,
override the command with `node dist/cli.js`.

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
