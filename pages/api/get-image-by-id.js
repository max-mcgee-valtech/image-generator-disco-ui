import { PrismaClient } from "@prisma/client";

export default async function handle(req, res) {
  let prisma = new PrismaClient();
  const result = await prisma.image.findMany({
    where: {
      imageId: req.body.imageId,
    },
  });

  return res.json(result);
}
