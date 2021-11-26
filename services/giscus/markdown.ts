import { unified } from 'unified';
import parse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import math from 'remark-math';
import katex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';

export function renderMarkdown(text: string) {
  return unified()
    .use(parse)
    .use(math)
    .use(remarkRehype)
    .use(katex)
    .use(rehypeDocument, {
      css: 'https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css'
    })
    .use(rehypeStringify)
    .process(text)
    .then((file) => file.toString());
}
