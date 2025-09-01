
"use client";
import { useState } from "react";

function generateTabsHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tabs Example</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .tab-btn { display: inline-block; padding: 8px 16px; border: 1px solid #ccc; background: #eee; cursor: pointer; margin-right: 4px; }
    .tab-btn.active { background: #fff; border-bottom: none; }
    .tab-content { border: 1px solid #ccc; padding: 16px; margin-top: -1px; }
  </style>
</head>
<body>
  <div>
    <button class="tab-btn active" onclick="showTab(0)">Tab 1</button>
    <button class="tab-btn" onclick="showTab(1)">Tab 2</button>
    <button class="tab-btn" onclick="showTab(2)">Tab 3</button>
  </div>
  <div id="tab-contents">
    <div class="tab-content" style="display:block;">Content for Tab 1</div>
    <div class="tab-content" style="display:none;">Content for Tab 2</div>
    <div class="tab-content" style="display:none;">Content for Tab 3</div>
  </div>
  <script>
    function showTab(idx) {
      var btns = document.querySelectorAll('.tab-btn');
      var contents = document.querySelectorAll('.tab-content');
      btns.forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
        contents[i].style.display = i === idx ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

export default function HomePage() {
  const [output, setOutput] = useState(generateTabsHTML());
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hello.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
// This section was assisted by github copilot
  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "flex-start", justifyContent: "flex-start", background: "var(--theme-bg, #f8f9fa)" }}>
      <div style={{ maxWidth: 600, width: "100%", background: "var(--theme-card, #fff)", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: "2rem", margin: "2rem 0 2rem 2rem" }}>
        <h1 style={{ marginBottom: "1rem", color: "var(--theme-text, #222)" }}>Tabs HTML5 Generator</h1>
        <p style={{ marginBottom: "2rem", color: "var(--theme-subtext, #555)" }}>
          This tool generates standalone HTML5 + JS with inline CSS for a tabs widget.<br />
          Copy and paste this code into Moodle or a <code>.html</code> file, or download as <code>hello.html</code>.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              border: 'none',
              background: 'var(--theme-btn, #007bff)',
              color: 'var(--theme-btn-text, #fff)',
              fontWeight: 700,
              fontSize: '1.05em',
              letterSpacing: '0.01em',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            aria-label="Copy generated code to clipboard"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              border: 'none',
              background: 'var(--theme-btn-alt, #28a745)',
              color: 'var(--theme-btn-text, #fff)',
              fontWeight: 700,
              fontSize: '1.05em',
              letterSpacing: '0.01em',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            aria-label="Download generated code as hello.html"
          >
            Download hello.html
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          rows={18}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: "1em",
            borderRadius: 8,
            border: "1px solid #bbb",
            padding: "1em",
            marginBottom: "1em",
            background: "var(--theme-code-bg, #f6f6f6)",
            color: "var(--theme-code-text, #222)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
          }}
          aria-label="Generated HTML code"
        />
        <style>{`
          :root {
            --theme-bg: #f8f9fa;
            --theme-card: #fff;
            --theme-text: #222;
            --theme-subtext: #555;
            --theme-code-bg: #f6f6f6;
            --theme-code-text: #222;
            --theme-btn: #007bff;
            --theme-btn-text: #fff;
          }
          [data-theme="dark"] {
            --theme-bg: #181a1b;
            --theme-card: #23272b;
            --theme-text: #f6f6f6;
            --theme-subtext: #ccc;
            --theme-code-bg: #23272b;
            --theme-code-text: #f6f6f6;
            --theme-btn: #0056b3;
            --theme-btn-text: #fff;
          }
        `}</style>
      </div>
    </main>
  );
}
