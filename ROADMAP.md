# Zora Genesis Roadmap

## Current state

- The agent generates post text.
- The agent generates an AI image from the post context.
- Farcaster publishing with image embed works.
- X publishing with image upload works after OAuth with `media.write`.
- X access tokens are refreshed automatically with `X_REFRESH_TOKEN`.
- Zora publishing stays manual/gasless through the Zora UI.
- SDK-based Zora publishing is intentionally skipped unless a local EVM private key is configured.

## Next upgrade: brand-style QA gate

Before publishing, the agent should review every generated image against brand rules.

Desired brand style:

- Warm, human, creator-led.
- Optimistic and builder-focused.
- Base/Zora native without looking spammy.
- Premium but not corporate.
- Realistic photographic/editorial feel.
- Natural or cinematic light.
- Clear subject and composition.

Reject or regenerate images that are:

- Generic robot or stock-AI looking.
- Dark dystopian cyberpunk.
- Scammy crypto aesthetics.
- Full of charts, clutter, fake dashboards, or hype visuals.
- Containing text, logos, watermarks, or brand marks.
- Showing distorted faces, hands, screens, or obvious AI artifacts.
- Off-brand for Chef Marko / Base creator identity.

Target flow:

1. Generate post text.
2. Generate image from the post text.
3. Review image with a vision model.
4. Score brand fit, quality, clarity, and artifact risk.
5. If it fails, regenerate up to 2-3 times.
6. Publish only when the image passes.

## Caching plan

Use caching only where it is safe:

- Cache brand-style review calls.
- Cache repeated test/evaluation calls.
- Include brand-rules version in the cache key.

Do not cache:

- Final live post generation.
- Final live image generation.
- Any step where fresh output is required.

## Posting rules

- X and Farcaster should receive text plus image.
- The post text can be used as the image description/prompt context.
- Zora remains manual/gasless unless a separate burner wallet is intentionally configured.
- Never paste private keys into chat.
