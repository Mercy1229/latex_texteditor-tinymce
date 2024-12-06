import React, { useEffect, useState, } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './App.css';
import { parseLatexToReadableText } from './components/ParsedLatext';
const App = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/generated_resume.tex")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch the LaTeX file: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then((latexContent) => {
        const parsedContent = parseLatexToReadableText(latexContent);
        setContent(parsedContent);
      })
      .catch((err) => {
        console.error("Error processing the LaTeX file:", err);
        setError(err.message);
      });
  }, []);
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],      
    },
    
  };

  return (
    <div className="app-container">
      <h1 className="page-title">Resume Builder</h1>
      {error ? (
        <p className="error-message">Error: {error}</p>
      ) : (
        <div className="editor-wrapper">
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="quill-editor"
          />
        </div>
      )}
    </div>
  );
};

export default App;



