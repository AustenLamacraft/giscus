// import { unified } from 'unified';
// import parse from 'remark-parse';
// import remarkRehype from 'remark-rehype';
// import math from 'remark-math';
// import katex from 'rehype-katex';
// import rehypeStringify from 'rehype-stringify';
// import rehypeDocument from 'rehype-document';

import { micromark } from 'micromark';
import { math, mathHtml } from 'micromark-extension-math';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

export function renderMarkdown(text: string) {
  return micromark(text, {
    allowDangerousHtml: true,
    extensions: [gfm(), math()],
    htmlExtensions: [gfmHtml(), mathHtml({ throwOnError: false })],
  });
}
