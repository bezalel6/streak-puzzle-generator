import * as lichess from "simple-lichess-api";
import fetch from "cross-fetch";
import { evalGame } from "./anaylze";
// export function analyzeGame(game: Game) {}

// lichess
//   .fetchGames("bezalel6", { rated: "both", maxGames: 1 })
//   .listen(async (g) => {
//     console.log(g);
//     const evaluated = await evalGame(g);
//     console.log("evaluated", evaluated);
//   });

const fen = "rnbqkbnr/ppppp2p/8/4Ppp1/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3";

lichess.fetchGames("bezalel6", { rated: "both", maxGames: 1 }).listen((g) => {
  evalGame(g).then(console.log);
});

// new StockfishAbstraction();
// setTimeout(function () {
//   engine.send("stop");
// }, 1000);
