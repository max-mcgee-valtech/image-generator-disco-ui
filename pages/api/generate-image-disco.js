import cloudinary from "cloudinary";
import { uuid } from "uuidv4";
// import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const textPrompt = req.body.textPrompt;
  const status = req.body.status;

  const newId = uuid();
  // let prisma = new PrismaClient();

  await cloudinary.v2.uploader.upload(
    "https://res.cloudinary.com/detzng4ks/image/upload/v1652744227/gray_rmkqbm.png",
    {
      public_id: newId,
      folder: "/disco-diffusion-active-tests",
      context: `alt=${status}|caption=${textPrompt}`,
    }
  );

  // await prisma.image.create({
  //   data: {
  //     textPrompt,
  //     status: "pending",
  //     imageId: newId,
  //   },
  // });

  // await fetch("http://13.56.154.163:5000/handle_data", {
  //   method: "POST",
  //   headers: {
  //     "Bypass-Tunnel-Reminder": "go",
  //     mode: "no-cors",
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     textPrompt,
  //     imageId: newId,
  //   }),
  // });

  // res.status(200).send({
  //   currentPrompt: textPrompt,
  // });
}
