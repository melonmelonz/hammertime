import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const TOTAL_ROUNDS = 6
export const TOTAL_OBJECTIVES = 5

export interface Secondary {
  id: string
  name: string
  shortName: string
  description: string
  maxVP: number
  perRoundMax: number
}

export const SECONDARIES_40K: Secondary[] = [
  {
    id: 'bring-it-down',
    name: 'Bring It Down',
    shortName: 'Bring It Down',
    description: 'Score 1VP per enemy unit with 3+ wounds destroyed this turn (3W–9W = 1VP, 10W–19W = 2VP, 20W+ = 3VP).',
    maxVP: 12,
    perRoundMax: 4,
  },
  {
    id: 'assassination',
    name: 'Assassination',
    shortName: 'Assassination',
    description: 'Score 3VP for the first enemy CHARACTER destroyed, then 4VP for the second. Max 7VP total.',
    maxVP: 7,
    perRoundMax: 7,
  },
  {
    id: 'no-prisoners',
    name: 'No Prisoners',
    shortName: 'No Prisoners',
    description: 'Score 2VP if 10–14 enemy models were destroyed this turn. Score 3VP if 15+ were destroyed.',
    maxVP: 9,
    perRoundMax: 3,
  },
  {
    id: 'raise-banners',
    name: 'Raise the Banners High',
    shortName: 'Raise Banners',
    description: 'At end of your turn: score 1VP per objective marker you control that has a Banner planted on it.',
    maxVP: 8,
    perRoundMax: 5,
  },
  {
    id: 'storm-hostile',
    name: 'Storm Hostile Objective',
    shortName: 'Storm Hostile',
    description: 'At end of your turn: 3VP if you control 1 objective in enemy deployment, 5VP for 2 or more.',
    maxVP: 10,
    perRoundMax: 5,
  },
  {
    id: 'behind-enemy-lines',
    name: 'Behind Enemy Lines',
    shortName: 'Behind Lines',
    description: 'At end of your turn: 2VP if 1 infantry unit is wholly in enemy deployment, 4VP for 2 or more.',
    maxVP: 8,
    perRoundMax: 4,
  },
  {
    id: 'engage-all-fronts',
    name: 'Engage on All Fronts',
    shortName: 'Engage All Fronts',
    description: 'At end of your turn: 3VP if you have units in 3 different table quarters, 4VP if in all 4.',
    maxVP: 12,
    perRoundMax: 4,
  },
  {
    id: 'cull-the-horde',
    name: 'Cull the Horde',
    shortName: 'Cull the Horde',
    description: 'Score 2VP per turn for each enemy UNIT of 10+ models that was destroyed this turn.',
    maxVP: 9,
    perRoundMax: 3,
  },
  {
    id: 'marked-for-death',
    name: 'Marked for Death',
    shortName: 'Marked for Death',
    description: 'Before the battle, select 3 enemy units. Score 4VP for each one that is destroyed.',
    maxVP: 12,
    perRoundMax: 12,
  },
  {
    id: 'cleanse',
    name: 'Cleanse',
    shortName: 'Cleanse',
    description: 'At end of your turn: 2VP for each objective in No Man\'s Land you control, up to 2 objectives.',
    maxVP: 8,
    perRoundMax: 4,
  },
]

// Objective ownership: null = contested/unclaimed, 'p1' | 'p2' = player controlled
export type ObjOwner = 'p1' | 'p2' | null

export interface TurnScore {
  primaryVP: number           // auto-calculated or overridden
  primaryOverride: boolean    // true if user manually set primary VP
  secondaryVP: number[]       // one per secondary (4 entries)
  cp: number                  // command points AT END of this turn
}

export interface GameRound {
  number: number
  objectives: ObjOwner[]     // 5 objectives
  p1: TurnScore
  p2: TurnScore
}

export interface PlayerSetup {
  name: string
  army: string
  secondaryIds: [string, string, string, string]
}

export interface TrackerGame {
  id: string
  status: 'setup' | 'playing' | 'finished'
  player1: PlayerSetup
  player2: PlayerSetup
  rounds: GameRound[]
  currentRound: number
  activePlayer: 'p1' | 'p2'
}

function defaultTurnScore(): TurnScore {
  return { primaryVP: 0, primaryOverride: false, secondaryVP: [0, 0, 0, 0], cp: 0 }
}

function defaultRound(number: number): GameRound {
  return {
    number,
    objectives: [null, null, null, null, null],
    p1: defaultTurnScore(),
    p2: defaultTurnScore(),
  }
}

