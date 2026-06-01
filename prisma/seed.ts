/**
 * Avori OS — Database seed
 *
 * Populates a fresh database with a demo account that matches the mock
 * data layer used in development. Run with:
 *
 *   npx prisma db seed
 *
 * (Requires `"prisma": { "seed": "tsx prisma/seed.ts" }` in package.json
 * and `tsx` installed as a devDependency.)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create or reset the demo user
  const user = await prisma.user.upsert({
    where: { email: "sayed@avorigrowth.co" },
    update: {},
    create: {
      email: "sayed@avorigrowth.co",
      name: "Sayed",
      timezone: "America/Toronto",
      level: 27,
      xp: 8420,
      streakDays: 47,
      longestStreak: 89,
      disciplineScore: 92,
      productivityScore: 87,
      focusScore: 78,
      agencyScore: 94,
      coachPersonality: "STRATEGIST",
      honestyLevel: 9,
      morningBriefAt: "07:00",
      windDownAt: "21:45",
    },
  });

  console.log(`✓ Seeded user: ${user.name} (${user.email})`);

  // Habits
  const habitDefinitions = [
    { name: "Workout", icon: "💪", color: "emerald", targetPerWeek: 6, currentStreak: 47 },
    { name: "Read", icon: "📚", color: "indigo", targetPerWeek: 7, currentStreak: 31 },
    { name: "Meditate", icon: "🧘", color: "violet", targetPerWeek: 7, currentStreak: 12 },
    { name: "Cold plunge", icon: "❄️", color: "cyan", targetPerWeek: 5, currentStreak: 8 },
    { name: "No alcohol", icon: "🚫", color: "rose", targetPerWeek: 7, currentStreak: 89 },
    { name: "Sleep 7+ hrs", icon: "😴", color: "amber", targetPerWeek: 7, currentStreak: 22 },
  ];

  for (const h of habitDefinitions) {
    await prisma.habit.upsert({
      where: { id: `${user.id}-${h.name}` },
      update: {},
      create: {
        id: `${user.id}-${h.name}`,
        userId: user.id,
        ...h,
        longestStreak: h.currentStreak,
      },
    });
  }
  console.log(`✓ Seeded ${habitDefinitions.length} habits`);

  // Clients
  const clientDefs = [
    { name: "Meridian Capital", logo: "M", mrr: 18500, healthScore: 96 },
    { name: "Volta Energy", logo: "V", mrr: 12000, healthScore: 88 },
    { name: "Northwind Labs", logo: "N", mrr: 9500, healthScore: 72 },
    { name: "Helios Robotics", logo: "H", mrr: 22000, healthScore: 94 },
    { name: "Citadel Brands", logo: "C", mrr: 7500, healthScore: 80 },
    { name: "Aurora Health", logo: "A", mrr: 14000, healthScore: 91 },
  ];
  for (const c of clientDefs) {
    await prisma.client.upsert({
      where: { id: `${user.id}-client-${c.name}` },
      update: {},
      create: {
        id: `${user.id}-client-${c.name}`,
        userId: user.id,
        ...c,
      },
    });
  }
  console.log(`✓ Seeded ${clientDefs.length} clients`);

  console.log("\n✨ Seed complete. Run `npx prisma studio` to explore.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
