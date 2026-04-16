import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

type DanceEntry = {
  id: string;
  date: string;
  theme: string;
  videoUrl: string;
  notes: string;
};

type ArtEntry = {
  id: string;
  title: string;
  category: "Painting" | "Sketch" | "Digital";
  imageUrl: string;
  description: string;
};

type BookEntry = {
  id: string;
  title: string;
  author: string;
  progress: number;
  rating: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

type BasketballEntry = {
  id: string;
  playedDate: string;
  upcomingDate: string;
  sessionNotes: string;
  fact: string;
};

type TechProjectEntry = {
  id: string;
  title: string;
  type: "Website" | "Web App" | "Mobile App" | "AI Project" | "Other";
  about: string;
  screenshotUrl: string;
  liveUrl: string;
  repoUrl: string;
  updatedAt: string;
};

const STORAGE_KEYS = {
  dance: "portfolio_dance_entries",
  art: "portfolio_art_entries",
  books: "portfolio_book_entries",
  basketball: "portfolio_basketball_entries",
  tech: "portfolio_tech_entries",
  quoteDate: "portfolio_quote_date",
  quoteIndex: "portfolio_quote_index",
  dashboardAuth: "portfolio_dashboard_auth",
  dashboardPassword: "portfolio_dashboard_password",
};

const OWNER_NAME = "Ivy Mbote";

const QUOTES = [
  "You are becoming everything you once dreamed of.",
  "Small daily steps create extraordinary stories.",
  "Grace in motion, power in purpose.",
  "Create boldly, play fiercely, read deeply.",
  "Your consistency is your quiet superpower.",
  "The court, the canvas, and the page all belong to you.",
];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "Not set";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getYouTubeId(urlString: string) {
  try {
    const url = new URL(urlString);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return url.pathname.slice(1);
    }
    if (host.includes("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) {
        return fromQuery;
      }
      const parts = url.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (marker >= 0 && parts[marker + 1]) {
        return parts[marker + 1];
      }
    }
  } catch {
    return "";
  }
  return "";
}

function normalizePassword(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function useStoredList<T>(key: string) {
  const [value, setValue] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function useDailyQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(STORAGE_KEYS.quoteDate);
    const savedIndex = Number(localStorage.getItem(STORAGE_KEYS.quoteIndex));
    let nextIndex = Number.isInteger(savedIndex) && savedIndex >= 0 ? savedIndex : 0;

    if (savedDate !== today) {
      nextIndex = Math.floor(Math.random() * QUOTES.length);
      localStorage.setItem(STORAGE_KEYS.quoteDate, today);
      localStorage.setItem(STORAGE_KEYS.quoteIndex, String(nextIndex));
    }
    setQuoteIndex(nextIndex);
  }, []);

  const newQuote = () => {
    const today = new Date().toISOString().slice(0, 10);
    setQuoteIndex((current) => {
      const next = (current + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
      localStorage.setItem(STORAGE_KEYS.quoteDate, today);
      localStorage.setItem(STORAGE_KEYS.quoteIndex, String(next));
      return next;
    });
  };

  return { quote: QUOTES[quoteIndex], newQuote };
}

function Header({
  label,
  intro,
}: {
  label: string;
  intro: string;
}) {
  const { quote, newQuote } = useDailyQuote();

  return (
    <header className="site-header" id="home">
      <div className="intro-card">
        <p className="label">{label}</p>
        <h1>Her Creative Court</h1>
        <p>{intro}</p>
        <div className="quote-widget">
          <h2>Today&apos;s Inspiration</h2>
          <p className="daily-quote">{quote}</p>
          <button type="button" className="secondary-btn" onClick={newQuote}>
            New Quote
          </button>
        </div>
      </div>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#tech-portfolio">Tech Portfolio</a>
        <a href="#dance-archive">Dance Archive</a>
        <a href="#art-gallery">Art Gallery</a>
        <a href="#book-reviews">Book Reviews</a>
        <a href="#basketball-tracker">Basketball Tracker</a>
      </nav>
    </header>
  );
}

