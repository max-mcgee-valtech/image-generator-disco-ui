import { PrismaClient } from "@prisma/client";

export default async function handle(req, res) {
  let prisma = new PrismaClient();

  const user = await prisma.user.create({
    data: {
      name: "MCM",
      totalPoints: 0,
    },
  });
  return res.json(user);
}
