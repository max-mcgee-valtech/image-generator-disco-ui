import cloudinary from "cloudinary";
import multiparty from "multiparty";
import { uuid } from "uuidv4";

const uploadImage = async (req, res) => {
  const newId = uuid();
  cloudinary.config({
    cloud_name: "detzng4ks",
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const form = new multiparty.Form();
  const data = await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) reject({ err });
      resolve({ fields, files });
    });
  });

  // Upload init_image to cloudinary
  let initImageResult = null;
  if (data.files.file) {
    initImageResult = await cloudinary.v2.uploader.upload(
      data.files.file[0].path,
      {
        public_id: newId,
        folder: "/disco-diffusion-init-images",
        context: `alt=${data.fields.status}|caption=${data.fields.textPrompt}`,
      }
    );
  }

  const initImageUrl = initImageResult?.url ?? "";

  // Upload placeholder image
  await cloudinary.v2.uploader.upload(
    "https://res.cloudinary.com/detzng4ks/image/upload/v1652744227/gray_rmkqbm.png",
    {
      public_id: newId,
      folder: "/disco-diffusion-active-tests",
      context: `alt=${data.fields.status}|caption=${data.fields.textPrompt}`,
    }
  );

  // Send text prompt, init image to backend for image generation
  await fetch("http://13.56.154.163:5000/handle_data", {
    method: "POST",
    headers: {
      "Bypass-Tunnel-Reminder": "go",
      mode: "no-cors",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      textPrompt: data.fields.textPrompt[0],
      imageId: newId,
      initImageUrl,
    }),
  });
  return res.json({ currentPrompt: data.fields.textPrompt });
};

export default uploadImage;
export const config = {
  api: {
    bodyParser: false,
  },
};
