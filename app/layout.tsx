import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link" // Remove unused import
import Nav from "./components/nav";
import ThemeToggle from "./components/ThemeToggles";

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
        <header aria-label="Site Header" className="site-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand">
            <span className="student" aria-label="studentNumber">{studentNumber}</span>
            <span className="student-name" aria-label="studentName">{studentName}</span>
            <Link href="/" className="logo">LTU Builder</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Nav />
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              background: 'var(--bubble-bg, #f3f3f3)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              border: '1px solid var(--bubble-border, #ccc)',
              marginLeft: '1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--bubble-text, #222)',
              letterSpacing: '0.02em',
            }}>
              <ThemeToggle />
            </div>
          </div>
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
