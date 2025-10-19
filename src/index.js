import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import "./index.css";
import App from "./App";

const BASE_URL = process.env.REACT_APP_API_URL || "https://jsramverk-boba24-d7a5f7cjfthdbycb.northeurope-01.azurewebsites.net";
const httpLink = createHttpLink({ uri: `${BASE_URL}/graphql` });

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);