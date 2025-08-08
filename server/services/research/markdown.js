const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

async function renderMarkdownToHtml(markdown) {
  return md.render(markdown || '');
}

module.exports = { renderMarkdownToHtml };

