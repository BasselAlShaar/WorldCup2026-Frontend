const API_URL = "https://worldcup26.ir";

async function safeFetch(url, fallbackKey) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch (err) {
    console.error(url, err);
    return { [fallbackKey]: [] };
  }
}

export const getGames = () =>
  safeFetch(`${API_URL}/get/games`, "games");

export const getTeams = () =>
  safeFetch(`${API_URL}/get/teams`, "teams");

export const getGroups = () =>
  safeFetch(`${API_URL}/get/groups`, "groups");