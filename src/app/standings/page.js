"use client";
import { useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";

async function fetchStandings() {
  const [groupsRes, teamsRes] = await Promise.all([
    fetch("https://worldcup26.ir/get/groups", { cache: "no-store" }).then((r) => r.json()),
    fetch("https://worldcup26.ir/get/teams", { cache: "no-store" }).then((r) => r.json()),
  ]);

  const groups = Array.isArray(groupsRes) ? groupsRes : groupsRes?.groups ?? [];
  const teamsArray = Array.isArray(teamsRes) ? teamsRes : teamsRes?.teams ?? [];
  const teamMap = {};
  teamsArray.forEach((t) => { teamMap[String(t.id)] = t; });

  return { groups, teamMap };
}

const sortTeams = (teams) =>
  [...teams].sort((a, b) => {
    if ((b.pts ?? 0) !== (a.pts ?? 0)) return (b.pts ?? 0) - (a.pts ?? 0);
    if ((b.gd ?? 0) !== (a.gd ?? 0)) return (b.gd ?? 0) - (a.gd ?? 0);
    return (b.gf ?? 0) - (a.gf ?? 0);
  });

export default function StandingsPage() {
  const fetcher = useCallback(() => fetchStandings(), []);
  const { data, loading } = usePolling(fetcher, 30000);

  const sorted = data
    ? [...data.groups].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const teamMap = data?.teamMap ?? {};

  const thirdPlaceEntries = sorted
    .map((group) => {
      const teams = sortTeams(
        (group.teams ?? []).map((entry) => ({
          ...entry,
          teamInfo: teamMap[String(entry.team_id)] ?? null,
        }))
      );
      return teams[2] ?? null;
    })
    .filter(Boolean);

  const best8ThirdIds = new Set(
    sortTeams(thirdPlaceEntries).slice(0, 8).map((e) => String(e.team_id))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-in">
        <h1 className="font-display text-5xl md:text-6xl text-white tracking-wider">Group Standings</h1>
        <p className="text-white/40 font-body">Points, goal difference and rank for every group</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 animate-pulse h-64" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/20">
          <span className="text-5xl mb-4">📊</span>
          <p className="font-body text-sm tracking-widest uppercase">Standings not available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map((group, gi) => {
            const teams = sortTeams(
              (group.teams ?? []).map((entry) => ({
                ...entry,
                teamInfo: teamMap[String(entry.team_id)] ?? null,
              }))
            );

            return (
              <div key={group._id || gi} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${gi * 60}ms`, animationFillMode: "both", opacity: 0 }}>
                <div className="px-5 py-3 border-b border-white/10 bg-white/3 flex items-center gap-3">
                  <h2 className="font-display text-xl text-gold tracking-widest">Group {group.name}</h2>
                </div>
                <div className="px-4 py-2 flex items-center text-xs font-mono text-white/30 uppercase tracking-widest border-b border-white/5">
                  <span className="w-6 mr-2" />
                  <span className="flex-1">Team</span>
                  <span className="w-7 text-center">MP</span>
                  <span className="w-7 text-center">W</span>
                  <span className="w-7 text-center">D</span>
                  <span className="w-7 text-center">L</span>
                  <span className="w-7 text-center">GF</span>
                  <span className="w-7 text-center">GA</span>
                  <span className="w-7 text-center">GD</span>
                  <span className="w-9 text-center text-gold">Pts</span>
                </div>
                {teams.map((entry, ti) => {
                  const t = entry.teamInfo;
                  const isTop2 = ti < 2;
                  const isQualifiedThird = ti === 2 && best8ThirdIds.has(String(entry.team_id));
                  const isQualified = isTop2 || isQualifiedThird;
                  return (
                    <div key={entry._id || ti}
                      className={`px-4 py-2.5 flex items-center border-t border-white/5 hover:bg-white/5 transition-colors ${isQualified ? "bg-gold/5" : ""}`}>
                      <span className={`w-6 mr-2 text-xs font-mono ${isQualified ? "text-gold" : "text-white/20"}`}>{ti + 1}</span>
                      {t?.flag ? (
                        <img src={t.flag} alt={t.name_en} className="w-5 h-3.5 object-cover rounded-sm mr-2 flex-shrink-0" />
                      ) : (
                        <span className="w-5 h-3.5 mr-2 flex-shrink-0 bg-white/10 rounded-sm" />
                      )}
                      <span className="flex-1 font-body text-sm text-white/90 truncate">{t?.name_en ?? `Team ${entry.team_id}`}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.mp ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.w ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.d ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.l ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.gf ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.ga ?? 0}</span>
                      <span className="w-7 text-center font-mono text-xs text-white/50">{entry.gd ?? 0}</span>
                      <span className="w-9 text-center font-mono text-sm font-bold text-gold">{entry.pts ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}