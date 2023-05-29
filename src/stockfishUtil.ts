import { Game } from "simple-lichess-api";

import { Chess } from "chess.js";

const loadEngine = require("./load_engine.js");
export type EvaluatedGame = {
  game: Game;
  algabraicNotationMoves: string[];
  evaluatedMoves: EvaluatedMove[];
};
export type EvaluatedMove = {
  move: string;
  evaluation: number;
};

export async function evalGame(game: Game) {
  console.log("evaling");
  const chess = new Chess();
  const tChess = new Chess();
  const stockfish = new StockfishAbstraction();
  chess.loadPgn(game.pgn);
  const moveHistory = chess.history({ verbose: true });
  const evaluated: EvaluatedGame = {
    game,
    algabraicNotationMoves: [],
    evaluatedMoves: [],
  };
  const gameLen = moveHistory.length;
  let i = 0;
  while (moveHistory.length > 0) {
    const p1Move = moveHistory.shift(),
      p1c = p1Move.from + p1Move.to;
    evaluated.algabraicNotationMoves.push(p1c);
    tChess.move(p1Move);
    stockfish.setPos(tChess.fen());
    const playerToMove = tChess.turn();

    let evaluation = await stockfish.evalPos();
    if (playerToMove !== "b") {
      evaluation *= -1;
    }
    console.log(`evaluating move ${i + 1}/${gameLen}`);
    evaluated.evaluatedMoves.push({ evaluation, move: p1c });
    i++;
  }
  return evaluated;
}

export class StockfishAbstraction {
  static THINK = 1000;
  engine: Engine;
  currentPosition: string;
  constructor() {
    this.engine = StockfishAbstraction.createEngine();
    this.engine.busy = false;
    this.currentPosition =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.init();
  }
  async init() {
    // this.setPos("8/k1q2q2/8/8/8/3Q4/3K4/8 w - - 0 1");
    // this.evalPos().then(console.log);
    // this.engine.send("d", console.log, console.log);
  }
  setPos(fen: string) {
    this.currentPosition = fen;
  }

  getPlayerToMove(): Promise<"w" | "b"> {
    const fen = this.currentPosition;
    const res = fen.split(" ")[1] as any;
    if (StockfishAbstraction.DEBUG) console.log("PLAYER TO MOVE: " + res);
    return res;
  }

  async evalPos(): Promise<number> {
    const d = await this.startProcessing(
      `go movetime ${StockfishAbstraction.THINK}`,
      {
        finalLine: "bestmove",
      }
    );
    const split = d.fullData.split("\n");
    const lastLine = split[split.length - 1];
    if (lastLine.includes("mate")) {
      const pattern = /score mate (-?\d+)/;
      const matcher = lastLine.match(pattern);
      if (matcher !== null) {
        const mateNumberString = matcher[1];
        const mateIn = parseInt(mateNumberString, 10);

        return (mateIn > 0 ? 1 : -1) * 10000000;
      } else {
        throw new Error("No mate number found.");
      }
    } else {
      const pattern_1 = /score cp (-?\d+)/;
      const matcher_2 = lastLine.match(pattern_1);
      if (matcher_2 !== null) {
        const scoreString = matcher_2[1];
        const score = parseInt(scoreString, 10);
        return score;
      } else {
        throw new Error("no score found");
      }
    }
  }
  static DEBUG = false;
  async startProcessing(
    cmd: string,
    { finalLine, cpEngine }: { finalLine?: string; cpEngine?: boolean } = {}
  ) {
    if (cpEngine === undefined || cpEngine === null) {
      cpEngine = true;
    }
    if (cpEngine) {
      this.engine = StockfishAbstraction.createEngine();
      await this.startProcessing(`position fen ${this.currentPosition}`, {
        cpEngine: false,
      });
    }

    const engine = this.engine;

    return new Promise<EngineProcessingResult>((resolve, reject) => {
      if (engine.busy) {
        reject("engine busy");
      }
      let fullData = "";
      let wasDone = false;
      engine.busy = true;
      function onDone(data: string) {
        // if (wasDone) return;
        wasDone = true;
        if (StockfishAbstraction.DEBUG) console.log("DONE: " + data);

        resolve({ criticalData: data, fullData });
        engine.busy = false;
        if (cpEngine) engine.quit();
      }
      function streaming(data: string) {
        if (StockfishAbstraction.DEBUG) console.log("STREAMING: " + data);
        fullData += data;
        if (finalLine && data.includes(finalLine)) {
          onDone(data);
        }
      }
      engine.send(cmd, onDone, streaming);
    });
  }
  static createEngine() {
    return loadEngine(
      require("path").join(
        __dirname,
        "../node_modules/stockfish/src/stockfish.js"
      )
    );
  }
}
interface EngineProcessingResult {
  fullData: string;
  criticalData: string;
}

interface Engine {
  send: (
    str: string,
    onDone: (data: string) => void,
    onStream: (data: string) => void
  ) => void;
  quit: () => void;
  busy: boolean;
}
