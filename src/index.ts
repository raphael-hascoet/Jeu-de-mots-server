import { Game } from '../src/Game';
import { calculateWordScore } from '../src/gameUtils';
import { Player } from '../src/Player';

const app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', function(socket: any) {
    console.log('a user connected');

    socket.on('startGame', function(gameConfig: any) {
        console.log('Game started with config :');
        console.log(gameConfig);
        console.log(JSON.stringify(gameConfig));
        console.log(gameConfig.hostName);
        console.log(gameConfig.hostTeam);
        console.log(gameConfig.gameDifficulty);

        Game.getInstance(new Player(gameConfig.hostName, gameConfig.hostTeam), gameConfig.gameDifficulty)
        console.log("hostName : "+Game.getInstance().getHost().getName());
        console.log("hostTeam : "+Game.getInstance().getHost().getTeam());
        console.log("difficultyLevel : "+Game.getInstance().getDifficultyLevel());
        
        
    });
    socket.on('proposition', function(msg: string) {
        console.log('Mot proposé :');
        console.log(msg);
        var score = calculateWordScore(Game.getInstance().getWordToFind(), msg);
        socket.emit('score', [msg, score]);
    });
});

const server = http.listen(3000, async () => {
    console.log('server is running on port', server.address().port);

    console.log("Resultat attendu 3 : " + calculateWordScore('boom', 'bimbamboom'));
    console.log("Resultat attendu 3 : " + calculateWordScore('bim', 'biim'));
    console.log("Resultat attendu 0 : " + calculateWordScore('', 'rien'));
    console.log(Game.getInstance().getWordToFind());
});