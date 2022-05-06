import { PaginationParams, DiscussionsQuery } from '../../lib/types/common';
import { GUser, GRepositoryDiscussion, GError, GMultipleErrors } from '../../lib/types/github';
import { parseRepoWithOwner } from '../../lib/utils';
import { GITHUB_GRAPHQL_API_URL } from '../config';

const DISCUSSIONS_QUERY = `
  repository(owner: $owner, name: $name) {
    discussions(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        id
        url
        title
        bodyHTML
        locked
        repository {
          nameWithOwner
        }
        reactions {
          totalCount
        }
        reactionGroups {
          content
          users {
            totalCount
          }
          viewerHasReacted
        }
        comments(last: 1) {
          totalCount
          pageInfo {
            startCursor
            hasNextPage
            hasPreviousPage
            endCursor
          }
          nodes {
            id
            upvoteCount
            viewerHasUpvoted
            viewerCanUpvote
            author {
              avatarUrl
              login
              url
            }
            viewerDidAuthor
            createdAt
            url
            authorAssociation
            lastEditedAt
            deletedAt
            isMinimized
            body
            reactionGroups {
              content
              users {
                totalCount
              }
              viewerHasReacted
            }
            replies(last: 1) {
              totalCount
              nodes {
                id
                author {
                  avatarUrl
                  login
                  url
                }
                viewerDidAuthor
                createdAt
                url
                authorAssociation
                lastEditedAt
                deletedAt
                isMinimized
                body
                reactionGroups {
                  content
                  users {
                    totalCount
                  }
                  viewerHasReacted
                }
                replyTo {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface GetDiscussionsParams extends PaginationParams, DiscussionsQuery {}

const GET_DISCUSSIONS_QUERY = `
  query($owner: String! $name: String!) {
    viewer {
      avatarUrl
      login
      url
    }
    ${DISCUSSIONS_QUERY}
  }`;

interface GetDiscussionsResponse {
  data: {
    viewer: GUser;
    repository: {
      discussions: {
        nodes: Array<GRepositoryDiscussion>;
      };
    };
  };
}

export async function getDiscussions(
  params: GetDiscussionsParams,
  token: string,
): Promise<GetDiscussionsResponse | GError | GMultipleErrors> {
  const { repo: repoWithOwner, ...pagination } = params;

  // Force repo to lowercase to prevent GitHub's bug when using category in query.
  // https://github.com/giscus/giscus/issues/118
  const repo = repoWithOwner.toLowerCase();
  const query = `repo:${repo}`;
  const gql = GET_DISCUSSIONS_QUERY;

  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },

    body: JSON.stringify({
      query: gql,
      variables: {
        repo,
        query,
        ...parseRepoWithOwner(repo), // returns { owner, name }
        ...pagination,
      },
    }),
  }).then((r) => r.json());
}
