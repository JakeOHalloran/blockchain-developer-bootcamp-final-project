import axios from 'axios';
import './App.css';
import './animate.css';
import background from './background.png';
import prizeDrawImage from './prizedraw.png';
import React, { useEffect, useState } from 'react';
import PrizeDrawContract from './contracts/PrizeDrawContract.json';
import FaucetContract from './contracts/Faucet.json';
import { getWeb3 } from './utils.js';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [accountString, setAccountString] = useState('');
  const [contract, setContract] = useState(undefined);
  const [faucet, setFaucet] = useState(undefined);
  const [admin, setAdmin] = useState("");
  const [state, setState] = useState();
  const [priceVal, setPrice] = useState();
  const [adminVal, setAdminVal] = useState();
  const [pot_token, setPotToken] = useState(0);
  const [pot_dollars, setPotDollars] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [ticketNum, setTicketNum] = useState(0);
  const [ticketPriceDollar, setTicketPriceDollar] = useState(0);
  const [ticketPriceToken, setTicketPriceToken] = useState(0);
  const [date, setDate] = useState("");
  const [prizeDrawDate, setPrizeDrawDate] = useState("");
  const [prevWinnings, setPrevWinnings] = useState(0);
  const [playersTickets, setPlayersTickets] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [odds, setOdds] = useState(0);
  
  const contract_addr = "0x00eD5aD3ed039Ab0d47b957ed7173750B082b1b0";
  const TOKEN_ADDRESS = "0xf16c95eaD5dEBc414f9Fbd300C22f4FD97A2b6ac";
  const faucet_addr = "0x2641151de1e4468B7a657023Cfe9434c8407FdCC";

  useEffect(() => {
    document.getElementById("popup-wrapper").addEventListener("click", function( e ){
      e = window.event || e; 
      if(this === e.target) {
        document.getElementById('popup-wrapper').style.display = 'none';
        document.getElementById('popup-info').style.visibility = 'hidden';
        document.getElementById('popup-howto').style.visibility = 'hidden';
      }
    });

    init();

    if(window.ethereum) {
      window.ethereum.on('accountsChanged', accounts => {
        if (accounts.length) {
          console.log("switched account in metamask");
          init();
        } else {
          console.log("logged out of metamask");
          setAccounts([]);
        }
      });
  
      window.ethereum.on('networkChanged', function(networkId) {
        init();
      });
    }
  }, []);

  async function createDraw() {
    await contract.methods.createPrizeDraw().send({from: accounts[0]});
  }

  async function getFunds() {
    await faucet.methods.giveTokens().send({from: accounts[0]});
  }

  async function startDraw() {
    await contract.methods.startPrizeDraw().send({from: accounts[0]});

    const state = await contract.methods.currentState().call();
    const date = await contract.methods.getPrizeDrawDate().call();
    setState(parseInt(state));
    setPotDollars(0);
    setPotToken(0);
    setPrizeDrawDate(date);
    setPlayersTickets(0);
    setPlayerCount(0);
    setTicketCount(0);
    setOdds(0);
  }

  async function cancelDraw() {
    await contract.methods.cancelPrizeDraw().send({from: accounts[0]});
    
    const state = await contract.methods.currentState().call();
    setState(parseInt(state));
    setPotDollars(0);
    setPotToken(0);
    setPrizeDrawDate("");
    setPlayersTickets(0);
    setPlayerCount(0);
    setTicketCount(0);
    setOdds(0);
  }

  async function pickWinner() {
    const web3 = await getWeb3();

    await contract.methods.pickWinner().send({from: accounts[0]});

    const state = await contract.methods.currentState().call();

    const prevWinnings = await contract.methods.getPreviousPrize().call();

    const prevWinningsNotWei = web3.utils.fromWei(prevWinnings.toString(), 'ether');

    const prevPotDollars = Math.round((prevWinningsNotWei * tokenPrice) * 100) / 100;

    setPrevWinnings(prevPotDollars);
    setState(parseInt(state));
    setPotDollars(0);
    setPotToken(0);
    setPrizeDrawDate("");
    setPlayersTickets(0);
    setPlayerCount(0);
    setTicketCount(0);
    setOdds(0);
  }

  async function setTicketPrice() {
    await contract.methods.setTicketPrice(priceVal).send({from: accounts[0]});
    await contract.methods.getTicketPrice().call({from: accounts[0]});
    
    document.getElementById("ticket-price-input").value = null;
  }

  async function changeAdmin() {
    await contract.methods._transferOwnership(adminVal).send({from: accounts[0]});

    const result = await contract.methods.owner().call({from: accounts[0]});
    
    alert("New Admin: " + result);
  }

  async function getBalance() {
    const result = await Promise.all([
      contract.methods.getRemainingLINK().call({from: accounts[0]})
    ]);
    
    alert(result);
  }

  async function buyTickets() {
    if(ticketNum <= 0) {
      return false;
    }

    if (isNaN(ticketNum)) {
        alert("Please enter a valid Number.");
        return false;
    }

    const ERC20TransferABI = [
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        }
    ]

    const web3 = await getWeb3();

    const token = new web3.eth.Contract(ERC20TransferABI, TOKEN_ADDRESS);

    const ticketPrice = await contract.methods.getTicketPrice().call();

    let totalToken = ticketNum * ticketPrice;

    let tokenWei = web3.utils.toWei(totalToken.toString(), 'ether');

    document.getElementsByClassName('transaction-popup-wrapper')[0].style.display = 'block';

    await token.methods.approve(contract_addr, tokenWei).send({from: accounts[0]}).on('error', function(error, receipt) {
      document.getElementsByClassName('active-flashing')[0].classList.remove('active-flashing');
      closeTransactionPopup();
    });

    document.getElementsByClassName('active-status')[0].classList.remove('active-status');
    document.getElementsByClassName('active-flashing')[0].classList.remove('active-flashing');
    document.getElementById('status-buying').className += ' active-status';
    document.getElementById('buying-flashing').className += ' active-flashing';

    await contract.methods.buyTickets(ticketNum).send({from: accounts[0]}).on('error', function(error, receipt) {
      document.getElementsByClassName('active-flashing')[0].classList.remove('active-flashing');
      closeTransactionPopup();
    });

    document.getElementsByClassName('active-status')[0].classList.remove('active-status');
    document.getElementsByClassName('active-flashing')[0].classList.remove('active-flashing');
    document.getElementById('status-complete').className += ' active-status';
    document.getElementsByClassName('transaction-popup-button')[0].style.display = 'block';

    let newPotDollars = pot_dollars + Math.round((tokenPrice * totalToken) * 100) / 100;
    const newPotDollars2 = Math.round(newPotDollars * 100) / 100;

    document.getElementById("ticketInput").value = null;
    setPotDollars(newPotDollars2);
    setTicketNum(0);
    setTicketPriceDollar(0);
    setTicketPriceToken(0);
    
    const pot_token = await contract.methods.getTotalPrize().call({from: accounts[0]});

    const pot_tokenNotWei = web3.utils.fromWei(pot_token.toString(), 'ether');
    
    setPotToken(pot_tokenNotWei);

    const ticketCount = await contract.methods.getPrizeDrawTickets().call();
    setTicketCount(ticketCount);

    const playersTickets = await contract.methods.getTicketsPerPlayer(accounts[0]).call();
    setPlayersTickets(playersTickets);

    const playerCount = await contract.methods.getPrizeDrawPlayers().call();
    setPlayerCount(playerCount);

    const odds = ((playersTickets / ticketCount) * 100).toFixed(2);
    setOdds(odds);
  }

  async function saveDate() {
    await contract.methods.saveDate(date).send({from: accounts[0]});
    document.getElementById("date-input").value = null;
    setPrizeDrawDate(date);
  }

  async function updatedTicketNum(value) {
    if (isNaN(value)) {
      setTicketPriceDollar(0);
      setTicketPriceToken(0);
      return false;
    } else {
      if(value >= 1) {
        setTicketNum(value);

        const ticketPrice = await contract.methods.getTicketPrice().call();
    
        const token = ticketPrice * value;
        const dollar = Math.round(((ticketPrice * tokenPrice) * value) * 100) / 100;
    
        setTicketPriceDollar(dollar);
        setTicketPriceToken(token);
      } else {
        setTicketPriceDollar(0);
        setTicketPriceToken(0);
      }
    }
  }

  async function getRandomNumber() {
    await contract.methods.getRandomNumber().send({from: accounts[0]});
  }

  async function withdrawLink() {
    await contract.methods.withdrawLink().send({from: accounts[0]});
  }


  function connectWallet() {
    if(accounts.length > 0) {
      popup("Wallet Already Connected.")
    } else {
      init();
    }
  }

  function howTo() {
    document.getElementById('popup-wrapper').style.display = 'block';
    document.getElementById('popup-howto').style.visibility = 'visible';
    document.getElementById('popup-howto').className += ' animated fadeIn';
  }

  function popup(popupText) {
    document.getElementById('popup-text_info').innerHTML = popupText;
    document.getElementById('popup-wrapper').style.display = 'block';
    document.getElementById('popup-info').style.visibility = 'visible';
    document.getElementById('popup-info').className += ' animated fadeIn';
  }
  
  function closePopup() {
    document.getElementById('popup-wrapper').style.display = 'none';
    document.getElementById('popup-info').style.visibility = 'hidden';
    document.getElementById('popup-howto').style.visibility = 'hidden';
  }

  function closeTransactionPopup() {
    document.getElementsByClassName('active-status')[0].classList.remove('active-status');
    document.getElementsByClassName('transaction-popup-wrapper')[0].style.display = 'none';
    document.getElementById('status-approve').className += ' active-status';
    document.getElementById('approve-flashing').className += ' active-flashing';
    document.getElementsByClassName('transaction-popup-button')[0].style.display = 'none';
  }

  async function init() {
    const web3 = await getWeb3();

    let network = await web3.eth.net.getId();

    if(parseInt(network) !== 42) {
      popup("Please Connect To Kovan Network.");
    }

    const accounts = await web3.eth.getAccounts();
    setAccountString(accounts[0].toString().substring(0, 8) + "...");

    const contract = new web3.eth.Contract(PrizeDrawContract.abi, contract_addr);
    const faucet = new web3.eth.Contract(FaucetContract.abi, faucet_addr);

    const admin = await contract.methods.owner().call();
    const state = await contract.methods.currentState().call();
    const date = await contract.methods.getPrizeDrawDate().call();

    const playerCount = await contract.methods.getPrizeDrawPlayers().call();
    const ticketCount = await contract.methods.getPrizeDrawTickets().call();
    const playersTickets = await contract.methods.getTicketsPerPlayer(accounts[0]).call();

    const odds = ((playersTickets / ticketCount) * 100).toFixed(2);

    const pot_token = await contract.methods.getTotalPrize().call({from: accounts[0]});

    const pot_tokenNotWei = web3.utils.fromWei(pot_token.toString(), 'ether');

    const prevWinnings = await contract.methods.getPreviousPrize().call();

    const prevWinningsNotWei = web3.utils.fromWei(prevWinnings.toString(), 'ether');

    axios.get('https://api.pancakeswap.info/api/v2/tokens/0x2859e4544c4bb03966803b044a93563bd2d0dd4d')
    .then(response => {
      const tokenPrice = response.data.data.price;

      const potDollars = Math.round((pot_tokenNotWei * tokenPrice) * 100) / 100;

      const prevPotDollars = Math.round((prevWinningsNotWei * tokenPrice) * 100) / 100;

      setPotDollars(potDollars);
      setTokenPrice(tokenPrice);
      setPrevWinnings(prevPotDollars);
    })
    .catch(e => {
      console.log(e);
    });

    setPrizeDrawDate(date);
    setPotToken(pot_tokenNotWei);
    setAccounts(accounts);
    setContract(contract);
    setFaucet(faucet);
    setAdmin(admin);
    setState(parseInt(state));
    setPlayerCount(playerCount);
    setTicketCount(ticketCount);
    setPlayersTickets(playersTickets);
    setOdds(odds);

    contract.events.NumberReceived((err, events) => {
      //pickWinner();
      if(accounts[0] === admin) {
        alert("Random Number Generated");
      }
    });
  }

  return (
    <div className="App">
      <div className="main-section">
        <img className="section-background" src={background}></img>
        <div className="nav-section">
          <div className="navbar">
            <div className="nav-links-section">
              <div className="wallet" onClick={getFunds}>FAUCET</div>
              {accounts.length ? (
                <div className="wallet-connected-wrapper">
                  <i className="fa fa-wallet"></i>
                  <div className="account">{accountString}</div>
                </div>
              ):
                <div className="wallet" onClick={connectWallet}>CONNECT WALLET</div>
              }
            </div>
          </div>
        </div>

        <div id="popup-wrapper">
          <div className="popup" id="popup-info">
            <div id="popup-text_info"></div>
            <div className="popup-button" onClick={closePopup}>OK</div>
          </div>

          <div className="popup" id="popup-howto">
            <div className="popup-text">Connect your wallet to the Kovan network. To enter the draw, you must enter the number of tickets you wish to purchase and press the Buy Tickets button.
            The winning ticket will be chosen at random via Chainlink VRF, and the owner of this ticket will immediately receive the entirety of the prize pool.</div>
            <div className="popup-button" onClick={closePopup}>OK</div>
          </div>
        </div>

        
        <div className="transaction-popup-wrapper">
          <div className="transaction-popup">
            <div className="status-text active-status" id="status-approve">Approving Tickets</div>
            
            <div className="dot-flashing active-flashing" id="approve-flashing"></div>

            <div className="status-text" id="status-buying">Buying Tickets</div>

            <div className="dot-flashing" id="buying-flashing"></div>

            <div className="status-text" id="status-complete">Transaction Complete</div>
            <div className="transaction-popup-button" onClick={closeTransactionPopup}>OK</div>
          </div>
        </div>

        <div className="section-wrapper">
          <div className="howto-button" onClick={howTo}>
            <div className="howto-button-text">?</div>
          </div>
          <div className="section-sub-heading">Current Prize</div>
          <div className="section-heading">{pot_token} TOKENS (~ ${pot_dollars})</div>

          {accounts.length ? (
            <div>
              <div>
                {playersTickets > 0 && state === 1 ? (
                  <div className="tickets-wrapper">
                    {playersTickets} out of {ticketCount} tickets for this Prize Draw are yours. 
                    You have around a {odds}% chance of winning.
                  </div>
                ): null}
              </div>
              {state === 1 ? (
                <div className="prize-draw-wrapper">
                  <div className="prize-draw-header">
                    <div className="prize-draw-header-section">
                      Tickets Sold: {ticketCount}
                    </div><div className="prize-draw-header-section" id="prize-draw-header-section-center">
                      Total Players: {playerCount}
                    </div><div className="prize-draw-header-section">
                      Draw Ends: {prizeDrawDate}
                    </div>
                  </div>
                  <div className="prize-draw-header_sm">
                    <div className="prize-draw-header-pool">
                      {ticketCount} Total Tickets Bought By {playerCount} Players
                    </div>
                    <div className="prize-draw-header-date">
                      Prize Draw Ends On: {prizeDrawDate}
                    </div>
                  </div>
                  <div className="prize-draw-body">
                    <img className="hidden-prize-draw-image" src={prizeDrawImage}></img>
                    <div className="buy-section">
                      <div className="buy-ticket-text">Enter Ticket Amount</div>
                      <input className="ticket-input" id="ticketInput" onChange={e => updatedTicketNum(e.target.value)} maxLength="7"></input>
                      <div className="token-cost">{ticketPriceToken} TOKENS</div>
                      <div className="dollar-cost">~ {ticketPriceDollar} Dollars</div>
                      <div className="buy-tickets-button" onClick={buyTickets}>BUY TICKETS</div>
                    </div>
                    <img className="prize-draw-image" src={prizeDrawImage}></img>
                  </div>
                </div>
              ) : 
                <div className="prize-draw-wrapper">
                  <div className="prize-draw-header">
                    {prevWinnings === 0 ? (
                      <div className="prevWinner">No Prize Draw Running.</div>
                    ):
                      <div className="prevWinner">Current Prize Draw Ended. The Winner Received ~${prevWinnings}</div>
                    }
                  </div>
                  <div className="prize-draw-header_sm">
                    {prevWinnings === 0 ? (
                      <div className="prevWinner">No Prize Draw Running.</div>
                    ):
                      <div className="prevWinner">Current Prize Draw Ended. The Winner Received ~${prevWinnings}</div>
                    }
                  </div>
                  <div className="prize-draw-body noMetaMask">
                    <img className="hidden-prize-draw-image" src={prizeDrawImage}></img>
                    <div className="buy-section">
                      <div className="buy-ticket-text">Enter Ticket Amount</div>
                      <input className="ticket-input noMetaMask-input" id="ticketInput" onChange={e => updatedTicketNum(e.target.value)} maxLength="7"></input>
                      <div className="token-cost">{ticketPriceToken} TOKENS</div>
                      <div className="dollar-cost">~ {ticketPriceDollar} Dollars</div>
                      <div className="buy-tickets-button noMetaMask">BUY TICKETS</div>
                    </div>
                    <img className="prize-draw-image" src={prizeDrawImage}></img>
                  </div>
                </div>
              }
            </div>
          ) : 
            <div>
              <div className="prize-draw-wrapper">
                <div className="prize-draw-header">
                  <div id="prize-draw-header-section-center-metamask">PLEASE CONNECT WALLET</div>
                </div>
                <div className="prize-draw-header_sm">
                  <div id="prize-draw-header-section-center-metamask">PLEASE CONNECT WALLET</div>
                </div>
                <div className="prize-draw-body noMetaMask">
                  <img className="hidden-prize-draw-image" src={prizeDrawImage}></img>
                  <div className="buy-section">
                    <div className="buy-ticket-text">Enter Ticket Amount</div>
                    <input className="ticket-input noMetaMask-input" id="ticketInput" onChange={e => updatedTicketNum(e.target.value)} maxLength="7"></input>
                    <div className="token-cost">{ticketPriceToken} TOKENS</div>
                    <div className="dollar-cost">~ {ticketPriceDollar} Dollars</div>
                    <div className="buy-tickets-button noMetaMask">BUY TICKETS</div>
                  </div>
                  <img className="prize-draw-image" src={prizeDrawImage}></img>
                </div>
              </div>
            </div>
          }



        </div>

        {accounts[0] === admin ? (
          <div className="admin-section">
            <div className="admin_button" onClick={createDraw}>Create Draw</div>
            <div className="input-wrapper">
              <input className="admin_input" id="ticket-price-input" onChange={e => setPrice(e.target.value)}></input>
              <div className="admin_submit" onClick={setTicketPrice}>Set Price</div>
            </div>
            <div className="input-wrapper">
              <input className="admin_input" id="date-input" onChange={e => setDate(e.target.value)}></input>
              <div className="admin_submit" onClick={saveDate}>Set Date</div>
            </div>
            <div className="admin_button" onClick={startDraw}>Start Draw</div>
            <div className="admin_button" onClick={getRandomNumber}>Get Random</div>
            <div className="admin_button" onClick={pickWinner}>Pick Winner</div>
            <div className="admin_button" onClick={cancelDraw}>Cancel Draw</div>

            <div className="admin_button" onClick={getBalance}>Get Link Balance</div>
            <div className="admin_button" onClick={withdrawLink}>Withdraw Link</div>
            <div className="input-wrapper">
              <input className="admin_input" onChange={e => setAdminVal(e.target.value)}></input>
              <div className="admin_submit" onClick={changeAdmin}>Change Admin</div>
            </div>
          </div>
          ) : null}
      </div>
    </div>
  );
}

export default App;
