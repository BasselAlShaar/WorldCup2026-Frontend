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

async function fetchHomeData() {
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
        venue: "",
      };
    });
}

export default function Home() {
  const fetcher = useCallback(() => fetchHomeData(), []);
  const { data: allMatches, loading } = usePolling(fetcher, 30000);

  const liveMatches = allMatches?.filter((m) => m.status === "live") ?? [];
  const upcomingMatches = (allMatches?.filter((m) => m.status === "upcoming") ?? [])
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16 animate-fade-in">
        <p className="text-sm font-body font-medium text-white/40 uppercase tracking-[0.3em] mb-4">
          USA · Canada · Mexico
        </p>
        <h1 className="font-display text-7xl md:text-9xl text-white leading-none tracking-wider mb-4">
          FIFA World Cup
          <span className="text-gold"> 2026</span>
        </h1>
        <p className="text-white/50 font-body max-w-md mx-auto">
          Follow every match live. Scores update in real time, with full fixtures, group standings and the knockout bracket.
        </p>
      </div>

      {/* Live Now */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse-live" />
          <h2 className="font-display text-3xl text-white tracking-wider">Live now</h2>
          <span className="ml-auto text-xs font-mono text-white/30">
            Auto-refreshing every 30s
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : liveMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {liveMatches.map((match, i) => (
              <div key={match.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both", opacity: 0 }}>
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-white/30 font-body">No matches live right now</p>
          </div>
        )}
      </section>

      {/* Up Next */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-3xl text-white tracking-wider">Up next</h2>
          <span className="ml-auto text-xs font-mono text-white/30">All times in Beirut time</span>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : upcomingMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingMatches.slice(0, 6).map((match, i) => (
              <div key={match.id} className="animate-slide-up" style={{ animationDelay: `${(i + liveMatches.length) * 60}ms`, animationFillMode: "both", opacity: 0 }}>
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-white/30 font-body">No upcoming matches</p>
          </div>
        )}
      </section>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 animate-pulse h-28" />
      ))}
    </div>
  );
}