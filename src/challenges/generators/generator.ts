import { EvaluatedGame, EvaluatedMove } from "../../anaylze";
import { Challenge, ChallengeSkeleton } from "../challenge";
import {
  Mistakes,
  mistakeChallenge,
  mistakeSkeleton,
  mistakeSort,
} from "./mistake";

export function generateChallenges(
  evaluatedGame: EvaluatedGame,
  numChallengesToGenerate: number = 1
) {
  return Mistakes(evaluatedGame);
}
interface SimpleGeneratorParams {
  currentMove: EvaluatedMove;
  pseudoChallenge: Challenge;
  evaluatedGame: EvaluatedGame;
  prevMove?: EvaluatedMove;
  nextMove?: EvaluatedMove;
}
export type ChallengesSort<ChallengeType extends Challenge> = (
  a: ChallengeType,
  b: ChallengeType
) => number;
export type SimpleGenerator<T extends Challenge> = (
  params: SimpleGeneratorParams
) => T | null;
export function createSimpleGenerator<T extends Challenge>(
  evaluatedGame: EvaluatedGame,
  skeleton: ChallengeSkeleton,
  generator: SimpleGenerator<T>,
  sortingAlgo: ChallengesSort<T>,
  ignoreMoves: Number[] = []
) {
  const ret: T[] = [];

  const filtered = evaluatedGame.evaluatedMoves.filter(
    (m, i) =>
      !ignoreMoves.includes(i) &&
      m.movingPlayerClr === (evaluatedGame.game.isWhite ? "w" : "b")
  );
  function val(index: number) {
    return index < 0 || index > filtered.length - 1
      ? undefined
      : filtered[index];
  }
  for (let i = 0; i < filtered.length; i++) {
    const currentMove = filtered[i];
    const pseudo: Challenge = {
      ...skeleton,
      evaluatedGame,
      fen: currentMove.evaluation.fen,
      moveNumber: currentMove.moveNumber,
      evaluation: currentMove.evaluation,
    };
    const generated = generator({
      prevMove: val(i - 1),
      currentMove: currentMove,
      nextMove: val(i + 1),
      pseudoChallenge: pseudo,
      evaluatedGame,
    });
    if (generated) ret.push(generated);
  }
  ret.sort(sortingAlgo);
  return ret;
}
