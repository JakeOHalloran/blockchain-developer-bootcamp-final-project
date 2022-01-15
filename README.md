# Prize Draw Dapp
## Project description

### Intro
There is no shortage of new ERC20 tokens being minted in hopes of being the next '200x' coin to explode in value. With all these new ERC20 projects, one thing they struggle with is community engagement and utility. 
Minting a new ERC20 token is relatively quick and easy, but for a lot of these projects they are forced to stop at this point, they have nothing to keep their community alive and engaged with the project.
This is where the Prize Draw app comes in. The token minter or community manager can use this app to run a 'winner takes all' style giveaway for their token. People who hold the token can buy tickets in hopes of winning the prize pool.
It may even promote more token buys, as people might see that there is 1000 of the ERC20 token up for grabs and be convinced to buy some of the tokens just to enter the draw themselves.

### Application Flow
1. Owner deploys the prize draw contract, passing the ERC20 token address into the constructor.
2. Owner creates the prize draw, sets the ticket price, the date the winner will be picked and then starts the prize draw.
3. Owner transfers a certain amount of the token to the prize draw contract directly, to be used as the initial prize pool.
4. Users buy tickets with the token, with all tokens used to buy tickets being sent into the current prize draw pool.
5. App updates, showing the user how many tickets they own, the new prize pool (total tokens and current dollar value), and their current chances of winning.
6. Owner clicks the random number button, generating a random number via Chainlink VRF. 
7. Owner clicks the pick winner button. The contract uses the random number to select a ticket at random. The owner of the ticket receives the total balance of the prize pool.
8. Current prize draw shuts down. Displays how much the winner received for the last prize draw.
9. Steps 2 - 8 repeat everytime the owner wishes to start another prize draw.


## Web app URL
http://jakeohalloran.com/FinalProject/

## Screencast - intro to the project
http://jakeohalloran.com/video/screencast.webm

## Folder structure
- `./client`: Front end application files (React application)
- `./contracts`: Solidity smart contracts
- `./migrations`: migration scripts for deploying the smart contracts
- `./test`: JS tests for the solidity smart contract PrizeDraw.sol


## Using Live version
1. Go to the live version URL (make sure you are connected to the kovan network)
2. The prize draw accepts a specific erc20 token deployed on kovan testnet called 'TestToken (TT)' (0xf16c95eaD5dEBc414f9Fbd300C22f4FD97A2b6ac), get some by clicking the faucet button (button added for the demo version of the app only)
3. Enter the amount of tickets you would like to purchase and click the 'buy tickets' button
4. You have now been entered into the prize draw (as you will not be the contract owner, you cannot select a winner, you can only enter. To see a winner being selected, watch the video or deploy and run your own version of the prize draw locally)

## For running locally
1. Install NodeJS
2. Install Truffle
3. Clone repo, and inside the root directory run 'npm install' to install the project dependencies.
4. Inside the client dir, run 'npm install' to install the front end project dependencies.
5. Run 'truffle develop'
6. In the secrets dir, inside the root directory, populate the seed value inside the .secrets file with your mnemonic for the account that will deploy the contracts.
7. Run 'migrate --reset --network testnet' to deploy both the prize draw contract and the test token to the kovan test network
8. Inside client/src/app.js, replace line 34 and 35 with the new prize draw contract address and the newly minted TestToken token address
9. Send the prize draw contract address a minimum of 0.1 LINK token to fund chainlink VRF, the LINK faucet is here https://faucets.chain.link/kovan?_ga=2.108810882.1216370729.1642006297-407420639.1634565281
10. In another terminal, go to the clients directory and run 'npm start', the front end should open in your browser
11. While connected to the front end with the owner account, the owner options will appear below the prize draw. You must first click the create draw button to create a new prize draw.

12. send some TestToken directly to the PrizeDraw contract address (account used to mint the token has them all). This is the starting fund that players will be buying tickets to win.
13. set the price (how much TestToken a ticket will cost) with the set price button.
14. set the date (when will the winner be selected) with the set date button.
15. start the draw with the start button. 
16. buy some tickets with TestToken. Maybe use a few different accounts to buy tickets for demo purposes.
	- each account will need some TestToken and test ETH to buy tickets (faucet will not work unless funded with the new TestToken)
17. When you are ready to end the prize draw and select the winner, click the get random button, wait for the alert to pop up to say the number has been generated by chainlink. 
18. Press the pick winner button.


## Test
1. complete steps 1 - 5 above
2. run 'test'

# Public ETH address for certification
`0x19a01f4d329CE59782e3Fb9A974e8d49e26846B4`