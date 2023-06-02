import { Challenge, ChallengeSkeleton } from "../challenge";
import { SimpleGenerator } from "./generator";
import { MistakeChallenge } from "./mistake";

export interface OnlyMoveChallenge extends Challenge {
  correctMove: string;
  wrongMoves: [];
}
export const onlyMoveSkeleton: ChallengeSkeleton = {
  name: "Only Move",
  description: "the player managed to find the only good move. try to find it",
};

export const onlyMoveChallenge: SimpleGenerator<MistakeChallenge> = ({}) => {};
