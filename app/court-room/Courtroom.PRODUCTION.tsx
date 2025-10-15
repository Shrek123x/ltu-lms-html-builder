"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * CourtRoom - Production Version (Stage 3 Complete)
 *
 * PRODUCTION-READY: All test functions and debug helpers removed
 *
 * REQUIREMENTS SATISFIED:
 * 
 * ✅ Manual set Timer
 *    - User can input minutes/seconds and Start/Stop/Reset the timer
 *    - Timer countdown displayed in mm:ss format
 *    - See: startTimer(), stopTimer(), resetAll(), and the timer controls UI
 * 
 * ✅ Create an image for the background (a court room and a work desk)
 *    - Background image loaded from public/courtroom.jpg
 *    - Served as /courtroom.jpg in the browser
 *    - Full-cover background with darkened filter for text readability
 *    - See: background div with backgroundImage style
 * 
 * ✅ Allow several stages
 *    - 3 stages defined: Debugging, Release, Audit
 *    - Each stage has different message pools and reminder intervals
 *    - Stage selection dropdown allows manual stage switching
 *    - See: STAGES array and stageIndex state
 * 
 * ✅ User is to debug code - They get messages every 20-30 seconds
 *    - Scheduler runs every second and randomly injects messages from current stage
 *    - Messages from boss, family, agile appear at 20-30s intervals (configurable per stage)
 *    - See: useEffect scheduler with Math.random() < 0.03 logic for message injection
 * 
 * ✅ Message escalation behavior:
 *    a) "Fix alt in img1" (accessibility consequence)
 *       - Initial: info level, scheduled reminder
 *       - After ~20-30s if ignored: escalates to WARNING, next reminder in 2 min
 *       - After 2 more min if still ignored: escalates to URGENT, courtAt scheduled for 2 min
 *       - After courtAt passes: Court overlay appears with "Accessibility Hearing" (Disability Act violation)
 *    
 *    b) "Fix input validation" (tort consequence)
 *       - Same escalation flow as (a)
 *       - Court overlay shows "Laws of Tort" message (security issue led to harm/hacking)
 *    
 *    c) "Fix User login" (bankruptcy consequence)
 *       - Same escalation flow
 *       - Court overlay shows "Bankruptcy Notice" and DISABLES app controls
 *       - Simulates business collapse (no one can use app, you don't get paid)
 *    
 *    d) "Fix Secure Database" (hacked consequence)
 *       - Same escalation flow
 *       - Court overlay shows "Laws of Tort" (hacked due to known unfixed issue)
 * 
 * ✅ Escalation logic (see scheduler useEffect and triggerConsequenceOverlay):
 *    - First reminder: info → warning (2 min wait)
 *    - Second reminder: warning → urgent (2 min wait, then court)
 *    - Court action: overlay appears with consequence-specific message
 * 
 * ✅ Resolve action:
 *    - User can click "Resolve" on any message to mark it resolved
 *    - Resolved messages prevent further reminders and court actions
 *    - See: resolveMessage() function
 * 
 * ✅ Debug Code Interface:
 *    - User can click "Debug Code" button on messages with code challenges
 *    - Opens a code editor in the right panel showing broken code
 *    - User must fix the code to match the expected solution
 *    - When fixed correctly, message is automatically resolved
 *    - Code challenges mapped to specific messages:
 *      • "Fix alt in img1" → fix missing alt attribute
 *      • "Fix input validation" → add input sanitization
 *      • "Fix User login" → add password parameter
 *      • "Fix Secure Database" → use parameterized queries
 *      • "Fix change Title colour" → change CSS color to red
 *    - See: CODE_CHALLENGES array, startDebugging(), validateAndResolve()
 * 
 * Save as: app/court-room/CourtRoom.tsx
 */

/* ------------------------
   Types & Helpers
   ------------------------ */
// LEARNING NOTE: TypeScript union types allow strict type checking
// These prevent typos and enforce valid values throughout the component
type MessageLevel = "info" | "warning" | "urgent";

type ConsequenceType = "none" | "accessibility" | "tort" | "bankruptcy" | "hacked";

// COMPLEX SECTION - Message Data Model (ChatGPT assisted with design)
// This type definition represents the complete state of a message throughout its lifecycle
// Each field serves a specific purpose in the escalation and reminder system:
type Message = {
  id: string;                 // Unique identifier for React keys and deduplication
  text: string;               // The actual message content shown to user
  from?: string;              // Who sent it (boss, family, agile, etc.) - optional field
  level: MessageLevel;        // Current severity: info → warning → urgent
  timestamp: number;          // When created (milliseconds since epoch)
  resolved?: boolean;         // True when user fixes/resolves the issue
  escalations?: number;       // Counter: how many times we've reminded/escalated
  nextRemindAt?: number;      // Timestamp (ms) when next reminder should fire
  courtAt?: number;           // Timestamp (ms) when court overlay should appear
  consequence?: ConsequenceType; // What happens if ignored (accessibility/tort/bankruptcy)
};