function PublicPage() {
  const [dance] = useStoredList<DanceEntry>(STORAGE_KEYS.dance);
  const [art] = useStoredList<ArtEntry>(STORAGE_KEYS.art);
  const [books] = useStoredList<BookEntry>(STORAGE_KEYS.books);
  const [basketball] = useStoredList<BasketballEntry>(STORAGE_KEYS.basketball);
  const [tech] = useStoredList<TechProjectEntry>(STORAGE_KEYS.tech);

  const sortedDance = useMemo(
    () => [...dance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [dance]
  );
  const sortedBasketball = useMemo(
    () =>
      [...basketball].sort(
        (a, b) => new Date(b.playedDate).getTime() - new Date(a.playedDate).getTime()
      ),
    [basketball]
  );

  return (
    <>
      <Header
        label="Welcome to my little world"
        intro="Hi, I am an independent dreamer who finds joy in dance floors, art studios, basketball courts, and cozy novel pages. This is my public portfolio where you can explore my journey."
      />
      <main>
        <section className="card-section">
          <p className="entry-meta owner-note">Curated with love by {OWNER_NAME}.</p>
        </section>
        <section id="dance-archive" className="card-section">
          <div className="section-head">
            <h2>Dance Archive</h2>
            <p>Performances organized by date and theme.</p>
          </div>
          <div className="entry-list">
            {!sortedDance.length && <p className="empty-state">No dance entries published yet.</p>}
            {sortedDance.map((entry) => {
              const yt = getYouTubeId(entry.videoUrl);
              return (
                <article className="entry-card" key={entry.id}>
                  <h3 className="entry-title">{entry.theme}</h3>
                  <p className="entry-meta">Date: {formatDate(entry.date)}</p>
                  {entry.notes && <p>{entry.notes}</p>}
                  <p className="entry-meta">
                    <a href={entry.videoUrl} className="video-link" target="_blank" rel="noreferrer">
                      Watch video
                    </a>
                  </p>
                  {yt && (
                    <div className="video-preview">
                      <iframe
                        src={`https://www.youtube.com/embed/${yt}`}
                        title="Dance video preview"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section id="art-gallery" className="card-section">
          <div className="section-head">
            <h2>Art Gallery</h2>
            <p>Paintings, sketches, and digital work with full descriptions.</p>
          </div>
          <div className="entry-list">
            {!art.length && <p className="empty-state">No artwork published yet.</p>}
            {art.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">Category: {entry.category}</p>
                <p>{entry.description}</p>
                {entry.imageUrl && (
                  <p className="entry-meta">
                    <a href={entry.imageUrl} className="art-link" target="_blank" rel="noreferrer">
                      View artwork link
                    </a>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="book-reviews" className="card-section">
          <div className="section-head">
            <h2>Book Reviews</h2>
            <p>Novel summaries, ratings, and reading progress.</p>
          </div>
          <div className="entry-list">
            {!books.length && <p className="empty-state">No book reviews published yet.</p>}
            {books.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">Updated: {formatDate(entry.updatedAt || entry.createdAt)}</p>
                <p>{entry.summary}</p>
                <p className="entry-meta">Author: {entry.author}</p>
                <p className="entry-meta">
                  Progress: {entry.progress}% | Rating: {entry.rating}/5
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="basketball-tracker" className="card-section">
          <div className="section-head">
            <h2>Basketball Tracker</h2>
            <p>Play logs, upcoming games, and fun basketball facts.</p>
          </div>
          <div className="entry-list">
            {!sortedBasketball.length && (
              <p className="empty-state">No basketball updates published yet.</p>
            )}
            {sortedBasketball.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">Played: {formatDate(entry.playedDate)}</h3>
                <p className="entry-meta">
                  {entry.upcomingDate
                    ? `Upcoming game: ${formatDate(entry.upcomingDate)}`
                    : "Upcoming game: Not scheduled"}
                </p>
                <p>{entry.sessionNotes}</p>
                <p>
                  <strong>Fun fact:</strong> {entry.fact}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="tech-portfolio" className="card-section">
          <div className="section-head">
            <h2>Tech Portfolio</h2>
            <p>Complete websites and projects with screenshots and links.</p>
          </div>
          <div className="entry-list">
            {!tech.length && <p className="empty-state">No tech projects published yet.</p>}
            {tech.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">
                  {entry.type} | Updated: {formatDate(entry.updatedAt)}
                </p>
                <p>{entry.about}</p>
                {entry.screenshotUrl && (
                  <img
                    src={entry.screenshotUrl}
                    alt={`${entry.title} screenshot`}
                    className="project-screenshot"
                    loading="lazy"
                  />
                )}
                <div className="project-links">
                  {entry.liveUrl && (
                    <a href={entry.liveUrl} className="art-link" target="_blank" rel="noreferrer">
                      Live Website
                    </a>
                  )}
                  {entry.repoUrl && (
                    <a href={entry.repoUrl} className="art-link" target="_blank" rel="noreferrer">
                      Project Link
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p className="bottom-dashboard-link">
          Creator dashboard: <Link to="/dashboard">Open upload page</Link>
        </p>
        <p>Made with heart, rhythm, color, and confidence.</p>
      </footer>
    </>
  );
}

function DashboardPage() {
  const [dance, setDance] = useStoredList<DanceEntry>(STORAGE_KEYS.dance);
  const [art, setArt] = useStoredList<ArtEntry>(STORAGE_KEYS.art);
  const [books, setBooks] = useStoredList<BookEntry>(STORAGE_KEYS.books);
  const [basketball, setBasketball] = useStoredList<BasketballEntry>(STORAGE_KEYS.basketball);
  const [tech, setTech] = useStoredList<TechProjectEntry>(STORAGE_KEYS.tech);

  const [danceFilter, setDanceFilter] = useState({ query: "", date: "" });
  const [artFilter, setArtFilter] = useState({ query: "", category: "" });
  const [bookFilter, setBookFilter] = useState({ query: "", rating: "" });
  const [basketFilter, setBasketFilter] = useState({ query: "", date: "" });
  const [techFilter, setTechFilter] = useState({ query: "", type: "" });

  const [danceForm, setDanceForm] = useState<DanceEntry>({
    id: "",
    date: "",
    theme: "",
    videoUrl: "",
    notes: "",
  });
  const [artForm, setArtForm] = useState<ArtEntry>({
    id: "",
    title: "",
    category: "Painting",
    imageUrl: "",
    description: "",
  });
  const [bookForm, setBookForm] = useState<BookEntry>({
    id: "",
    title: "",
    author: "",
    progress: 0,
    rating: 1,
    summary: "",
    createdAt: "",
    updatedAt: "",
  });
  const [basketForm, setBasketForm] = useState<BasketballEntry>({
    id: "",
    playedDate: "",
    upcomingDate: "",
    sessionNotes: "",
    fact: "",
  });
  const [techForm, setTechForm] = useState<TechProjectEntry>({
    id: "",
    title: "",
    type: "Website",
    about: "",
    screenshotUrl: "",
    liveUrl: "",
    repoUrl: "",
    updatedAt: "",
  });
  const [dashboardPassword, setDashboardPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEYS.dashboardAuth) === "unlocked"
  );
  const [savedPassword, setSavedPassword] = useState(
    () => localStorage.getItem(STORAGE_KEYS.dashboardPassword) ?? ""
  );
  const [passwordSetup, setPasswordSetup] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordChange, setPasswordChange] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const visibleDance = useMemo(
    () =>
      dance
        .filter((e) => {
          const q = danceFilter.query.toLowerCase();
          const matchesQuery = !q || e.theme.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q);
          const matchesDate = !danceFilter.date || e.date === danceFilter.date;
          return matchesQuery && matchesDate;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [dance, danceFilter]
  );

  const visibleArt = useMemo(
    () =>
      art.filter((e) => {
        const q = artFilter.query.toLowerCase();
        const matchesQuery =
          !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
        const matchesCategory = !artFilter.category || e.category === artFilter.category;
        return matchesQuery && matchesCategory;
      }),
    [art, artFilter]
  );

  const visibleBooks = useMemo(
    () =>
      books.filter((e) => {
        const q = bookFilter.query.toLowerCase();
        const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.author.toLowerCase().includes(q);
        const matchesRating = !bookFilter.rating || Number(bookFilter.rating) === e.rating;
        return matchesQuery && matchesRating;
      }),
    [books, bookFilter]
  );

  const visibleBasket = useMemo(
    () =>
      basketball
        .filter((e) => {
          const q = basketFilter.query.toLowerCase();
          const matchesQuery =
            !q || e.sessionNotes.toLowerCase().includes(q) || e.fact.toLowerCase().includes(q);
          const matchesDate = !basketFilter.date || e.playedDate === basketFilter.date;
          return matchesQuery && matchesDate;
        })
        .sort((a, b) => new Date(b.playedDate).getTime() - new Date(a.playedDate).getTime()),
    [basketball, basketFilter]
  );

  const visibleTech = useMemo(
    () =>
      tech.filter((entry) => {
        const q = techFilter.query.toLowerCase();
        const matchesQuery =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.about.toLowerCase().includes(q);
        const matchesType = !techFilter.type || entry.type === techFilter.type;
        return matchesQuery && matchesType;
      }),
    [tech, techFilter]
  );

  const submitDance = (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...danceForm, id: danceForm.id || createId() };
    setDance((prev) => (danceForm.id ? prev.map((e) => (e.id === danceForm.id ? payload : e)) : [...prev, payload]));
    setDanceForm({ id: "", date: "", theme: "", videoUrl: "", notes: "" });
  };

  const submitArt = (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...artForm, id: artForm.id || createId() };
    setArt((prev) => (artForm.id ? prev.map((e) => (e.id === artForm.id ? payload : e)) : [...prev, payload]));
    setArtForm({ id: "", title: "", category: "Painting", imageUrl: "", description: "" });
  };

  const submitBook = (event: FormEvent) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const payload = {
      ...bookForm,
      id: bookForm.id || createId(),
      createdAt: bookForm.createdAt || now,
      updatedAt: now,
    };
    setBooks((prev) => (bookForm.id ? prev.map((e) => (e.id === bookForm.id ? payload : e)) : [...prev, payload]));
    setBookForm({
      id: "",
      title: "",
      author: "",
      progress: 0,
      rating: 1,
      summary: "",
      createdAt: "",
      updatedAt: "",
    });
  };

  const submitBasket = (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...basketForm, id: basketForm.id || createId() };
    setBasketball((prev) =>
      basketForm.id ? prev.map((e) => (e.id === basketForm.id ? payload : e)) : [...prev, payload]
    );
    setBasketForm({ id: "", playedDate: "", upcomingDate: "", sessionNotes: "", fact: "" });
  };

  const submitTech = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...techForm,
      id: techForm.id || createId(),
      updatedAt: new Date().toISOString(),
    };
    setTech((prev) =>
      techForm.id ? prev.map((entry) => (entry.id === techForm.id ? payload : entry)) : [...prev, payload]
    );
    setTechForm({
      id: "",
      title: "",
      type: "Website",
      about: "",
      screenshotUrl: "",
      liveUrl: "",
      repoUrl: "",
      updatedAt: "",
    });
  };

  const unlockDashboard = (event: FormEvent) => {
    event.preventDefault();
    if (!savedPassword) {
      setAuthError("Create your private password first.");
      return;
    }
    if (normalizePassword(dashboardPassword) === normalizePassword(savedPassword)) {
      sessionStorage.setItem(STORAGE_KEYS.dashboardAuth, "unlocked");
      setIsUnlocked(true);
      setAuthError("");
      setDashboardPassword("");
      return;
    }
    setAuthError("That password is not correct. Try again.");
  };

  const createDashboardPassword = (event: FormEvent) => {
    event.preventDefault();
    if (passwordSetup.newPassword.trim().length < 4) {
      setAuthError("Use at least 4 characters for your password.");
      return;
    }
    if (passwordSetup.newPassword !== passwordSetup.confirmPassword) {
      setAuthError("Passwords do not match. Please re-enter.");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.dashboardPassword, passwordSetup.newPassword);
    setSavedPassword(passwordSetup.newPassword);
    setPasswordSetup({ newPassword: "", confirmPassword: "" });
    setAuthError("");
    sessionStorage.setItem(STORAGE_KEYS.dashboardAuth, "unlocked");
    setIsUnlocked(true);
  };

  const changeDashboardPassword = (event: FormEvent) => {
    event.preventDefault();
    if (passwordChange.newPassword.trim().length < 4) {
      setPasswordMessage("Use at least 4 characters for your new password.");
      return;
    }
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.dashboardPassword, passwordChange.newPassword);
    setSavedPassword(passwordChange.newPassword);
    setPasswordChange({ newPassword: "", confirmPassword: "" });
    setPasswordMessage("Password updated successfully.");
  };

  const lockDashboard = () => {
    sessionStorage.removeItem(STORAGE_KEYS.dashboardAuth);
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return (
      <>
        <Header
          label="Private Creator Space"
          intro={`This space belongs to ${OWNER_NAME}. Unlock to add dance, art, books, and basketball updates.`}
        />
        <main className="auth-main">
          <section className="card-section auth-card">
            <h2>Welcome back, {OWNER_NAME}</h2>
            {!savedPassword ? (
              <>
                <p className="entry-meta">
                  Create the private password you want for your dashboard.
                </p>
                <form className="entry-form" onSubmit={createDashboardPassword}>
                  <label>
                    New Password
                    <input
                      type="password"
                      value={passwordSetup.newPassword}
                      onChange={(event) =>
                        setPasswordSetup((prev) => ({
                          ...prev,
                          newPassword: event.target.value,
                        }))
                      }
                      placeholder="Create your password"
                      required
                    />
                  </label>
                  <label>
                    Confirm Password
                    <input
                      type="password"
                      value={passwordSetup.confirmPassword}
                      onChange={(event) =>
                        setPasswordSetup((prev) => ({
                          ...prev,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Confirm your password"
                      required
                    />
                  </label>
                  {authError && <p className="auth-error">{authError}</p>}
                  <button type="submit">Create & Unlock</button>
                </form>
              </>
            ) : (
              <>
                <p className="entry-meta">
                  Enter your private password to open your creative dashboard.
                </p>
                <form className="entry-form" onSubmit={unlockDashboard}>
                  <label>
                    Dashboard Password
                    <input
                      type="password"
                      value={dashboardPassword}
                      onChange={(event) => setDashboardPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </label>
                  {authError && <p className="auth-error">{authError}</p>}
                  <button type="submit">Unlock My Space</button>
                </form>
              </>
            )}
            <p className="entry-meta">
              <Link to="/">Back to public portfolio</Link>
            </p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        label="Creator Dashboard"
        intro={`Welcome back, ${OWNER_NAME}. This is your private upload and management page.`}
      />
      <div className="dashboard-tools-wrap">
        <section className="card-section dashboard-tools">
          <button type="button" className="secondary-btn" onClick={lockDashboard}>
            Lock Dashboard
          </button>
          <form className="password-inline-form" onSubmit={changeDashboardPassword}>
            <label>
              New Password
              <input
                type="password"
                value={passwordChange.newPassword}
                onChange={(event) =>
                  setPasswordChange((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="Change password"
                required
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(event) =>
                  setPasswordChange((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Repeat new password"
                required
              />
            </label>
            <button type="submit">Update Password</button>
          </form>
          {passwordMessage && <p className="entry-meta">{passwordMessage}</p>}
        </section>
      </div>
      <main>
        <section id="dance-archive" className="card-section">
          <div className="section-head">
            <h2>Dance Archive</h2>
            <p>Save each performance by date, theme, and video link.</p>
          </div>
          <div className="filters">
            <label>
              Search Theme
              <input
                type="search"
                value={danceFilter.query}
                onChange={(e) => setDanceFilter((p) => ({ ...p, query: e.target.value }))}
              />
            </label>
            <label>
              Filter By Date
              <input
                type="date"
                value={danceFilter.date}
                onChange={(e) => setDanceFilter((p) => ({ ...p, date: e.target.value }))}
              />
            </label>
          </div>
          <form className="entry-form" onSubmit={submitDance}>
            <label>
              Date
              <input type="date" value={danceForm.date} onChange={(e) => setDanceForm((p) => ({ ...p, date: e.target.value }))} required />
            </label>
            <label>
              Theme / Mood
              <input type="text" value={danceForm.theme} onChange={(e) => setDanceForm((p) => ({ ...p, theme: e.target.value }))} required />
            </label>
            <label>
              Video URL
              <input type="url" value={danceForm.videoUrl} onChange={(e) => setDanceForm((p) => ({ ...p, videoUrl: e.target.value }))} required />
            </label>
            <label>
              Notes
              <textarea rows={3} value={danceForm.notes} onChange={(e) => setDanceForm((p) => ({ ...p, notes: e.target.value }))} />
            </label>
            <div className="form-actions">
              <button type="submit">{danceForm.id ? "Update Dance Entry" : "Add Dance Entry"}</button>
              {danceForm.id && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setDanceForm({ id: "", date: "", theme: "", videoUrl: "", notes: "" })}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div className="entry-list">
            {!visibleDance.length && <p className="empty-state">No dance entries match this filter.</p>}
            {visibleDance.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.theme}</h3>
                <p className="entry-meta">Date: {formatDate(entry.date)}</p>
                {entry.notes && <p>{entry.notes}</p>}
                <p className="entry-meta">
                  <a href={entry.videoUrl} className="video-link" target="_blank" rel="noreferrer">
                    Watch video
                  </a>
                </p>
                {getYouTubeId(entry.videoUrl) && (
                  <div className="video-preview">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(entry.videoUrl)}`}
                      title="Dance video preview"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="entry-actions">
                  <button type="button" className="secondary-btn" onClick={() => setDanceForm(entry)}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn" onClick={() => setDance((prev) => prev.filter((x) => x.id !== entry.id))}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="art-gallery" className="card-section">
          <div className="section-head">
            <h2>Art Gallery</h2>
            <p>Organize artwork by category with full descriptions.</p>
          </div>
          <div className="filters">
            <label>
              Search Artwork
              <input type="search" value={artFilter.query} onChange={(e) => setArtFilter((p) => ({ ...p, query: e.target.value }))} />
            </label>
            <label>
              Filter Category
              <select value={artFilter.category} onChange={(e) => setArtFilter((p) => ({ ...p, category: e.target.value }))}>
                <option value="">All categories</option>
                <option value="Painting">Painting</option>
                <option value="Sketch">Sketch</option>
                <option value="Digital">Digital</option>
              </select>
            </label>
          </div>
          <form className="entry-form" onSubmit={submitArt}>
            <label>
              Artwork Title
              <input type="text" value={artForm.title} onChange={(e) => setArtForm((p) => ({ ...p, title: e.target.value }))} required />
            </label>
            <label>
              Category
              <select value={artForm.category} onChange={(e) => setArtForm((p) => ({ ...p, category: e.target.value as ArtEntry["category"] }))}>
                <option value="Painting">Painting</option>
                <option value="Sketch">Sketch</option>
                <option value="Digital">Digital</option>
              </select>
            </label>
            <label>
              Artwork Link (optional)
              <input type="url" value={artForm.imageUrl} onChange={(e) => setArtForm((p) => ({ ...p, imageUrl: e.target.value }))} />
            </label>
            <label>
              Description
              <textarea rows={4} value={artForm.description} onChange={(e) => setArtForm((p) => ({ ...p, description: e.target.value }))} required />
            </label>
            <div className="form-actions">
              <button type="submit">{artForm.id ? "Update Artwork" : "Add Artwork"}</button>
              {artForm.id && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setArtForm({ id: "", title: "", category: "Painting", imageUrl: "", description: "" })}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div className="entry-list">
            {!visibleArt.length && <p className="empty-state">No artwork matches this filter.</p>}
            {visibleArt.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">Category: {entry.category}</p>
                <p>{entry.description}</p>
                {entry.imageUrl && (
                  <p className="entry-meta">
                    <a href={entry.imageUrl} className="art-link" target="_blank" rel="noreferrer">
                      View artwork link
                    </a>
                  </p>
                )}
                <div className="entry-actions">
                  <button type="button" className="secondary-btn" onClick={() => setArtForm(entry)}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn" onClick={() => setArt((prev) => prev.filter((x) => x.id !== entry.id))}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="book-reviews" className="card-section">
          <div className="section-head">
            <h2>Book Reviews</h2>
            <p>Track summaries, ratings, and reading progress.</p>
          </div>
          <div className="filters">
            <label>
              Search Books
              <input type="search" value={bookFilter.query} onChange={(e) => setBookFilter((p) => ({ ...p, query: e.target.value }))} />
            </label>
            <label>
              Filter By Rating
              <select value={bookFilter.rating} onChange={(e) => setBookFilter((p) => ({ ...p, rating: e.target.value }))}>
                <option value="">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </label>
          </div>
          <form className="entry-form" onSubmit={submitBook}>
            <label>
              Novel Title
              <input type="text" value={bookForm.title} onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))} required />
            </label>
            <label>
              Author
              <input type="text" value={bookForm.author} onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))} required />
            </label>
            <label>
              Reading Progress (%)
              <input type="number" min={0} max={100} value={bookForm.progress} onChange={(e) => setBookForm((p) => ({ ...p, progress: Number(e.target.value) }))} required />
            </label>
            <label>
              Rating (1-5)
              <input type="number" min={1} max={5} value={bookForm.rating} onChange={(e) => setBookForm((p) => ({ ...p, rating: Number(e.target.value) }))} required />
            </label>
            <label>
              Summary / Thoughts
              <textarea rows={4} value={bookForm.summary} onChange={(e) => setBookForm((p) => ({ ...p, summary: e.target.value }))} required />
            </label>
            <div className="form-actions">
              <button type="submit">{bookForm.id ? "Update Review" : "Add Review"}</button>
              {bookForm.id && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setBookForm({
                      id: "",
                      title: "",
                      author: "",
                      progress: 0,
                      rating: 1,
                      summary: "",
                      createdAt: "",
                      updatedAt: "",
                    })
                  }
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div className="entry-list">
            {!visibleBooks.length && <p className="empty-state">No book reviews match this filter.</p>}
            {visibleBooks.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">Updated: {formatDate(entry.updatedAt || entry.createdAt)}</p>
                <p>{entry.summary}</p>
                <p className="entry-meta">Author: {entry.author}</p>
                <p className="entry-meta">
                  Progress: {entry.progress}% | Rating: {entry.rating}/5
                </p>
                <div className="entry-actions">
                  <button type="button" className="secondary-btn" onClick={() => setBookForm(entry)}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn" onClick={() => setBooks((prev) => prev.filter((x) => x.id !== entry.id))}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="basketball-tracker" className="card-section">
          <div className="section-head">
            <h2>Basketball Tracker</h2>
            <p>Log played dates, upcoming games, and fun facts.</p>
          </div>
          <div className="filters">
            <label>
              Search Notes
              <input type="search" value={basketFilter.query} onChange={(e) => setBasketFilter((p) => ({ ...p, query: e.target.value }))} />
            </label>
            <label>
              Filter Played Date
              <input type="date" value={basketFilter.date} onChange={(e) => setBasketFilter((p) => ({ ...p, date: e.target.value }))} />
            </label>
          </div>
          <form className="entry-form" onSubmit={submitBasket}>
            <label>
              Played Date
              <input type="date" value={basketForm.playedDate} onChange={(e) => setBasketForm((p) => ({ ...p, playedDate: e.target.value }))} required />
            </label>
            <label>
              Upcoming Game Date
              <input type="date" value={basketForm.upcomingDate} onChange={(e) => setBasketForm((p) => ({ ...p, upcomingDate: e.target.value }))} />
            </label>
            <label>
              Session Notes
              <textarea rows={3} value={basketForm.sessionNotes} onChange={(e) => setBasketForm((p) => ({ ...p, sessionNotes: e.target.value }))} required />
            </label>
            <label>
              Basketball Fun Fact
              <textarea rows={3} value={basketForm.fact} onChange={(e) => setBasketForm((p) => ({ ...p, fact: e.target.value }))} required />
            </label>
            <div className="form-actions">
              <button type="submit">{basketForm.id ? "Update Basketball Entry" : "Log Basketball Entry"}</button>
              {basketForm.id && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setBasketForm({ id: "", playedDate: "", upcomingDate: "", sessionNotes: "", fact: "" })}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div className="entry-list">
            {!visibleBasket.length && <p className="empty-state">No basketball logs match this filter.</p>}
            {visibleBasket.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">Played: {formatDate(entry.playedDate)}</h3>
                <p className="entry-meta">
                  {entry.upcomingDate ? `Upcoming game: ${formatDate(entry.upcomingDate)}` : "Upcoming game: Not scheduled"}
                </p>
                <p>{entry.sessionNotes}</p>
                <p>
                  <strong>Fun fact:</strong> {entry.fact}
                </p>
                <div className="entry-actions">
                  <button type="button" className="secondary-btn" onClick={() => setBasketForm(entry)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => setBasketball((prev) => prev.filter((x) => x.id !== entry.id))}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tech-portfolio" className="card-section">
          <div className="section-head">
            <h2>Tech Portfolio</h2>
            <p>Post complete websites, project details, screenshots, and links.</p>
          </div>
          <div className="filters">
            <label>
              Search Projects
              <input
                type="search"
                value={techFilter.query}
                onChange={(event) =>
                  setTechFilter((prev) => ({ ...prev, query: event.target.value }))
                }
              />
            </label>
            <label>
              Filter By Type
              <select
                value={techFilter.type}
                onChange={(event) =>
                  setTechFilter((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                <option value="">All project types</option>
                <option value="Website">Website</option>
                <option value="Web App">Web App</option>
                <option value="Mobile App">Mobile App</option>
                <option value="AI Project">AI Project</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <form className="entry-form" onSubmit={submitTech}>
            <label>
              Project Title
              <input
                type="text"
                value={techForm.title}
                onChange={(event) =>
                  setTechForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Project Type
              <select
                value={techForm.type}
                onChange={(event) =>
                  setTechForm((prev) => ({
                    ...prev,
                    type: event.target.value as TechProjectEntry["type"],
                  }))
                }
              >
                <option value="Website">Website</option>
                <option value="Web App">Web App</option>
                <option value="Mobile App">Mobile App</option>
                <option value="AI Project">AI Project</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              About the Project
              <textarea
                rows={4}
                value={techForm.about}
                onChange={(event) =>
                  setTechForm((prev) => ({ ...prev, about: event.target.value }))
                }
                placeholder="Describe what this project does and why it matters."
                required
              />
            </label>
            <label>
              Screenshot URL
              <input
                type="url"
                value={techForm.screenshotUrl}
                onChange={(event) =>
                  setTechForm((prev) => ({
                    ...prev,
                    screenshotUrl: event.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </label>
            <label>
              Live Website Link
              <input
                type="url"
                value={techForm.liveUrl}
                onChange={(event) =>
                  setTechForm((prev) => ({ ...prev, liveUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </label>
            <label>
              Project Link (GitHub/Docs)
              <input
                type="url"
                value={techForm.repoUrl}
                onChange={(event) =>
                  setTechForm((prev) => ({ ...prev, repoUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </label>
            <div className="form-actions">
              <button type="submit">{techForm.id ? "Update Project" : "Add Project"}</button>
              {techForm.id && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setTechForm({
                      id: "",
                      title: "",
                      type: "Website",
                      about: "",
                      screenshotUrl: "",
                      liveUrl: "",
                      repoUrl: "",
                      updatedAt: "",
                    })
                  }
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div className="entry-list">
            {!visibleTech.length && <p className="empty-state">No tech projects match this filter.</p>}
            {visibleTech.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <h3 className="entry-title">{entry.title}</h3>
                <p className="entry-meta">
                  {entry.type} | Updated: {formatDate(entry.updatedAt)}
                </p>
                <p>{entry.about}</p>
                {entry.screenshotUrl && (
                  <img
                    src={entry.screenshotUrl}
                    alt={`${entry.title} screenshot`}
                    className="project-screenshot"
                    loading="lazy"
                  />
                )}
                <div className="project-links">
                  {entry.liveUrl && (
                    <a href={entry.liveUrl} className="art-link" target="_blank" rel="noreferrer">
                      Live Website
                    </a>
                  )}
                  {entry.repoUrl && (
                    <a href={entry.repoUrl} className="art-link" target="_blank" rel="noreferrer">
                      Project Link
                    </a>
                  )}
                </div>
                <div className="entry-actions">
                  <button type="button" className="secondary-btn" onClick={() => setTechForm(entry)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => setTech((prev) => prev.filter((x) => x.id !== entry.id))}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p className="bottom-dashboard-link">
          <Link to="/">Public portfolio</Link>
        </p>
        <p>Made with heart, rhythm, color, and confidence.</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
