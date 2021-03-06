import { Game } from "../src/Game";
import { calculateWordScore } from "../src/gameUtils";
import { Player } from "../src/Player";
import { GameConfiguration } from "./GameConfiguration";

const app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var gameConfiguration = new GameConfiguration();
gameConfiguration.calculLevelInterval();

io.on("connection", function(socket: any) {
  console.log("a user connected");

  /**
   * @userId Pseudonyme du joueur, relié au socket
   */
  var userId: string = "Inconnu";

  /**
   * Au lancement d'une partie
   *
   * @gameConfig contient le nom de l'hote créateur de la partie, le nom de l'équipe et le niveau de difficulté
   */
  socket.on("startGame", async function(gameConfig: any) {
    console.log("Game started with config :");
    console.log(JSON.stringify(gameConfig));

    if (gameConfig.hostName != "") {
      userId = gameConfig.hostName;
    }

    Game.getInstance(
      new Player(gameConfig.hostName, gameConfig.hostTeam),
      gameConfig.gameDifficulty
    );
    await Game.getInstance().startGame();
    console.log(
      "hostName : " +
        Game.getInstance()
          .getHost()
          .getName()
    );
    console.log(
      "hostTeam : " +
        Game.getInstance()
          .getHost()
          .getTeam()
    );
    console.log("difficultyLevel : " + Game.getInstance().getDifficultyLevel());
    console.log("Mot a trouver : " + Game.getInstance().getWordToFind());
  });

  /**
   * Proposition d'un mot par l'utilisateur
   *
   * @msg le mot proposé
   */
  socket.on("proposition", function(msg: string) {
    console.log("Mot proposé par " + userId + " :");
    console.log(msg);
    let score = calculateWordScore(Game.getInstance().getWordToFind(), msg);
    Game.getInstance().addProposedWord(msg, score);
    socket.emit("score", [
      msg,
      score.getcorrectPlace(),
      score.getcorrectLetter()
    ]);

    if (msg == Game.getInstance().getWordToFind()) {
      io.emit("fin");
    }
  });

  socket.on("getAnswer", function() {
    socket.emit("answer", [Game.getInstance().getWordToFind()]);
  });

  /**
   * Récupération des meilleurs mots proposés
   */
  socket.on("getWords", function() {
    console.log("getWords");
    socket.emit("words", [Game.getInstance().getBestProposedWords(5)]);
  });

  /**
   * Récupération du niveau de difficulté minimal
   */
  socket.on("getMinimalDifficulty", function() {
    socket.emit("minDifficulty", gameConfiguration.getMinimalDifficulty());
  });

  /**
   * Récupération du niveau de difficulté maximal
   */
  socket.on("getMaximalDifficulty", function() {
    socket.emit("maxDifficulty", gameConfiguration.getMaximalDifficulty());
  });

  /**
   * Déconnexion de l'utilisateur
   */
  socket.on("disconnect", function() {
    console.log(userId + " disconnected");
  });
});

const server = http.listen(8080, async () => {
  console.log("server is running on port", server.address().port);

  //Initialisation des niveaux de difficulté
  await gameConfiguration.calculLevelInterval();
});