/** Calculate primary VP based on objective count comparison */
export function calcPrimaryVP(myObjs: number, theirObjs: number): number {
  // Standard Leviathan-style scoring:
  // 3VP if you hold 1+ objectives
  // 3VP if you hold more objectives than your opponent
  // 3VP if you hold 3+ objectives
  let vp = 0
  if (myObjs >= 1) vp += 3
  if (myObjs > theirObjs) vp += 3
  if (myObjs >= 3) vp += 3
  return vp
}

function countObjectives(objectives: ObjOwner[], player: 'p1' | 'p2'): number {
  return objectives.filter((o) => o === player).length
}

interface TrackerState {
  game: TrackerGame | null

  startGame: (player1: PlayerSetup, player2: PlayerSetup) => void
  resetGame: () => void

  setObjective: (roundIndex: number, objIndex: number, owner: ObjOwner) => void
  setTurnScore: (roundIndex: number, player: 'p1' | 'p2', score: Partial<TurnScore>) => void
  setSecondaryVP: (roundIndex: number, player: 'p1' | 'p2', secIndex: number, vp: number) => void
  setCP: (roundIndex: number, player: 'p1' | 'p2', cp: number) => void

  nextTurn: () => void
  finishGame: () => void
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      game: null,

      startGame: (player1, player2) => {
        const rounds: GameRound[] = Array.from({ length: TOTAL_ROUNDS }, (_, i) => defaultRound(i + 1))
        set({
          game: {
            id: crypto.randomUUID(),
            status: 'playing',
            player1,
            player2,
            rounds,
            currentRound: 0,
            activePlayer: 'p1',
          },
        })
      },

      resetGame: () => set({ game: null }),

      setObjective: (roundIndex, objIndex, owner) => {
        set((state) => {
          if (!state.game) return state
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r
            const objectives = [...r.objectives]
            objectives[objIndex] = owner
            // Recalculate primary VP for both players unless overridden
            const p1Objs = countObjectives(objectives, 'p1')
            const p2Objs = countObjectives(objectives, 'p2')
            return {
              ...r,
              objectives,
              p1: {
                ...r.p1,
                primaryVP: r.p1.primaryOverride ? r.p1.primaryVP : calcPrimaryVP(p1Objs, p2Objs),
              },
              p2: {
                ...r.p2,
                primaryVP: r.p2.primaryOverride ? r.p2.primaryVP : calcPrimaryVP(p2Objs, p1Objs),
              },
            }
          })
          return { game: { ...state.game, rounds } }
        })
      },

      setTurnScore: (roundIndex, player, score) => {
        set((state) => {
          if (!state.game) return state
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r
            return { ...r, [player]: { ...r[player], ...score } }
          })
          return { game: { ...state.game, rounds } }
        })
      },

      setSecondaryVP: (roundIndex, player, secIndex, vp) => {
        set((state) => {
          if (!state.game) return state
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r
            const secondaryVP = [...r[player].secondaryVP]
            secondaryVP[secIndex] = Math.max(0, vp)
            return { ...r, [player]: { ...r[player], secondaryVP } }
          })
          return { game: { ...state.game, rounds } }
        })
      },

      setCP: (roundIndex, player, cp) => {
        set((state) => {
          if (!state.game) return state
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r
            return { ...r, [player]: { ...r[player], cp: Math.max(0, cp) } }
          })
          return { game: { ...state.game, rounds } }
        })
      },

      nextTurn: () => {
        set((state) => {
          if (!state.game) return state
          const { activePlayer, currentRound } = state.game
          if (activePlayer === 'p1') {
            return { game: { ...state.game, activePlayer: 'p2' } }
          } else {
            const nextRound = currentRound + 1
            if (nextRound >= TOTAL_ROUNDS) {
              return { game: { ...state.game, status: 'finished', activePlayer: 'p1' } }
            }
            return { game: { ...state.game, currentRound: nextRound, activePlayer: 'p1' } }
          }
        })
      },

      finishGame: () => {
        set((state) => {
          if (!state.game) return state
          return { game: { ...state.game, status: 'finished' } }
        })
      },
    }),
    { name: 'hammertime-tracker' },
  ),
)

/** Compute total VP for a player across all rounds */
export function totalVP(game: TrackerGame, player: 'p1' | 'p2'): number {
  return game.rounds.reduce((sum, r) => {
    const turn = r[player]
    return sum + turn.primaryVP + turn.secondaryVP.reduce((s, v) => s + v, 0)
  }, 0)
}

/** Get secondary object by ID */
export function getSecondary(id: string): Secondary | undefined {
  return SECONDARIES_40K.find((s) => s.id === id)
}
