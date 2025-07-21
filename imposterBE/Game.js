class Game {
    /**
     *
     * @type {Map<string, WebSocket>}
     */
    #clients;

    /**
     * @type {string}
     */
    imposterId

    /**
     * @type {Array<string>}
     */
    players

    /**
     * @type {string}
     */
    currentTurn
    /**
     * @type {Map<string , string>}
     */
    chosenWords

    static turnTime = 20000;

    resolveCurrentWordTimer;
    constructor() {
        this.chosenWords= new Map();
    }

    setClients(clients) {
        this.#clients = clients;
    }

    start() {
        const players = Array.from(this.#clients.keys());
        if(players.length === 0) throw new Error("INVALID PLAYER COUNT!");
        const randomIndex = Math.floor(Math.random() * players.length)
        this.imposterId = players[randomIndex];
        this.players = players.filter(name => name !== this.imposterId);
        this.assignRoles()
        this.startRound();




    }

    async startRound() {
        for(const player of this.#clients.keys()) {
            const con = this.#clients.get(player);
            const wordsFromOtherPlayers = this.chosenWords.values().toArray();
            const msg = {action: "yourTurn", turnTime: Game.turnTime, wordsFromOtherPlayers: wordsFromOtherPlayers }
            con.send(JSON.stringify(msg));
            this.currentTurn = player;

            await new Promise( resolve => {
                this.resolveCurrentWordTimer = resolve;
                setTimeout(resolve, Game.turnTime);
            })

        }

        this.evaluate();
    }

    assignRoles() {
        this.players.forEach(playerName => {
            const connection = this.#clients.get(playerName);
            const msg = {
                action: "assignRole",
                role: "player",
                word: "Bastard"
            }
            connection.send(JSON.stringify(msg))
        })

        const imposterCon = this.#clients.get(this.imposterId);
        const msg = {
            action: "assignRole",
            role: "impostor"
        }
        imposterCon.send(JSON.stringify(msg))

    }

    wordReceived(name, word) {
        if(name === this.currentTurn) {
            this.chosenWords.set(name, word);
            this.resolveCurrentWordTimer();
        }
    }

    evaluate() {
        const words = [];
        this.#clients.keys().toArray().forEach(key => {
            const word = this.chosenWords.get(key);
            if(!word) return;
            words.push( {
              name: key,
              word: word,
            } )
        })

        this.#clients.keys().toArray().forEach(key => {
            const con = this.#clients.get(key);
            const msg = {
                action: "allWords",
                words: words
            }
            con.send(JSON.stringify(msg))
        })
    }

    startAnotherRound() {
        this.chosenWords.clear()
        this.startRound();
    }

    endGame() {
        const msg = {
            action: "showImpostor",
            impostor: this.imposterId
        }
        this.players.forEach(player => {
            const con = this.#clients.get(player);
            con.send(JSON.stringify(msg))
        })
    }
}

export default Game