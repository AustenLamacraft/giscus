import { DiscussionQuery, PaginationParams } from '../../lib/types/common';
import { GUser, GRepositoryDiscussion, GError, GMultipleErrors } from '../../lib/types/github';
import { parseRepoWithOwner } from '../../lib/utils';
import { GITHUB_GRAPHQL_API_URL } from '../config';

const DISCUSSIONS_QUERY = `
    nodes {
        title
        createdAt
        updatedAt
        comments(last: 1) {
            nodes {
                author {
                    login
                }
                createdAt
                updatedAt
                replies(last: 1) {
                    nodes {
                        author {
                            login
                        }
                    createdAt
                    updatedAt
                    }
                }
            }
        }
    }`;

// const SEARCH_QUERY = `
//   search(type: DISCUSSION last: 1 query: $query) {
//     discussionCount
//     nodes {
//       ... on Discussion {
//         ${DISCUSSIONS_QUERY}
//       }
//     }
//   }`;

const SPECIFIC_QUERY = `
  repository(owner: $owner, name: $name) {
    discussions(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
      ${DISCUSSIONS_QUERY}
    }
  }
`;

const GET_DISCUSSIONS_QUERY = `
  query($owner: String! $name: String!) {
    viewer {
      avatarUrl
      login
      url
    }
    ${SPECIFIC_QUERY}
  }`;

export interface GetDiscussionParams extends PaginationParams, DiscussionQuery {}

interface SearchResponse {
  data: {
    viewer: GUser;
    search: {
      discussionCount: number;
      nodes: Array<GRepositoryDiscussion>;
    };
  };
}

interface SpecificResponse {
  data: {
    viewer: GUser;
    repository: {
      discussion: GRepositoryDiscussion;
    };
  };
}

export type GetDiscussionResponse = SearchResponse | SpecificResponse;

export async function getDiscussions(
  params: GetDiscussionParams,
  token: string,
): Promise<GetDiscussionResponse | GError | GMultipleErrors> {
  const { repo: repoWithOwner, term, number, category, ...pagination } = params;

  // Force repo to lowercase to prevent GitHub's bug when using category in query.
  // https://github.com/giscus/giscus/issues/118
  const repo = repoWithOwner.toLowerCase();
  const categoryQuery = category ? `category:${JSON.stringify(category)}` : '';
  const query = `repo:${repo} ${categoryQuery} in:title ${JSON.stringify(term)}`;
  const gql = GET_DISCUSSION_QUERY(number ? 'number' : 'term');

  return fetch(GITHUB_GRAPHQL_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },

    body: JSON.stringify({
      query: gql,
      variables: {
        repo,
        query,
        number,
        ...parseRepoWithOwner(repo),
        ...pagination,
      },
    }),
  }).then((r) => r.json());
}