// TIMING CONSTANTS - Configurable intervals for production
// NOTE: Adjust these values based on your production requirements
const DEMO_REMIND_MIN_MS = 20_000; // 20 seconds
const DEMO_REMIND_MAX_MS = 30_000; // 30 seconds
const ESCALATE_WAIT_MS = 120_000; // 2 minutes for escalation

// HELPER FUNCTIONS (ChatGPT assisted with implementation)

// Generates a reasonably unique ID using timestamp + random string
// Why: Prevents React key collisions and allows message deduplication
function genId(prefix = "msg") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Returns a random integer between min and max (inclusive)
// Used for: Varying message injection times to feel more natural
function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ESCALATION LOGIC - Determines next severity level
// Pattern: info → warning → urgent (stays at urgent)
function escalateLevel(level: MessageLevel): MessageLevel {
  if (level === "info") return "warning";
  if (level === "warning") return "urgent";
  return "urgent"; // Already at max, stay there
}

/* ------------------------
   Stage definitions
   ------------------------ */
// REQUIREMENT: Allow several stages
// Each stage has:
// - name: displayed in UI
// - messages: pool of messages that can appear (boss, family, agile, security, etc.)
// - reminderMinMs / reminderMaxMs: timing for message injection (20-30s default for Debugging)
// 
// MESSAGE CONSEQUENCES:
// - "none": no court action, just reminders
// - "accessibility": if ignored → Court overlay for Disability Act violation
// - "tort": if ignored → Court overlay for Laws of Tort (security/validation failures)
// - "bankruptcy": if ignored → Court overlay + app disabled (business collapse)
// - "hacked": if ignored → Court overlay for Laws of Tort (got hacked, didn't fix)

const STAGES = [
  {
    id: 0,
    name: "Debugging",
    // REQUIREMENT: Messages from boss, family, agile every 20-30 seconds
    messages: [
      { text: "Are you done with sprint 1?", from: "boss", consequence: "none" as ConsequenceType },
      { text: "Can you pick up the kids after work?", from: "family", consequence: "none" as ConsequenceType },
      { text: "Fix change Title colour to Red", from: "agile", consequence: "none" as ConsequenceType },
      // REQUIREMENT: "fix alt in img1" → escalates to urgent → court for Disability Act
      { text: "Fix alt in img1", from: "agile", consequence: "accessibility" as ConsequenceType },
      // REQUIREMENT: "fix input validation" → escalates to urgent → court for Laws of Tort
      { text: "Fix input validation", from: "security", consequence: "tort" as ConsequenceType },
      // REQUIREMENT: "Fix User login" → don't fix → bankruptcy (app disabled, no revenue)
      { text: "Fix User login", from: "payment", consequence: "bankruptcy" as ConsequenceType },
      // REQUIREMENT: "Fix Secure Database" → got hacked → court for Laws of Tort
      { text: "Fix Secure Database", from: "ops", consequence: "hacked" as ConsequenceType },
    ],
    // schedule speed modifiers: 20-30s for this stage
    reminderMinMs: DEMO_REMIND_MIN_MS,
    reminderMaxMs: DEMO_REMIND_MAX_MS,
  },
  {
    id: 1,
    name: "Release",
    messages: [
      { text: "Regression found in checkout", from: "qa", consequence: "tort" as ConsequenceType },
      { text: "Update release notes", from: "docs", consequence: "none" as ConsequenceType },
      { text: "Fix User login", from: "payment", consequence: "bankruptcy" as ConsequenceType },
    ],
    reminderMinMs: 30_000,
    reminderMaxMs: 60_000,
  },
  {
    id: 2,
    name: "Audit",
    messages: [
      { text: "Accessibility audit: missing alt tags", from: "audit", consequence: "accessibility" as ConsequenceType },
      { text: "Pen test found SQLi", from: "security", consequence: "hacked" as ConsequenceType },
      { text: "Fix input validation", from: "security", consequence: "tort" as ConsequenceType },
    ],
    reminderMinMs: 60_000,
    reminderMaxMs: 120_000,
  },
];

/* ------------------------
   Code Challenge Database
   Maps message text keywords to code problems that users must debug
   
   COMPLEX SECTION (ChatGPT assisted with validation logic design)
   ------------------------ */
// LEARNING NOTE: This structure separates data (challenges) from logic (validation)
// Makes it easy to add new challenges without changing component code
type CodeChallenge = {
  messageKeyword: string; // match this against message.text (case-insensitive search)
  description: string;    // Shown to user when they start debugging
  brokenCode: string;     // The buggy code loaded into editor initially
  solution: string;       // Expected correct code (used for validation)
  hint: string;          // Help text shown when user makes a mistake
};

