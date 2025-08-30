import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link" // Remove unused import
import Nav from "./components/nav";

export const metadata: Metadata = {
  title: "LTU LMS HTML Builder",
  description: "Generate copy-pastable HTML+JS with inline CSS for Moodle",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const studentNumber = "21982875";
  const studentName = "Nathanule Gibb";
  return (
    <html lang="en">
      <body>
        <a href="#content" className="skip">Skip to content</a>
        <header aria-label="Site Header" className="site-header">
          <div className="brand">
            <span className="student" aria-label="studentNumber">{studentNumber}</span>
            <span className="student-name" aria-label="studentName">{studentName}</span>
            <Link href="/" className="logo">LTU Builder</Link>
          </div>
          <Nav />
        </header>
        <main id="content" className="container" role="main">{children}</main>
        <footer className="site-footer" role="contentinfo">
          <small>
            © {new Date().getFullYear()} {studentName} · {studentNumber} · {new Date().toLocaleDateString("en-AU")}
          </small>
        </footer>
      </body>
    </html>
  );
}
