import fs from "fs/promises";
import path from "path";

const file = path.join(process.cwd(), "data", "site-images.json");

export const defaultSiteImages = {
  heroImage: "/media/site/placeholder.svg",
  artisanPortrait: "/media/site/placeholder.svg",
  collectionJewellery: "/media/site/placeholder.svg",
  collectionHome: "/media/site/placeholder.svg",
  collectionAccessories: "/media/site/placeholder.svg",
  pageTexture: "/textures/linen-noise.svg",
};

export async function readSiteImages() {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultSiteImages, ...parsed };
  } catch {
    return { ...defaultSiteImages };
  }
}

export async function writeSiteImages(patch) {
  const current = await readSiteImages();
  const merged = { ...current, ...patch };
  await fs.writeFile(file, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return merged;
}
