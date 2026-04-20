import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import fs from "fs/promises";
import path from "path";

const calendarPath = path.join(process.cwd(), "data", "store", "social-calendar.json");

async function readCalendar() {
  try {
    const data = await fs.readFile(calendarPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCalendar(posts) {
  await fs.writeFile(calendarPath, JSON.stringify(posts, null, 2), "utf8");
}

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const posts = await readCalendar();
      return res.status(200).json({ posts });
    }

    if (req.method === "POST") {
      const { caption, platform, scheduledFor } = req.body;

      if (!caption || !platform || !scheduledFor) {
        return res.status(400).json({ error: "Caption, platform, and date required" });
      }

      const posts = await readCalendar();
      const newPost = {
        id: `post-${Date.now()}`,
        caption,
        platform,
        scheduledFor: new Date(scheduledFor).toISOString(),
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      posts.push(newPost);
      await writeCalendar(posts);

      return res.status(200).json({ success: true, post: newPost });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "ID required" });
      }

      let posts = await readCalendar();
      posts = posts.filter((p) => p.id !== id);
      await writeCalendar(posts);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error managing calendar:", error);
    return res.status(500).json({ error: "Failed to manage calendar" });
  }
}
