import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Search,
  Loader2,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* Same dark token set as the main catalog screen, kept in
   sync so this reads as one product rather than a bolted-on
   form page. */
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
  danger: "#E27A6B",
  dangerWash: "#3A1E1A",
  codeBg: "#081209",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const CATEGORIES = [
  "Productivity",
  "Media",
  "CLI",
  "Self-hosted",
  "Security",
  "Web",
  "Utilities",
];

const PLATFORMS = ["Android", "iOS", "Linux", "Windows", "macOS", "Web", "Self-hosted"];

function parseRepoUrl(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  const bare = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (bare) return { owner: bare[1], repo: bare[2] };
  return null;
}

function guessCategory(topics = [], language = "") {
  const hay = [...topics, language].join(" ").toLowerCase();
  if (/(note|todo|task|productiv|calendar)/.test(hay)) return "Productivity";
  if (/(music|video|media|stream|player)/.test(hay)) return "Media";
  if (/(cli|terminal|shell|command)/.test(hay)) return "CLI";
  if (/(self.?hosted|docker|server|homelab)/.test(hay)) return "Self-hosted";
  if (/(security|encrypt|privacy|vpn|auth)/.test(hay)) return "Security";
  if (/(web|browser|extension)/.test(hay)) return "Web";
  return "Utilities";
}

function StepDot({ active, done }) {
  return (
    <div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: done || active ? c.primary : c.line }}
    />
  );
}

