import fetch from "node-fetch";

export async function whitelistUser(displayName) {
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
