const MarkdownIt = require('markdown-it');

// Enhanced markdown renderer with better formatting
const md = new MarkdownIt({ 
  html: false, 
  linkify: true, 
  typographer: true,
  breaks: true,
  quotes: '""\'\'',
})
.enable(['table', 'strikethrough'])
.disable(['image']); // Disable images for security

// Custom renderer for better paragraph spacing and formatting
md.renderer.rules.paragraph_open = function(tokens, idx, options, env, renderer) {
  return '<p class="mb-4 leading-relaxed text-gray-700">';
};

md.renderer.rules.heading_open = function(tokens, idx, options, env, renderer) {
  const level = tokens[idx].markup.length;
  const classes = {
    1: 'text-3xl font-bold text-[#1f4e79] font-serif mt-8 mb-4',
    2: 'text-2xl font-bold text-[#1f4e79] font-serif mt-6 mb-3', 
    3: 'text-xl font-bold text-[#1f4e79] font-serif mt-4 mb-2',
    4: 'text-lg font-bold text-[#1f4e79] mt-4 mb-2',
    5: 'text-base font-bold text-[#1f4e79] mt-3 mb-2',
    6: 'text-sm font-bold text-[#1f4e79] mt-3 mb-2'
  };
  return `<h${level} class="${classes[level] || classes[6]}">`;
};

md.renderer.rules.strong_open = function() {
  return '<strong class="font-bold text-[#1f4e79]">';
};

md.renderer.rules.blockquote_open = function() {
  return '<blockquote class="border-l-4 border-[#D4AF37] pl-4 italic text-gray-600 my-4">';
};

md.renderer.rules.bullet_list_open = function() {
  return '<ul class="list-disc pl-6 mb-4 space-y-1">';
};

md.renderer.rules.ordered_list_open = function() {
  return '<ol class="list-decimal pl-6 mb-4 space-y-1">';
};

md.renderer.rules.code_inline = function(tokens, idx) {
  return `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">${tokens[idx].content}</code>`;
};

md.renderer.rules.fence = function(tokens, idx) {
  const token = tokens[idx];
  return `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code class="text-sm font-mono">${token.content}</code></pre>`;
};

async function renderMarkdownToHtml(markdown) {
  if (!markdown || !markdown.trim()) {
    return '<p class="text-gray-500">No content available</p>';
  }
  
  // Clean up the markdown first
  const cleanMarkdown = markdown
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
    .trim();
  
  return md.render(cleanMarkdown);
}

module.exports = { renderMarkdownToHtml };