export default function SubmitProject() {
  const [stage, setStage] = useState("fetch"); // fetch | loading | error | form | success
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [repoData, setRepoData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "Utilities",
    platforms: [],
    license: "",
    install: "",
  });

  const fetchRepo = async () => {
    const parsed = parseRepoUrl(url);
    if (!parsed) {
      setError("That doesn't look like a GitHub repo — try owner/repo or a full github.com URL.");
      setStage("error");
      return;
    }
    setStage("loading");
    setError("");
    try {
      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
      if (res.status === 404) {
        setError(`Couldn't find ${parsed.owner}/${parsed.repo} on GitHub. Check the spelling and that it's public.`);
        setStage("error");
        return;
      }
      if (res.status === 403) {
        setError("GitHub's rate limit kicked in on this connection — wait a minute and try again.");
        setStage("error");
        return;
      }
      if (!res.ok) {
        setError(`GitHub returned an error (${res.status}). Try again in a moment.`);
        setStage("error");
        return;
      }
      const data = await res.json();
      setRepoData(data);
      const category = guessCategory(data.topics, data.language);
      setForm({
        name: data.name,
        tagline: (data.description || "").slice(0, 100),
        description: data.description || "",
        category,
        platforms: [],
        license: data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? data.license.spdx_id : "",
        install: "",
      });
      setStage("form");
    } catch (e) {
      setError("Couldn't reach GitHub from here — check your connection and try again.");
      setStage("error");
    }
  };

  const togglePlatform = (p) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  const canSubmit = form.name && form.tagline && form.category && form.platforms.length > 0;

  const currentStep = stage === "fetch" || stage === "loading" || stage === "error" ? 0 : stage === "form" ? 1 : 2;

  return (
    <div style={{ backgroundColor: c.bg, minHeight: "100%" }}>
      <style>{FONTS}</style>
      <style>{`::placeholder { color: ${c.textFaint}; }`}</style>

      <header
        className="flex items-center gap-3 px-6 md:px-10 py-4"
        style={{ borderBottom: `1px solid ${c.line}` }}
      >
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm"
          style={{ color: c.textSoft, fontFamily: "Archivo, sans-serif" }}
        >
          <ArrowLeft size={15} /> Back to catalog
        </Link>
      </header>

      <div className="max-w-xl mx-auto px-6 md:px-0 pt-12 pb-24">
        <div className="flex items-center gap-2 mb-8">
          <StepDot active={currentStep === 0} done={currentStep > 0} />
          <div className="h-px w-8" style={{ backgroundColor: c.line }} />
          <StepDot active={currentStep === 1} done={currentStep > 1} />
          <div className="h-px w-8" style={{ backgroundColor: c.line }} />
          <StepDot active={currentStep === 2} done={false} />
          <span
            className="text-xs ml-3"
            style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}
          >
            {currentStep === 0 ? "find repo" : currentStep === 1 ? "edit listing" : "done"}
          </span>
        </div>

        {(stage === "fetch" || stage === "loading" || stage === "error") && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              List your project
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: c.textSoft }}>
              Point us at the GitHub repo and we'll pull in the name, description, license, and
              stars automatically. You fill in the rest — platforms, category, how to install it.
            </p>

            <div className="mt-6 relative">
              <Github
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: c.textFaint }}
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && stage !== "loading" && fetchRepo()}
                placeholder="github.com/owner/repo"
                className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: c.surface,
                  border: `1px solid ${stage === "error" ? c.danger : c.line}`,
                  color: c.text,
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              />
            </div>

            {stage === "error" && (
              <div
                className="mt-3 flex items-start gap-2 text-sm px-4 py-3 rounded-lg"
                style={{ backgroundColor: c.dangerWash, color: c.danger }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={fetchRepo}
              disabled={!url.trim() || stage === "loading"}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: c.primary, color: c.invertText, fontFamily: "Archivo, sans-serif" }}
            >
              {stage === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Fetching from GitHub…
                </>
              ) : (
                <>
                  <Search size={16} /> Fetch repo details
                </>
              )}
            </button>
          </div>
        )}

        {stage === "form" && repoData && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              Check the listing
            </h1>
            <p className="mt-2 text-sm" style={{ color: c.textSoft }}>
              Pulled straight from GitHub — edit anything before it goes live.
            </p>

            {/* Fetched repo summary */}
            <div
              className="mt-6 flex items-center gap-3 p-4 rounded-lg"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.line}` }}
            >
              <img
                src={repoData.owner?.avatar_url}
                alt=""
                className="w-10 h-10 rounded-lg shrink-0"
                style={{ border: `1px solid ${c.line}` }}
              />
              <div className="min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: c.text, fontFamily: "IBM Plex Mono, monospace" }}
                >
                  {repoData.full_name}
                </div>
                <div
                  className="flex items-center gap-3 text-xs mt-0.5"
                  style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}
                >
                  <span className="flex items-center gap-1">
                    <Star size={11} /> {repoData.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={11} /> {repoData.forks_count}
                  </span>
                  {repoData.language && <span>{repoData.language}</span>}
                </div>
              </div>
              <div
                className="ml-auto text-xs px-2 py-1 rounded-full shrink-0"
                style={{ backgroundColor: c.primaryWash, color: c.primaryOnWash }}
              >
                <Sparkles size={11} className="inline mr-1" />
                auto-filled
              </div>
            </div>

            {/* Editable fields */}
            <div className="mt-6 flex flex-col gap-5">
              <Field label="Project name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="osm-input"
                  style={inputStyle}
                />
              </Field>

              <Field label="Tagline" hint={`${form.tagline.length}/100`}>
                <input
                  value={form.tagline}
                  maxLength={100}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  style={inputStyle}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>

              <Field label="Category">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className="text-sm px-3.5 py-1.5 rounded-full font-medium"
                      style={{
                        backgroundColor: form.category === cat ? c.invert : c.surface,
                        color: form.category === cat ? c.invertText : c.textSoft,
                        border: `1px solid ${form.category === cat ? c.invert : c.line}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Platforms" hint="pick at least one">
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const isOn = form.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className="text-sm px-3.5 py-1.5 rounded-full font-medium"
                        style={{
                          backgroundColor: isOn ? c.primaryWash : c.surface,
                          color: isOn ? c.primaryOnWash : c.textSoft,
                          border: `1px solid ${isOn ? c.primaryWash : c.line}`,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="License" hint="from GitHub — edit if it's wrong">
                <input
                  value={form.license}
                  onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
                  placeholder="e.g. MIT, GPL-3.0"
                  style={{ ...inputStyle, fontFamily: "IBM Plex Mono, monospace" }}
                />
              </Field>

              <Field label="Install command" hint="not on GitHub — add it yourself">
                <input
                  value={form.install}
                  onChange={(e) => setForm((f) => ({ ...f, install: e.target.value }))}
                  placeholder="e.g. flatpak install org.example.App"
                  style={{ ...inputStyle, fontFamily: "IBM Plex Mono, monospace" }}
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setStage("fetch")}
                className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-lg"
                style={{ backgroundColor: c.surface, color: c.textSoft, border: `1px solid ${c.line}` }}
              >
                <ArrowLeft size={14} /> Different repo
              </button>
              <button
                onClick={() => canSubmit && setStage("success")}
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: c.primary, color: c.invertText }}
              >
                Submit listing <ArrowRight size={15} />
              </button>
            </div>
            {!canSubmit && (
              <p className="text-xs mt-2" style={{ color: c.textFaint }}>
                Needs a name, tagline, and at least one platform before it can go out.
              </p>
            )}
          </div>
        )}

        {stage === "success" && (
          <div className="text-center py-10">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: c.primaryWash }}
            >
              <CheckCircle2 size={26} style={{ color: c.primaryOnWash }} />
            </div>
            <h1 className="text-xl font-bold mt-5" style={{ color: c.text, fontFamily: "Archivo, sans-serif" }}>
              {form.name} is queued
            </h1>
            <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: c.textSoft }}>
              Your listing is saved as a draft. Once review is wired up, this is where it'd
              go live in the catalog.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setStage("fetch");
                  setUrl("");
                  setRepoData(null);
                }}
                className="text-sm px-5 py-2.5 rounded-lg font-medium"
                style={{ backgroundColor: c.surface, color: c.text, border: `1px solid ${c.line}` }}
              >
                Submit another
              </button>
              <Link
                to="/"
                className="text-sm px-5 py-2.5 rounded-lg font-medium"
                style={{ backgroundColor: c.primary, color: c.invertText }}
              >
                Back to catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  borderRadius: "0.5rem",
  backgroundColor: c.surface,
  border: `1px solid ${c.line}`,
  color: c.text,
  fontSize: "0.875rem",
  outline: "none",
  fontFamily: "Archivo, sans-serif",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          className="text-xs font-medium"
          style={{ color: c.textFaint, fontFamily: "Archivo, sans-serif" }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-xs" style={{ color: c.textFaint, fontFamily: "IBM Plex Mono, monospace" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
