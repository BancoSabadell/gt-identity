pragma solidity ^0.4.4;

contract TestContract {
  string text;
  uint number;
  bool boolean;
  address user;
  address sender;

  function test(string _text, uint _number, bool _boolean, address _user) {
    text = _text;
    number = _number;
    boolean = _boolean;
    user = _user;
    sender = msg.sender;
  }

  function check() constant returns(string, uint, bool, address, address) {
    return(text, number, boolean, user, sender);
  }
}
