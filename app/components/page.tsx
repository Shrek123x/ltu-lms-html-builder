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

	return (
		<section>
			<h1>Tabs HTML5 Generator</h1>
			<p>This tool generates standalone HTML5 + JS with inline CSS for a tabs widget. You can copy and paste this code into Moodle or a .html file.</p>
			<textarea
				value={output}
				readOnly
				rows={20}
				style={{ width: "100%", fontFamily: "monospace", fontSize: "0.95em" }}
				aria-label="Generated HTML code"
			/>
			<br />
			<button onClick={handleCopy} style={{ marginTop: "1em", padding: "0.5em 1em" }}>
				{copied ? "Copied!" : "Copy to Clipboard"}
			</button>
		</section>
	);
}
