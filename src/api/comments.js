import { gql } from "@apollo/client";
import { client } from "./apolloClient";

export async function listComments(docId) {
  const { data, errors } = await client.query({
    query: gql`
      query Comments($docId: ID!) {
        comments(docId: $docId) {
          _id
          docId
          text
          by
          at
          resolved
          anchor { startLine startCh endLine endCh }
        }
      }
    `,
    variables: { docId },
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });
  if (errors?.length) console.error(errors);
  return data?.comments ?? [];
}

export async function createComment(docId, anchor, text) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation CreateComment($docId: ID!, $anchor: AnchorInput!, $text: String!) {
        createComment(docId: $docId, anchor: $anchor, text: $text) {
          _id
          docId
          text
          by
          at
          resolved
          anchor { startLine startCh endLine endCh }
        }
      }
    `,
    variables: { docId, anchor, text },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message);
  return data.createComment;
}

export async function updateComment(id, docId, patch = {}) {
  const { text, resolved, anchor } = patch;
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation UpdateComment($id: ID!, $docId: ID!, $text: String, $resolved: Boolean, $anchor: AnchorInput) {
        updateComment(id: $id, docId: $docId, text: $text, resolved: $resolved, anchor: $anchor) {
          _id
          text
          resolved
          anchor { startLine startCh endLine endCh }
        }
      }
    `,
    variables: { id, docId, text, resolved, anchor },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message);
  return data.updateComment;
}

export async function deleteComment(id, docId) {
  const { data, errors } = await client.mutate({
    mutation: gql`
      mutation DeleteComment($id: ID!, $docId: ID!) {
        deleteComment(id: $id, docId: $docId)
      }
    `,
    variables: { id, docId },
    errorPolicy: "all",
  });
  if (errors?.length) throw new Error(errors[0].message);
  return !!data.deleteComment;
}