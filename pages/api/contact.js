export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
  if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
  if (!phone?.trim()) return res.status(400).json({ error: "Phone is required" });
  if (!subject?.trim()) return res.status(400).json({ error: "Subject is required" });
  if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

  try {
    // Send email notification (can integrate with SendGrid, Mailgun, etc.)
    console.log("Contact form submission:", { name, email, phone, subject, message, timestamp: new Date().toISOString() });

    // For now, just log it
    // TODO: Integrate email service to send to kelvinmark.services@gmail.com

    return res.status(200).json({
      ok: true,
      message: "Your message has been received. We will respond within 24 hours.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to process contact form" });
  }
}
