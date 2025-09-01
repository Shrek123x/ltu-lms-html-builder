"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
    const pathname = usePathname();
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = parts.map((seq, i) => ({
        href: "/" + parts.slice(0, i+1).join("/"),
        label: seq.replace(/-/g, " "),
    }));
    return (
        <nav aria-label="Breadcrumb" className="breadcrumbs">
            <ol>
                <li><Link href="/">Home</Link></li>
                {crumbs.map((c, i) => (
                    <li key={c.href} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                        {i === crumbs.length - 1 ? c.label : <Link href={c.href}>{c.label}</Link>}
                    </li>
                ))}
            </ol>
            <style jsx>{`
                .breadcrumbs ol{display:flex; gap:.5rem; list-style:none; pading:0; margin:0;}
                .breadcrumbs li+li:before{content:"/"; margin:0 .25rem;}
            `}</style>
        </nav>
    );
}