import { useState, useCallback, useEffect } from "react";
import { Window } from "./Window";
import { SearchPanel } from "./SearchPanel";
import { TaskBar } from "./TaskBar";
import { WotIcon } from "./WotIcon";
import type { TaskWindow } from "./TaskBar";
import "./App.css";



type Story = {
  id: number;
  title: string;
  culture: string;
  text: string;
  views: number;
  author: string;
};

type WinState = {
  windowId: string;
  isMinimized: boolean;
};

type StoryWinState = WinState & { story: Story; initialX: number; initialY: number };

type AuthUser = {
  id: number;
  username: string;
  email: string;
};



const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function formatViews(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  return String(n);
}

let windowCounter = 0;
function nextWindowId() { return `story-${++windowCounter}`; }
const CASCADE_OFFSET = 30;



function DesktopIcon({ label, onClick, renderIcon }: { label: string; onClick: () => void; renderIcon: () => React.ReactNode }) {
  const [selected, setSelected] = useState(false);
  return (
    <div
      onMouseDown={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      onDoubleClick={() => { setSelected(false); onClick(); }}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        padding: "4px", width: 72, cursor: "default", userSelect: "none",
        background: selected ? "rgba(0,0,128,0.4)" : "transparent",
        border: `1px solid ${selected ? "rgba(255,255,255,0.5)" : "transparent"}`,
        color: "white",
        textShadow: "1px 1px 1px #000",
      }}
    >
      <div style={{ filter: selected ? "brightness(0.75)" : "none" }}>{renderIcon()}</div>
      <span style={{
        fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
        fontSize: 11, textAlign: "center", lineHeight: 1.2, wordBreak: "break-word",
      }}>
        {label}
      </span>
    </div>
  );
}



