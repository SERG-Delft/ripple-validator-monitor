const { time } = require('console')

WebSocket = require('ws')
subscription = '{"id":"subscribe_ID","command":"subscribe","streams":["ledger", "validations"]}'
websocket = new WebSocket('wss://ripple5.ewi.tudelft.nl')

ewi_node = "nHDDkPeX4CzMrXAQXNQqVSxkPmRbrxReC5NUHWPCmDezfADKKwDQ"
time_diff = 946684800

suggested_ledgers = []
canonical_ledgers = []

/**
 * Opens a connection to the node and subscribes to the ledger and validation streams.
 * If this subscription fails, the connection is closed automatically.
 **/
websocket.on('open', function() {
    console.log("Connected to ripple.ewi.tudelft.nl")
    websocket.send(subscription)
})

function metrics() {
    correctly_validated_hour = 0
    total_validated_hour = 0
    correctly_validated_day = 0
    total_validated_day = 0
    for ([index, ledger] of canonical_ledgers.entries()) {
        time_passed = Math.round((new Date()).getTime() / 1000) - time_diff - ledger.timestamp
        
        // Removes old validations
        if (time_passed > 84600) {
            canonical_ledgers.splice(index, 1)
        } else {
            total_validated_day++
            if (time_passed <= 3600) total_validated_hour++
            // Tried includes, didn't work. This was my solution. Probably not the best but it works
            if (suggested_ledgers.filter(suggested => suggested.hash === ledger.hash).length > 0) {
                correctly_validated_day++
                if (time_passed <= 3600) correctly_validated_hour++
            }
        }
    }
    hour_metric = correctly_validated_hour/total_validated_hour
    day_metric = correctly_validated_day/total_validated_day
    console.log("Hour: ", hour_metric, "Day: ", day_metric)
}

websocket.on('message', function(message){
    msg = JSON.parse(message)
    if (msg.type === "ledgerClosed") {
        var ledger = {hash:msg.ledger_hash, timestamp:msg.ledger_time};
        canonical_ledgers.push(ledger)
        metrics()
    } else if (msg.type === "validationReceived" && msg.master_key === ewi_node) {  
        var ledger = {hash:msg.ledger_hash, timestamp:msg.signing_time};  
        suggested_ledgers.push(ledger)
    }
})

websocket.on('close', function() {
  console.log('Disconnected.')
})