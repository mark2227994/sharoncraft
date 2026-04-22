import { readSiteImages, writeSiteImages } from "./site-images";

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export async function readAdminContentField(field, fallback) {
  const content = await readSiteImages();
  const value = content?.[field];
  if (value === undefined || value === null) return clone(fallback);

  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? value : clone(fallback);
  }

  if (fallback && typeof fallback === "object") {
    return value && typeof value === "object" && !Array.isArray(value)
      ? { ...clone(fallback), ...value }
      : clone(fallback);
  }

  return value;
}

export async function writeAdminContentField(field, value) {
  return writeSiteImages({ [field]: value });
}
