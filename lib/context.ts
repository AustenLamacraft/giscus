import { createContext } from 'react';
import { CommentOrder, InputPosition } from './types/giscus';
import { Theme } from './variables';

interface IAuthContext {
  token: string;
  origin: string;
  getLoginUrl: (origin: string) => string;
}

export function getLoginUrl(origin: string) {
  return `/api/oauth/authorize?redirect_uri=${encodeURIComponent(origin)}`;
}

export const AuthContext = createContext<IAuthContext>({
  token: '',
  origin: '',
  getLoginUrl,
});

interface IThemeContext {
  theme: Theme;
  setTheme?: (theme: Theme) => void;
}

export const ThemeContext = createContext<IThemeContext>({
  theme: 'light',
});

interface IConfigContext {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  term: string;
  description: string;
  number: number;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: InputPosition;
  defaultCommentOrder: CommentOrder;
  discussionsSummary: boolean;
}

export const ConfigContext = createContext<IConfigContext>({
  repo: '',
  repoId: '',
  category: '',
  categoryId: '',
  term: '',
  description: '',
  number: 0,
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: 'bottom',
  defaultCommentOrder: 'oldest',
  discussionsSummary: false,
});
