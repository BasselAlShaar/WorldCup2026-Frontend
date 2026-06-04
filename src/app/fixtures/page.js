import MatchCard from "@/components/MatchCard/page";
import { getGames } from "@/lib/api";
import { getTeamMap } from "@/lib/teams";

export const dynamic = "force-dynamic";

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(8640000000000000);
  const [datePart, timePart] = dateStr.split(" ");
  const [month, day, year] = datePart.split("/");
  const d = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${timePart ?? "00:00"}`
  );
  return isNaN(d.getTime()) ? new Date(8640000000000000) : d;
}

// Date header uses Lebanon timezone
function formatDayHeader(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    timeZone: "Asia/Beirut",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Group by Lebanon calendar date (not UTC date)
function groupByLebanonDate(matches) {
  const grouped = {};
  matches.forEach((m) => {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Beirut",
    }).format(new Date(m.date)); // "2026-06-11"
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

async function getMatches() {
  const [gamesRes, teamMap] = await Promise.all([getGames(), getTeamMap()]);
  const games = gamesRes?.games ?? [];
  const now = new Date();

  return games
    .filter((g) => g.type === "group")
    .map((g) => {
      const finished = String(g.finished).toUpperCase() === "TRUE";
      const matchDate = parseLocalDate(g.local_date);
      const isLive =
        !finished &&
        g.time_elapsed !== "notstarted" &&
        matchDate <= now;

      const homeTeamInfo = teamMap[String(g.home_team_id)];
      const awayTeamInfo = teamMap[String(g.away_team_id)];

      return {
        id: g._id,
        date: matchDate.toISOString(),
        status: finished ? "finished" : isLive ? "live" : "upcoming",
        group: g.group ?? "?",
        homeTeam: g.home_team_name_en || homeTeamInfo?.name_en || "TBD",
        awayTeam: g.away_team_name_en || awayTeamInfo?.name_en || "TBD",
        homeScore: finished || isLive ? Number(g.home_score ?? 0) : null,
        awayScore: finished || isLive ? Number(g.away_score ?? 0) : null,
        homeFlag: homeTeamInfo?.flag ?? null,
        awayFlag: awayTeamInfo?.flag ?? null,
        venue: g.stadium_name ?? "",
      };
    });
}

function DateSection({ date, matches, index }) {
  const todayLB = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Beirut",
  }).format(new Date());
  const isToday = date === todayLB;

  return (
    <section
      className="animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`font-body font-semibold text-xs uppercase tracking-[0.2em] ${
            isToday ? "text-amber-400" : "text-white/40"
          }`}
        >
          {isToday ? "Today · " : ""}
          {formatDayHeader(date)}
        </span>
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-white/20 text-xs tabular-nums">
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

export default async function FixturesPage() {
  const matches = await getMatches();

  if (!matches.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <PageHeader />
        <div className="flex flex-col items-center justify-center py-24 text-white/20">
          <span className="text-5xl mb-4">📋</span>
          <p className="font-body text-sm tracking-widest uppercase">
            No group stage matches found
          </p>
        </div>
      </div>
    );
  }

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));
  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => b.date.localeCompare(a.date));

  const groupedRest = groupByLebanonDate([...upcoming, ...finished]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <PageHeader totalMatches={matches.length} liveCount={liveMatches.length} />

      <div className="space-y-12 mt-10">
        {liveMatches.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 font-body font-semibold text-xs uppercase tracking-[0.2em] text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Live now
              </span>
              <div className="flex-1 h-px bg-red-500/20" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {groupedRest.map(([date, dayMatches], gi) => (
          <DateSection
            key={date}
            date={date}
            matches={dayMatches}
            index={gi + (liveMatches.length > 0 ? 1 : 0)}
          />
        ))}
      </div>
    </div>
  );
}

function PageHeader({ totalMatches, liveCount }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-2">
            Fixtures
          </h1>
          <p className="text-white/40 font-body text-sm">
            Group stage · All times in Beirut time
            {totalMatches != null && (
              <span className="ml-2 text-white/20">· {totalMatches} matches</span>
            )}
          </p>
        </div>

        {liveCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body font-medium">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {liveCount} match{liveCount !== 1 ? "es" : ""} live
          </div>
        )}
      </div>
    </div>
  );
}