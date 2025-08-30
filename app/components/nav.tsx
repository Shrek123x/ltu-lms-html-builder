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

    return (
        <nav aria-label="Primary" className="nav">
            <button
                aria-expanded={open}
                aria-controls="primary-menu"
                onClick={() => setOpen(o => !o)}
                className="menu-button"
            >Menu</button>
            <ul id="primary-menu" hidden={!open} className="menu-list">
                {[
                    { href: "/", label: "Home" },
                    { href: "/tabs", label: "Escape Room" },
                    { href: "/escape-room", label: "Coding Races" },
                    { href: "/court-room", label: "Court Room" },
                    { href: "/about", label: "About" },
                ].map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={active === item.href ? "page" : undefined}
                            onClick={() => setCookie("activeNav", item.href)}
                        >{item.label}</Link>
                    </li>
                ))}
            </ul>
            <style jsx>{`
                .menu-button { border:1px solid; padding:.25rem .5rem; background:none; }
                .menu-list { list-style:none; padding:0; margin:.5rem 0 0; display:flex; gap:.75rem; flex-wrap:wrap; }
                @media (min-width: 720px) { .menu-list { display:flex !important; } .menu-button { display:none; } }
                [aria-current="page"] { font-weight: 700; text-decoration: underline; }
            `}</style>
        </nav>
    );
}