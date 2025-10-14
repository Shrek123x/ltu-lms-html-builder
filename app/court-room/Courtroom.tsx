'use client';

import { timeStamp } from "console";
import React, { useEffect, useRef, useState} from "react";

/**
 * CourtRoom Components
 * 
 * "use client" enables client-side React features (state, effects, and timers)
 * Renders background image area and a control panel with manual timer controls
 * Shows a simple message list
 * 
 */

/* data types */

type MessageLevel = "info" | "warning" | "urgent";

type Message = {
    id: string;             //stable id for React keys and dedupe
    text: string;           //message body
    from?: string;          // who sent the message
    level: MessageLevel;    //Severity of the message
    timestamp: number;      //created at (ms)
    resolved?: boolean;     // true when user resolves the issue
    escalations?: number;  //how many times we've escalated/reminded 
    nextRemindAt?: number; // ms timestamp for next reminder/escalation check
};

// Confiqureation 
const DEMO_REMIND_MIN_MS = 20_000; // 20 SECs (demo)
const DEMO_REMIND_MAX_MS = 30_000; // 30 SECs (demo)
const ESCALATION_STEPS = ["info", "warning", "urgent"] as const; // escalation order

//generate a reasonable unique ID (timestamp + random)
function genID(prefix = "msg") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// pick a random ms between min and max (INCLUSIVE)
function randBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// returns the next level after current, or same if already at top
function escalateLevel(level: MessageLevel): MessageLevel {
    const idx = ESCALATION_STEPS.indexOf(level);
    const nextIdx = Math.min(idx + 1, ESCALATION_STEPS.length - 1);
    return ESCALATION_STEPS[nextIdx] as MessageLevel;
}

