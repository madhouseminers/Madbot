import fetch from "node-fetch";
import gql from "graphql-tag";
import { apolloClient } from "./graphql";
import { sendWhitelist } from "./commands/whitelistFetch";

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
      await sendWhitelist(whitelist);
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
