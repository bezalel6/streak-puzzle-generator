import { Game } from "simple-lichess-api";
import { EvaluatedGame, EvaluatedMove, ParsedResponse } from "../anaylze";

export interface Challenge extends ChallengeSkeleton {
  evaluatedGame: EvaluatedGame;
  evaluation: ParsedResponse;
  fen: string;
  /**
   *move number is in the format of individual player moves.
   for example: 
   1.e4 2.e5...
   */
  moveNumber: number;
}

export interface ChallengeSkeleton {
  name: string;
  description: string;
}
