export const parseLatexToReadableText = (latex) => {
  const nameMatch = latex.match(
    /\\fontsize\{\d+\s*pt\}\{\d+\s*pt\}\\selectfont\s*(.+)/
  );
  const name = nameMatch ? nameMatch[1] : "";
  const locationMatch = latex.match(/\\mbox\{(.*?Location)\}/);
  const location = locationMatch ? locationMatch[1] : "";
  
  return latex
    .replace(/%.*$/gm, "")
    .replace(/\\usepackage\[[^\]]*\]\{[^\}]*\}/g, "")
    .replace(/\\documentclass\[[^\]]*\]\{[^\}]*\}/g, "\\documentclass{article}")
    .replace(/\\newcommand\{\\AND\}[\s\S]*?\\sbox\\ANDbox\{\$\|\$\}/g, "")
    .replace(/\\newcommand\{\\placelastupdatedtext\}[\s\S]*?}%/g, "")
    .replace(/\\documentclass.*?\\begin\{document\}/gs, "")
    .replace(/\\definecolor\{[^\}]*\}\{[^\}]*\}\{[^\}]*\}/g, "")
    .replace(
      /\\normalsize\s*([\s\S]*?)\\end\{header\}/g,
      (_, content) => `<h1 class='name'>${name}</h1>
      <div class=' '>${location}${content}</div>`
    )
    .replace(/\\fontsize\{\d+\s*pt\}\{\d+\s*pt\}\\selectfont\s*(.+)/, "")
    .replace(/\\normalsize\s*([\s\S]*?)\\end\{center\}/g, (_, content) => {
      return `
          <div class='contact-details'>
            <h1>${name}</h1>
            <div class=''>${content}</div>
          </div>
        `;
    })
    .replace(/\[leftmargin=\*\]/, "")
    .replace(
      /\\section\{(.*?)\}/g,
      (_, title) => `<h2 class="section-title">${title}</h2>`
    )
    .replace(/\[leftmargin=\*\]/, "")
    .replace(
      /\\subsection\{(.*?)\}/g,
      (_, title) => `<h3 class="subsection-title">${title}</h3>`
    )
    .replace(
      /\\begin\{twocolentry\}\{(.*?)\}/g,
      (_, right) =>
        `<div class="two-col-entry flex flex-row justify-between"><div class="col left">`
    )
    .replace(/\\end\{twocolentry\}/g, "</div></div>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(
      /\\begin\{threecolentry\}\{(.*?)\}\{(.*?)\}/g,
      '<div class="three-col-entry flex flex-row justify-between"><div class="col left">$1</div><div class="col middle">$2</div><div class="col right">'
    )
    .replace(/\\end\{threecolentry\}/g, "</div></div>")
    .replace(/\\begin\{onecolentry\}/g, '<div class="one-col-entry">')
    .replace(/\\end\{onecolentry\}/g, "</div>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\begin\{highlights\}/g, '<ul class="highlights">')
    .replace(/\\end\{highlights\}/g, "</ul>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\begin\{itemize\}/g, '<ul class="highlights">')
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\end\{itemize\}/g, "</ul>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\begin\{enumerate\}/g, "<ol>")
    .replace(/\\end\{enumerate\}/g, "</ol>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\item/g, "<li>")
    .replace(/<\/li>\s*<li>/g, "</li><li>")
    .replace(/\[leftmargin=\*\]/, "")
    .replace(/\\textbf\{(.*?)\}/g, (_, text) => `<strong>${text}</strong>`)
    .replace(/\\textit\{(.*?)\}/g, (_, text) => `<em>${text}</em>`)
    .replace(
      /\\href\{(.*?)\}\{(.*?)\}/g,
      (_, url, text) => `<a href="${url}" target="_blank">${text}</a>`
    )
    .replace(
      /\\url\{(.*?)\}/g,
      (_, url) => `<a href="${url}" target="_blank">${url}</a>`
    )
    .replace(/\\AND/g, '<span class="separator">|</span>')
    .replace(
      /\\kern\s*([\d.]+)\s*pt/g,
      (_, spacing) => `<span style="margin-left: ${spacing}pt;"></span>`
    )
    .replace(
      /\\vspace\{(.*?)\}/g,
      (_, spacing) =>
        `<div class="vspace" style="margin-top: ${spacing};"></div>`
    )
    .replace(/\\newline|\\\\/g, "<br>")
    .replace(/\s{2,}/g, " ")
    .replace(/\\[a-zA-Z]+\*?\{.*?\}/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\\%/g, '<span>%</span>')
    .replace(/[\{\}]/g, ""); 
};
