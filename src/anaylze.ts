import { Game } from "simple-lichess-api";
import { Chess } from "chess.js";

export type EvaluatedGame = {
  game: Game;
  algabraicNotationMoves: string[];
  evaluatedMoves: EvaluatedMove[];
};
export type EvaluatedMove = {
  move: string;
  evaluation: number | string;
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
  evaluated.evaluatedMoves.fill(null);
  const gameLen = moveHistory.length;
  let i = 0;
  while (moveHistory.length > 0) {
    const p1Move = moveHistory.shift(),
      p1c = p1Move.from + p1Move.to;
    evaluated.algabraicNotationMoves.push(p1c);
    tChess.move(p1Move);
    const currentFen = tChess.fen();
    const evaluation = await analyzePosition(currentFen);
    console.log(`evaluated move ${i + 1}/${gameLen}`);
    evaluated.evaluatedMoves[i] = { evaluation, move: p1c };
    i++;
  }
  return evaluated;
}

export function analyzePosition(fen: string) {
  const apiUrl = "http://localhost:3000/analyze/";

  return fetch(apiUrl + encodeURIComponent(fen))
    .then((response) => response.text())
    .then(parseEvalString)
    .catch((error) => {
      throw error;
    });
}
const MATE_VAL = 1_000_000;
function parseEvalString(evaluation: string) {
  const split = evaluation.split("#");
  if (split.length === 1) {
    const n = Number(evaluation);
    return isNaN(n) ? evaluation : n;
  }
  return Number(split[1]) > 0 ? MATE_VAL : -MATE_VAL;
}
