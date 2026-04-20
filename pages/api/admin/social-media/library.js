import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import fs from "fs/promises";
import path from "path";

const libraryPath = path.join(process.cwd(), "data", "store", "social-captions.json");

async function readLibrary() {
  try {
    const data = await fs.readFile(libraryPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLibrary(captions) {
  await fs.writeFile(libraryPath, JSON.stringify(captions, null, 2), "utf8");
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const captions = await readLibrary();
      return res.status(200).json({ captions });
    }

    if (req.method === "POST") {
      const caption = req.body;
      if (!caption.name && !caption.template) {
        return res.status(400).json({ error: "Name and template required" });
      }

      const captions = await readLibrary();
      const newCaption = {
        id: `caption-${Date.now()}`,
        name: caption.name || "Untitled",
        template: caption.template || caption.caption,
        savedAt: new Date().toISOString(),
      };

      captions.push(newCaption);
      await writeLibrary(captions);

      return res.status(200).json({ success: true, caption: newCaption });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "ID required" });
      }

      let captions = await readLibrary();
      captions = captions.filter((c) => c.id !== id);
      await writeLibrary(captions);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error managing caption library:", error);
    return res.status(500).json({ error: "Failed to manage library" });
  }
}
