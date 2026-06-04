export default function MatchCard({ match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isUpcoming = match.status === "upcoming";

  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl overflow-hidden
        ${
          isLive
            ? "border-gold/50 bg-gradient-to-br from-[#1a2540] to-[#0f1c35] shadow-gold/10 shadow-lg"
            : "border-white/10 bg-white/5 hover:bg-white/8"
        }`}
    >
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Group {match.group}
          </span>

          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          ) : isFinished ? (
            <span className="text-xs font-mono text-white/30 uppercase">FT</span>
          ) : (
            <span className="text-xs font-mono text-white/40">
              {formatLebanonTime(match.date)}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-3">
          {/* Home */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <TeamFlag flag={match.homeFlag} name={match.homeTeam} />
            <span
              className={`font-body font-semibold text-sm truncate ${
                isLive ? "text-white" : "text-white/80"
              }`}
            >
              {match.homeTeam}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isUpcoming ? (
              <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <span className="font-display text-lg text-white/30">vs</span>
              </div>
            ) : (
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  isLive ? "bg-gold/10 border border-gold/30" : "bg-white/5"
                }`}
              >
                <span className={`font-display text-2xl ${isLive ? "text-gold" : "text-white"}`}>
                  {match.homeScore}
                </span>
                <span className="font-display text-2xl text-white/30">–</span>
                <span className={`font-display text-2xl ${isLive ? "text-gold" : "text-white"}`}>
                  {match.awayScore}
                </span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 text-right min-w-0 flex items-center justify-end gap-2">
            <span
              className={`font-body font-semibold text-sm truncate ${
                isLive ? "text-white" : "text-white/80"
              }`}
            >
              {match.awayTeam}
            </span>
            <TeamFlag flag={match.awayFlag} name={match.awayTeam} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center gap-2 text-xs text-white/30 font-body">
          {match.venue && (
            <>
              <span>📍</span>
              <span className="truncate">{match.venue}</span>
            </>
          )}
          <span className="ml-auto tabular-nums">
            {formatLebanonDate(match.date)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function TeamFlag({ flag, name }) {
  if (!flag) return null;

  // URL flag (from API teams endpoint)
  if (flag.startsWith("http")) {
    return (
      <img
        src={flag}
        alt={name}
        className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
        loading="lazy"
      />
    );
  }

  // Emoji fallback
  return <span className="flex-shrink-0 text-base leading-none">{flag}</span>;
}

function toLebanon(dateStr) {
  // dateStr is an ISO string (UTC). Lebanon is UTC+3 in summer (EEST).
  const d = new Date(dateStr);
  // Use Intl to get Lebanon local time reliably
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Beirut",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatLebanonTime(dateStr) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Beirut",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "";
  }
}

function formatLebanonDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Beirut",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}