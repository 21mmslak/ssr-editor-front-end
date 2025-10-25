import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const BASE_URL = (process.env.REACT_APP_API_URL || "https://jsramverk-boba24-d7a5f7cjfthdbycb.northeurope-01.azurewebsites.net").replace(/\/+$/,"");
const httpLink = createHttpLink({ uri: `${BASE_URL}/graphql` });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return { headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
