import { Message } from "discord.js";

export default async (msg: Message) => {
  const features = [
    "Whitelist Application Notification",
    "Whitelist Application Feedback",
    "Auto Whitelist on Accept",
    "DNS Management",
  ];

  return msg.reply(
    `My current features are:\n\n${features.map((f) => `* ${f}`).join("\n")}`
  );
};
