
//const websocketURL = "10.1.104.207"
const websocketURL = "127.0.0.1"
const ws = new WebSocket(`ws://${websocketURL}:3001`)
const MessageType = {
    loginUser: "loginUser",
    sendWort: "wordInput"
}


ws.onopen = () => {
    sobaldVerbunden();
};

ws.onmessage = (message) => {
    console.log(message.data)
    const msg = JSON.parse(message.data);
    if(msg.action === "log") {
        nachrichtAusgeben(msg.message);
        return;
    }

    if (msg.action == "assignRole") {
        rolleZuweisen(msg.role);
        console.log(msg.role)
        return;
    }

    if(msg.action == "yourTurn") {
        deinZug();
    }

    if(msg.action === "allWords") {

        /** @type {Array<string>} */
        const words = msg.words;
        zeigeWoerterAn(words)
    }

    if(msg.action == "showImpostor") {
        zeigeImpostorAn(msg.impostor)
    }


}


function sobaldVerbunden() {
    const msg = {
        action: "loginUser",
    }

    sendeNachrichtAnServer(msg)
}




/**
 * Sendet das Wort an den Server das im Eingabe Feld eingegeben wurde
 * @param wort {string}
 */
function sendeWortAnServer(wort) {
    const msg = {
        action: "wordInput",
        word: wort,
    }
    sendeNachrichtAnServer(msg)
}


/**
 * Sendet Nachricht an den Server, fügt den namen des Absenders automatisch hinzu
 * @param msg
 */
function sendeNachrichtAnServer(msg) {
    msg.name = nameID;
    ws.send(JSON.stringify(msg));
}



