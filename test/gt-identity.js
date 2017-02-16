'use strict';

const Deployer = require('contract-deployer');
const fs = require('fs');
const TestRPC = require('ethereumjs-testrpc');
const Web3 = require('web3');
const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const GtIdentity = require('../src/index');
const gas = 3000000;
const BigNumber = require('bignumber.js');

const provider = TestRPC.provider({
    accounts: [{
        index: 0,
        secretKey: '0x998c22e6ab1959d6ac7777f12d583cc27d6fb442c51770125ab9246cb549db80',
        balance: 200000000
    }, {
        index: 1,
        secretKey: '0x998c22e6ab1959d6ac7777f12d583cc27d6fb442c51770125ab9246cb549db81',
        balance: 200000000
    }, {
        index: 2,
        secretKey: '0x998c22e6ab1959d6ac7777f12d583cc27d6fb442c51770125ab9246cb549db82',
        balance: 200000000
    }, {
        index: 3,
        secretKey: '0x998c22e6ab1959d6ac7777f12d583cc27d6fb442c51770125ab9246cb549db83',
        balance: 200000000
    }]
});

const web3 = new Web3(provider);
chai.use(chaiAsPromised);
chai.should();
Promise.promisifyAll(web3.eth);
Promise.promisifyAll(web3.personal);

describe('Identity contract', function () {
    let identity;
    let testContract;
    const account1 = '0x5bd47e61fbbf9c8b70372b6f14b068fddbd834ac';
    const account2 = '0x25e940685e0999d4aa7bd629d739c6a04e625761';
    const account3 = '0x6128333118cef876bd620da1efa464437470298d';

    before(function() {
        this.timeout(60000);
        return GtIdentity.deployContract(web3, account1, gas)
            .then(contract => {
                identity = contract;

                GtIdentity.contracts['TestContract.sol'] = fs.readFileSync('./test/TestContract.sol', 'utf8');
                const deployer = new Deployer(web3, {sources: GtIdentity.contracts}, 0);

                return deployer.deploy('TestContract', [], { from: account1, gas: gas });
            }).catch(error => console.log(error))
            .then((contract) => {
                testContract = contract;
            });
    });

    describe('Check ownership', () => {
        it('check owner', () => {
            return identity.ownersAsync(account1).should.eventually.equals(true);
        });

        it('check non-owner', () => {
            return identity.ownersAsync(account2).should.eventually.equals(false);
        });

        it('add owner as non-owner', () => {
            const promise = identity.addOwnerAsync(account3, {
                from: account2,
                gas: gas
            });

            return promise.should.eventually.be.rejected;
        });

        it('check non-owner', () => {
            return identity.ownersAsync(account3).should.eventually.equals(false);
        });

        it('add owner', () => {
            return identity.addOwnerAsync(account3, {from: account1, gas: gas});
        });

        it('check owner', () => {
            return identity.ownersAsync(account3).should.eventually.equals(true);
        });

        it('remove owner as non-owner', () => {
            const promise = identity.removeOwnerAsync(account3, {
                from: account2,
                gas: gas
            });

            return promise.should.eventually.be.rejected;
        });

        it('check owner', () => {
            return identity.ownersAsync(account3).should.eventually.equals(true);
        });

        it('remove owner', () => {
            return identity.removeOwnerAsync(account3, {from: account1, gas: gas});
        });

        it('check non owner', () => {
            return identity.ownersAsync(account3).should.eventually.equals(false);
        });

        it('should launch Owner event after adding an owner', function () {
            return identity.addOwnerAsync(account2, { from: account1, gas: gas })
                .then(() => identity.OwnerAsync())
                .should.eventually.satisfy(event => {
                    return event.args.who === account2 &&
                        event.args.by === account1 &&
                        event.args.isOwner === true;
                }, 'invalid Owner event');
        }).timeout(40000);

        it('should launch Owner event after removing an owner', function () {
            return identity.removeOwnerAsync(account2, { from: account1, gas: gas })
                .then(() => identity.OwnerAsync())
                .should.eventually.satisfy(event => {
                    return event.args.who === account2 &&
                        event.args.by === account1 &&
                        event.args.isOwner === false;
                }, 'invalid Owner event');
        }).timeout(40000);
    });

    describe('Check key recovery', () => {
        it('check key recovery', () => {
            return identity.keyRecoveryAsync()
                .should.eventually.equals('0x0000000000000000000000000000000000000000');
        });

        it('set key recovery as non-owner', () => {
            const promise = identity.setKeyRecoveryAsync(account3, {
                from: account2,
                gas: gas
            });

            return promise.should.eventually.be.rejected;
        });

        it('check key recovery', () => {
            return identity.keyRecoveryAsync().should.eventually.equals('0x0000000000000000000000000000000000000000');
        });

        it('set key recovery', () => {
            return identity.setKeyRecoveryAsync(account3, {from: account1, gas: gas});
        });

        it('check key recovery', () => {
            return identity.keyRecoveryAsync().should.eventually.equals(account3);
        });

        it('should launch KeyRecovery event after recovering the ownerwhip', function () {
            return identity.recoverKeyAsync(account2, { from: account3, gas: gas })
                .then(() => identity.KeyRecoveryAsync())
                .should.eventually.satisfy(event => {
                    return event.args.newOwner === account2;
                }, 'invalid Owner event');
        }).timeout(40000);

        it('check owner', () => {
            return identity.ownersAsync(account2).should.eventually.equals(true);
        });
    });

    describe('Check proxy', () => {

        it('set values in TestContract', () => {
            return testContract.testAsync("abc", 123, true, account2, { from: account1, gas: gas });
        });

        it('check values in TestContract', () => {
            return testContract.checkAsync()
                .should.eventually.satisfy(data => {
                    return data[0] === "abc" &&
                        data[1].equals(123) &&
                        data[2] === true &&
                        data[3] === account2 &&
                        data[4] === account1;
                }, 'incorrect document');
        });

        it('set values in TestContract using Proxy ', () => {
            var data = testContract.test.getData("def", 456, false, account1);
            return identity.executeAsync(testContract.address, 0, data, { from: account1, gas: gas });
        });

        it('check values in TestContract', () => {
            return testContract.checkAsync()
                .should.eventually.satisfy(data => {
                    return data[0] === "def" &&
                        data[1].equals(456) &&
                        data[2] === false &&
                        data[3] === account1 &&
                        data[4] === identity.address;
                }, 'incorrect document');
        });
    });
});
