import { gql } from "@apollo/client";
import { client } from "./apolloClient";
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://jsramverk-boba24-d7a5f7cjfthdbycb.northeurope-01.azurewebsites.net";

export async function getDocuments() {
  const { data, errors } = await client.query({
    query: gql`
      query GetDocuments {
        documents {
          _id
          title
          content
          updatedAt
          createdAt
        }
      }
    `,
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });
  if (errors?.length) console.error(errors);
  return data?.documents ?? [];
}

export async function getDocument(id) {
  const { data } = await client.query({
    query: gql`
      query GetDocument($id: ID!) {
        document(id: $id) {
          _id
          title
          content
          updatedAt
          createdAt
        }
      }
    `,
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (!data.document) throw new Error("Dokument hittades inte");
  return data.document;
}

export async function addDocumentApi({ title = "", content = "" }) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation CreateDocument($title: String!, $content: String!) {
        createDocument(title: $title, content: $content) {
          _id
          title
          content
          updatedAt
          createdAt
        }
      }
    `,
    variables: { title, content: content ?? "" },
    errorPolicy: "all",
  });

  if (errors?.length) {
    console.error("GraphQL errors (createDocument):", errors);
    throw new Error(errors[0].message);
  }
  return data.createDocument;
}

export async function updateDocument(_id, patch) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation UpdateDocument($id: ID!, $title: String!, $content: String!) {
        updateDocument(id: $id, title: $title, content: $content) {
          _id
          title
          content
          updatedAt
          createdAt
        }
      }
    `,
    variables: {
      id: _id,
      title: patch.title ?? "",
      content: patch.content ?? "",
    },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message || "Update failed");
  return data.updateDocument;
}

export async function deleteDocument(_id) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation DeleteDocument($id: ID!) {
        deleteDocument(id: $id)
      }
    `,
    variables: { id: _id },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message);
  return !!data.deleteDocument;
}

export async function addCollaborator(_id, email) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation AddCollaborator($id: ID!, $email: String!) {
        addCollaborator(id: $id, email: $email)
      }
    `,
    variables: { id: _id, email },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message);
  return !!data.addCollaborator;
}

export async function registerApiCall({ email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error, status: ${res.status}`);
  }

  return await res.json();
}

export async function loginApiCall({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error, status: ${res.status}`);
  }

  return await res.json();
}

