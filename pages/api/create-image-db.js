import { PrismaClient } from "@prisma/client";

export default async function handle(req, res) {
  //   const { title, content } = req.body;
  let prisma = new PrismaClient();
  const result = await prisma.image.create({
    data: {
      textPrompt: "test",
      status: "pending",
    },
  });
  res.json(result);
}
