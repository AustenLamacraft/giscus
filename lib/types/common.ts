export interface PaginationParams {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export interface DiscussionQuery {
  repo: string;
  term: string;
  number: number;
  category: string;
}

export interface DiscussionsQuery {
  repo: string;
  number: number;
  categoryId: string;
}
