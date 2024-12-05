import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { BiPlusCircle } from "react-icons/bi";
const App = () => {
  const [readableContent, setReadableContent] = useState("");
  const [error, setError] = useState(null);
  const [editableContent, setEditableContent] = useState("");

  useEffect(() => {
    fetch("/Original Tex.tex")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch the LaTeX file: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((latexContent) => {
        const parsedContent = parseLatexToReadableText(latexContent);
        setReadableContent(parsedContent);
        setEditableContent(parsedContent);
      })
      .catch((err) => {
        console.error("Error processing the LaTeX file:", err);
        setError(err.message);
      });
  }, []);

  const parseLatexToReadableText = (latex) => {
    const locationMatch = latex.match(/\\mbox\{(.*?Location)\}/);
    const location = locationMatch ? locationMatch[1] : "";
    const nameMatch = latex.match(
      /\\fontsize\{\d+\s*pt\}\{\d+\s*pt\}\\selectfont\s*(.+)/
    );
    const name = nameMatch ? nameMatch[1] : "";
    return (
      latex
        .replace(/%.*$/gm, "")
        .replace(/\\usepackage$$.*?$$\{.*?\}/g, "")
        .replace(/\\usepackage\[[^\]]*\]\{[^\}]*\}/g, "")
        .replace(
          /\\documentclass\[[^\]]*\]\{[^\}]*\}/g,
          "\\documentclass{article}"
        )
        .replace(/\\newcommand\{\\AND\}[\s\S]*?\\sbox\\ANDbox\{\$\|\$\}/g, "")
        .replace(
          /\\begin\{header\}[\s\S]*?\\fontsize\{25 pt\}\{25 pt\}/g,
          `<h1 class='name'>${name}</h1>`
        )
        .replace(/\\newcommand\{\\placelastupdatedtext\}[\s\S]*?}%/g, "")
        .replace(/\\documentclass.*?\\begin\{document\}/gs, "")
        .replace(/\\definecolor\{[^\}]*\}\{[^\}]*\}\{[^\}]*\}/g, "")
        .replace(/pdftitle=(.*?),/g, "")
        .replace(/pdfauthor=(.*?),/g, "")
        .replace(/pdfcreator=(.*?)[,\]]/g, "")
        //  .replace(/\\raggedright/g, "<div class='items-end'>")
        .replace(
          /\\AtBeginEnvironment\{adjustwidth\}\{\\partopsep0pt\}/g,
          "<div>"
        )
        .replace(
          /\\pagestyle\{empty\}/g,
          "<header style='display: none;'></header><footer style='display: none;'></footer>"
        ) // Hide header/footer
        .replace(
          /\\setcounter\{secnumdepth\}\{0\}/g,
          "<section style='counter-reset: section;'>"
        )
        .replace(/\\setlength\{\\parindent\}\{0pt\}/g, "")
        .replace(/\\setlength\{\\topskip\}\{0pt\}/g, "")
        .replace(/\\setlength\{\\columnsep\}\{0.15cm\}/g, "")
        .replace(/\\pagenumbering\{gobble\}/g, "")
        .replace(
          /\\titleformat\{\\section\}\{.*?\}\{.*?\}\{.*?\}\{.*?\}\[.*?\]/g,
          "<style>.section { font-weight: bold; font-size: larger; margin-top: 0.3cm; margin-bottom: 0.2cm; border-bottom: 1px solid; }</style>"
        ) // Format the section with bold, large font, top/bottom spacing, and a border
        .replace(/\\titlespacing\{\\section\}\{.*?\}\{.*?\}\{.*?\}/g, "")
        // .replace(/\\newenvironment\{header\}\{.*?\}\{.*?\}/g, "")

        .replace(
          /\\normalsize\s*([\s\S]*?)\\end\{header\}/g,
          (_, content) => `<div class=' '>${location}${content}</div>`
        )

        .replace(
          /\\section\{(.*?)\}/g,
          (_, title) => `
          <h2 class="section-title">${title}</h2>
         `
        )
        .replace(
          /\\subsection\{(.*?)\}/g,
          (_, title) => `<h3 class="subsection-title">${title}</h3>`
        )

        .replace(
          /\\begin\{twocolentry\}\{([\s\S]*?)\}([\s\S]*?)\\end\{twocolentry\}/g,
          (_, leftContent, rightContent) => `
            <div class="twocol">
            <div class="twocol2 text-right">${rightContent.trim()}</div>
              <div class="twocol1">${leftContent.trim()}</div>
              
            </div>
          `
        )

        // Handle three-column entries
        .replace(
          /\\begin\{threecolentry\}\{(.*?)\}\{(.*?)\}/g,
          '<div class="three-col-entry flex flex-row justify-between"><div class="col left">$1</div><div class="col middle">$2</div><div class="col right">'
        )
        .replace(/\\end\{threecolentry\}/g, "</div></div>")

        // Handle one-column entries
        .replace(/\\begin\{onecolentry\}/g, '<div class="one-col-entry">')
        .replace(/\\end\{onecolentry\}/g, "</div>")

        // Handle lists
        .replace(/\\begin\{highlights\}/g, '<ul class="highlights">')
        .replace(/\\end\{highlights\}/g, "</ul>")
        .replace(/\\begin\{itemize\}/g, '<ul class="highlights">')
        .replace(/\\end\{itemize\}/g, "</ul>")
        .replace(/\\begin\{enumerate\}/g, "<ol>")
        .replace(/\\end\{enumerate\}/g, "</ol>")
        .replace(/\\item/g, "<li>")
        .replace(/<\/li>\s*<li>/g, "</li><li>")

        // Handle text formatting
        .replace(/\\textbf\{(.*?)\}/g, (_, text) => `<strong>${text}</strong>`)
        .replace(/\\textit\{(.*?)\}/g, (_, text) => `<em>${text}</em>`)

        // Handle links
        .replace(
          /\\href\{(.*?)\}\{(.*?)\}/g,
          (_, url, text) => `<a href="${url}" target="_blank">${text}</a>`
        )
        .replace(
          /\\url\{(.*?)\}/g,
          (_, url) => `<a href="${url}" target="_blank">${url}</a>`
        )
        // Handle spacing and separators
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
        .replace(/[\{\}]/g, "")
        .trim()
    );
  };

  const handleEditableChange = (content) => {
    setEditableContent(content);
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-4xl font-bold text-center mb-4">Resume Builder</h1>

      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="editor-container">
          <Editor
            apiKey="a5g7ccvo5429e35quzkq9hhv0zkfzvwblq0neht24wqxe5kt"
            value={editableContent}
            onEditorChange={handleEditableChange}
            init={{
              width: "100%",
              height: "100vh",
              menubar: true,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "table",
                "help",
                "wordcount",
                "save",
                "template",
                "paste",
                "textpattern",
                "imagetools",
                "nonbreaking",
                "quickbars",
                "visualchars",
                "directionality",
                "autosave",
                "codesample",
                "hr",
                "pagebreak",
                "print",
                "importcss",
                "noneditable",
              ],
              toolbar: [
                "save zoomout zoomin  undo redo  bold italic underline strikethrough  alignleft aligncenter alignright alignjustify  bullist numlist  outdent indent  forecolor backcolor removeformat pagebreak charmap fullscreen preview insertfile image link ltr rtl hr searchreplace print", // Add custom zoom buttons
              ],
              save_enablewhendirty: true,
              save_onsavecallback: () => {
                console.log("content saved");
              },
              setup: (editor) => {
                // Zoom In Button
                editor.ui.registry.addButton("zoomin", {
                  icon: "zoom-in",
                  tooltip: "Zoom In",
                  onAction: () => {
                    const currentZoom = parseFloat(
                      editor.getBody().style.zoom || 1
                    );
                    editor.getBody().style.zoom = currentZoom + 0.1;
                  },
                });

                // Zoom Out Button
                editor.ui.registry.addButton("zoomout", {
                  icon: "zoom-out",
                  tooltip: "Zoom Out",
                  onAction: () => {
                    const currentZoom = parseFloat(
                      editor.getBody().style.zoom || 1
                    );
                    editor.getBody().style.zoom = Math.max(
                      currentZoom - 0.1,
                      0.1
                    ); // Prevent zooming out too far
                  },
                });
              },
              content_style: `
                body {
                  margin: 0;
                  padding: 0;
                  
                  justify-content: center;
                  
                }
                .mce-content-body {
                  width: 210mm;
                 
                  padding: 20mm;
                  margin: auto;
                  background: white;
                  border: 1px solid #ddd;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  box-sizing: border-box;
                }
                  .container {
  max-width: 21cm;
  margin: 0 auto;
  padding: 2cm;
  width: 8.5in;
  height: 11in;
  background: blue;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.twocol {
  display: flex;
  justify-content: space-between; /* Ensures even spacing between columns */
  align-items: center; /* Aligns items vertically */
  padding: 10px 0; /* Optional: Adds spacing */
}

.twocol1 {
  flex: 1; /* Adjusts width of the left column to take available space */
  text-align: right; /* Aligns text to the left */
}

.twocol2 {
  flex: 1; 
  text-align: left; /* Aligns text to the right */
}

.vspace {
  margin-top: 10px;
}

.vspace-lg {
  margin-top: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.header {
  text-align: center;
  padding: 20px 0;
}

.header h1 {
  font-size: 25pt;
  margin-bottom: 5px;
  font-weight: bold;
}

.contact-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin: 10px 0;
}
.name{
  text-align: center;
}
.separator {
  color: #999;
  margin: 0 5px;
}

.section-title {
  font-size: 1.2em;
  font-weight: bold;
  border-bottom: 1px solid #000;
  
  margin: 0 0 10px 0;
}

.subsection-title {
  font-size: 1.1em;
  font-weight: bold;
  margin: 10px 0;
}

.two-col-entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 5px 0;
}

.three-col-entry {
  display: grid;
  grid-template-columns: 1fr auto 4.5cm;
  gap: 10px;
  margin: 5px 0;
}

.col.left {
  flex-grow: 1;
}

.col.middle {
  text-align: center;
}

.col.right {
  width: 4.5cm;
  text-align: right;
}

.one-col-entry {
  margin: 5px 0;
}

.highlights {
  list-style-type: disc;
  padding-left: 20px;
  margin: 5px 0;
}

.highlights li {
  margin: 3px 0;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.vspace {
  margin-top: 10px;
}

.vspace-lg {
  margin-top: 20px;
}

.cv-content {
  font-family: 'Charter', serif;
  line-height: 1.5;
  color: #333;
}

strong {
  font-weight: bold;
}

.error {
  color: red;
  text-align: center;
  padding: 20px;
}

@media print {
  .container {
    padding: 0;
    box-shadow: none;
  }
  
  .title {
    display: none;
  }
}
              `,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;

