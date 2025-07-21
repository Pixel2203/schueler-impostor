import { WebSocketServer } from 'ws';
import Game from "./Game.js";

console.log(`✅ WebSocket Server läuft auf ws://localhost:3001`);

const wss = new WebSocketServer({ port: 3001 });
const clients = new Map();


let adminNameId = undefined;
/**
 *
 * @type {WebSocket}
 */
let adminPanelCon = undefined;
// Types

const MessageType = {
    loginUser: "loginUser",
    loginAdmin: "loginAdmin",
    sendWort: "wordInput",
    start: "startGame",
    anotherRound: "anotherRound",
    playerLeave: "playerLeave",
    playerJoin: "playerJoin",
    endGame: "endGame"
}
const game = new Game(clients)
wss.on('connection', (ws) => {
    ws.on("message", (message) => {
        handleMessage(JSON.parse(message), ws)
    })

    ws.on('close', () => {
        Array.from(clients.entries()).forEach((entry) => {
            if(entry[1] === ws) {
                clients.delete(entry[0])
                console.log(`Player ${entry[0]} left the game`)
                if(adminPanelCon) {
                    const msg = {
                        action: MessageType.playerLeave,
                        name: entry[0]
                    }
                    adminPanelCon.send(JSON.stringify(msg))
                }
            }
        })
    });
});



function loginAsAdmin(msg, ws) {
    if(adminNameId !== undefined) return;
    adminNameId = msg.name;
    adminPanelCon = ws;
    console.log(`Admin joined the game with name=${msg.name}`)

    for(const player of Array.from(clients.keys())) {
        if(adminPanelCon) {
            const msg = {
                action: MessageType.playerJoin,
                name: player
            }
            adminPanelCon.send(JSON.stringify(msg))
        }
    }
}

/**
 *
 * @param name
 * @param ws {WebSocket}
 */
function loginAsPlayer(name, ws) {
    if(clients.has(name)) {
        ws.close()
        console.log("Verbindung abgelehnt für " + name)
        return;
    }
    const res = {
        action: "log",
        message: "Spiel beigetreten"
    }
    ws.send(JSON.stringify(res))
    clients.set(name, ws)
    console.log(`Client joined with name=${name}`)
    if(adminPanelCon) {
        const msg = {
            action: MessageType.playerJoin,
            name: name
        }
        adminPanelCon.send(JSON.stringify(msg))
    }
}

function getPlayerNameByCon(webCon) {
    let p;
    Array.from(clients.entries()).forEach((entry) => {
        if(entry[1] === webCon) {
            p = entry[0];
        }
    });
    return p;
}

function handleMessage(msg, webCon) {
    const {action} = msg;
    if(action === MessageType.loginUser) {
        loginAsPlayer(msg.name, webCon)
    }else if(action === MessageType.loginAdmin) {
        loginAsAdmin(msg, webCon);
    }else if(action === MessageType.start) {
        game.setClients(clients)
        game.start()
    }else if(action === MessageType.sendWort) {
        game.wordReceived(getPlayerNameByCon(webCon), msg.word)
    }else if(action === MessageType.anotherRound) {
        game.startAnotherRound();
    }else if(action === MessageType.endGame) {
        game.endGame();
    }
}