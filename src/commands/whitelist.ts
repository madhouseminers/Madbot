import { Message } from "discord.js";
import gql from "graphql-tag";
import { apolloClient } from "../graphql";

export default async (outcome, params, msg: Message) => {
  const formatErrorMessage = `The format is \`!${outcome} [id] [reason]\`. Please try again`;
  if (params.length < 2) return msg.reply(formatErrorMessage);

  const id = params.shift();
  const feedback = params.join(" ");

  let results = await apolloClient.query({
    query: gql`
      query whitelist($id: ID) {
        whitelist(id: $id) {
          status
          displayName
        }
      }
    `,
    variables: { id },
  });

  if (results.data.whitelist.status !== "SUBMITTED") {
    return msg.reply(
      `Application **${id}** is currently not ready for review. The current status is **${results.data.whitelist.status}**`
    );
  }

  let displayName = results.data.whitelist.displayName;

  try {
    let remoteOutcome;
    switch (outcome) {
      case "accept":
        remoteOutcome = "ACCEPTED";
        break;
      case "info":
        remoteOutcome = "REQUEST_FOR_INFO";
        break;
      case "decline":
        remoteOutcome = "DENIED";
        break;
    }

    await apolloClient.mutate({
      mutation: gql`
        mutation reviewWhitelist(
          $id: ID
          $outcome: String!
          $feedback: String!
        ) {
          reviewWhitelist(id: $id, outcome: $outcome, feedback: $feedback) {
            id
          }
        }
      `,
      variables: { outcome: remoteOutcome, feedback, id },
    });
  } catch (e) {
    console.log(e.networkError.response);
    return msg.reply(
      `There was an error updating application **${id}** for ** ${displayName}. Please check and try again.`
    );
  }

  return msg.reply(
    `Application **${id}** for **${displayName}** has been updated to ${outcome}.`
  );
};
