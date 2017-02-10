pragma solidity ^0.4.4;

contract TestContract {

  function test(string text, uint number, bool boolean, address user)
    constant returns(string, uint, bool, address, address)
  {

    return (text, number, boolean, user, msg.sender);
  }
}
