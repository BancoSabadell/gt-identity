pragma solidity ^0.4.4;

contract Proxy {
  
  /**
   * Forwards a call to another contract
   * @param destination Address of the contract that is going to receive the call
   * @param value Amount in wei
   * @param data Transaction data encoded, as function to call, params, etc.
   */
  function forward(address destination, uint value, bytes data) internal {
    if (!destination.call.value(value)(data))
      throw;
  }
}
