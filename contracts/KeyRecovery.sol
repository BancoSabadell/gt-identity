pragma solidity ^0.4.4;

import "MultiOwned.sol";

contract KeyRecovery is MultiOwned {
  address public keyRecovery;

  event KeyRecovery(address newOwner);

  modifier onlyKeyRecovery() {
    if(msg.sender != keyRecovery)
      throw;
    _;
  }

  function setKeyRecovery(address _keyRecovery) onlyOwners {
    keyRecovery = _keyRecovery;
  }

  function recoverKey(address newOwner) onlyKeyRecovery {
    owners[newOwner] = true;

    KeyRecovery(newOwner);
  }
}
