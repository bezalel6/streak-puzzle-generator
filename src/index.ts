import * as lichess from "simple-lichess-api";
import { StockfishAbstraction, evalGame } from "./stockfishUtil";

// export function analyzeGame(game: Game) {}

lichess
  .fetchGames("bezalel6", { rated: "both", maxGames: 1 })
  .listen(async (g) => {
    console.log(g);
    const evaluated = await evalGame(g);
    console.log("evaluated", evaluated);
  });
// new StockfishAbstraction();
// setTimeout(function () {
//   engine.send("stop");
// }, 1000);
