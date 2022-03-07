const MemoryToken = artifacts.require('./MemoryToken.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Memory Token', (accounts) => {
  let token

  before(async() => {
    token = await MemoryToken.deployed()
  })

  describe('Deployment', async() => {
    it('deploys sucessfully', async() =>{
        const address = token.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('contract has correct name/symbol', async() =>{
      const name = await token.name()
      assert.equal(name, 'Memory Token')
      const symbol = await token.symbol()
      assert.equal(symbol, 'MEMORY')
    })
  })

  describe('Token Distribution', async() => {
    let result

    it('Mint token', async() => {
      await token.mint(accounts[0], 'https://www.token-uri.com/nft')

      //token has been minted, total supply will increase
      result = await token.totalSupply()
      assert.equal(result.toString(), '1', 'total supply is correct')

      //user will now own 1 token
      result = await token.balanceOf(accounts[0])
      assert.equal(result.toString(), '1', 'accounts own correct # of nft')

      //see all tokens of owner
      let balanceOf = await token.balanceOf(accounts[0])
      let tokenIds = []
      for (let i = 0; i < balanceOf; i++){
        let id = await token.tokenOfOwnerByIndex(accounts[0], i)
        tokenIds.push(id.toString())
      }
      assert.equal(tokenIds.toString(), ['1'].toString(), 'tokenIds are correct')

      //check tokenURI
      let tokenURI = await token.tokenURI('1')
      assert.equal(tokenURI, 'https://www.token-uri.com/nft')
    })
  })
})
