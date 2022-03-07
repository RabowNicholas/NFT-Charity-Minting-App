import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'

const COST_OF_PACK = 0.01
const PACK_SIZE = 8
const ETH_DONATION_WALLET = '0x3aE7359eF4aa9A2A2bC4690Ade38db5A06b4AEA1'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    let pack = this.createCardArray()
    this.setState({ cardArray: pack.sort(() => 0.5 - Math.random()) })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if(networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  createCardArray() {
    let pack_ids = Array.from(Array(PACK_SIZE-1)).map(x=>Math.floor(Math.random() * 100))
    pack_ids.push(pack_ids[0])
    for (let i = 0; i < pack_ids.length; i++) {
      if (pack_ids[i] < 9) {
        pack_ids[i] = '00' + pack_ids[i].toString()
      }
      else if (pack_ids[i] < 99) {
        pack_ids[i] = '0' + pack_ids[i].toString()
      }
      else{
        continue
      }
    }
    let pack = [
      {
        name: pack_ids[0],
        img: '/images/' + pack_ids[0].toString() + '.gif'
      },
      {
        name: pack_ids[1],
        img: '/images/' + pack_ids[1].toString() + '.gif'
      },
      {
        name: pack_ids[2],
        img: '/images/' + pack_ids[2].toString() + '.gif'
      },
      {
        name: pack_ids[3],
        img: '/images/' + pack_ids[3].toString() + '.gif'
      },
      {
        name: pack_ids[4],
        img: '/images/' + pack_ids[4].toString() + '.gif'
      },
      {
        name: pack_ids[5],
        img: '/images/' + pack_ids[5].toString() + '.gif'
      },
      {
        name: pack_ids[6],
        img: '/images/' + pack_ids[6].toString() + '.gif'
      },
      {
        name: pack_ids[7],
        img: '/images/' + pack_ids[7].toString() + '.gif'
      }
    ]
    return pack
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if(this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    }
    else if(this.state.cardsChosenId.includes(cardId)) {
      return this.state.cardArray[cardId].img
    } else {
      return window.location.origin + '/images/bottle.jfif'
    }
  }

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }

  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0]
    const optionTwoId = this.state.cardsChosenId[1]

    if(optionOneId == optionTwoId) {
      alert('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + this.state.cardArray[optionOneId].img.toString()
      )
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({
          cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
          tokenURIs: [...this.state.tokenURIs, this.state.cardArray[optionOneId].img]
        })
        if(!alert('Welcome to the Ocean Art Club')){window.location.reload();}
      })
    } else {
      alert('Sorry, try again')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
  }

  donateETH = async () => {
    window.web3.eth.sendTransaction({
      to: ETH_DONATION_WALLET,
      from: this.state.account,
      value: window.web3.utils.toWei(this.state.donationAmount, 'ether'),
    },
    function (err, transactionHash){
      if (err) return alert('There was a problem!: ' + err.message)
      alert('The Oceans will be more clean thanks to you!')
    })
  }

  buyPack = async () => {
    window.web3.eth.sendTransaction({
      to: ETH_DONATION_WALLET,
      from: this.state.account,
      value: window.web3.utils.toWei(COST_OF_PACK.toString(), 'ether'),
    },
    function (err, transactionHash){
      if (err) return alert('There was a problem!: ' + err.message)
      alert('Pack is opened')
    })
    this.setState({
      paid: true
    })

  }


  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],
      cardsDisplayOrder: [],
      donationAmount: 0,
      paid: false
    }
  }

  render() {
    let content
    if(this.state.paid){
      content =
      <div className="grid mb-4">
        { this.state.cardArray.map((card, key) => {
          return(
            <img
              key={key}
              src={this.chooseImage(key)}
              width={100}
              height={100}
              data-id={key}
              onClick={(event) => {
                let cardId = event.target.getAttribute('data-id')
                if(!this.state.cardsWon.includes(cardId.toString())) {
                  this.flipCard(cardId)
                }
              }}
            />
          )
        })}
      </div>
    }
    else{
      content =
      <div className="grid mb-4">
        <button
        className="btn btn-dark grid mb-4"
        onClick={(event) => {
            this.buyPack()
        }}>
        Pay to Play/Mint
        </button>
      </div>

    }
    return (
      <div class="bg-info">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
          &nbsp; Ocean Art
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">OCEAN CLUB ART</h1>
                <p className="grid mb-4">
                  Buy an Ocean Art Pack for {COST_OF_PACK} ETH. Each pack contains
                  a matching pair of art. The matching pair has to option of being minted.
                  Click on bottle images to flip cards until a match is found.
                  Owners of the NFT will be a member of the Ocean Club.
                  Decisions on how to utilize proceeds to prevent new plastics from
                  entering our oceans will be voted on by members.

                  <div className="col-md-12">
                    <button
                    className="btn btn-dark"
                    onClick={(event) => {
                        this.donateETH()
                    }}>
                    Donate ETH
                    </button>
                    <input
                      type="text"
                      onChange={(event) => {
                        const donationAmount= this.input.value.toString()
                        this.setState({
                          donationAmount
                        })
                      }}
                      ref={(input) => { this.input = input}}
                      placeholder="0"
                    />
                  </div>
                </p>

                {content}

                <div>

                  <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>

                  <div className="grid mb-4" >

                    { this.state.tokenURIs.map((tokenURI, key) => {
                      return(
                        <img
                          key={key}
                          width={200}
                          height={200}
                          src={tokenURI}
                        />
                      )
                    })}

                  </div>

                </div>

              </div>

            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
