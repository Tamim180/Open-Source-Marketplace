import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  GitBranch,
  ArrowUpRight,
  X,
  Github,
  Copy,
  Check,
  Plus,
} from "lucide-react";

/* ---------------------------------------------------------
   Design tokens — dark developer theme.
   Base is a deep forest-black rather than pure #000, so the
   brand's green identity carries through even in the neutral
   surfaces. Two accents (green + amber) plus one "invert"
   light-chip treatment for selected/standout states, so no
   single element is doing the "one neon accent on black" tell
   by itself — each has a distinct job.
--------------------------------------------------------- */
const c = {
  bg: "#0F1B13",
  surface: "#17271C",
  surfaceAlt: "#1E3124",
  line: "#28402F",
  lineSoft: "#1F3226",
  text: "#ECF2E8",
  textSoft: "#AABBA9",
  textFaint: "#8A9C89",
  primary: "#3EBE7C",
  primaryWash: "#163826",
  primaryOnWash: "#7FE3AC",
  amber: "#E4A15C",
  amberWash: "#3A2814",
  invert: "#ECF2E8",
  invertText: "#0F1B13",
  collectionBg: "#123321",
  collectionBlurb: "#B9D6C2",
  collectionMeta: "#8FC9A2",
  codeBg: "#081209",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const CATEGORIES = [
  "All",
  "Productivity",
  "Media",
  "CLI",
  "Self-hosted",
  "Security",
  "Web",
  "Utilities",
];

const PROJECTS = [
  {
    id: "localsend",
    name: "LocalSend",
    tagline: "Send files between your own devices, no server involved.",
    description:
      "LocalSend discovers devices on the same network and transfers files directly between them, encrypted, with no account and no upload to a third party. It works the same way whether you're moving a photo from your phone to your laptop or sending a folder across the room.",
    platforms: ["Android", "iOS", "Linux", "Windows", "macOS"],
    category: "Utilities",
    license: "MIT",
    stars: 18400,
    updated: "3 days ago",
    badge: "Trending",
    repo: "localsend/localsend",
    install: "flatpak install org.localsend.localsend_app",
  },
  {
    id: "spotube",
    name: "Spotube",
    tagline: "Stream music without ads, without a subscription.",
    description:
      "Spotube plays music through open catalogs while keeping the library browsing and playlist experience people expect from a modern streaming app. No ads, no premium tier, no tracking pixels riding along with your queue.",
    platforms: ["Android", "Linux", "Windows", "macOS"],
    category: "Media",
    license: "GPL-3.0",
    stars: 27100,
    updated: "1 day ago",
    badge: "Trending",
    repo: "KRTirtho/spotube",
    install: "flatpak install com.github.KRTirtho.Spotube",
  },
  {
    id: "joplin",
    name: "Joplin",
    tagline: "Notes and to-dos that sync on your own terms.",
    description:
      "Joplin stores notes as plain markdown files and syncs them through whichever backend you already trust — a personal server, an encrypted cloud folder, or nothing at all. Notebooks, tags, and to-dos work the way a paper notebook would, just faster to search.",
    platforms: ["Android", "iOS", "Linux", "Windows", "macOS", "Web"],
    category: "Productivity",
    license: "AGPL-3.0",
    stars: 46200,
    updated: "6 hours ago",
    badge: "New",
    repo: "laurent22/joplin",
    install: "flatpak install net.cozic.joplin_desktop",
  },
  {
    id: "ghostty",
    name: "Ghostty",
    tagline: "A terminal that gets out of the way.",
    description:
      "Ghostty renders entirely on the GPU, which means scrolling and resizing stay smooth even with heavy output. It ships with sensible defaults, so most people never open the config file, but everything is there when they do.",
    platforms: ["Linux", "macOS"],
    category: "CLI",
    license: "MIT",
    stars: 22800,
    updated: "2 days ago",
    badge: "Editor's pick",
    repo: "ghostty-org/ghostty",
    install: "brew install --cask ghostty",
  },
  {
    id: "yt-dlp",
    name: "yt-dlp",
    tagline: "Download video and audio from thousands of sites.",
    description:
      "yt-dlp is a command-line tool for saving video and audio from the sites that host it, with format selection, subtitle handling, and playlist support built in. It's a maintained fork of youtube-dl with a much wider list of supported sites.",
    platforms: ["Linux", "Windows", "macOS"],
    category: "CLI",
    license: "Unlicense",
    stars: 91500,
    updated: "5 hours ago",
    badge: "Trending",
    repo: "yt-dlp/yt-dlp",
    install: "pip install yt-dlp",
  },
  {
    id: "immich",
    name: "Immich",
    tagline: "Back up your photos to a server you control.",
    description:
      "Immich mirrors the photo and video backup experience of a big-tech phone app, but the server is yours. Faces, locations, and search run locally, and your library never leaves hardware you chose.",
    platforms: ["Self-hosted", "Web", "Android", "iOS"],
    category: "Self-hosted",
    license: "AGPL-3.0",
    stars: 39700,
    updated: "12 hours ago",
    badge: "New",
    repo: "immich-app/immich",
    install: "docker compose up -d",
  },
  {
    id: "excalidraw",
    name: "Excalidraw",
    tagline: "A whiteboard that feels hand-drawn.",
    description:
      "Excalidraw is a collaborative sketching tool that runs entirely in the browser. Shapes, arrows, and text stay editable, and a room link is all it takes to draw with someone else in real time.",
    platforms: ["Web"],
    category: "Web",
    license: "MIT",
    stars: 84300,
    updated: "1 day ago",
    badge: "Editor's pick",
    repo: "excalidraw/excalidraw",
    install: "npx degit excalidraw/excalidraw-app-template",
  },
  {
    id: "cryptomator",
    name: "Cryptomator",
    tagline: "Encrypt files before they reach your cloud drive.",
    description:
      "Cryptomator creates an encrypted vault inside any existing cloud folder. Files are encrypted individually on your device before syncing, so the cloud provider only ever sees ciphertext.",
    platforms: ["Android", "iOS", "Linux", "Windows", "macOS"],
    category: "Security",
    license: "GPL-3.0",
    stars: 8600,
    updated: "4 days ago",
    badge: null,
    repo: "cryptomator/cryptomator",
    install: "flatpak install org.cryptomator.Cryptomator",
  },
  {
    id: "standard-notes",
    name: "Standard Notes",
    tagline: "End-to-end encrypted notes, built to last decades.",
    description:
      "Standard Notes encrypts every note on your device before it syncs anywhere. The editor stays deliberately simple, and the file format is documented so your notes stay readable long after any one app.",
    platforms: ["Web", "Linux", "Windows", "macOS", "Android", "iOS"],
    category: "Productivity",
    license: "AGPL-3.0",
    stars: 8300,
    updated: "1 week ago",
    badge: null,
    repo: "standardnotes/app",
    install: "flatpak install org.standardnotes.standardnotes",
  },
  {
    id: "syncthing",
    name: "Syncthing",
    tagline: "Keep folders in sync across devices, peer to peer.",
    description:
      "Syncthing replicates folders directly between your own devices without routing files through a third-party server. Every connection is encrypted and authenticated, and you decide exactly which folders go where.",
    platforms: ["Linux", "Windows", "macOS", "Android"],
    category: "Self-hosted",
    license: "MPL-2.0",
    stars: 65900,
    updated: "2 days ago",
    badge: "Trending",
    repo: "syncthing/syncthing",
    install: "flatpak install me.kozec.syncthingtk",
  },
  {
    id: "jellyfin",
    name: "Jellyfin",
    tagline: "A media server with no subscription attached.",
    description:
      "Jellyfin organizes and streams your own media library — movies, shows, music — to any device on your network or beyond, with no telemetry and no paywall behind advanced features.",
    platforms: ["Self-hosted", "Web"],
    category: "Self-hosted",
    license: "GPL-2.0",
    stars: 34200,
    updated: "3 days ago",
    badge: null,
    repo: "jellyfin/jellyfin",
    install: "docker compose up -d",
  },
  {
    id: "appflowy",
    name: "AppFlowy",
    tagline: "A workspace for notes and docs you fully own.",
    description:
      "AppFlowy stores your workspace locally by default, with a familiar blocks-and-databases editor. It's built as an open alternative to hosted workspace tools, for people who want the data on their own disk.",
    platforms: ["Linux", "Windows", "macOS"],
    category: "Productivity",
    license: "AGPL-3.0",
    stars: 58100,
    updated: "8 hours ago",
    badge: "New",
    repo: "AppFlowy-IO/AppFlowy",
    install: "flatpak install io.appflowy.AppFlowy",
  },
];

const COLLECTIONS = [
  {
    title: "Alternatives to proprietary Windows utilities",
    blurb: "File sharing, encryption, and sync tools that don't phone home.",
    ids: ["localsend", "cryptomator", "syncthing"],
  },
  {
    title: "A self-hosted stack worth running",
    blurb: "Photos, media, and files, kept on hardware you control.",
    ids: ["immich", "jellyfin", "syncthing"],
  },
  {
    title: "Android apps you won't find on the Play Store",
    blurb: "Independent builds, distributed outside the usual store.",
    ids: ["localsend", "spotube", "joplin"],
  },
];

function formatStars(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;
}

function badgeStyle(badge) {
  if (badge === "Trending") return { bg: c.amberWash, fg: c.amber };
  if (badge === "New") return { bg: c.primaryWash, fg: c.primaryOnWash };
  if (badge === "Editor's pick") return { bg: c.invert, fg: c.invertText };
  return null;
}

function ProjectCard({ project, onOpen, wide }) {
  const badge = badgeStyle(project.badge);
  return (
    <button
      onClick={() => onOpen(project)}
      className={`text-left rounded-xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 ${
        wide ? "w-72 shrink-0 snap-start" : ""
      }`}
      style={{
        backgroundColor: c.surface,
        border: `1px solid ${c.line}`,
        fontFamily: "Archivo, sans-serif",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0"
          style={{ backgroundColor: c.primaryWash, color: c.primaryOnWash }}
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        {badge && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
            style={{ backgroundColor: badge.bg, color: badge.fg }}
          >
            {project.badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-base leading-tight" style={{ color: c.text }}>
          {project.name}
        </h3>
        <p className="text-sm mt-1 leading-snug" style={{ color: c.textSoft }}>
          {project.tagline}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mt-auto">
        {project.platforms.slice(0, 3).map((p) => (
          <span
            key={p}
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: c.surfaceAlt, color: c.textSoft }}
          >
            {p}
          </span>
        ))}
        {project.platforms.length > 3 && (
          <span className="text-xs px-2 py-0.5" style={{ color: c.textFaint }}>
            +{project.platforms.length - 3}
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-4 pt-3 text-xs"
        style={{
          borderTop: `1px solid ${c.lineSoft}`,
          color: c.textFaint,
          fontFamily: "IBM Plex Mono, monospace",
        }}
      >
        <span className="flex items-center gap-1">
          <Star size={12} strokeWidth={2} /> {formatStars(project.stars)}
        </span>
        <span>{project.license}</span>
        <span className="ml-auto">{project.updated}</span>
      </div>
    </button>
  );
}

function Shelf({ title, count, projects, onOpen }) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline gap-3 mb-4 px-6 md:px-10">
        <h2 className="text-xl font-semibold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
          {title}
        </h2>
        <span
          className="text-xs"
          style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}
        >
          {count} listed
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-2 snap-x snap-mandatory">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onOpen={onOpen} wide />
        ))}
      </div>
    </section>
  );
}

