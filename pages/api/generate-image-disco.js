export default async function handler(req, res) {
  const textPrompt = req.body.textPrompt;

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
    }),
  });

  res.status(200).send({
    currentPrompt: textPrompt,
  });
}
