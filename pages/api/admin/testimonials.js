import { supabaseAdmin } from "../../../lib/supabase-server";
import { isAuthorizedRequest } from "../../../lib/admin-auth";

// Create testimonials table if it doesn't exist (will be idempotent)
async function ensureTestimonialsTable() {
  try {
    // This is just for reference - table should exist in Supabase
    // If not, create via Supabase dashboard with: id, name, location, rating, quote, productId, approved, submittedAt, createdAt
  } catch (error) {
    console.error("Error ensuring testimonials table:", error);
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req, res) {
  try {
    const query = supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("createdAt", { ascending: false });

    const { data, error } = isAuthorizedRequest(req)
      ? await query
      : await query.eq("approved", true);

    if (error) {
      console.error("Testimonials GET error:", error);
      return res.status(500).json({ error: "Could not read testimonials" });
    }

    return res.status(200).json({ testimonials: data || [] });
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return res.status(500).json({ error: "Could not read testimonials" });
  }
}

async function handlePost(req, res) {
  try {
    const { testimonials: newTestimonials } = req.body;

    console.log("Received POST request with testimonials:", JSON.stringify(newTestimonials));

    if (!newTestimonials) {
      console.log("Error: No testimonials provided");
      return res.status(400).json({ error: "No testimonials provided" });
    }

    if (!Array.isArray(newTestimonials)) {
      console.log("Error: Testimonials is not an array:", typeof newTestimonials);
      return res.status(400).json({ error: "Testimonials must be an array" });
    }

    // Check if this is a new customer review submission (has submittedAt field)
    // vs admin management of testimonials (no submittedAt field)
    const isNewReviewSubmission = newTestimonials.some((t) => t.submittedAt);

    if (isNewReviewSubmission) {
      // Customer submitting a new review - insert into DB
      console.log("New review submission - inserting into database");

      const { data, error } = await supabaseAdmin
        .from("testimonials")
        .insert(
          newTestimonials.map((t) => ({
            name: t.name,
            location: t.location,
            rating: t.rating,
            quote: t.quote,
            productId: t.productId || null,
            approved: false,
            submittedAt: t.submittedAt,
          }))
        )
        .select();

      if (error) {
        console.error("Error inserting testimonial:", error);
        throw new Error("Could not save testimonial: " + error.message);
      }

      console.log("Successfully inserted", data?.length || 0, "testimonials");
      return res.status(200).json({ success: true, count: data?.length || 0 });
    } else {
      if (!isAuthorizedRequest(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Admin managing testimonials - update entire list
      console.log("Admin management - updating testimonials");

      // Update each testimonial
      for (const testimonial of newTestimonials) {
        const { error } = await supabaseAdmin
          .from("testimonials")
          .update({
            name: testimonial.name,
            location: testimonial.location,
            rating: testimonial.rating,
            quote: testimonial.quote,
            productId: testimonial.productId || null,
            approved: testimonial.approved,
          })
          .eq("id", testimonial.id);

        if (error) {
          console.error("Error updating testimonial:", error);
          throw new Error("Could not update testimonial: " + error.message);
        }
      }

      console.log("Successfully updated", newTestimonials.length, "testimonials");
      return res.status(200).json({ success: true, count: newTestimonials.length });
    }
  } catch (error) {
    console.error("Testimonials POST error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: error.message || "Could not save testimonial",
      details: error.toString(),
    });
  }
}
