# Zora Genesis Roadmap

## Current focus

The agent is now focused on practical social publishing, not crypto platforms.

Primary channels:

- Facebook
- Instagram
- X.com

Paused for now:

- Zora automatic publishing
- Farcaster
- Other crypto-native channels

## Current behavior

- The agent generates Slovenian social posts for relationship/life themes.
- The same core post is used for Facebook, Instagram, and X.
- Facebook and Instagram receive the fuller version.
- X receives a shortened version when needed because of the 280-character limit.
- The agent generates an image from the post text.
- The image is uploaded to a public URL before Facebook/Instagram publishing.
- X image publishing is limited by X plan permissions; text posting remains supported.

## Content direction

Core themes:

- Relationships
- Trust
- Betrayal
- Cheating
- Lying
- Pride
- Money
- Self-worth
- Boundaries
- Emotional maturity

Tone:

- Slovenian
- Direct
- Human
- Emotional but grounded
- A little provocative, but not vulgar
- Written for comments and discussion

## Next upgrade: brand-style QA gate

Before publishing, the agent should review every generated image and post against brand rules.

Desired style:

- Warm, human, adult, emotionally expressive.
- Elegant and tasteful.
- Clear subject and strong first impression.
- Suitable for Facebook and Instagram relationship discussions.
- No cheap shock value.

Reject or regenerate if:

- The image looks generic or artificial.
- The image is too sexual, vulgar, or clickbait.
- The post sounds robotic.
- The post attacks one gender unfairly.
- The post lacks a strong question for discussion.
- The post is too long for the selected platform.

Target flow:

1. User provides a topic.
2. Agent creates one main post.
3. Agent creates platform versions for Facebook, Instagram, and X.
4. Agent generates a matching image.
5. Agent reviews text and image for brand fit.
6. Agent asks for approval or publishes, depending on mode.

## Practical dashboard idea

Build a simple creator dashboard:

- Topic input
- Facebook preview
- Instagram preview
- X preview
- Image preview
- Regenerate text button
- Regenerate image button
- Save draft button
- Publish button
- Channel status

The goal is to make the agent feel like a practical creator assistant, not a terminal bot.
