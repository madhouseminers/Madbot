import fetch from "node-fetch";
import { MessageEmbed, TextChannel } from "discord.js";
import * as moment from "moment";
import gql from "graphql-tag";
import { apolloClient } from "./graphql";
import discord from "./discord";

const query = gql`
  subscription {
    whitelistUpdated {
      id
      displayName
      dob
      whereHeard
      moddedExperience
      knownMembers
      interestedServers
      aboutUser
      status
    }
  }
`;

let observe = apolloClient.subscribe({
  query,
});
observe.subscribe(async (result) => {
  const whitelist = result.data.whitelistUpdated;
  switch (whitelist.status) {
    case "SUBMITTED":
      const exampleEmbed = new MessageEmbed()
        .setColor("#aea1ea")
        .setTitle(`New Application for ${whitelist.displayName}`)
        .addFields({
          name: "Application ID",
          value: whitelist.id,
        })
        .addFields({
          name: "Minecraft Name",
          value: whitelist.displayName,
        })
        .addFields({
          name: "Date of Birth",
          value: moment(whitelist.dob).format("Mo MMMM YYYY"),
        })
        .addFields({
          name: "Where did you hear about Madhouse Miners?",
          value: whitelist.whereHeard,
        })
        .addFields({
          name: "What experience do you have with modded Minecraft?",
          value: whitelist.moddedExperience,
        })
        .addFields({
          name:
            "Do you know any other members of our community? If so, what is their minecraft name?",
          value: whitelist.knownMembers,
        })
        .addFields({
          name: "Which of our servers are you mainly interested in and why?",
          value: whitelist.interestedServers,
        })
        .addFields({
          name:
            "Tell us a bit about yourself (e.g. What mods are you mainly interest in, what style of building do you like to do?)",
          value: whitelist.aboutUser,
        })
        .setTimestamp();

      await (discord.channels.cache.get(
        process.env.DISCORD_CHANNEL
      ) as TextChannel).send(exampleEmbed);
      await (discord.channels.cache.get(
        process.env.DISCORD_CHANNEL
      ) as TextChannel).send(
        `You can respond to this application here.\n\nTo accept type \`\`\`!accept ${whitelist.id} [reason]\`\`\`\nTo request more information type \`\`\`!info ${whitelist.id} [reason]\`\`\`\nTo decline type \`\`\`!decline ${whitelist.id} [reason]\`\`\``
      );
      break;
    case "ACCEPTED":
      await whitelistUser(whitelist.displayName);
      break;
  }
});

async function whitelistUser(displayName) {
  const serverResults = await fetch(
    "https://panel.madhouseminers.com/api/application/servers",
    {
      headers: {
        Authorization: `Bearer ${process.env.PANEL_APPLICATION_KEY}`,
        "Content-type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
    }
  );
  const servers = await serverResults.json();
  for (const server of servers.data) {
    await fetch(
      `https://panel.madhouseminers.com/api/client/servers/${server.attributes.identifier}/command`,
      {
        method: "POST",
        body: JSON.stringify({ command: `/whitelist add ${displayName}` }),
        headers: {
          Authorization: `Bearer ${process.env.PANEL_CLIENT_KEY}`,
          "Content-type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      }
    );
  }
}
