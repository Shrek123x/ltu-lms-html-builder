
"use client";
import Link from "next/link"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function setCookie(name: string, value: string, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + days*24*60*60*1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=LAX`;
}
function getCookie(name: string) {
    return document.cookie.split("; ").find((row) => row.startsWith(name+"="))?.split("=")[1] ?? "";
}
export default function Nav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string>("/");

    useEffect(() => {
        const saved = decodeURIComponent(getCookie("activeNav"));
        if (saved) setActive(saved);
    }, []);

    useEffect(() => {
        setActive(pathname);
        setCookie("activeNav", pathname);
    }, [pathname]);
//This section was assited by github copilot
    return (
        <nav aria-label="Primary" className="nav">
            <button
                aria-expanded={open}
                aria-controls="primary-menu"
                onClick={() => setOpen(o => !o)}
                className="menu-button"
                style={{
                  border: '1px solid #888',
                  padding: '.5rem 1rem',
                  background: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1em',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  marginRight: '.5rem',
                  display: 'inline-block',
                }}
                aria-label="Open navigation menu"
            >
                &#9776; Menu
            </button>
            <ul
                id="primary-menu"
                className="menu-list"
                style={{
                  position: 'absolute',
                  top: '3.2rem',
                  left: '1rem',
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
                  padding: '1rem',
                  margin: 0,
                  listStyle: 'none',
                  display: open ? 'block' : 'none',
                  zIndex: 100,
                  minWidth: '180px',
                }}
            >
                {[
                    { href: "/", label: "Home" },
                    { href: "/tabs", label: "Tabs" },
                    { href: "/escape-room", label: "Escape Room" },
                    { href: "/coding-races", label: "Coding Races" },
                    { href: "/court-room", label: "Court Room" },
                    { href: "/about", label: "About" },
                ].map((item) => (
                    <li key={item.href} style={{ marginBottom: '.75rem' }}>
                        <Link
                            href={item.href}
                            aria-current={active === item.href ? "page" : undefined}
                            onClick={() => { setCookie("activeNav", item.href); setOpen(false); }}
                                                        style={{
                                                            display: 'block',
                                                            padding: '.5rem 1rem',
                                                            borderRadius: 8,
                                                            background: active === item.href ? 'var(--nav-active-bg, #e9ecef)' : 'none',
                                                            fontWeight: active === item.href ? 700 : 500,
                                                            color: 'var(--nav-link-color, #222)',
                                                            textDecoration: 'none',
                                                            transition: 'background 0.2s, color 0.2s',
                                                        }}
                        >{item.label}</Link>
                    </li>
                ))}
            </ul>
                        <style jsx>{`
                                :root {
                                    --nav-link-color: #222;
                                    --nav-active-bg: #e9ecef;
                                }
                                [data-theme="dark"] {
                                    --nav-link-color: #f8f8f8;
                                    --nav-active-bg: #222;
                                }
                                .menu-button { }
                                @media (min-width: 720px) {
                                    .menu-list {
                                        position: static !important;
                                        display: flex !important;
                                        background: none !important;
                                        box-shadow: none !important;
                                        padding: 0 !important;
                                        min-width: 0 !important;
                                    }
                                    .menu-button { display:none !important; }
                                    .menu-list li { margin-bottom: 0 !important; }
                                    .menu-list a { padding: .5rem .75rem !important; }
                                }
                                [aria-current="page"] { font-weight: 700; text-decoration: underline; }
                        `}</style>
        </nav>
    );
}