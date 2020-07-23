WebSocket = require('ws')

subscription = '{"id":"subscribe_ID","command":"subscribe","streams":["ledger", "validations"]}'

ewi_socket = new WebSocket('wss://ripple5.ewi.tudelft.nl')
ewi_node = "nHDDkPeX4CzMrXAQXNQqVSxkPmRbrxReC5NUHWPCmDezfADKKwDQ"

validated_ledgers = []
canonical_ledgers = []

ewi_socket.on('open', function() {
    console.log("Connected to ripple.ewi.tudelft.nl")
    ewi_socket.send(subscription)
})

ewi_socket.on('message', function(message){
    msg = JSON.parse(message)
    if (msg.type === "ledgerClosed") {
        canonical_ledgers.push(msg.ledger_hash)
        console.log("Canonical ledger is", msg.ledger_hash)
    } else if (msg.type === "validationReceived" && msg.master_key === ewi_node) {    
        validated_ledgers.push(msg.ledger_hash)
        console.log("EWI: Validation of ledger", msg.ledger_hash, "by node", ewi_node)
    }
})

