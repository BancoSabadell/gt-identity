'use strict';

const Deployer = require('contract-deployer');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

exports.contracts = Object.assign({
    'MultiOwned.sol': fs.readFileSync(path.join(__dirname, '../contracts/Multiowned.sol'), 'utf8'),
    'KeyRecovery.sol': fs.readFileSync(path.join(__dirname, '../contracts/KeyRecovery.sol'), 'utf8'),
    'Proxy.sol': fs.readFileSync(path.join(__dirname, '../contracts/Proxy.sol'), 'utf8'),
    'Identity.sol': fs.readFileSync(path.join(__dirname, '../contracts/Identity.sol'), 'utf8')
});

exports.deployContract = function (web3, account1, gas) {
    const deployer = new Deployer(web3, {sources: exports.contracts}, 0);
    return deployer.deploy('Identity', [], { from: account1, gas: gas })
        .then(identity => {
            checkContract(identity);
            return identity;
        });
};

exports.deployedContract = function (web3, account1, abi, address) {

    const identity = web3.eth.contract(abi).at(address);
    Promise.promisifyAll(identity);
    checkContract(identity);
    return Promise.resolve(identity);
};

function checkContract(identity) {
    if (!identity.abi) {
        throw new Error('abi must not be null');
    }

    if (!identity.address) {
        throw new Error('address must not be null');
    }

    if (typeof identity.owners === "undefined") {
        throw new Error('contract has not been properly deployed');
    }

}
