import { Client } from "discord.js";
import whitelist from "./whitelist";

const client = new Client();

const prefix = "!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  message.content = message.content.substr(prefix.length);
  const commandPieces = message.content.split(" ");
  const command = commandPieces.shift();

  switch (command) {
    case "ping":
      message.reply("Pong!");
      break;
    case "accept":
    case "info":
    case "decline":
      whitelist(command, commandPieces, message);
      break;
  }
});

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Logged into discord"));

export default client;