function HometownContent() {
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/stories`)
      .then(async (r) => {

        const buffer = await r.arrayBuffer();
        const text = new TextDecoder("utf-8").decode(buffer);
        return JSON.parse(text) as Story[];
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.views - a.views).slice(0, 3);
        setTopStories(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif", fontSize: 11, height: "100%", display: "flex", flexDirection: "column" }}>

      
      <div style={{
        background: "linear-gradient(to right, #000080, #4040c0)",
        color: "white", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, fontStyle: "italic", fontWeight: "bold" }}>🏠</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold" }}>Our Hometown</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>The most-read stories in our community</div>
        </div>
      </div>

      
      <div style={{ flex: 1, overflow: "auto", background: "white", padding: 0 }}>
        {loading && (
          <div style={{ padding: 16, color: "#666", fontStyle: "italic" }}>Loading stories...</div>
        )}
        {!loading && topStories.length === 0 && (
          <div style={{ padding: 16, color: "#666", fontStyle: "italic" }}>No stories found.</div>
        )}
        {!loading && topStories.map((story, i) => (
          <div key={story.id} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "10px 12px",
            borderBottom: "1px solid #e0e0e0",
            background: i === 0 ? "#fffbf0" : "white",
          }}>
            
            <div style={{
              width: 24, height: 24, flexShrink: 0,
              background: i === 0 ? "#c04000" : i === 1 ? "#808080" : "#a06030",
              color: "white", fontWeight: "bold", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #000",
            }}>
              {i + 1}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", color: "#000080", fontSize: 12, marginBottom: 2 }}>
                {story.title}
              </div>
              <div style={{ color: "#555", fontSize: 10, marginBottom: 4 }}>
                Culture: <span style={{ color: "#0000cc", textDecoration: "underline" }}>{story.culture}</span>
              </div>
              <div style={{
                fontSize: 11, color: "#333", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}>
                {story.text}
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
                <span>👁 {formatViews(story.views)} views</span>
                {i === 0 && <span style={{ color: "#c04000", fontWeight: "bold" }}>🔥 Most Read</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <div style={{
        background: "#c0c0c0", padding: "2px 6px",
        borderTop: "1px solid #808080", fontSize: 11, color: "#000",
        display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
        height: 20,
      }}>
        <div style={{ border: "1px solid", borderColor: "#808080 #fff #fff #808080", padding: "0 4px", flex: 1 }}>
          {topStories.length} stories shown · sorted by views
        </div>
      </div>
    </div>
  );
}



function HometownIcon() {
  return (
    <svg viewBox="0 0 36 36" width={36} height={36} xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="20" height="14" fill="#c08060" stroke="#808080" strokeWidth="1"/>
      <polygon points="4,18 18,6 32,18" fill="#c04000" stroke="#808080" strokeWidth="1"/>
      <rect x="14" y="22" width="8" height="8" fill="#000080"/>
      <rect x="10" y="19" width="6" height="6" fill="#ffff99" stroke="#808080" strokeWidth="0.5"/>
    </svg>
  );
}

function SubmitIcon() {
  return (
    <svg viewBox="0 0 36 36" width={36} height={36} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="22" height="28" fill="#ffffcc" stroke="#808080" strokeWidth="1"/>
      <line x1="8" y1="10" x2="22" y2="10" stroke="#808080" strokeWidth="1"/>
      <line x1="8" y1="14" x2="22" y2="14" stroke="#808080" strokeWidth="1"/>
      <line x1="8" y1="18" x2="18" y2="18" stroke="#808080" strokeWidth="1"/>
      <polygon points="24,20 32,12 34,14 26,22" fill="#ffcc00" stroke="#808080" strokeWidth="1"/>
      <polygon points="24,20 26,22 22,24" fill="#c0c0c0" stroke="#808080" strokeWidth="0.5"/>
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 36 36" width={36} height={36} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="16" width="20" height="14" fill="#ffcc00" stroke="#808080" strokeWidth="1"/>
      <path d="M10 16 V11 a6 6 0 0 1 12 0 V16" fill="none" stroke="#808080" strokeWidth="2"/>
      <circle cx="16" cy="22" r="2" fill="#808080"/>
      <rect x="15" y="22" width="2" height="5" fill="#808080"/>
    </svg>
  );
}



function SubmitStoryContent({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [title, setTitle] = useState("");
  const [culture, setCulture] = useState("");
  const [year, setYear] = useState("");
  const [text, setText] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handlePost() {
    if (!title.trim() || !text.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          culture: culture.trim() || undefined,
          year: year ? parseInt(year) : undefined,
          text: text.trim(),
        }),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.detail || "Failed to post story.");
        setStatus("error");
      } else {
        setStatus("success");
        setTitle("");
        setCulture("");
        setYear("");
        setText("");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  // shared Win98-style input/button styles
  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    border: "inset 2px #808080",
    borderStyle: "inset",
    padding: "2px 4px",
    background: "white",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    marginBottom: 2,
    display: "block",
  };

  const buttonStyle: React.CSSProperties = {
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    padding: "3px 12px",
    border: "2px outset #c0c0c0",
    background: "#c0c0c0",
    cursor: "pointer",
    minWidth: 80,
  };

  const canPost = title.trim().length > 0 && text.trim().length > 0 && status !== "loading";

  return (
    <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif", fontSize: 11, height: "100%", display: "flex", flexDirection: "column" }}>

      <div style={{
        background: "linear-gradient(to right, #000080, #4040c0)",
        color: "white", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20 }}>✏️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold" }}>Share a Story</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>Contribute your cultural story to the tapestry</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: "#c0c0c0" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label style={labelStyle}>Title <span style={{ color: "#cc0000" }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="Story title"
            />
          </div>
          <div>
            <label style={labelStyle}>Culture</label>
            <input
              type="text"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Japanese, Nigerian, Mexican..."
            />
          </div>
          <div>
            <label style={labelStyle}>Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ ...inputStyle, width: 120 }}
              placeholder="e.g. 1885"
            />
          </div>
          <div>
            <label style={labelStyle}>Story <span style={{ color: "#cc0000" }}>*</span></label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ ...inputStyle, height: 120, resize: "vertical" }}
              placeholder="Write your story here..."
            />
          </div>
        </div>

        {status === "success" && (
          <div style={{ marginTop: 10, padding: "6px 8px", background: "#d4edda", border: "1px solid #006400", color: "#006400", fontWeight: "bold", fontSize: 11 }}>
            ✔ Story posted successfully!
          </div>
        )}
        {status === "error" && (
          <div style={{ marginTop: 10, padding: "6px 8px", background: "#f8d7da", border: "1px solid #cc0000", color: "#cc0000", fontSize: 11 }}>
            ✘ {errorMsg}
          </div>
        )}
      </div>

      <div style={{
        background: "#c0c0c0", padding: "6px 12px",
        borderTop: "2px inset #808080",
        display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <button
          style={{ ...buttonStyle, opacity: canPost ? 1 : 0.5, cursor: canPost ? "pointer" : "not-allowed" }}
          disabled={!canPost}
          onClick={handlePost}
        >
          {status === "loading" ? "Posting..." : "Post Story"}
        </button>
      </div>
    </div>
  );
}



function AuthContent({
  currentUser,
  onAuth,
  onLogout,
}: {
  currentUser: AuthUser | null;
  onAuth: (token: string, user: AuthUser) => void;
  onLogout: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem("wot_login_lockout_until");
    if (!stored) return null;
    const ts = Number(stored);
    if (!Number.isFinite(ts) || ts <= Date.now()) {
      localStorage.removeItem("wot_login_lockout_until");
      return null;
    }
    return ts;
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (lockoutUntil === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockoutUntil) {
        setLockoutUntil(null);
        localStorage.removeItem("wot_login_lockout_until");
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  const lockoutRemainingSec =
    lockoutUntil === null ? 0 : Math.max(0, Math.ceil((lockoutUntil - now) / 1000));
  const isLockedOut = lockoutRemainingSec > 0;

  function formatCountdown(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleSubmit() {
    if (!email.trim() || !password) return;
    if (mode === "register" && !username.trim()) return;
    if (isLockedOut) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: email.trim(), password }
          : { username: username.trim(), email: email.trim(), password };
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail;
        if (
          res.status === 429 &&
          detail &&
          typeof detail === "object" &&
          typeof detail.retry_after === "number"
        ) {
          const t = Date.now();
          const until = t + detail.retry_after * 1000;
          setNow(t);
          setLockoutUntil(until);
          localStorage.setItem("wot_login_lockout_until", String(until));
          setErrorMsg(detail.message || "Too many failed login attempts.");
        } else if (typeof detail === "string") {
          setErrorMsg(detail);
        } else if (detail && typeof detail === "object" && typeof detail.message === "string") {
          setErrorMsg(detail.message);
        } else {
          setErrorMsg("Authentication failed.");
        }
        setStatus("error");
        return;
      }
      const data = await res.json();
      onAuth(data.access_token, data.user as AuthUser);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    border: "inset 2px #808080",
    borderStyle: "inset",
    padding: "2px 4px",
    background: "white",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    marginBottom: 2,
    display: "block",
  };

  const buttonStyle: React.CSSProperties = {
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    padding: "3px 12px",
    border: "2px outset #c0c0c0",
    background: "#c0c0c0",
    cursor: "pointer",
    minWidth: 80,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
    fontSize: 11,
    padding: "4px 14px",
    border: "2px outset #c0c0c0",
    borderBottom: active ? "2px solid #c0c0c0" : "2px outset #c0c0c0",
    background: active ? "#c0c0c0" : "#a8a8a8",
    cursor: "pointer",
    fontWeight: active ? "bold" : "normal",
  });

  const canSubmit =
    status !== "loading" &&
    !isLockedOut &&
    email.trim().length > 0 &&
    password.length > 0 &&
    (mode === "login" || username.trim().length > 0);

  if (currentUser) {
    return (
      <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif", fontSize: 11, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{
          background: "linear-gradient(to right, #000080, #4040c0)",
          color: "white", padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: "bold" }}>Account</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>You are signed in</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 16, background: "#c0c0c0", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11 }}>Signed in as:</div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#000080" }}>{currentUser.username}</div>
          <div style={{ fontSize: 11, color: "#444" }}>{currentUser.email}</div>
        </div>

        <div style={{
          background: "#c0c0c0", padding: "6px 12px",
          borderTop: "2px inset #808080",
          display: "flex", justifyContent: "flex-end", flexShrink: 0,
        }}>
          <button style={buttonStyle} onClick={onLogout}>Log Out</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif", fontSize: 11, height: "100%", display: "flex", flexDirection: "column" }}>

      <div style={{
        background: "linear-gradient(to right, #000080, #4040c0)",
        color: "white", padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20 }}>🔑</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold" }}>Sign In</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>Log in or create an account</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: "#c0c0c0" }}>

        <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
          <button style={tabStyle(mode === "login")} onClick={() => { setMode("login"); setStatus("idle"); setErrorMsg(""); }}>
            Login
          </button>
          <button style={tabStyle(mode === "register")} onClick={() => { setMode("register"); setStatus("idle"); setErrorMsg(""); }}>
            Register
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "register" && (
            <div>
              <label style={labelStyle}>Username <span style={{ color: "#cc0000" }}>*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                style={inputStyle}
                placeholder="Pick a username"
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email <span style={{ color: "#cc0000" }}>*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Password <span style={{ color: "#cc0000" }}>*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
              style={inputStyle}
              placeholder="Password"
            />
          </div>
        </div>

        {(status === "error" || isLockedOut) && (
          <div style={{ marginTop: 10, padding: "6px 8px", background: "#f8d7da", border: "1px solid #cc0000", color: "#cc0000", fontSize: 11 }}>
            ✘ {isLockedOut
              ? `Too many failed login attempts. Try again in ${formatCountdown(lockoutRemainingSec)}.`
              : errorMsg}
          </div>
        )}
      </div>

      <div style={{
        background: "#c0c0c0", padding: "6px 12px",
        borderTop: "2px inset #808080",
        display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <button
          style={{ ...buttonStyle, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isLockedOut
            ? `Wait ${formatCountdown(lockoutRemainingSec)}`
            : status === "loading"
              ? "..."
              : mode === "login"
                ? "Log In"
                : "Register"}
        </button>
      </div>
    </div>
  );
}



export default function App() {

  const [searchWin, setSearchWin] = useState<WinState>({ windowId: "search", isMinimized: false });
  const [searchOpen, setSearchOpen] = useState(false);

  const [hometownWin, setHometownWin] = useState<WinState>({ windowId: "hometown", isMinimized: false });
  const [hometownOpen, setHometownOpen] = useState(false);

  // share story window state
  const [submitWin, setSubmitWin] = useState<WinState>({ windowId: "submit", isMinimized: false });
  const [submitOpen, setSubmitOpen] = useState(false);

  // login window state
  const [authWin, setAuthWin] = useState<WinState>({ windowId: "auth", isMinimized: false });
  const [authOpen, setAuthOpen] = useState(false);

  // global auth state, hydrated from localStorage so refresh keeps the session
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("wot.authToken"));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("wot.currentUser");
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; } catch { return null; }
  });

  const [storyWindows, setStoryWindows] = useState<StoryWinState[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);

  const bringToFront = useCallback((id: string) => {
    setZOrder((prev) =>
      prev[prev.length - 1] === id ? prev : [...prev.filter((w) => w !== id), id]
    );
  }, []);

  const zIndexOf = (id: string) => {
    const idx = zOrder.indexOf(id);
    return idx === -1 ? 10 : 10 + idx;
  };

  const activeId = zOrder[zOrder.length - 1];


  function openSearch() {
    if (!searchOpen) {
      setSearchOpen(true);
      setSearchWin({ windowId: "search", isMinimized: false });
      setZOrder((prev) => [...prev.filter((w) => w !== "search"), "search"]);
    } else if (searchWin.isMinimized) {
      setSearchWin((w) => ({ ...w, isMinimized: false }));
      bringToFront("search");
    } else {
      bringToFront("search");
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setZOrder((prev) => prev.filter((id) => id !== "search"));
  }

  function minimizeSearch() {
    setSearchWin((w) => ({ ...w, isMinimized: true }));
  }


  function openHometown() {
    if (!hometownOpen) {
      setHometownOpen(true);
      setHometownWin({ windowId: "hometown", isMinimized: false });
      setZOrder((prev) => [...prev.filter((w) => w !== "hometown"), "hometown"]);
    } else if (hometownWin.isMinimized) {
      setHometownWin((w) => ({ ...w, isMinimized: false }));
      bringToFront("hometown");
    } else {
      bringToFront("hometown");
    }
  }

  function closeHometown() {
    setHometownOpen(false);
    setZOrder((prev) => prev.filter((id) => id !== "hometown"));
  }

  function minimizeHometown() {
    setHometownWin((w) => ({ ...w, isMinimized: true }));
  }


  // open, close, and minimize handlers for the share story window
  function openSubmit() {
    if (!authToken) {
      openAuth();
      return;
    }
    if (!submitOpen) {
      setSubmitOpen(true);
      setSubmitWin({ windowId: "submit", isMinimized: false });
      setZOrder((prev) => [...prev.filter((w) => w !== "submit"), "submit"]);
    } else if (submitWin.isMinimized) {
      setSubmitWin((w) => ({ ...w, isMinimized: false }));
      bringToFront("submit");
    } else {
      bringToFront("submit");
    }
  }

  function closeSubmit() {
    setSubmitOpen(false);
    setZOrder((prev) => prev.filter((id) => id !== "submit"));
  }

  function minimizeSubmit() {
    setSubmitWin((w) => ({ ...w, isMinimized: true }));
  }


  function openAuth() {
    if (!authOpen) {
      setAuthOpen(true);
      setAuthWin({ windowId: "auth", isMinimized: false });
      setZOrder((prev) => [...prev.filter((w) => w !== "auth"), "auth"]);
    } else if (authWin.isMinimized) {
      setAuthWin((w) => ({ ...w, isMinimized: false }));
      bringToFront("auth");
    } else {
      bringToFront("auth");
    }
  }

  function closeAuth() {
    setAuthOpen(false);
    setZOrder((prev) => prev.filter((id) => id !== "auth"));
  }

  function minimizeAuth() {
    setAuthWin((w) => ({ ...w, isMinimized: true }));
  }

  function handleAuthSuccess(token: string, user: AuthUser) {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem("wot.authToken", token);
    localStorage.setItem("wot.currentUser", JSON.stringify(user));
    closeAuth();
  }

  function handleLogout() {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem("wot.authToken");
    localStorage.removeItem("wot.currentUser");
  }

  // called by any authenticated fetch when the server returns 401:
  // clear stored auth, close protected windows, and reopen Sign In so the user can re-auth
  function handleUnauthorized() {
    handleLogout();
    setSubmitOpen(false);
    setZOrder((prev) => prev.filter((id) => id !== "submit"));
    openAuth();
  }


  function handleOpenStory(story: Story) {
    const windowId = nextWindowId();
    const cascadeIndex = storyWindows.length;
    setStoryWindows((prev) => [...prev, {
      windowId, story, isMinimized: false,
      initialX: 180 + cascadeIndex * CASCADE_OFFSET,
      initialY: 120 + cascadeIndex * CASCADE_OFFSET,
    }]);
    setZOrder((prev) => [...prev, windowId]);
  }

  function closeStory(windowId: string) {
    setStoryWindows((prev) => prev.filter((w) => w.windowId !== windowId));
    setZOrder((prev) => prev.filter((id) => id !== windowId));
  }

  function minimizeStory(windowId: string) {
    setStoryWindows((prev) => prev.map((w) => w.windowId === windowId ? { ...w, isMinimized: true } : w));
  }


  function handleTaskbarFocus(id: string) {
    if (id === "search") {
      if (searchWin.isMinimized) {
        setSearchWin((w) => ({ ...w, isMinimized: false }));
      }
      bringToFront("search");
    } else if (id === "hometown") {
      if (hometownWin.isMinimized) {
        setHometownWin((w) => ({ ...w, isMinimized: false }));
      }
      bringToFront("hometown");
    } else if (id === "submit") {
      if (submitWin.isMinimized) {
        setSubmitWin((w) => ({ ...w, isMinimized: false }));
      }
      bringToFront("submit");
    } else if (id === "auth") {
      if (authWin.isMinimized) {
        setAuthWin((w) => ({ ...w, isMinimized: false }));
      }
      bringToFront("auth");
    } else {
      setStoryWindows((prev) => prev.map((w) => w.windowId === id ? { ...w, isMinimized: false } : w));
      bringToFront(id);
    }
  }


  const taskWindows: TaskWindow[] = [
    ...(searchOpen ? [{ id: "search", title: "Weave Our Tapestry", icon: "📖", isMinimized: searchWin.isMinimized }] : []),
    ...(hometownOpen ? [{ id: "hometown", title: "Our Hometown", icon: "🏠", isMinimized: hometownWin.isMinimized }] : []),
    ...(submitOpen ? [{ id: "submit", title: "Share a Story", icon: "✏️", isMinimized: submitWin.isMinimized }] : []), // share story window entry
    ...(authOpen ? [{ id: "auth", title: currentUser ? "Account" : "Sign In", icon: currentUser ? "👤" : "🔑", isMinimized: authWin.isMinimized }] : []),
    ...storyWindows.map((sw) => ({ id: sw.windowId, title: sw.story.title, icon: "📜", isMinimized: sw.isMinimized })),
  ];




  return (
    <div style={{ width: "100vw", height: "100vh", paddingBottom: 48, boxSizing: "border-box", position: "relative" }}>

      
      <div style={{ position: "absolute", top: 20, left: 20, display: "flex", flexDirection: "column", gap: 16, zIndex: 1 }}>
        <DesktopIcon
          label="WOT"
          onClick={openSearch}
          renderIcon={() => <WotIcon size={36} />}
        />
        <DesktopIcon
          label={"Our\nHometown"}
          onClick={openHometown}
          renderIcon={() => <HometownIcon />}
        />
        <DesktopIcon
          label={"Share\nStory"}
          onClick={openSubmit}
          renderIcon={() => <SubmitIcon />}
        />
        <DesktopIcon
          label={currentUser ? currentUser.username : "Sign In"}
          onClick={openAuth}
          renderIcon={() => <LoginIcon />}
        />
      </div>

      
      {searchOpen && (
        <Window
          title="Weave Our Tapestry"
          initialX={40} initialY={50}
          initialWidth={900} initialHeight={500}
          onClose={closeSearch}
          onMinimize={minimizeSearch}
          isMinimized={searchWin.isMinimized}
          zIndex={zIndexOf("search")}
          onFocus={() => bringToFront("search")}
        >
          <SearchPanel onOpenStory={handleOpenStory} />
        </Window>
      )}

      
      {hometownOpen && (
        <Window
          title="Our Hometown"
          initialX={120} initialY={80}
          initialWidth={520} initialHeight={420}
          onClose={closeHometown}
          onMinimize={minimizeHometown}
          isMinimized={hometownWin.isMinimized}
          zIndex={zIndexOf("hometown")}
          onFocus={() => bringToFront("hometown")}
        >
          <HometownContent />
        </Window>
      )}

      
      {submitOpen && authToken && (
        <Window
          title="Share a Story"
          initialX={220} initialY={90}
          initialWidth={500} initialHeight={540}
          onClose={closeSubmit}
          onMinimize={minimizeSubmit}
          isMinimized={submitWin.isMinimized}
          zIndex={zIndexOf("submit")}
          onFocus={() => bringToFront("submit")}
        >
          <SubmitStoryContent token={authToken} onUnauthorized={handleUnauthorized} />
        </Window>
      )}

      {authOpen && (
        <Window
          title={currentUser ? "Account" : "Sign In"}
          initialX={260} initialY={110}
          initialWidth={380} initialHeight={360}
          onClose={closeAuth}
          onMinimize={minimizeAuth}
          isMinimized={authWin.isMinimized}
          zIndex={zIndexOf("auth")}
          onFocus={() => bringToFront("auth")}
        >
          <AuthContent
            currentUser={currentUser}
            onAuth={handleAuthSuccess}
            onLogout={handleLogout}
          />
        </Window>
      )}

      {storyWindows.map(({ windowId, story, isMinimized, initialX, initialY }) => (
        <Window
          key={windowId}
          title={story.title}
          initialX={initialX} initialY={initialY}
          initialWidth={660} initialHeight={480}
          onClose={() => closeStory(windowId)}
          onMinimize={() => minimizeStory(windowId)}
          isMinimized={isMinimized}
          zIndex={zIndexOf(windowId)}
          onFocus={() => bringToFront(windowId)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontFamily: "'MS Sans Serif', Tahoma, Geneva, Arial, sans-serif", fontSize: 13, fontWeight: 'bold', lineHeight: 1.2 }}>
                {story.title}
              </h2>
              <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Geneva, Arial, sans-serif", fontSize: 11, color: "#444", marginBottom: 2 }}>
                Author: <span style={{ fontStyle: "italic" }}>{story.author}</span>
              </div>
              <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Geneva, Arial, sans-serif", fontSize: 11, color: "#444" }}>
                Culture: <span style={{ textDecoration: "underline", cursor: "pointer" }}>{story.culture}</span>
              </div>
            </div>
            <div style={{ fontFamily: "'MS Sans Serif', Tahoma, Geneva, Arial, sans-serif", fontSize: 11, color: "#333", display: "flex", alignItems: "center", gap: 6, paddingTop: 4 }}>
              <span>{formatViews(story.views)}</span><span>👁</span>
            </div>
          </div>
          <hr style={{ border: "none", borderTop: "2px solid #888", margin: "10px 0 14px 0" }} />
          <div
  style={{
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: 6,
  }}
>
  <div
    style={{
      fontFamily: "'MS Sans Serif', Tahoma, Geneva, Arial, sans-serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "#111",
      whiteSpace: "pre-wrap",
    }}
  >
    {story.text}
  </div>

  <hr style={{ margin: "16px 0" }} />

  <div>
    <h3 style={{ fontSize: 12 }}>Comments</h3>

    <textarea
      placeholder="Write a comment..."
      style={{
        width: "100%",
        minHeight: 60,
        marginBottom: 8,
        fontSize: 11,
      }}
    />

    <button>
      Post Comment
    </button>
  </div>
</div>
        </Window>
      ))}

      <TaskBar
        windows={taskWindows}
        activeId={activeId}
        onFocusWindow={handleTaskbarFocus}
      />
    </div>
  );
}