pragma solidity ^0.4.4;

contract MultiOwned {
  mapping (address => bool) public owners;

  event Owner(address who, address by, bool isOwner);

  modifier onlyOwners() {
    if(!owners[msg.sender])
      throw;
    _;
  }

  function MultiOwned() {
    owners[msg.sender] = true;
  }

  function addOwner(address who) onlyOwners {
    owners[who] = true;

    Owner(who, msg.sender, true);
  }

  function removeOwner(address who) onlyOwners {
    owners[who] = false;

    Owner(who, msg.sender, false);
  }
}
