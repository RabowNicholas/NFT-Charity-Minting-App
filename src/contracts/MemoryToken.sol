pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract MemoryToken is ERC721Full{
  constructor() ERC721Full("Memory Token", "MEMORY") public {
  }
  //_to is address token is to be sent to
  //_tokenURI is string that is URI that referneces images
  function mint(address _to, string memory _tokenURI) public returns(bool){
    uint _tokenID = totalSupply().add(1);
    _mint(_to, _tokenID);
    _setTokenURI(_tokenID, _tokenURI);
  }
}
