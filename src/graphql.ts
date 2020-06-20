import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import * as ws from "ws";
import fetch from "node-fetch";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

const api = "://www.madhouseminers.com/graphql";
const httpLink = new HttpLink({
  uri: `https${api}`,
  fetch,
  headers: { authorization: process.env.GRAPHQL_TOKEN },
});
const wsLink = new WebSocketLink({
  uri: `wss${api}`,
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
