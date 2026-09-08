import { generateFacebookPost } from "./facebook-ai.js";
import { loadFacebookPosts } from "./facebook-memory.js";
import { generateImageForPost, type GeneratedImage } from "./image.js";
import { preparePostForChannel } from "./channel-content.js";
import { formatForFacebook } from "./facebook.js";
import { formatForX } from "./x.js";
import type { GeneratedPost } from "../types.js";

function imageToDataUrl(image: GeneratedImage | null) {
  if (!image) {
    return null;
  }

  return `data:${image.mimeType};base64,${image.buffer.toString("base64")}`;
}

function formatForInstagram(post: GeneratedPost) {
  const hashtags = post.hashtags.join(" ");
  return `${post.post}\n\n${hashtags}`.trim();
}

type CreateSocialDraftInput = {
  topic?: string;
  language?: string;
};

export async function createSocialDraft(input: CreateSocialDraftInput = {}) {
  const memory = loadFacebookPosts();
  const topic = input.topic?.trim();
  const language = input.language?.trim().toLowerCase() || "si";
  const post = await generateFacebookPost({ memory, topic, language }).catch((err) => {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("Facebook draft text generation failed, using fallback:", reason);
    return {
      title: topic || "Ko ponos preglasi resnico",
      post: [
        ...(topic ? [`Tema: ${topic}`, ""] : []),
        "Najtezji trenutek v odnosu ni vedno prepir.",
        "",
        "Vcasih je najtezje priznati, da nas ne vodi vec resnica, ampak ponos. Tisti notranji glas, ki ne zeli slisati, ne zeli razumeti in ne zeli popustiti. Takrat clovek ne brani ljubezni. Brani svojo podobo.",
        "",
        "In ravno tam se zacnejo razdalje med ljudmi.",
      ].join("\n"),
      hashtags: ["#Odnosi", "#Zivljenje", "#Iskreno"],
    };
  });
  const image = await generateImageForPost(post).catch((err) => {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("Image generation failed for preview draft:", reason);
    return null;
  });

  const facebookPost = preparePostForChannel(post, "facebook");
  const instagramPost = preparePostForChannel(post, "instagram");
  const xPost = preparePostForChannel(post, "x");

  return {
    generatedAt: new Date().toISOString(),
    topic: topic || null,
    language,
    source: post,
    image: image
      ? {
          prompt: image.prompt,
          filename: image.filename,
          mimeType: image.mimeType,
          dataUrl: imageToDataUrl(image),
        }
      : null,
    channels: {
      facebook: {
        title: facebookPost.title,
        text: formatForFacebook(facebookPost),
      },
      instagram: {
        title: instagramPost.title,
        text: formatForInstagram(instagramPost),
      },
      x: {
        title: xPost.title,
        text: formatForX(xPost),
      },
    },
  };
}
