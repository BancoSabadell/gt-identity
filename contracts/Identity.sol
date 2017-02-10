pragma solidity ^0.4.4;

import "Proxy.sol";
import "KeyRecovery.sol";

contract Identity is Proxy, KeyRecovery {

  function execute(address destination, uint value, bytes data) onlyOwners {
    super.forward(destination, value, data);
  }
}