// REQUIREMENT MAPPING: Each challenge corresponds to a specific message requirement
const CODE_CHALLENGES: CodeChallenge[] = [
  {
    // REQUIREMENT: "fix alt in img1" → accessibility issue
    messageKeyword: "alt in img",
    description: "Fix missing alt attribute in image tag (accessibility issue)",
    brokenCode: `<img src="logo.png" />`,
    solution: `<img src="logo.png" alt="Company logo" />`,
    hint: "Add an alt attribute describing the image content",
  },
  {
    // REQUIREMENT: "fix input validation" → prevent injection attacks
    messageKeyword: "input validation",
    description: "Fix input validation to prevent injection attacks",
    brokenCode: `function validateInput(input) {
  return input;
}`,
    solution: `function validateInput(input) {
  return input.replace(/[<>]/g, '');
}`,
    hint: "Sanitize input by removing or escaping dangerous characters like < and >",
  },
  {
    // REQUIREMENT: "Fix User login" → missing password check
    messageKeyword: "User login",
    description: "Fix authentication logic (missing password check)",
    brokenCode: `function login(username) {
  if (username) {
    return true;
  }
  return false;
}`,
    solution: `function login(username, password) {
  if (username && password) {
    return true;
  }
  return false;
}`,
    hint: "Login should require both username AND password",
  },
  {
    // REQUIREMENT: "Fix Secure Database" → SQL injection vulnerability
    messageKeyword: "Secure Database",
    description: "Fix SQL injection vulnerability in database query",
    brokenCode: `const query = "SELECT * FROM users WHERE id = " + userId;`,
    solution: `const query = "SELECT * FROM users WHERE id = ?";
// Use parameterized queries`,
    hint: "Use parameterized queries instead of string concatenation",
  },
  {
    // REQUIREMENT: "fix change Title colour to Red"
    messageKeyword: "Title colour",
    description: "Fix CSS to change title color to red",
    brokenCode: `.title {
  color: blue;
}`,
    solution: `.title {
  color: red;
}`,
    hint: "Change the color property value to 'red'",
  },
];

/* ------------------------
   Component
   ------------------------ */
