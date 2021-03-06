import { cloudflare_endpoint } from "./index";
import fetch from "node-fetch";

export default async (server, port, msg) => {
  const result = await (
    await fetch(
      `${cloudflare_endpoint}/zones/911cc33fa83f08b44a713d93675888cf/dns_records`,
      {
        method: "POST",
        body: JSON.stringify({
          type: "SRV",
          name: `_minecraft._tcp.${server}.madhouseminers.com`,
          content: `1\t${port}\t${process.env.MC_HOST}`,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      }
    )
  ).json();
  if (!result.success) {
    console.log("ERROR CREATING DNS: ");
    console.log(result.errors);
    msg.reply(
      "There was an error creating this DNS. Time to ask MadhouseSteve what happened!"
    );
  } else {
    msg.reply(
      `The dns record was set up successfully. \`${server}\` on port \`${port}\` set up on \`${server}.madhouseminers.com\``
    );
  }
};