export default function CourtRoom() {
    // timerSeconds holds the remaining seconds when the timer is running (enabled)
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    //input for manual Minutes/Seconds before starting
    const [inputMinutes, setInputMinutes] = useState<string>("0");
    const [inputSeconds, setInputSeconds] = useState<string>("30");
    // running flag
    const [running, setRunning] = useState<boolean>(false);
    // messages that will be displayed in the UI
    const [message, setMessages] = useState<Message[]>([]);
    //ref to store intervals id so we can clear it
    const intervalRef = useRef<number | null>(null);
    //Court overlay state (shows when an urgent, unresolved message triggers it)
    const [courtOverlay, setCourtOverlay] = useState<{ show: boolean; reason?: string }>({ show: false });
    // Schedular ticking interval ref (seperate from timer)
    const schedulerRef = useRef<number | null>(null);

    // helper to format seconds to mm:ss
    function formatTime(totalSeconds: number) {
        const m = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
        const s = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");
        return `${m}:${s}`
    }

    //startTimer initilizes timerSeconds from inputs and starts ticking
    function startTimer() {
        //parse inputs (fallback to 0 on invalid)
        const mins = Math.max(0, parseInt(inputMinutes || "0", 10) || 0);
        const secs = Math.max(0, parseInt(inputSeconds || "0", 10) || 0);
        const total = mins * 60 + secs;
        setTimerSeconds(total);
        setRunning(true);
    }

    //stopTimer stops the ticking and clears interval
    function stopTimer() {
        setRunning(false);
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    //reset clears timer and messages (optional function)
    function resetAll() {
        stopTimer();
        setTimerSeconds(0);
        setMessages([]);
        setInputMinutes('0');
        setInputSeconds("30");
        setCourtOverlay({ show: false });
    }

    // Tick effect: when running, setIntervals reduces timerSeconds every second
    useEffect(() => {
        if (running) {
            // clear any exsisting interval first
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
            intervalRef.current = window.setInterval(() => {
                setTimerSeconds((prev) => {
                    if (prev <= 1) {
                        // when reaching zero, stop timer and optionally add an event
                        window.clearInterval(intervalRef.current!);
                        intervalRef.current = null;
                        setRunning(false);
                        // add message to show the timer is finished
                        addMessage({
                            id: genID("sys"),
                            text: "Timer Finished",
                            from: "system",
                            level: "info",
                        });
                        return 0;
                    }
                    return prev - 1;
                });   
            }, 1000);
            // cleanup when effect re-runs or component unmounts
            return () => {
                if (intervalRef.current !== null) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
        // if not running, ensure interval is cleared
        return;
    }, [running])

    // helper to add a message to the list
    function addMessage(msg: Omit<Message, "timestamp"> & Partial<Pick<Message, "timestamp">>) {
        const m: Message = {
            id: msg.id || genID("msg"),
            text: msg.text,
            from: msg.from ?? "system",
            level: msg.level ?? "info",
            timestamp: msg.timestamp ?? Date.now(),
            resolved: msg.resolved ?? false,
            escalations: msg.escalations ?? 0,
            nextRemindAt: Date.now() + randBetween(DEMO_REMIND_MIN_MS, DEMO_REMIND_MAX_MS),
        };
        setMessages((prev) => {
        // remove any existing message with same id, then prepend the new one
        const filtered = prev.filter((x) => x.id !== m.id);
        return [m, ...filtered].slice(0, 100); // limit to 100 messages
        });
    }

    // resolve a message (user action) -> prevent further reminders for that messge
    function resolveMessage(id: string) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, resolved: true} : m)))
    }
    useEffect(() => {
        // Run scheduler only when component mounts — keep it independent of timer running
        if (schedulerRef.current !== null) return;

        schedulerRef.current = window.setInterval(() => {
        const now = Date.now();

        setMessages((prev) => {
            let changed = false;
            const next = prev.map((m) => {
            // skip resolved messages
            if (m.resolved) return m;

            // if there's no nextRemindAt or it's in the future, do nothing
            if (!m.nextRemindAt || m.nextRemindAt > now) return m;

            // At this point: reminder time reached and message not resolved
            const escalations = (m.escalations ?? 0) + 1;
            const newLevel = escalateLevel(m.level);

            // Build updated message
            const updated: Message = {
                ...m,
                level: newLevel,
                escalations,
                // schedule next reminder (unless already urgent)
                nextRemindAt: newLevel === "urgent" ? undefined : now + randBetween(DEMO_REMIND_MIN_MS, DEMO_REMIND_MAX_MS),
            };

            changed = true;

            // If we reached urgent and message still unresolved, trigger court overlay
            if (newLevel === "urgent") {
                // Show the court overlay with reason — use side effect after state update
                setTimeout(() => {
                setCourtOverlay({ show: true, reason: `Court action: ${updated.text}` });
                }, 50);
            }

            return updated;
            });

            return changed ? next : prev;
        });
        }, 1000); // check every second

        return () => {
        if (schedulerRef.current !== null) {
            window.clearInterval(schedulerRef.current);
            schedulerRef.current = null;
        }
        };
    }, []);

    //quick demo helper: add a sample message (manly used for debugging)
    function addSampleMessages() {
        addMessage({
            id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            text: "Are you done with sprint 1?",
            from: "boss",
            level: "info",
        })
        addMessage({
            id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            text: "Can you pick up the kids from school after work?",
            from: "family",
            level: "info",
        });
        addMessage({
            id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            text: "Fix change title colours to Red",
            from: "agile",
            level: "warning",
        });
    }

    //render UI, ChatGPT was used to assist in the following below
    return (
        <div
        style={{
            position: "relative",
            minHeight: "60vh",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
        >
        {/* Background area: uses an image from /public/images/courtroom.jpg */}
        <div
            style={{
            backgroundImage: `url(/images/courtroom.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6)",
            position: "absolute",
            inset: 0,
            zIndex: 0,
            }}
            aria-hidden
        />

        {/* Foreground content */}
        <div
            style={{
            position: "relative",
            zIndex: 2,
            color: "white",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "1rem",
            alignItems: "start",
            }}
        >
            {/* Left column: info and messages */}
            <div>
            <h2 style={{ marginTop: 0 }}>Court Room — Stage 1</h2>
            <p>
                This is an interactive demo area. Stage 1 provides a manual timer and a message area.
                We'll add scheduled messages and escalations in the next stage.
            </p>

            <section
                style={{
                background: "rgba(255,255,255,0.06)",
                padding: "0.75rem",
                borderRadius: 6,
                marginTop: "1rem",
                }}
            >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Messages</h3>
                <div style={{ maxHeight: 240, overflow: "auto" }}>
                {message.length === 0 ? (
                    <div style={{ opacity: 0.8 }}>No messages yet — add a sample or start the timer.</div>
                ) : (
                    <ul style={{ paddingLeft: 16 }}>
                    {message.map((m) => (
                        <li key={m.id} style={{ marginBottom: 8 }}>
                        <strong style={{ textTransform: "capitalize" }}>{m.from ?? "system"}</strong>:{" "}
                        <span>{m.text}</span>{" "}
                        <small style={{ opacity: 0.75, marginLeft: 8 }}>{new Date(m.timestamp).toLocaleTimeString()}</small>
                        {m.level === "urgent" && <span style={{ color: "salmon", marginLeft: 8 }}>URGENT</span>}
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            </section>
            </div>

            {/* Right column: controls */}
            <aside
            style={{
                background: "rgba(0,0,0,0.5)",
                padding: "1rem",
                borderRadius: 8,
                color: "white",
            }}
            >
            <h3 style={{ marginTop: 0 }}>Timer Controls</h3>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>Min</span>
                <input
                    aria-label="minutes"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(e.target.value)}
                    style={{ width: 56, padding: 6, borderRadius: 4 }}
                />
                </label>

                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span>Sec</span>
                <input
                    aria-label="seconds"
                    value={inputSeconds}
                    onChange={(e) => setInputSeconds(e.target.value)}
                    style={{ width: 56, padding: 6, borderRadius: 4 }}
                />
                </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                onClick={startTimer}
                disabled={running}
                style={{ padding: "8px 12px", borderRadius: 6, cursor: running ? "not-allowed" : "pointer" }}
                >
                Start
                </button>
                <button onClick={stopTimer} style={{ padding: "8px 12px", borderRadius: 6 }}>
                Stop
                </button>
                <button onClick={resetAll} style={{ padding: "8px 12px", borderRadius: 6 }}>
                Reset
                </button>
            </div>

            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{formatTime(timerSeconds)}</div>
                <div style={{ opacity: 0.85, fontSize: 13 }}>{running ? "Running" : "Stopped"}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addSampleMessages} style={{ padding: "8px 10px", borderRadius: 6 }}>
                Add samples
                </button>
                <button
                onClick={() =>
                    addMessage({
                    id: String(Date.now()),
                    text: "Demo urgent issue: Fix alt in img1",
                    from: "system",
                    level: "urgent",
                    })
                }
                style={{ padding: "8px 10px", borderRadius: 6, background: "tomato", color: "white" }}
                >
                Add urgent
                </button>
            </div>
            </aside>
        </div>
        </div>
    );

}
