import { getTeams } from "@/lib/api";

let cachedTeamMap = null;

export async function getTeamMap() {
  // In dev, re-fetch each time. In prod this runs per-request anyway (Next.js RSC).
  const res = await getTeams();
  const teams = Array.isArray(res) ? res : res?.teams ?? [];

  const map = {};
  teams.forEach((t) => {
    map[String(t.id)] = t;
  });

  return map; // { "1": { id, name_en, flag, ... }, ... }
}