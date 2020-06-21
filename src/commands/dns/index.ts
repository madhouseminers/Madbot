import { Message } from "discord.js";
import fetch from "node-fetch";
import update from "./update";
import create from "./create";
import remove from "./remove";

export const cloudflare_endpoint = "https://api.cloudflare.com/client/v4";

export default async (params: Array<string>, msg: Message) => {
  const formatErrorMessage = `The format is \`!dns [operation] [server]\`. Operations available are: \`update\`, \`create\`, \`delete\`, \`fetch\`. Please try again`;
  if (params.length < 2) return msg.reply(formatErrorMessage);

  let result = await (
    await fetch(
      `${cloudflare_endpoint}/zones/911cc33fa83f08b44a713d93675888cf/dns_records?type=srv&name=_minecraft._tcp.${params[1]}.madhouseminers.com`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      }
    )
  ).json();

  switch (params[0].toLowerCase()) {
    case "create":
      if (params.length < 3) {
        msg.reply(
          `The format for this command is: !dns create \`${params[1]}\` [port]`
        );
      } else if (result.result_info.count) {
        msg.reply(
          `A DNS record for this server already exists. Did you mean \`!dns update ${params[1]} ${params[2]}\`?`
        );
      } else {
        await create(params[1], params[2], msg);
      }
      break;

    case "update":
      if (params.length < 3) {
        msg.reply(
          `The format for this command is: !dns update \`${params[1]}\` [port]`
        );
      } else if (!result.result_info.count) {
        msg.reply(
          `This DNS record does not exist. Did you mean \`!dns create ${params[1]} ${params[2]}\`?`
        );
      } else {
        await update(params[1], params[2], msg, result.result[0].id);
      }
      break;

    case "delete":
      if (result.result_info.count !== 1) {
        msg.reply(
          `This DNS record does not exist so there is nothing to delete.`
        );
        break;
      }
      await remove(params[1], msg, result.result[0].id);
      break;

    case "fetch":
      if (!result.result_info.count) {
        msg.reply(`This DNS record does not exist.`);
        break;
      }
      msg.reply(
        `${params[1]} is set on port \`${
          result.result[0].content.split("\t")[1]
        }\``
      );
      break;

    default:
      msg.reply(formatErrorMessage);
  }
};
