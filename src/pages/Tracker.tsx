import { useState } from 'react'
import {
  PlusIcon,
  MinusIcon,
  ChevronRightIcon,
  TrophyIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  useTrackerStore,
  SECONDARIES_40K,
  TOTAL_ROUNDS,
  totalVP,
  getSecondary,
  calcPrimaryVP,
  type PlayerSetup,
  type ObjOwner,
} from '@/stores/trackerStore'

// ── Setup screen ─────────────────────────────────────────────────────────────

const DEFAULT_SECONDARIES = ['bring-it-down', 'assassination', 'engage-all-fronts', 'raise-banners'] as [string, string, string, string]

function SetupScreen() {
  const startGame = useTrackerStore((s) => s.startGame)
  const [p1, setP1] = useState<PlayerSetup>({ name: 'Player 1', army: '', secondaryIds: [...DEFAULT_SECONDARIES] as [string, string, string, string] })
  const [p2, setP2] = useState<PlayerSetup>({ name: 'Player 2', army: '', secondaryIds: [...DEFAULT_SECONDARIES] as [string, string, string, string] })

  function setSecondary(player: 'p1' | 'p2', idx: number, id: string) {
    const setter = player === 'p1' ? setP1 : setP2
    setter((prev) => {
      const ids = [...prev.secondaryIds] as [string, string, string, string]
      ids[idx] = id
      return { ...prev, secondaryIds: ids }
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-2">
          Game Tracker
        </h1>
        <p className="text-neutral-500 text-sm">Warhammer 40,000 10th Edition · 6 Rounds · 5 Objectives</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {(['p1', 'p2'] as const).map((pk) => {
          const player = pk === 'p1' ? p1 : p2
          const setter = pk === 'p1' ? setP1 : setP2
          return (
            <div key={pk} className={cn(
              'rounded-xl border p-5',
              'bg-white dark:bg-neutral-900',
              pk === 'p1'
                ? 'border-red-200 dark:border-red-900/50'
                : 'border-neutral-200 dark:border-neutral-800',
            )}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-bold text-white',
                  pk === 'p1' ? 'bg-red-600' : 'bg-neutral-600',
                )}>
                  {pk === 'p1' ? '1' : '2'}
                </div>
                <h2 className="font-display font-bold text-base uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                  {pk === 'p1' ? 'Player 1' : 'Player 2'}
                </h2>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Name</label>
                  <input
                    value={player.name}
                    onChange={(e) => setter((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-red-400"
                    placeholder="Commander name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Army</label>
                  <input
                    value={player.army}
                    onChange={(e) => setter((p) => ({ ...p, army: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-red-400"
                    placeholder="e.g. Space Marines, Chaos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Secondary Objectives (pick 4)
                </label>
                <div className="space-y-1.5">
                  {([0, 1, 2, 3] as const).map((idx) => (
                    <select
                      key={idx}
                      value={player.secondaryIds[idx]}
                      onChange={(e) => setSecondary(pk, idx, e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-red-400"
                    >
                      {SECONDARIES_40K.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} (max {s.maxVP}VP)</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Button variant="primary" size="lg" onClick={() => startGame(p1, p2)}>
          Begin Battle
        </Button>
      </div>
    </div>
  )
}

// ── Objective map ─────────────────────────────────────────────────────────────

function ObjectiveMap({ objectives, onChange }: { objectives: ObjOwner[]; onChange: (idx: number, owner: ObjOwner) => void }) {
  // 40k standard 5-objective layout: 4 corners + centre
  const positions = [
    { label: 'P2 L', pos: 'top-0 left-0' },
    { label: 'P2 R', pos: 'top-0 right-0' },
    { label: 'Centre', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { label: 'P1 L', pos: 'bottom-0 left-0' },
    { label: 'P1 R', pos: 'bottom-0 right-0' },
  ]

  function cycle(current: ObjOwner): ObjOwner {
    if (current === null) return 'p1'
    if (current === 'p1') return 'p2'
    return null
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56%' }}>
      <div className="absolute inset-0 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        {/* Grid lines */}
        <div className="absolute inset-4 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg" />
        <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-neutral-200 dark:border-neutral-700" />
        <div className="absolute left-1/2 top-4 bottom-4 w-px border-l border-dashed border-neutral-200 dark:border-neutral-700" />

        {objectives.map((owner, idx) => {
          const { label, pos } = positions[idx]
          return (
            <button
              key={idx}
              onClick={() => onChange(idx, cycle(owner))}
              className={cn(
                'absolute m-3 size-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer',
                owner === 'p1'
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                  : owner === 'p2'
                    ? 'bg-neutral-600 border-neutral-500 text-white shadow-lg shadow-neutral-600/30'
                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-400',
                pos,
              )}
              title={`${label} — click to cycle control`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── VP counter ────────────────────────────────────────────────────────────────

function VPCounter({ value, onChange, max, label }: { value: number; onChange: (v: number) => void; max?: number; label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] uppercase tracking-wider text-neutral-400 w-16 truncate">{label}</span>}
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="size-6 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <MinusIcon className="size-3" />
      </button>
      <span className="w-8 text-center text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className="size-6 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  )
}

// ── Player score panel ────────────────────────────────────────────────────────

function PlayerScorePanel({
  player,
  playerKey,
  round,
  roundIndex,
  secondaryIds,
}: {
  player: PlayerSetup
  playerKey: 'p1' | 'p2'
  round: ReturnType<typeof useTrackerStore.getState>['game'] extends null ? never : NonNullable<ReturnType<typeof useTrackerStore.getState>['game']>['rounds'][number]
  roundIndex: number
  secondaryIds: [string, string, string, string]
}) {
  const { setTurnScore, setSecondaryVP, setCP } = useTrackerStore()
  const turn = round[playerKey]
  const secVPTotal = turn.secondaryVP.reduce((s, v) => s + v, 0)

  return (
    <div className={cn(
      'rounded-xl border p-4',
      'bg-white dark:bg-neutral-900',
      playerKey === 'p1' ? 'border-red-200 dark:border-red-900/50' : 'border-neutral-200 dark:border-neutral-800',
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('size-6 rounded-full flex items-center justify-center text-xs font-bold text-white', playerKey === 'p1' ? 'bg-red-600' : 'bg-neutral-600')}>
            {playerKey === 'p1' ? '1' : '2'}
          </div>
          <div>
            <p className="font-display font-bold text-sm uppercase tracking-wide text-neutral-900 dark:text-neutral-100">{player.name}</p>
            {player.army && <p className="text-[10px] text-neutral-400">{player.army}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className={cn('font-display text-2xl font-extrabold leading-none', playerKey === 'p1' ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400')}>
            {turn.primaryVP + secVPTotal}
          </p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">this round</p>
        </div>
      </div>

      {/* Primary VP */}
      <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">Primary VP</p>
          {!turn.primaryOverride && (
            <span className="text-[10px] text-neutral-400">auto-calculated</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <VPCounter
            value={turn.primaryVP}
            onChange={(v) => setTurnScore(roundIndex, playerKey, { primaryVP: v, primaryOverride: true })}
            max={9}
          />
          {turn.primaryOverride && (
            <button
              onClick={() => {
                const objs = round.objectives.filter((o) => o === playerKey).length
                const oppObjs = round.objectives.filter((o) => o !== playerKey && o !== null).length
                setTurnScore(roundIndex, playerKey, { primaryVP: calcPrimaryVP(objs, oppObjs), primaryOverride: false })
              }}
              className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              reset
            </button>
          )}
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">3VP per tier: hold 1+, hold 3+, hold more than opponent</p>
      </div>

      {/* Secondaries */}
      <div className="space-y-2 mb-3">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">Secondaries</p>
        {secondaryIds.map((secId, i) => {
          const sec = getSecondary(secId)
          if (!sec) return null
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate">{sec.shortName}</p>
              </div>
              <VPCounter
                value={turn.secondaryVP[i] ?? 0}
                onChange={(v) => setSecondaryVP(roundIndex, playerKey, i, v)}
                max={sec.perRoundMax}
              />
            </div>
          )
        })}
      </div>

      {/* CP */}
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Command Points</p>
        <VPCounter value={turn.cp} onChange={(v) => setCP(roundIndex, playerKey, v)} />
      </div>
    </div>
  )
}

// ── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({ game }: { game: NonNullable<ReturnType<typeof useTrackerStore.getState>['game']> }) {
  const resetGame = useTrackerStore((s) => s.resetGame)
  const p1VP = totalVP(game, 'p1')
  const p2VP = totalVP(game, 'p2')
  const winner = p1VP > p2VP ? game.player1 : p2VP > p1VP ? game.player2 : null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
      <TrophyIcon className="size-16 text-red-500 mx-auto mb-4" />
      <h1 className="font-display text-5xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-2">
        {winner ? `${winner.name} Wins!` : 'Draw!'}
      </h1>
      {winner && <p className="text-neutral-500 mb-8">{winner.army}</p>}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {(['p1', 'p2'] as const).map((pk) => {
          const player = game[pk === 'p1' ? 'player1' : 'player2']
          const vp = totalVP(game, pk)
          const isWinner = (pk === 'p1' && p1VP > p2VP) || (pk === 'p2' && p2VP > p1VP)
          return (
            <div key={pk} className={cn(
              'rounded-xl border p-5',
              isWinner ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
            )}>
              <p className="font-display font-bold text-lg uppercase tracking-wide text-neutral-800 dark:text-neutral-200 mb-1">{player.name}</p>
              {player.army && <p className="text-xs text-neutral-400 mb-3">{player.army}</p>}
              <p className={cn('font-display text-5xl font-extrabold', isWinner ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400')}>
                {vp}
              </p>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Victory Points</p>

              {/* Round breakdown */}
              <div className="mt-3 space-y-1">
                {game.rounds.map((r, i) => {
                  const turn = r[pk]
                  const total = turn.primaryVP + turn.secondaryVP.reduce((s, v) => s + v, 0)
                  return (
                    <div key={i} className="flex justify-between text-[11px] text-neutral-500">
                      <span>Round {i + 1}</span>
                      <span className="font-mono font-semibold">{turn.primaryVP}p + {turn.secondaryVP.reduce((s, v) => s + v, 0)}s = {total}VP</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Button variant="primary" size="lg" onClick={resetGame} icon={<ArrowPathIcon />}>
        New Game
      </Button>
    </div>
  )
}

// ── Main tracker page ─────────────────────────────────────────────────────────

export function TrackerPage() {
  const { game, setObjective, nextTurn, finishGame, resetGame } = useTrackerStore()

  if (!game || game.status === 'setup') return <SetupScreen />
  if (game.status === 'finished') return <ResultScreen game={game} />

  const roundIndex = game.currentRound
  const round = game.rounds[roundIndex]

  const p1Total = totalVP(game, 'p1')
  const p2Total = totalVP(game, 'p2')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
            Battle Tracker
          </h1>
          <p className="text-xs text-neutral-400">Round {roundIndex + 1} of {TOTAL_ROUNDS}</p>
        </div>

        {/* Round indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
            <div
              key={i}
              className={cn(
                'size-2.5 rounded-full transition-colors',
                i < roundIndex ? 'bg-red-600' : i === roundIndex ? 'bg-red-400 ring-2 ring-red-200 dark:ring-red-900' : 'bg-neutral-200 dark:bg-neutral-700',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetGame} icon={<ArrowPathIcon />}>Reset</Button>
          <Button variant="secondary" size="sm" onClick={finishGame} icon={<CheckIcon />}>End Game</Button>
        </div>
      </div>

      {/* Running totals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 px-4 py-3 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">{game.player1.name}</p>
          <p className="font-display text-4xl font-extrabold text-red-700 dark:text-red-400">{p1Total}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Total VP</p>
        </div>
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-0.5">{game.player2.name}</p>
          <p className="font-display text-4xl font-extrabold text-neutral-700 dark:text-neutral-300">{p2Total}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Total VP</p>
        </div>
      </div>

      {/* Objective map */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">Objectives — click to assign control</p>
        <ObjectiveMap
          objectives={round.objectives}
          onChange={(idx, owner) => setObjective(roundIndex, idx, owner)}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-600 inline-block" />
            {game.player1.name}: {round.objectives.filter((o) => o === 'p1').length} obj
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-neutral-600 inline-block" />
            {game.player2.name}: {round.objectives.filter((o) => o === 'p2').length} obj
          </span>
        </div>
      </div>

      {/* Player scoring panels */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <PlayerScorePanel
          player={game.player1}
          playerKey="p1"
          round={round}
          roundIndex={roundIndex}
          secondaryIds={game.player1.secondaryIds}
        />
        <PlayerScorePanel
          player={game.player2}
          playerKey="p2"
          round={round}
          roundIndex={roundIndex}
          secondaryIds={game.player2.secondaryIds}
        />
      </div>

      {/* Next turn */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={nextTurn}
          iconRight={<ChevronRightIcon />}
        >
          {game.activePlayer === 'p1'
            ? `End ${game.player1.name}'s Turn`
            : roundIndex < TOTAL_ROUNDS - 1
              ? `End Round ${roundIndex + 1}`
              : 'End Battle'}
        </Button>
      </div>
    </div>
  )
}
