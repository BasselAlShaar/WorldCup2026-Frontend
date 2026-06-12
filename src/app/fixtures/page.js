"use client";
import { useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";
import MatchCard from "@/components/MatchCard/page";

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(8640000000000000);
  const [datePart, timePart] = dateStr.split(" ");
  const [month, day, year] = datePart.split("/");
  const d = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${timePart ?? "00:00"}`
  );
  return isNaN(d.getTime()) ? new Date(8640000000000000) : d;
}

function formatDayHeader(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    timeZone: "Asia/Beirut",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupByLebanonDate(matches) {
  const grouped = {};
  matches.forEach((m) => {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut" }).format(new Date(m.date));
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

async function fetchFixtures() {
  const [gamesRes, teamsRes] = await Promise.all([
    fetch("https://worldcup26.ir/get/games", { cache: "no-store" }).then((r) => r.json()),
    fetch("https://worldcup26.ir/get/teams", { cache: "no-store" }).then((r) => r.json()),
  ]);

  const games = gamesRes?.games ?? [];
  const teamsArray = Array.isArray(teamsRes) ? teamsRes : teamsRes?.teams ?? [];
  const teamMap = {};
  teamsArray.forEach((t) => { teamMap[String(t.id)] = t; });

  const now = new Date();

  return games
    .filter((g) => g.type === "group")
    .map((g) => {
      const finished = String(g.finished).toUpperCase() === "TRUE";
      const matchDate = parseLocalDate(g.local_date);
      const isLive = !finished && g.time_elapsed !== "notstarted" && matchDate <= now;
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

export default function FixturesPage() {
  const fetcher = useCallback(() => fetchFixtures(), []);
  const { data: matches, loading } = usePolling(fetcher, 30000);

  const liveMatches = matches?.filter((m) => m.status === "live") ?? [];
  const upcoming = (matches?.filter((m) => m.status === "upcoming") ?? []).sort((a, b) => a.date.localeCompare(b.date));
  const finished = (matches?.filter((m) => m.status === "finished") ?? []).sort((a, b) => b.date.localeCompare(a.date));
  const groupedRest = groupByLebanonDate([...upcoming, ...finished]);

  const todayLB = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut" }).format(new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="animate-fade-in">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-2">Fixtures</h1>
            <p className="text-white/40 font-body text-sm">
              Group stage · All times in Beirut time
              {matches != null && <span className="ml-2 text-white/20">· {matches.length} matches</span>}
            </p>
          </div>
          {liveMatches.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {liveMatches.length} match{liveMatches.length !== 1 ? "es" : ""} live
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-10 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
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
                {liveMatches.map((match) => <MatchCard key={match.id} match={match} />)}
              </div>
            </section>
          )}

          {groupedRest.map(([date, dayMatches], gi) => {
            const isToday = date === todayLB;
            return (
              <section key={date} className="animate-slide-up" style={{ animationDelay: `${gi * 80}ms` }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`font-body font-semibold text-xs uppercase tracking-[0.2em] ${isToday ? "text-amber-400" : "text-white/40"}`}>
                    {isToday ? "Today · " : ""}{formatDayHeader(date)}
                  </span>
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-xs tabular-nums">
                    {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {dayMatches.map((match) => <MatchCard key={match.id} match={match} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}