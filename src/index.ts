import * as lichess from "simple-lichess-api";
import { evalGame } from "./anaylze";
import { generateChallenges } from "./challenges/generators/generator";

lichess.fetchGames("bezalel6", { rated: "both", maxGames: 1 }).listen((g) => {
  evalGame(g)
    .then(generateChallenges)
    .then((mistakes) => {
      mistakes.forEach((mistake) => {
        console.log("mistake cost", mistake.mistakeCost, "fen:", mistake.fen);
      });
    })
    .catch(console.error);
});
