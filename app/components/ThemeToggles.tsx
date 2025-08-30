"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<string>("system");
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "system";
        setTheme(saved);
        apply(saved);
    }, []);

    function apply(next: string) {
        const root = document.documentElement;
        root.dataset.theme = next;
        if (next === "light") root.style.colorScheme = "light";
        else if (next === "dark") root.style.colorScheme = "dark";
        else root.style.removeProperty("color-scheme");
    }

    function cycle() {
        const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
        setTheme(next); localStorage.setItem("theme", next); apply(next);
    }
    
    return <button onClick={cycle} aria-label="Toggle theme">Theme: {theme}</button>
}