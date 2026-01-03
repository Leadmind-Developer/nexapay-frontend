// src/middleware/organizerAuth.js
import { prisma } from "../lib/prisma.js";

export default async function organizerAuth(req, res, next) {
  try {
    const user = req.user;

    // Ensure user exists and has an ID and email
    if (!user?.id || !user?.email) {
      return res.status(401).json({ error: "Unauthorized: user not found or missing email" });
    }

    const userIdStr = String(user.id);

    // Try to find an existing organizer
    let organizer = await prisma.organizer.findFirst({
      where: { userId: userIdStr },
    });

    // If not found, create a new organizer safely
    if (!organizer) {
      organizer = await prisma.organizer.create({
        data: {
          name: user.name || "Organizer",
          email: user.email, // guaranteed to exist
          userId: userIdStr,
        },
      });
    }

    // Attach organizer to request object
    req.organizer = organizer;
    next();
  } catch (err) {
    console.error("Organizer auth failed:", err);
    return res.status(500).json({ error: "Server error while verifying organizer" });
  }
}
