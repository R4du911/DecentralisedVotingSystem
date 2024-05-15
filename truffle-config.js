require('dotenv').config();

const HDWalletProvider = require("truffle-hdwallet-provider");
const LoomTruffleProvider = require('loom-truffle-provider')

const { MNEMONIC, PROJECT_ID, PRIVATE_KEY } = process.env;

const keyBuffer = Buffer.from(PRIVATE_KEY, 'hex');
const base64PrivateKey = keyBuffer.toString('base64');

module.exports = {
  networks: {
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/v3/${PROJECT_ID}`)
      },
      network_id: 4
    },

    loom_testnet: {
      provider: function() {
          const chainId = 'extdev-plasma-us1';
          const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc';
          const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query';
          return new LoomTruffleProvider(chainId, writeUrl, readUrl, base64PrivateKey);
      },
      network_id: '9545242630824'
    },

    development: {
      host: "127.0.0.1",     
      port: 8545,            
      network_id: "*", 
      gas: 10000000, 
      gasPrice: 20000000000      
    },
  },

  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.17",   
    }
  },
};