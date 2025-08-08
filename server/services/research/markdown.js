const { unified } = require('unified');
const remarkParse = require('remark-parse');
const remarkGfm = require('remark-gfm');
const remarkRehype = require('remark-rehype');
const rehypeSanitize = require('rehype-sanitize');
const rehypeSlug = require('rehype-slug');
const rehypeStringify = require('rehype-stringify');

async function renderMarkdownToHtml(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown || '');
  return String(file);
}

module.exports = { renderMarkdownToHtml };

