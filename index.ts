import { Game } from './src/Game';
import { calculateWordScore } from './src/gameUtils';

const app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', function(socket: any) {
    console.log('a user connected');

    socket.on('startGame', function(gameConfig: Game) {
        console.log('Game started with config :');
        console.log(JSON.stringify(gameConfig));
    });
    socket.on('proposition', function(msg: string) {
        console.log('Mot proposé :');
        console.log(msg);
        var score = calculateWordScore(Game.getInstance().getWordToFind(), msg);
        Game.getInstance().addProposedWord(msg, score);
        socket.emit('score', [msg, score]);
    });
    socket.on('getWords', function() {
        console.log('getWords');
        socket.emit('words', [Game.getInstance().getProposedWords()]);
    });
});

const server = http.listen(3000, async () => {
    console.log('server is running on port', server.address().port);
    await Game.getInstance().startGame();
    console.log(Game.getInstance().getWordToFind());
});