import cloudinary from "cloudinary";
import { uuid } from "uuidv4";

export default async function handle(req, res) {
  const textPrompt = req.body.textPrompt;
  const status = req.body.status;
  const newId = uuid();
  cloudinary.config({
    cloud_name: "detzng4ks",
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  await cloudinary.v2.uploader.upload(
    "https://res.cloudinary.com/detzng4ks/image/upload/v1652744227/gray_rmkqbm.png",
    {
      public_id: newId,
      folder: "/disco-diffusion-active-tests",
      context: `alt=${status}|caption=${textPrompt}`,
    }
  );

  fetch("http://13.56.154.163:5000/handle_data", {
    method: "POST",
    headers: {
      "Bypass-Tunnel-Reminder": "go",
      mode: "no-cors",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      textPrompt,
      imageId: newId,
    }),
  });
  return res.json({ currentPrompt: textPrompt });
}