export default function CourtRoom() {
  /* Timer state (Stage 1) */
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<string>("0");
  const [inputSeconds, setInputSeconds] = useState<string>("30");
  const [running, setRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  /* Messages and scheduler */
  const [messages, setMessages] = useState<Message[]>([]);
  const schedulerRef = useRef<number | null>(null);
  const lastCodingChallengeTimeRef = useRef<number>(0); // Track last coding challenge injection time

  /* Stage state */
  const [stageIndex, setStageIndex] = useState<number>(0); // index into STAGES

  /* Court overlay and special consequences */
  const [overlay, setOverlay] = useState<{
    show: boolean;
    title?: string;
    body?: string;
    type?: ConsequenceType;
    disableApp?: boolean;
  }>({ show: false });

  /* Code debugging interface */
  const [userCode, setUserCode] = useState<string>("");
  const [selectedMessageForDebug, setSelectedMessageForDebug] = useState<string | null>(null);
  const [debugFeedback, setDebugFeedback] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  /* Track resolved message IDs to prevent re-injection */
  const [resolvedMessageIds, setResolvedMessageIds] = useState<Set<string>>(new Set());

  /* ------------------------
     Timer logic
     ------------------------ */
  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function startTimer() {
    const mins = Math.max(0, parseInt(inputMinutes || "0", 10) || 0);
    const secs = Math.max(0, parseInt(inputSeconds || "0", 10) || 0);
    const total = mins * 60 + secs;
    setTimerSeconds(total);
    setRunning(true);
    // Initialize coding challenge timer when starting
    if (lastCodingChallengeTimeRef.current === 0) {
      lastCodingChallengeTimeRef.current = Date.now();
    }
  }

  function stopTimer() {
    setRunning(false);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetAll() {
    stopTimer();
    setTimerSeconds(0);
    setMessages([]);
    setInputMinutes("0");
    setInputSeconds("30");
    setOverlay({ show: false });
    setResolvedMessageIds(new Set()); // Clear resolved tracking on full reset
    lastCodingChallengeTimeRef.current = 0; // Reset coding challenge timer
    cancelDebugging(); // Close debug interface
  }

  useEffect(() => {
    if (running) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current !== null) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setRunning(false);
            // optional system message when timer finishes
            addMessage({
              id: genId("sys"),
              text: "Timer finished",
              from: "system",
              level: "info",
              consequence: "none",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    return;
  }, [running, resolvedMessageIds]);

  /* ------------------------
     Message operations
     
     LEARNING NOTE: These functions encapsulate message state management
     Using functional setState (prev => ...) ensures we always work with latest state
     ------------------------ */

  // COMPLEX FUNCTION (ChatGPT assisted with deduplication logic)
  // Adds message, dedupes by id, and schedules initial nextRemindAt using current stage's interval
  // Why complex: Merges new message data, removes duplicates, applies stage-specific timing
  function addMessage(msg: Omit<Message, "timestamp"> & Partial<Pick<Message, "timestamp">>) {
    const stage = STAGES[stageIndex];
    const min = stage.reminderMinMs ?? DEMO_REMIND_MIN_MS;
    const max = stage.reminderMaxMs ?? DEMO_REMIND_MAX_MS;

    // Build complete message object with defaults
    const m: Message = {
      id: msg.id || genId("msg"),
      text: msg.text,
      from: msg.from ?? "system",
      level: msg.level ?? "info",
      timestamp: msg.timestamp ?? Date.now(),
      resolved: msg.resolved ?? false,
      escalations: msg.escalations ?? 0,
      nextRemindAt: Date.now() + randBetween(min, max), // Schedule first reminder
      consequence: msg.consequence ?? "none",
    };

    setMessages((prev) => {
      // DEDUPLICATION: Remove any existing message with same id before adding
      // Why: Prevents duplicate React keys and ensures each message appears once
      const filtered = prev.filter((x) => x.id !== m.id);
      return [m, ...filtered].slice(0, 200); // Prepend new, limit to 200 messages
    });
  }

  // Mark a message as resolved (stops all future reminders and court actions)
  // Also tracks the message text to prevent re-injection
  function resolveMessage(id: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id === id) {
        // Add to resolved tracking to prevent re-injection
        setResolvedMessageIds((prevIds) => new Set(prevIds).add(m.text));
        return { ...m, resolved: true, nextRemindAt: undefined, courtAt: undefined };
      }
      return m;
    }));
  }

  /* ------------------------
     Scheduler:
     REQUIREMENT: Coding challenges every 20 seconds, other messages random
     
     VERY COMPLEX SECTION (ChatGPT heavily assisted with scheduler logic and state management)
     
     How it works:
     1) Message injection (two types):
        a) CODING CHALLENGES: Injected exactly every 20 seconds when timer is running
           - Messages with code challenges: "Fix alt in img1", "Fix input validation", etc.
           - Guaranteed to appear on schedule (not random)
           - Only if not already resolved
        
        b) OTHER MESSAGES: Random injection (~3% per second for boss/family/etc.)
           - Messages without code challenges: "Are you done with sprint 1?", "Pick up kids", etc.
           - Random appearance gives variety
           - This gives roughly 1 random message every ~30 seconds on average
        
        - All messages start at "info" level with nextRemindAt scheduled (20-30s from now)
     
     2) Escalation policy (checked every second):
        - When nextRemindAt passes and message still unresolved:
          a) First escalation (escalations=1): info → WARNING
             - Set nextRemindAt = now + 2 minutes (ESCALATE_WAIT_MS)
          b) Second escalation (escalations=2): warning → URGENT
             - Set courtAt = now + 2 minutes
             - Clear nextRemindAt (no more reminders, court action scheduled)
          c) When courtAt passes: trigger court overlay
             - Show consequence overlay (accessibility / tort / bankruptcy / hacked)
             - Mark message as resolved to prevent repeat triggers
     
     3) Consequence overlay variants:
        - "accessibility": Court for Disability Act violation
        - "tort" or "hacked": Court for Laws of Tort (security/validation failure)
        - "bankruptcy": Court + app disabled (business collapse, no revenue)
     
     LEARNING NOTE: useEffect with cleanup function prevents memory leaks
     The dependency array ensures scheduler restarts when dependencies change
     
     See: triggerConsequenceOverlay() for overlay content
     ------------------------ */
  useEffect(() => {
    // create scheduler only once when component mounts
    if (schedulerRef.current !== null) return;

    schedulerRef.current = window.setInterval(() => {
      const now = Date.now();

      // 1a) CODING CHALLENGE INJECTION - Every 20 seconds (ChatGPT assisted)
      // REQUIREMENT: Coding challenges appear every 20 seconds when timer is running
      // These are guaranteed to appear on schedule (not random)
      if (running) {
        const timeSinceLastChallenge = now - lastCodingChallengeTimeRef.current;
        
        // Check if 20 seconds have passed since last coding challenge
        if (timeSinceLastChallenge >= 20000) {
          const pool = STAGES[stageIndex].messages;
          
          // Filter to only messages with code challenges
          const codingMessages = pool.filter(msg => 
            CODE_CHALLENGES.some(challenge => 
              msg.text.toLowerCase().includes(challenge.messageKeyword.toLowerCase())
            )
          );
          
          // Pick a random coding challenge that hasn't been resolved
          const unresolvedCodingMessages = codingMessages.filter(msg => !resolvedMessageIds.has(msg.text));
          
          if (unresolvedCodingMessages.length > 0) {
            const pick = unresolvedCodingMessages[Math.floor(Math.random() * unresolvedCodingMessages.length)];
            
            addMessage({
              id: genId("coding"),
              text: pick.text,
              from: pick.from,
              level: "info",
              consequence: pick.consequence,
            });
            
            lastCodingChallengeTimeRef.current = now; // Update last challenge time
          }
        }
      }

      // 1b) RANDOM MESSAGE INJECTION (ChatGPT assisted with probability calculation)
      // REQUIREMENT: Other messages (boss, family, etc.) appear randomly
      // ~3% per second -> roughly every 30 seconds on average
      // REQUIREMENT: Only inject messages when timer is running
      if (running && Math.random() < 0.03) {
        const pool = STAGES[stageIndex].messages;
        
        // Filter to only non-coding messages (boss, family, docs, qa, etc.)
        const nonCodingMessages = pool.filter(msg => 
          !CODE_CHALLENGES.some(challenge => 
            msg.text.toLowerCase().includes(challenge.messageKeyword.toLowerCase())
          )
        );
        
        if (nonCodingMessages.length > 0) {
          const pick = nonCodingMessages[Math.floor(Math.random() * nonCodingMessages.length)];
          
          // Check if this message text has been resolved before
          if (!resolvedMessageIds.has(pick.text)) {
            addMessage({
              id: genId("auto"),
              text: pick.text,
              from: pick.from,
              level: "info",
              consequence: pick.consequence,
            });
          }
        }
      }

      // 2) ESCALATION ENGINE (VERY COMPLEX - ChatGPT assisted extensively)
      // Check existing messages for reminder/escalation
      // REQUIREMENT: Only process escalations when timer is running
      if (!running) return;
      
      setMessages((prev) => {
        let changed = false;
        const nextMessages = prev.map((m) => {
          // Skip resolved messages (no further action needed)
          if (m.resolved) return m;

          // COURT ACTION TRIGGER
          // If courtAt is set and time has passed, show consequence overlay immediately
          if (m.courtAt && now >= m.courtAt) {
            // Side effect: show court overlay
            // NOTE: Using setTimeout to avoid state mutation inside map
            setTimeout(() => {
              triggerConsequenceOverlay(m);
            }, 10);
            changed = true;
            // mark as acknowledged in state to prevent repeat triggers
            return { ...m, resolved: true };
          }

          // If nextRemindAt is not set (e.g., already scheduled to courtAt) do nothing
          if (!m.nextRemindAt) return m;

          // If it's not yet time for the next reminder, leave it unchanged
          if (m.nextRemindAt > now) return m;

          // At this point: nextRemindAt reached and message is still unresolved => ESCALATE
          const escalations = (m.escalations ?? 0) + 1;

          // FIRST ESCALATION: info → warning, schedule next reminder in 2 min
          if (escalations === 1) {
            const updated: Message = {
              ...m,
              level: "warning",
              escalations,
              nextRemindAt: now + ESCALATE_WAIT_MS, // 2 minutes from now
            };
            changed = true;
            return updated;
          }

          // SECOND ESCALATION: warning → urgent, schedule court action in 2 min
          if (escalations === 2) {
            const updated: Message = {
              ...m,
              level: "urgent",
              escalations,
              nextRemindAt: undefined, // No more reminders
              courtAt: now + ESCALATE_WAIT_MS, // Court overlay in 2 minutes
            };
            changed = true;
            return updated;
          }

          // If escalations > 2, we leave the message (courtAt handling above will trigger)
          return m;
        });

        // Only trigger re-render if something actually changed (performance optimization)
        return changed ? nextMessages : prev;
      });
    }, 1000); // main loop runs every second for quick demo behavior

    // CLEANUP FUNCTION - prevents memory leaks when component unmounts
    return () => {
      if (schedulerRef.current !== null) {
        window.clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
    };
  }, [stageIndex, resolvedMessageIds, running]); // Re-run if stageIndex, resolvedMessageIds, or running changes

  /* ------------------------
     Consequence overlay handler
     REQUIREMENT: Show court overlay with specific consequences based on message type
     ------------------------ */
  function triggerConsequenceOverlay(m: Message) {
    // Decide overlay content by consequence type
    switch (m.consequence) {
      case "accessibility":
        // REQUIREMENT: "fix alt in img1" → if ignored → court for Disability Act violation
        setOverlay({
          show: true,
          title: "Accessibility Hearing",
          body: `You ignored accessibility issues ("${m.text}") — this can violate disability laws. Court action initiated.`,
          type: "accessibility",
          disableApp: false,
        });
        break;
      case "tort":
      case "hacked":
        // REQUIREMENT: "fix input validation" or "Fix Secure Database" → if ignored → court for Laws of Tort
        // Explanation: You knew there was a security issue and didn't fix it, leading to harm/hacking
        setOverlay({
          show: true,
          title: "Court of Law - Laws of Tort",
          body: `A critical security or validation issue ("${m.text}") was not fixed and led to failure/harm. Legal action: Laws of Tort.`,
          type: "tort",
          disableApp: false,
        });
        break;
      case "bankruptcy":
        // REQUIREMENT: "Fix User login" → if not fixed → bankruptcy (no one can use app, no revenue)
        setOverlay({
          show: true,
          title: "Bankruptcy Notice",
          body: `Failure to fix "${m.text}" caused loss of revenue / trust — declared bankruptcy. The app is disabled.`,
          type: "bankruptcy",
          disableApp: true, // SPECIAL: disable app controls to simulate business collapse
        });
        // In bankruptcy scenario, app functionality is disabled
        // User must reset or refresh to continue demo
        break;
      default:
        setOverlay({
          show: true,
          title: "Court Action",
          body: `An urgent issue escalated: "${m.text}".`,
          type: "none",
          disableApp: false,
        });
    }
  }

  /* ------------------------
     Code debugging functions (REQUIREMENT: user must debug code to resolve issues)
     
     COMPLEX VALIDATION LOGIC (ChatGPT assisted with normalization and comparison)
     ------------------------ */

  // Find the code challenge that matches a message
  // Uses case-insensitive substring search to match message text to challenge keyword
  function getCodeChallenge(messageText: string): CodeChallenge | null {
    return CODE_CHALLENGES.find((c) => messageText.toLowerCase().includes(c.messageKeyword.toLowerCase())) ?? null;
  }

  // Start debugging a message: load the broken code into the editor
  function startDebugging(messageId: string) {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const challenge = getCodeChallenge(msg.text);
    if (!challenge) {
      setDebugFeedback("No code challenge available for this message.");
      return;
    }

    // Load challenge into the debugging UI state
    setSelectedMessageForDebug(messageId);
    setUserCode(challenge.brokenCode);
    setDebugFeedback(`Debug challenge: ${challenge.description}\nHint: ${challenge.hint}`);
    setShowAnswer(false); // Reset show answer state
  }

  // COMPLEX VALIDATION FUNCTION (ChatGPT assisted with normalization algorithm)
  // Validate user's code and resolve the message if correct
  // 
  // LEARNING NOTE: Code validation is tricky because users might:
  // - Use different whitespace (tabs vs spaces)
  // - Add extra blank lines
  // - Use different indentation styles
  // 
  // Solution: Normalize both user code and solution before comparing
  // This makes validation forgiving while still ensuring correctness
  function validateAndResolve() {
    if (!selectedMessageForDebug) return;

    const msg = messages.find((m) => m.id === selectedMessageForDebug);
    if (!msg) return;

    const challenge = getCodeChallenge(msg.text);
    if (!challenge) return;

    // NORMALIZATION ALGORITHM (ChatGPT assisted)
    // Purpose: Make code comparison whitespace-insensitive
    // Steps:
    // 1. Split into lines
    // 2. Trim each line (remove leading/trailing spaces)
    // 3. Filter out empty lines
    // 4. Join back together
    // 5. Replace multiple spaces with single space
    const normalize = (code: string) =>
      code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n")
        .replace(/\s+/g, " ");

    const userNormalized = normalize(userCode);
    const solutionNormalized = normalize(challenge.solution);

    if (userNormalized === solutionNormalized) {
      // SUCCESS: code is correct, resolve the message
      resolveMessage(selectedMessageForDebug);
      setDebugFeedback("✅ Correct! Issue resolved. The message has been marked as fixed.");
      setSelectedMessageForDebug(null);
      setUserCode("");
    } else {
      // FAIL: code is incorrect, show hint
      setDebugFeedback("❌ Incorrect. Try again. Hint: " + challenge.hint);
    }
  }

  // Cancel debugging and close the code editor
  function cancelDebugging() {
    setSelectedMessageForDebug(null);
    setUserCode("");
    setDebugFeedback("");
    setShowAnswer(false);
  }

  // Show the answer (solution code) to help the user
  function showAnswerCode() {
    if (!selectedMessageForDebug) return;
    
    const msg = messages.find((m) => m.id === selectedMessageForDebug);
    if (!msg) return;

    const challenge = getCodeChallenge(msg.text);
    if (!challenge) return;

    // Load solution into editor
    setUserCode(challenge.solution);
    setShowAnswer(true);
    setDebugFeedback("✅ Answer shown. You can now submit this solution to resolve the issue.");
  }

  /* ------------------------
     Render UI
     
     LAYOUT NOTES (ChatGPT assisted with CSS-in-JS styling):
     - Two-column grid: Messages (left) + Controls/Debug (right)
     - Background image layer (absolute positioned, z-index: 0)
     - Foreground content layer (relative positioned, z-index: 2)
     - Overlays for court actions (fixed positioned, z-index: 9999)
     
     LEARNING NOTE: Inline styles used for simplicity
     In production, consider CSS modules or styled-components for better organization
     ------------------------ */
  // If overlay.disableApp is true (e.g., bankruptcy), we can render a "disabled" state
  const appDisabled = overlay.disableApp === true;

  return (
    <div style={{ position: "relative", minHeight: "70vh", overflow: "hidden", borderRadius: 8 }}>
      {/* 
        REQUIREMENT: Create an image for the background (a court room and a work desk)
        - Background image loads from public/courtroom.jpg (currently using single courtroom image)
        - File path: public/courtroom.jpg -> served as /courtroom.jpg
        - This div acts as the full background layer with darkened overlay (brightness 0.5) 
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(/courtroom.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5)", // Darken for text readability
          zIndex: 0,
        }}
        aria-hidden
      />

      {/* Foreground content - all interactive UI elements */}
      <div style={{ position: "relative", zIndex: 2, color: "white", padding: 16 }}>
        {/* 
          HEADER SECTION
          - Shows current stage (Debugging/Release/Audit)
          - Stage selector dropdown (REQUIREMENT: Allow several stages)
        */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Court Room — Stage {stageIndex + 1}: {STAGES[stageIndex].name}</h2>
            <div style={{ opacity: 0.9, fontSize: 13 }}>Messages escalate if ignored. Resolve to avoid consequences.</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ color: "white", opacity: 0.9 }}>
              Stage:
              <select
                value={stageIndex}
                onChange={(e) => setStageIndex(Number(e.target.value))}
                disabled={appDisabled}
                style={{ marginLeft: 8, padding: 6, borderRadius: 6 }}
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, marginTop: 12 }}>
          {/* 
            LEFT COLUMN: Message List
            REQUIREMENT: Shows messages from boss, family, agile, security, etc.
            - Each message shows: sender, text, level, timestamp, escalation count
            - Action buttons: Debug Code (if challenge exists), Resolve
          */}
          <div>
            <section style={{ background: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Messages</h3>
              <div style={{ maxHeight: 420, overflow: "auto" }}>
                {messages.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>No messages yet — wait for scheduled ones.</div>
                ) : (
                  <ul style={{ paddingLeft: 16 }}>
                    {messages.map((m: Message) => (
                      <li key={m.id} style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: m.level === "urgent" ? "rgba(255,90,70,0.08)" : "transparent", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <strong style={{ textTransform: "capitalize" }}>{m.from}</strong>: {m.text}
                            <div style={{ fontSize: 12, opacity: 0.8 }}>{m.level.toUpperCase()} • {new Date(m.timestamp).toLocaleTimeString()}</div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12 }}>{m.escalations ?? 0} reminders</div>
                            <div style={{ fontSize: 12, opacity: 0.85 }}>{m.resolved ? "Resolved" : (m.nextRemindAt ? `Next: ${new Date(m.nextRemindAt).toLocaleTimeString()}` : (m.courtAt ? `Court at: ${new Date(m.courtAt!).toLocaleTimeString()}` : ""))}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {!m.resolved && !appDisabled ? (
                            <>
                              {/* 
                                Debug Code Button
                                - Only shows for messages with matching code challenges
                                - Highlighted blue when actively debugging
                                - Opens code editor in right panel
                                - REQUIREMENT: Messages with code challenges can ONLY be resolved by debugging
                              */}
                              {getCodeChallenge(m.text) ? (
                                <button
                                  onClick={() => startDebugging(m.id)}
                                  style={{
                                    padding: "6px 8px",
                                    borderRadius: 6,
                                    background: selectedMessageForDebug === m.id ? "#4a9eff" : "#2a7ade",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  {selectedMessageForDebug === m.id ? "Debugging..." : "Debug Code"}
                                </button>
                              ) : (
                                /* Manual resolve only available for non-code messages */
                                <button onClick={() => resolveMessage(m.id)} style={{ padding: "6px 8px", borderRadius: 6 }}>
                                  Resolve
                                </button>
                              )}
                            </>
                          ) : (
                            <div style={{ opacity: 0.7 }}>
                              {m.resolved ? "✅ Resolved" : "No actions"}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* 
            RIGHT COLUMN: Controls & Code Debugging Interface
            REQUIREMENT: Manual set Timer + Debug Code interface
            
            LAYOUT (ChatGPT assisted with flexbox column layout):
            - Timer controls (top)
            - Code debugging interface (bottom, only when debugging active)
          */}
          <aside style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 8, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* 
              TIMER SECTION
              REQUIREMENT: Manual set Timer with Start/Stop/Reset
            */}
            <div>
              <h4 style={{ marginTop: 0 }}>Timer Controls</h4>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span>Min</span>
                  <input aria-label="minutes" value={inputMinutes} onChange={(e) => setInputMinutes(e.target.value)} style={{ width: 56, padding: 6, borderRadius: 4 }} />
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span>Sec</span>
                  <input aria-label="seconds" value={inputSeconds} onChange={(e) => setInputSeconds(e.target.value)} style={{ width: 56, padding: 6, borderRadius: 4 }} />
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={startTimer} disabled={running || appDisabled} style={{ padding: "8px 12px", borderRadius: 6 }}>Start</button>
                <button onClick={stopTimer} disabled={appDisabled} style={{ padding: "8px 12px", borderRadius: 6 }}>Stop</button>
                <button onClick={resetAll} style={{ padding: "8px 12px", borderRadius: 6 }}>Reset</button>
              </div>

              <div style={{ fontSize: 18, fontWeight: 600 }}>{formatTime(timerSeconds)}</div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>{running ? "Running" : "Stopped"}</div>
            </div>

            {/* 
              CODE DEBUGGING INTERFACE
              REQUIREMENT: User must be able to debug code to resolve issues
              
              COMPLEX UI COMPONENT (ChatGPT assisted with layout and interaction design)
              
              Shows when user clicks "Debug Code" on a message:
              - Challenge description and hints
              - Textarea code editor (monospace font)
              - Submit Fix button (validates code)
              - Cancel button (closes interface)
              
              LEARNING NOTE: Conditional rendering with && operator
              Only renders when selectedMessageForDebug has a value
            */}
            {selectedMessageForDebug && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
                <h4 style={{ marginTop: 0, marginBottom: 8 }}>🐛 Debug Code</h4>

                {/* Feedback/instructions */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: 8,
                    borderRadius: 6,
                    fontSize: 12,
                    marginBottom: 8,
                    whiteSpace: "pre-wrap",
                    maxHeight: 80,
                    overflow: "auto",
                  }}
                >
                  {debugFeedback}
                </div>

                {/* Code editor (textarea) */}
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="Edit the code here to fix the issue..."
                  style={{
                    width: "100%",
                    minHeight: 160,
                    fontFamily: "monospace",
                    fontSize: 12,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                    resize: "vertical",
                  }}
                  spellCheck={false}
                />

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={validateAndResolve}
                    style={{ padding: "8px 12px", borderRadius: 6, background: "#2a7ade", color: "white", border: "none", cursor: "pointer" }}
                  >
                    Submit Fix
                  </button>
                  <button
                    onClick={showAnswerCode}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: 6, 
                      background: showAnswer ? "#4a9eff" : "#f59e0b",
                      color: "white",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {showAnswer ? "Answer Shown" : "Show Answer"}
                  </button>
                  <button onClick={cancelDebugging} style={{ padding: "8px 12px", borderRadius: 6 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Overlay: show courtroom or bankruptcy depending on overlay state.
          Clicking 'Resolve urgent' will mark all urgent messages resolved.
      */}
      {overlay.show && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", color: "white", padding: 24 }}
        >
          <div style={{ maxWidth: 820, background: "rgba(20,20,20,0.98)", padding: 24, borderRadius: 10 }}>
            <h2 style={{ marginTop: 0 }}>{overlay.title}</h2>
            <p>{overlay.body}</p>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setOverlay({ show: false })} style={{ padding: "8px 10px", borderRadius: 6 }}>
                Close
              </button>

              <button
                onClick={() => {
                  // Resolve messages of the consequence type (or all urgent) when user acknowledges
                  setMessages((prev) => prev.map((m) => (m.level === "urgent" || m.consequence === overlay.type ? { ...m, resolved: true } : m)));
                  setOverlay({ show: false });
                }}
                style={{ padding: "8px 10px", borderRadius: 6, background: "tomato", color: "white" }}
              >
                Resolve urgent issues
              </button>
            </div>

            {overlay.disableApp && (
              <div style={{ marginTop: 16, background: "#2b0000", padding: 12, borderRadius: 8 }}>
                <strong>Bankruptcy enacted:</strong> App controls are disabled to simulate business collapse.
              </div>
            )}
          </div>
        </div>
      )}

      {/* App disabled overlay (full-screen) when bankruptcy is in effect */}
      {appDisabled && overlay.show === false && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.85)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 640, textAlign: "center", padding: 24 }}>
            <h2>Application disabled: Bankruptcy</h2>
            <p>Your app has been declared bankrupt due to unresolved critical issues. To continue testing, refresh the page or reset the demo.</p>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { resetAll(); setOverlay({ show: false }); }} style={{ padding: "8px 10px", borderRadius: 6 }}>
                Reset demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
