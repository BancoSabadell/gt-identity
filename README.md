# gt-identity

An Identity contract to forward calls to other contracts. This contract allows you to have a unique identity in the Ethereum blockchain (ie. same address as msg.sender when executing other contracts) while using several addresses from different devices.

## Installation
```bash
npm install gt-identity
```

## Usage

#### Proxy

Note that in order to use the proxy feature of the identity module, the transaction must be built offchain (see below), so you will have to execute the identity contract when calling other contracts.

A javascript example of how this could be done:
```javascript
  idContract.execute(destination, value, data);
```
where:
* `idContract`: You identity contract.
* `destination`: Address of the contract you want to execute.
* `value`: Amount of ether you want to send with the transaction
* `data`: A byte array with the function name and parameters encoded. To calculate it, you need to use the function getData from the web3 library.
For example, the following piece of code calculates the data value of the method `myMethod` from the contract `myContractInstance` with the parameters `param1` and `param2`.
    ```javascript
      var data = myContractInstance.myMethod.getData(param1, param2);
    ```

#### Ownership
The identity contract can be executed from different addresses in diferent devices. The contract supports multiple addresses as owners, each address can be added as an owner of the contract using the following functions:

* `addOwner(address who)`: Adds a new address as an owner.

* `removeOwner(address who)`: Removes an address as an owner.

* `owners(address who)` (constant): Returns true is the address is already an owner.

#### Key recovery
A trusted party can be added in the case that the owners lose their private keys.

`setKeyRecovery(address _keyRecovery)`: To set the address of the trusted party that will be able to add a new owner.

`recoverKey(address newOwner)`: Allows the trusted party to add a new address as an owner.

## Example
Using an Identity contract `yourIdentity`, lets execute the function `yourFunction(123, "abc")` of the contract `yourContract`:

```javascript
  // The contract you want to execute using your identity contract.
  var yourContract = web3.eth.contract(yourContractAbi).at(yourContractAddress);

  // Your identity contract. You need to know the address where it was deployed.
  var yourIdentity = web3.eth.contract(identityContractAbi).at(yourIdentityAddress);

  // [...]

  // Execution of the function "yourFunction(123, abc)"
  var data = yourContract.yourFunction.getData(123, "abc");
  yourIdentity.execute(yourContractAddress, 0, data);
```
