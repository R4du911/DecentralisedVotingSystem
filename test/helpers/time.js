const { promisify } = require('util');

const time = {
    latest: async () => {
        const block = await web3.eth.getBlock('latest');
        return block.timestamp;
    },

    increase: async (duration) => {
        await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id: new Date().getTime(),
        });
        await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: new Date().getTime(),
        });
    },

    duration: {
        seconds: function (val) { return val; },
        minutes: function (val) { return val * this.seconds(60); },
        hours: function (val) { return val * this.minutes(60); },
        days: function (val) { return val * this.hours(24); },
    },
};

module.exports = time;
