import type { NextApiRequest, NextApiResponse } from 'next';
import { getDiscussions } from '../../../services/github/getDiscussions';
import { adaptDiscussion } from '../../../lib/adapter';
import { IError, IGiscussions } from '../../../lib/types/adapter';

import { getAppAccessToken } from '../../../services/github/getAppAccessToken';
import { addCorsHeaders } from '../../../lib/cors';

async function get(req: NextApiRequest, res: NextApiResponse<IGiscussions | IError>) {
  const params = {
    repo: req.query.repo as string,
    number: +req.query.number,
    categoryId: req.query.categoryId as string,
    category: req.query.category as string,
    term: req.query.term as string,
    first: +req.query.first,
    last: +req.query.last,
    after: req.query.after as string,
    before: req.query.before as string,
  };
  if (!params.last && !params.first) {
    params.first = 20;
  }

  const userToken = req.headers.authorization?.split('Bearer ')[1];
  let token = userToken;
  if (!token) {
    try {
      token = await getAppAccessToken(params.repo);
    } catch (error) {
      res.status(403).json({ error: error.message });
      return;
    }
  }

  const response = await getDiscussions(params, token);

  if ('message' in response) {
    if (response.message.includes('Bad credentials')) {
      res.status(403).json({ error: response.message });
      return;
    }
    res.status(500).json({ error: response.message });
    return;
  }

  if ('errors' in response) {
    const error = response.errors[0];
    if (error?.message?.includes('API rate limit exceeded')) {
      let message = `API rate limit exceeded for ${params.repo}`;
      if (!userToken) {
        message += '. Sign in to increase the rate limit';
      }
      res.status(429).json({ error: message });
      return;
    }

    console.error(response);
    const message = response.errors.map?.(({ message }) => message).join('. ') || 'Unknown error';
    res.status(500).json({ error: message });
    return;
  }

  const { data } = response;
  if (!data) {
    console.error(response);
    res.status(500).json({ error: 'Unable to fetch latest discussions' });
    return;
  }

  const viewer = data.viewer;
  const discussions = data.repository ? data.repository.discussions?.nodes : data.search?.nodes;
  const pageInfo = data.repository ? data.repository.discussions?.pageInfo : data.search?.pageInfo;
  const adapted = discussions?.map((discussion) => adaptDiscussion({ viewer, discussion }));
  res.status(200).json({ pageInfo, discussions: adapted });
}

export default async function DiscussionsApi(req: NextApiRequest, res: NextApiResponse) {
  addCorsHeaders(req, res);
  if (req.method === 'GET') {
    await get(req, res);
  }
}
