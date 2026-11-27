# Gobble Run — The Great Thanksgiving Escape

[![make.fun competition](https://img.shields.io/badge/make.fun-turkey--run--game--01-orange)](https://make.fun/bounty/turkey-run-game-01)
[![make.fun rank](https://img.shields.io/badge/rank-awaiting%20judging-blue)](https://make.fun/bounty/turkey-run-game-01)
[![make.fun reward](https://img.shields.io/badge/reward-%24250%20pool-green)](https://make.fun/bounty/turkey-run-game-01)

A complete, original turkey escape game for the [make.fun](https://make.fun/bounty/turkey-run-game-01)
bounty **turkey-run-game-01**. It runs offline in a desktop browser from
static files — no network requests, no build step.

> Join make.fun with my referral: https://make.fun/r/4w89k05q

## The game

Thanksgiving is coming — and **you** are the main course. You are a turkey
with one job: run 3,000 metres from the farmyard, through the barn and the
kitchen, to the forest gate — without becoming dinner.

- **The farmer chases you.** He runs behind you, lunges when he gets close,
  and stops to search when you pull away. Get caught and you lose a life.
- **Dodge the oven and the carving knife.** Ovens glow and block the kitchen
  floor; knives fly at head height — duck under them. Fences and hay bales
  need a jump.
- **Grab corn** to push the farmer back and score points.
- **Three stages, one run:** the Farmyard, the Barn, the Kitchen — then
  freedom. Three lives, a HUD with score, distance, lives and a
  farmer-proximity meter, a title screen, and caught / escaped end screens
  with restart.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any
static server). Keyboard and mouse:

| Input | Action |
|---|---|
| Space / ↑ / W / click | Jump |
| ↓ / S | Duck |
| → / D | Sprint |
| ← / A | Slow down |
| P | Pause |
| M | Mute |
| R / Enter | Restart after an ending |

All art is drawn in code on a canvas and all sound is synthesized with
WebAudio — the game ships no image, audio or font files.

## Layout

- `game/` — the playable game (`index.html` + `src/*.js`, one clear job per file)
- `screenshots/` — real renders of the game's own code (title, farmyard run,
  kitchen run, caught)
- `main.ts` — the entry hand-in program: copies `game/` and `screenshots/`
  to `/output` (or `MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Build / verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Run it twice with different output directories; both runs must write the
same bytes.

## License

MIT — see [LICENSE](LICENSE).
