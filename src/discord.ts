import { Client } from "discord.js";
import whitelist from "./commands/whitelist";
import dns from "./commands/dns";
import features from "./commands/features";

const discord = new Client();

const prefix = "!";

discord.on("ready", () => {
  console.log(`Logged in as ${discord.user.tag}!`);
});

discord.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  message.content = message.content.substr(prefix.length);
  const commandPieces = message.content.split(" ");
  const command = commandPieces.shift();

  switch (command.toLowerCase()) {
    case "ping":
      message.reply("Pong!");
      break;
    case "features":
      features(message);
      break;
    case "accept":
    case "info":
    case "decline":
      if (message.channel.id === process.env.DISCORD_CHANNEL) {
        whitelist(command, commandPieces, message);
      }
      break;
    case "dns":
      if (message.guild.id === process.env.STAFF_GUILD) {
        dns(commandPieces, message);
      }
      break;
  }
});

discord
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Logged into discord"));

export default discord;
