import { File } from "node:buffer";
import { config } from "../config.js";
import type { GeneratedImage } from "./image.js";

async function optionalImport<T>(moduleName: string): Promise<T | null> {
  try {
    const load = new Function("moduleName", "return import(moduleName)");
    return (await load(moduleName)) as T;
  } catch {
    return null;
  }
}

function toGatewayUrl(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice("ipfs://".length)}`;
  }

  return uri;
}

export async function uploadImageForSocialEmbed(image: GeneratedImage | null) {
  if (!image) {
    return null;
  }

  if (!config.zoraApiKey || !config.creatorWalletAddress) {
    console.log("Zora API key or creator wallet missing; social image URL embed skipped.");
    return null;
  }

  const coins = await optionalImport<any>("@zoralabs/coins-sdk");
  if (!coins) {
    console.log("Zora SDK not installed; social image URL embed skipped.");
    return null;
  }

  coins.setApiKey(config.zoraApiKey);

  const uploader = coins.createZoraUploaderForCreator(
    config.creatorWalletAddress as `0x${string}`,
  );
  const uploadResult = await uploader.upload(
    new File([image.buffer], image.filename, { type: image.mimeType }),
  );

  const gatewayUrl = toGatewayUrl(uploadResult.url);
  console.log("Uploaded social image:", gatewayUrl);

  return {
    uri: uploadResult.url as string,
    url: gatewayUrl,
  };
}
