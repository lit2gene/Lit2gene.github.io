import rmrcLogo from "./assets/logos/rmrc.png";
import uniLogo from "./assets/logos/university.png";
import l2gLogo from "./assets/logos/L2G.png";

import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  HomePage,
  JobsPage,
  ProjectsPage,
  ProjectWorkspace,
  AboutPage,
  TeamPage,
} from "./pages";

import {
  apiBaseDidChange,
  getApiBase,
  isColabCandidate,
  pingBackend,
  setApiBase,
} from "./api";

/* =========================
   BACKEND STATUS BAR
========================= */

type BackendStatus =
  | "unknown"
  | "checking"
  | "connected"
  | "failed";

function BackendConnectionBar() {
  const [backendUrl, setBackendUrl] = useState(getApiBase());
  const [status, setStatus] = useState<BackendStatus>("unknown");
  const [statusText, setStatusText] = useState("Not checked");
  const skipAutoRecheckRef = useRef(false);

  const statusColor =
    status === "connected"
      ? "var(--success)"
      : status === "failed"
      ? "var(--danger)"
      : status === "checking"
      ? "var(--warning)"
      : "var(--muted)";

  const testBackend = async (candidate: string | undefined) => {
    setStatus("checking");
    setStatusText("Checking...");

    try {
      await pingBackend(candidate);
      if (candidate !== undefined) {
        skipAutoRecheckRef.current = true;
        const normalized = setApiBase(candidate);
        setBackendUrl(normalized);
        skipAutoRecheckRef.current = false;
      }
      setStatus("connected");
      setStatusText("Connected");
    } catch (err) {
      setStatus("failed");
      setStatusText((err as Error).message || "Unable to connect");
    }
  };

  useEffect(() => {
    const sync = () => {
      setBackendUrl(getApiBase());
      if (!skipAutoRecheckRef.current) {
        void testBackend(undefined);
      } else {
        skipAutoRecheckRef.current = false;
      }
    };
    sync();
    return apiBaseDidChange(sync);
  }, []);

  const hint = isColabCandidate(backendUrl)
    ? "Detected ngrok-style URL. Ensure it ends with /api."
    : "Use /api for local setups or an ngrok URL for remote.";

  return (
    <div className="card">
      <p className="eyebrow" style={{ marginBottom: 4 }}>Connection</p>
      <h3 style={{ marginTop: 0, marginBottom: "0.6rem" }}>Backend selector</h3>

      <div className="toolbar" style={{ alignItems: "flex-start" }}>
        <input
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          placeholder="/api or https://...ngrok-free.app/api"
          style={{ maxWidth: "560px", flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => testBackend(backendUrl)}
          disabled={status === "checking"}
        >
          Save &amp; test
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => testBackend(undefined)}
        >
          Test current
        </button>
      </div>

      <p style={{ margin: "0.7rem 0 0.35rem", color: statusColor, fontSize: ".95rem" }}>
        Backend: <strong style={{ fontFamily: "var(--font-mono)" }}>{backendUrl}</strong> · {statusText}
      </p>
      <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>{hint}</p>
    </div>
  );
}

/* =========================
   SITE HEADER (DKDM style)
========================= */

function SiteHeader() {
  const location = useLocation();
  const path = location.pathname;
  const [navOpen, setNavOpen] = useState(false);

  // close mobile nav when route changes
  useEffect(() => {
    setNavOpen(false);
  }, [path]);

  const isActive = (p: string) =>
    p === "/" ? path === "/" : path.startsWith(p);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-top">
          <Link to="/" className="brand" aria-label="L2G home">
            <img src={l2gLogo} className="brand-logo" alt="L2G logo" />
            <span className="brand-text">
            <span className="brand-title">L2G</span>
            <span className="brand-sub">
             Literature&nbsp;to&nbsp;Gene · NLP Pipeline for Disease–Gene Extraction
            </span>
            </span>
          </Link>

          <div className="header-right">
            <div className="header-logos">
              <a
                href="https://rmrc.mui.ac.ir/"
                target="_blank"
                rel="noopener noreferrer"
                title="Regenerative Medicine Research Center"
              >
                <img src={rmrcLogo} alt="RMRC logo" />
              </a>
              <a
                href="https://www.mui.ac.ir/en"
                target="_blank"
                rel="noopener noreferrer"
                title="Isfahan University of Medical Sciences"
              >
                <img src={uniLogo} alt="Isfahan University of Medical Sciences logo" />
              </a>
            </div>
            <a
              className="btn btn-ghost btn-sm"
              href="https://dkd-map.github.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "-2px" }}
            >
              DKDM ↗
            </a>
          </div>
        </div>

        <div className="header-bottom">
          <button
            className="nav-toggle"
            aria-label="Menu"
            onClick={() => setNavOpen((o) => !o)}
          >
            Menu ▾
          </button>
          <ul className={`main-nav ${navOpen ? "open" : ""}`}>
            <li>
              <Link to="/" className={isActive("/") && path === "/" ? "active" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>
                About
              </Link>
            </li>
            <li>
              <Link to="/projects" className={isActive("/projects") ? "active" : ""}>
                Workspace
              </Link>
            </li>
            <li>
              <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/team" className={isActive("/team") ? "active" : ""}>
                Team
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

/* =========================
   SITE FOOTER
========================= */

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-cite">
          L2G — Literature to Gene · Regenerative Medicine Research Center, Isfahan University of Medical Sciences
        </p>
        <nav className="footer-links">
          <a href="https://github.com/Lit2G" target="_blank" rel="noopener noreferrer">
            <span className="dot"></span>GitHub
          </a>
          <a href="https://dkd-map.github.io" target="_blank" rel="noopener noreferrer">
            <span className="dot"></span>DKDM
          </a>
          <a href="https://rmrc.mui.ac.ir/" target="_blank" rel="noopener noreferrer">
            <span className="dot"></span>RMRC
          </a>
        </nav>
      </div>
    </footer>
  );
}

/* =========================
   LAYOUT
========================= */

function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  // Show the backend selector only on the operational pages, not on the
  // editorial pages (About, Team, Home hero).
  const showBackendBar =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/jobs");

  return (
    <>
      <SiteHeader />
      <main>
        {showBackendBar && (
          <div className="container" style={{ paddingTop: "1.25rem", paddingBottom: 0 }}>
            <BackendConnectionBar />
          </div>
        )}
        <div className="container">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

/* =========================
   APP ROUTER
========================= */

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
