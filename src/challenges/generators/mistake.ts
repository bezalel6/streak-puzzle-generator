import { EvaluatedGame } from "../../anaylze";
import { Challenge, ChallengeSkeleton } from "../challenge";
import {
  ChallengesSort,
  SimpleGenerator,
  createSimpleGenerator,
} from "./generator";

export interface MistakeChallenge extends Challenge {
  mistakeCost: number;
}
export const mistakeSort: ChallengesSort<MistakeChallenge> = (a, b) =>
  b.mistakeCost - a.mistakeCost;
export const mistakeSkeleton: ChallengeSkeleton = {
  name: "Mistake",
  description:
    "the player made a mistake at this point of the game. try to find it",
};
export function Mistakes(evaluatedGame: EvaluatedGame) {
  return createSimpleGenerator(
    evaluatedGame,
    mistakeSkeleton,
    mistakeChallenge,
    mistakeSort
  );
}
export const mistakeChallenge: SimpleGenerator<MistakeChallenge> = ({
  currentMove,
  pseudoChallenge,
  nextMove,
}) => {
  if (!nextMove) return null;
  const bottomFloor = 1;
  if (currentMove.evaluation.eval < nextMove.evaluation.eval) {
    const diff = Math.abs(
      currentMove.evaluation.eval - nextMove.evaluation.eval
    );
    if (diff >= bottomFloor) {
      return {
        ...pseudoChallenge,
        mistakeCost: diff,
      };
    }
  }
  return null;
};
