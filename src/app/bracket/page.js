import { Fragment } from "react";
import { getGames } from "@/lib/api";

const ROUND_LABELS = {
  "Round of 32": "Round of 32",
  "Round of 16": "Round of 16",
  "Quarter Finals": "Quarter Finals",
  "Semi Finals": "Semi Finals",
  "Final": "Final",
};
const ORDERED_ROUNDS = Object.keys(ROUND_LABELS);

const CARD_HEIGHT = 62;
const LABEL_HEIGHT = 32;
const CONNECTOR_WIDTH = 44;

function cardMidY(index, count, totalHeight) {
  const slot = totalHeight / count;
  return slot * (index + 0.5);
}

function cardTopY(index, count, totalHeight) {
  return cardMidY(index, count, totalHeight) - CARD_HEIGHT / 2;
}

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(0);
  const [datePart, timePart] = dateStr.split(" ");
  const [month, day, year] = datePart.split("/");
  const d = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${timePart ?? "00:00"}`
  );
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function BracketMatchCard({ match }) {
  const isFinished = match.status === "finished";
  const isUpcoming = match.status === "upcoming";
  const isTBD = !match.homeTeam || match.homeTeam === "TBD";

  return (
    <div
      className={`rounded-lg border transition-all overflow-hidden h-full ${
        isTBD
          ? "border-white/5 bg-white/2 opacity-40"
          : isFinished
          ? "border-white/15 bg-white/5"
          : "border-gold/20 bg-gold/5"
      }`}
    >
      {[
        { team: match.homeTeam, score: match.homeScore },
        { team: match.awayTeam, score: match.awayScore },
      ].map((side, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-3 py-2 ${
            i === 0 ? "border-b border-white/8" : ""
          }`}
        >
          <span className="font-body text-xs font-medium text-white/80 flex-1 truncate">
            {side.team || "TBD"}
          </span>
          {!isUpcoming && side.score !== null && side.score !== undefined && (
            <span className={`font-mono text-sm font-bold ${isFinished ? "text-white" : "text-gold"}`}>
              {side.score}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function AbsoluteColumn({ label, count, totalHeight, width, children }) {
  return (
    <div className="flex-shrink-0" style={{ width }}>
      <p
        className="font-display text-xs text-gold/70 tracking-widest text-center"
        style={{ height: `${LABEL_HEIGHT}px`, lineHeight: `${LABEL_HEIGHT}px` }}
      >
        {label}
      </p>
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{ top: `${cardTopY(i, count, totalHeight)}px`, height: `${CARD_HEIGHT}px` }}
          >
            {children(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketConnectors({ leftCount, rightCount, totalHeight }) {
  const pairs = Math.floor(leftCount / 2);
  const paths = [];
  const xElbow = CONNECTOR_WIDTH / 2;

  for (let p = 0; p < pairs; p++) {
    const y1     = cardMidY(p * 2,     leftCount,  totalHeight);
    const y2     = cardMidY(p * 2 + 1, leftCount,  totalHeight);
    const yRight = cardMidY(p,          rightCount, totalHeight);
    const yMerge = (y1 + y2) / 2;

    paths.push(
      <path key={`t-${p}`}
        d={`M 0 ${y1} H ${xElbow} V ${yMerge}`}
        fill="none" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.45"
      />
    );
    paths.push(
      <path key={`b-${p}`}
        d={`M 0 ${y2} H ${xElbow} V ${yMerge}`}
        fill="none" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.45"
      />
    );
    paths.push(
      <path key={`m-${p}`}
        d={`M ${xElbow} ${yMerge} V ${yRight} H ${CONNECTOR_WIDTH}`}
        fill="none" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.45"
        markerEnd="url(#arrowhead)"
      />
    );
  }

  return (
    <svg
      width={CONNECTOR_WIDTH}
      height={totalHeight}
      className="flex-shrink-0"
      style={{ display: "block", marginTop: `${LABEL_HEIGHT}px` }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="#D4AF37" fillOpacity="0.6" />
        </marker>
      </defs>
      {paths}
    </svg>
  );
}

function DesktopBracket({ rounds, totalHeight }) {
  return (
    <div
      className="overflow-x-auto pb-4"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(212,175,55,0.2) transparent",
      }}
    >
      <div className="flex items-start gap-0" style={{ width: "max-content", paddingBottom: "8px" }}>
        {rounds.map((round, ri) => (
          <Fragment key={round.round}>
            <AbsoluteColumn
              label={round.round}
              count={round.matches.length}
              totalHeight={totalHeight}
              width="180px"
            >
              {(i) => <BracketMatchCard match={round.matches[i]} />}
            </AbsoluteColumn>

            {ri < rounds.length - 1 && (
              <BracketConnectors
                leftCount={round.matches.length}
                rightCount={rounds[ri + 1].matches.length}
                totalHeight={totalHeight}
              />
            )}
          </Fragment>
        ))}

        <div
          className="flex-shrink-0 flex items-center justify-center px-6 opacity-60"
          style={{ marginTop: `${LABEL_HEIGHT}px`, height: `${totalHeight}px` }}
        >
          <div className="text-center">
            <div className="text-5xl">🏆</div>
            <p className="text-gold text-xs font-display mt-2">Champion</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDesktopBracket() {
  const roundConfig = [
    { label: "Round of 32", count: 16 },
    { label: "Round of 16", count: 8 },
    { label: "Quarter Finals", count: 4 },
    { label: "Semi Finals", count: 2 },
    { label: "Final", count: 1 },
  ];

  const maxCount = roundConfig[0].count;
  const totalHeight = maxCount * CARD_HEIGHT * 1.4;

  const placeholderRounds = roundConfig.map((r) => ({
    round: r.label,
    matches: Array.from({ length: r.count }, (_, i) => ({
      id: `placeholder-${r.label}-${i}`,
      homeTeam: "TBD",
      awayTeam: "TBD",
      homeScore: null,
      awayScore: null,
      status: "upcoming",
    })),
  }));

  return <DesktopBracket rounds={placeholderRounds} totalHeight={totalHeight} />;
}

async function getBracketData() {
  const res = await getGames();
  const games = res?.games ?? [];
  const knockoutGames = games.filter((g) => g.type !== "group");
  if (!knockoutGames.length) return { rounds: [], isEmpty: true };

  const now = new Date();

  const matches = knockoutGames.map((g) => {
    const finished = String(g.finished).toUpperCase() === "TRUE";
    const matchDate = parseLocalDate(g.local_date);
    const isLive =
      !finished && g.time_elapsed !== "notstarted" && matchDate <= now;

    const roundLabel =
      ROUND_LABELS[g.type] ??
      g.type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
      "Unknown";

    return {
      id: g._id,
      round: roundLabel,
      homeTeam: g.home_team_name_en || "TBD",
      awayTeam: g.away_team_name_en || "TBD",
      homeScore: g.home_score ?? null,
      awayScore: g.away_score ?? null,
      status: finished ? "finished" : isLive ? "live" : "upcoming",
    };
  });

  const hasRealTeams = matches.some(
    (m) => m.homeTeam !== "TBD" && m.awayTeam !== "TBD"
  );
  if (!hasRealTeams) return { rounds: [], isEmpty: true };

  const grouped = {};
  matches.forEach((m) => {
    if (!grouped[m.round]) grouped[m.round] = [];
    grouped[m.round].push(m);
  });

  const orderedRounds = ORDERED_ROUNDS.filter((r) => grouped[r]);
  const extraRounds = Object.keys(grouped).filter(
    (r) => !ORDERED_ROUNDS.includes(r)
  );

  return {
    rounds: [...orderedRounds, ...extraRounds].map((r) => ({
      round: r,
      matches: grouped[r],
    })),
    isEmpty: false,
  };
}

export default async function BracketPage() {
  let data = { rounds: [], isEmpty: true };
  try {
    data = await getBracketData();
  } catch (e) {
    data = { rounds: [], isEmpty: true };
  }

  const { rounds, isEmpty } = data;
  const maxMatchCount = isEmpty ? 16 : Math.max(...rounds.map((r) => r.matches.length));
  const totalHeight = maxMatchCount * CARD_HEIGHT * 1.4;

  // For mobile: flatten all rounds in order
  const allRounds = isEmpty
    ? [
        { round: "Round of 32", matches: Array.from({ length: 16 }, (_, i) => ({ id: `r32-${i}`, homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "upcoming" })) },
        { round: "Round of 16", matches: Array.from({ length: 8 }, (_, i) => ({ id: `r16-${i}`, homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "upcoming" })) },
        { round: "Quarter Finals", matches: Array.from({ length: 4 }, (_, i) => ({ id: `qf-${i}`, homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "upcoming" })) },
        { round: "Semi Finals", matches: Array.from({ length: 2 }, (_, i) => ({ id: `sf-${i}`, homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "upcoming" })) },
        { round: "Final", matches: [{ id: "final-0", homeTeam: "TBD", awayTeam: "TBD", homeScore: null, awayScore: null, status: "upcoming" }] },
      ]
    : rounds;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-in">
        <h1 className="font-display text-5xl md:text-6xl text-white">
          Knockout Bracket
        </h1>
        <p className="text-white/40 font-body text-sm mt-1">
          Road to the World Cup 2026 Final
        </p>
        {isEmpty && (
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-body text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            Teams qualify after the group stage · Bracket begins July 2026
          </p>
        )}
      </div>

      {/* Mobile — stacked rounds */}
      <div className="md:hidden space-y-8">
        {allRounds.map((round) => (
          <div key={round.round}>
            <h2 className="text-gold font-display text-sm tracking-widest uppercase mb-3">
              {round.round}
            </h2>
            <div className="grid gap-3">
              {round.matches.map((m) => (
                <div key={m.id} style={{ height: `${CARD_HEIGHT}px` }}>
                  <BracketMatchCard match={m} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center pt-4 opacity-60">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-gold text-xs font-display tracking-widest">Champion</p>
        </div>
      </div>

      {/* Desktop — bracket with connectors, horizontally scrollable */}
      <div className="hidden md:block">
        {isEmpty ? (
          <EmptyDesktopBracket />
        ) : (
          <DesktopBracket rounds={rounds} totalHeight={totalHeight} />
        )}
      </div>
    </div>
  );
}