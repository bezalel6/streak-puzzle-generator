import { Game } from "simple-lichess-api";
import { Chess } from "chess.js";

interface Response {
  fen: string;
  eval: string;
  lines: Line[];
}
export interface ParsedResponse {
  fen: string;
  eval: number;
  lines: ParsedLine[];
}
type ParsedLine = { move: string; eval: number };
type Line = { move: string; eval: string };

export type EvaluatedGame = {
  game: Game;
  algabraicNotationMoves: string[];
  evaluatedMoves: EvaluatedMove[];
};
export type EvaluatedMove = {
  move: string;
  evaluation: ParsedResponse;
  moveNumber: number;

  movingPlayerClr: "w" | "b";
};
export async function evalGame(game: Game) {
  console.log("evaling");
  const chess = new Chess();
  const tChess = new Chess();
  chess.loadPgn(game.pgn);
  const moveHistory = chess.history({ verbose: true });
  const evaluated: EvaluatedGame = {
    game,
    algabraicNotationMoves: [],
    evaluatedMoves: [],
  };
  const gameLen = moveHistory.length;
  let i = 0;
  const mult = game.isWhite ? 1 : -1;
  while (moveHistory.length > 0) {
    const p1Move = moveHistory.shift(),
      p1c = p1Move.from + p1Move.to;
    evaluated.algabraicNotationMoves.push(p1c);
    tChess.move(p1Move);
    const currentFen = tChess.fen();
    try {
      let evaluation = await analyzePosition(currentFen, { max: 5, min: 3 });
      if (evaluation === "game-over") {
        break;
      }
      evaluation.eval *= mult;
      evaluation.lines = evaluation.lines.map((line) => {
        return { eval: line.eval * mult, move: line.move };
      });
      console.log(`evaluated move ${i + 1}/${gameLen}`);
      evaluated.evaluatedMoves.push({
        evaluation,
        move: p1c,
        moveNumber: i,
        movingPlayerClr: tChess.turn() === "b" ? "w" : "b",
      });
      i++;
    } catch (e) {
      throw e;
    }
  }
  return evaluated;
}

export function analyzePosition(
  fen: string,
  { min, max }: { min?: number; max?: number } = {}
) {
  const apiUrl = "http://localhost:3000/analyze/";
  let url = apiUrl + encodeURIComponent(fen);
  if (min) {
    url += `?min=${min}`;
  }
  if (max) {
    url += `${min ? "&" : "?"}max=${max}`;
  }

  return fetch(url)
    .then((response) => response.json())
    .then(parseResponse)
    .catch((error) => {
      throw error;
    });
}

const MATE_VAL = 1_000_000;
function parseResponse(evaluation: any): ParsedResponse | "game-over" {
  const response = evaluation as Response;
  const val = parseEval(response.eval);
  if (val === "game-over") {
    return "game-over";
  }
  const parsedResponse: ParsedResponse = {
    eval: val,
    fen: response.fen,
    lines: [],
  };
  response.lines.forEach((line) => {
    const val = parseEval(line.eval);
    if (typeof val !== "string") {
      parsedResponse.lines.push({ eval: val, move: line.move });
    }
  });

  console.log(parsedResponse);
  return parsedResponse;
}
function parseEval(eval_: string) {
  const split = eval_.split("#");
  if (split.length === 1) {
    const n = Number(eval_);
    if (isNaN(n)) {
      if (eval_ === "-") return "game-over";
      throw `idk wth this is ${eval_}`;
    }
    return n;
  }
  return Number(split[1]) > 0 ? MATE_VAL : -MATE_VAL;
}
