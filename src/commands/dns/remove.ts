import { cloudflare_endpoint } from "./index";
import fetch from "node-fetch";

export default async (server, msg, record_id) => {
  const result = await (
    await fetch(
      `${cloudflare_endpoint}/zones/911cc33fa83f08b44a713d93675888cf/dns_records/${record_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      }
    )
  ).json();
  if (!result.success) {
    console.log("ERROR DELETING DNS: ");
    console.log(result.errors);
    msg.reply(
      "There was an error deleting this DNS. Time to ask MadhouseSteve what happened!"
    );
  } else {
    msg.reply(
      `The dns record was removed successfully. \`${server}.madhouseminers.com\` has gone away.`
    );
  }
};
