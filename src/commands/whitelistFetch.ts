import { Message, MessageEmbed, TextChannel } from "discord.js";
import gql from "graphql-tag";
import { apolloClient } from "../graphql";
import * as moment from "moment";
import discord from "../discord";
import Whitelist from "../models/whitelist";

export default async (params, msg: Message) => {
  let results;
  try {
    results = await apolloClient.query({
      query: gql`
        query whitelist($id: ID) {
          whitelist(id: $id) {
            id
            status
            displayName
            dob
            whereHeard
            moddedExperience
            knownMembers
            interestedServers
            aboutUser
          }
        }
      `,
      variables: {
        id: params[0],
      },
    });
  } catch (e) {
    console.log(e);
  }

  const whitelist = results.data.whitelist;
  await sendWhitelist(whitelist);
};

export const sendWhitelist = async (whitelist: Whitelist) => {
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
};
