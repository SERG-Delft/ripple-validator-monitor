const RippleAPI = require('ripple-lib').RippleAPI;

const monitor_node = 'wss://ripple5.ewi.tudelft.nl'
const ewi_hash = "nHDDkPeX4CzMrXAQXNQqVSxkPmRbrxReC5NUHWPCmDezfADKKwDQ"

const validated_ledgers = []
const canonical_ledgers = []

const api = new RippleAPI({
  server: monitor_node
});

api.on('error', (errorCode, errorMessage) => {
    console.log(errorCode + ': ' + errorMessage);
});

api.on('connected', () => {
    console.log('Connected to Ripple node');
});
  
api.on('disconnected', (code) => {
    console.log('disconnected, code:', code);
});

api.connect().then(() => {
    api.connection.on('ledgerClosed', (event) => {
        canonical_ledgers.push(event.ledger_hash)
        console.log("Canonical ledger is", event.ledger_hash)
    })
  
    api.connection.on('validationReceived', (event) => {
        if (event.master_key === ewi_hash) {
            validated_ledgers.push(event.ledger_hash)
            console.log("EWI: Validation of ledger", event.ledger_hash, "by node", ewi_hash)
        }
    })
  
    api.request('subscribe', {
      streams: ['ledger', 'validations']
    }).then(response => {
        console.log('Successfully subscribed')
    }).catch(error => {
        console.log(error)
    })
  }).catch(console.error);

