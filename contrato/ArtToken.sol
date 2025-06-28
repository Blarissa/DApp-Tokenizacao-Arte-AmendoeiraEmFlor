// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) private _tokenURIs;

    event TokenMintedWithURI(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI
    );

    constructor(address initialOwner)
        ERC721("ObraDeArteToken", "ARTE")
        Ownable(initialOwner)
    {}

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId); // Garante que o token existe e é válido
        return _tokenURIs[tokenId];
    }

    function mintArtwork(address recipient, string memory _metadataURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _safeMint(recipient, newItemId); // Cria o token e o associa ao recipient
        _tokenURIs[newItemId] = _metadataURI; // Armazena a URI de metadados
        emit TokenMintedWithURI(newItemId, recipient, _metadataURI); // Emite o evento
        return newItemId;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721)  {
        super._safeTransfer(from, to, tokenId);
    }

    function transfer(address recipient, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender,
            "Voce nao e o proprietario desse token");
        safeTransferFrom(msg.sender, recipient, _tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function owner() public view override returns (address) {
        return super.owner();
    }
}