function CollectionCard({ collection, projects, onOpen }) {
  const items = collection.ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: c.collectionBg, color: c.text }}
    >
      <div>
        <h3 className="font-semibold text-lg leading-snug" style={{ fontFamily: "Archivo, sans-serif" }}>
          {collection.title}
        </h3>
        <p className="text-sm mt-1" style={{ color: c.collectionBlurb }}>
          {collection.blurb}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpen(p)}
            className="flex items-center justify-between text-left px-3 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
          >
            <span className="text-sm font-medium">{p.name}</span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: c.collectionMeta, fontFamily: "IBM Plex Mono, monospace" }}
            >
              <Star size={11} /> {formatStars(p.stars)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailModal({ project, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!project) return null;

  const copyInstall = () => {
    navigator.clipboard?.writeText(project.install).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
      style={{ backgroundColor: "rgba(4,9,6,0.65)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl p-8 my-8"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.line}`, fontFamily: "Archivo, sans-serif" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold shrink-0"
              style={{ backgroundColor: c.primaryWash, color: c.primaryOnWash }}
            >
              {project.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: c.text }}>
                {project.name}
              </h2>
              <p className="text-sm" style={{ color: c.textSoft }}>
                {project.tagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: c.surfaceAlt, color: c.textSoft }}
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-6 text-sm leading-relaxed" style={{ color: c.textSoft }}>
          {project.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
          {[
            ["License", project.license],
            ["Stars", formatStars(project.stars)],
            ["Updated", project.updated],
            ["Category", project.category],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="text-xs" style={{ color: c.textFaint }}>
                {label}
              </div>
              <div
                className="font-medium mt-0.5"
                style={{ color: c.text, fontFamily: "IBM Plex Mono, monospace" }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="text-xs mb-2" style={{ color: c.textFaint }}>
            Platforms
          </div>
          <div className="flex flex-wrap gap-2">
            {project.platforms.map((p) => (
              <span
                key={p}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: c.surfaceAlt, color: c.textSoft }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs mb-2" style={{ color: c.textFaint }}>
            Install
          </div>
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: c.codeBg }}
          >
            <code
              className="text-sm overflow-x-auto whitespace-nowrap"
              style={{ color: c.primaryOnWash, fontFamily: "IBM Plex Mono, monospace" }}
            >
              {project.install}
            </code>
            <button onClick={copyInstall} className="shrink-0" style={{ color: c.textFaint }}>
              {copied ? <Check size={16} color={c.primaryOnWash} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-7">
          <a
            href={`https://github.com/${project.repo}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: c.primary, color: c.invertText }}
          >
            <Github size={16} /> View source <ArrowUpRight size={14} />
          </a>
          <span className="text-xs" style={{ color: c.textFaint }}>
            Hosted on GitHub — OSM only indexes the listing.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OpenSourceMarketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(null);

  const trending = PROJECTS.filter((p) => p.badge === "Trending");
  const fresh = PROJECTS.filter((p) => p.badge === "New");

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div style={{ backgroundColor: c.bg, minHeight: "100%" }}>
      <style>{FONTS}</style>
      <style>{`
        @keyframes osm-blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        .osm-cursor { animation: osm-blink 1.1s step-end infinite; }
        ::placeholder { color: ${c.textFaint}; }
      `}</style>

      {/* Top bar */}
      <header
        className="flex items-center justify-between gap-4 px-6 md:px-10 py-4 sticky top-0 z-40"
        style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.line}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: c.primary, color: c.invertText, fontFamily: "IBM Plex Mono, monospace" }}
          >
            {"</>"}
          </div>
          <div className="leading-none">
            <div className="font-bold text-sm" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              Open Source Marketplace
            </div>
            <div className="text-xs" style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}>
              osm
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: c.textSoft, fontFamily: "Archivo, sans-serif" }}>
          <a href="#browse" className="hover:opacity-70">Browse</a>
          <a href="#collections" className="hover:opacity-70">Collections</a>
        </nav>

        <Link
          to="/submit"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: c.primary, color: c.invertText, fontFamily: "Archivo, sans-serif" }}
        >
          <Plus size={15} /> Submit project
        </Link>
      </header>

      {/* Terminal-prompt hero */}
      <section className="px-6 md:px-10 pt-14 pb-8">
        <div className="max-w-3xl">
          <div
            className="flex items-center gap-2 text-sm mb-4"
            style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}
          >
            <span style={{ color: c.primaryOnWash }}>osm</span>
            <span>~</span>
            <span>$</span>
            <span>browse --open-source</span>
            <span className="osm-cursor" style={{ color: c.primaryOnWash }}>▍</span>
          </div>
          <h1
            className="text-3xl md:text-[2.5rem] font-bold leading-tight"
            style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}
          >
            Every listing links back to the source.
          </h1>
          <p className="mt-3 text-base leading-relaxed max-w-xl" style={{ color: c.textSoft }}>
            A catalog of open-source software across every platform — submitted by the
            people who built it, indexed from GitHub, hosted nowhere else.
          </p>

          <div className="relative mt-6 max-w-lg">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: c.textFaint }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, e.g. file sync, notes, terminal"
              className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: c.surface,
                border: `1px solid ${c.line}`,
                color: c.text,
              }}
            />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <div className="px-6 md:px-10 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat === category;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="text-sm px-3.5 py-1.5 rounded-full font-medium transition-colors"
              style={{
                backgroundColor: isActive ? c.invert : c.surface,
                color: isActive ? c.invertText : c.textSoft,
                border: `1px solid ${isActive ? c.invert : c.line}`,
                fontFamily: "Archivo, sans-serif",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Trending + New shelves — only when not actively searching/filtering */}
      {category === "All" && !query && (
        <>
          <Shelf title="Trending this week" count={trending.length} projects={trending} onOpen={setActive} />
          <Shelf title="Recently updated" count={fresh.length} projects={fresh} onOpen={setActive} />
        </>
      )}

      {/* Collections */}
      {category === "All" && !query && (
        <section id="collections" className="mt-14 px-6 md:px-10">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-xl font-semibold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              Collections
            </h2>
            <span className="text-xs" style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}>
              {COLLECTIONS.length} curated
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLLECTIONS.map((col) => (
              <CollectionCard key={col.title} collection={col} projects={PROJECTS} onOpen={setActive} />
            ))}
          </div>
        </section>
      )}

      {/* Full catalog */}
      <section id="browse" className="mt-14 px-6 md:px-10 pb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-xl font-semibold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
            {query || category !== "All" ? "Results" : "Full catalog"}
          </h2>
          <span className="text-xs" style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}>
            {filtered.length} listed
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center text-sm"
            style={{ backgroundColor: c.surface, border: `1px solid ${c.line}`, color: c.textSoft }}
          >
            Nothing matches "{query}" in {category === "All" ? "any category" : category}. Try a
            different search, or{" "}
            <span style={{ color: c.primaryOnWash, fontWeight: 500 }}>submit the project yourself</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={setActive} />
            ))}
          </div>
        )}
      </section>

      {/* Submit CTA band */}
      <section className="px-6 md:px-10 pb-14">
        <div
          className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ backgroundColor: c.primaryWash }}
        >
          <div>
            <h3 className="text-lg font-semibold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              Built something open source?
            </h3>
            <p className="text-sm mt-1" style={{ color: c.primaryOnWash }}>
              Paste a GitHub link. OSM builds the listing from your repo — you keep hosting the code.
            </p>
          </div>
          <Link
            to="/submit"
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium shrink-0"
            style={{ backgroundColor: c.invert, color: c.invertText, fontFamily: "Archivo, sans-serif" }}
          >
            <GitBranch size={16} /> List your project
          </Link>
        </div>
      </section>

      <footer
        className="px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ borderTop: `1px solid ${c.line}`, color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}
      >
        <span>osm — early build, running on free-tier hosting.</span>
        <a href="#" className="flex items-center gap-1" style={{ color: c.textSoft }}>
          <Github size={13} /> Contribute on GitHub
        </a>
      </footer>

      <DetailModal project={active} onClose={() => setActive(null)} />
    </div>
  );
}
