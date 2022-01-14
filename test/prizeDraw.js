const { expectRevert } = require('@openzeppelin/test-helpers');
const PrizeDraw = artifacts.require('PrizeDrawContract.sol');
const TestToken = artifacts.require('TestToken.sol');

contract('PrizeDraw', (accounts) => {
  let testTokenContract = null;
  let prizeDrawContract = null;

  beforeEach(async () => {
    testTokenContract = await TestToken.new("10000000000000000000000000000");
    prizeDrawContract = await PrizeDraw.new(testTokenContract.address);
  });

  it('can change owner', async () => { 
    let owner = await prizeDrawContract.owner();
    assert(owner === accounts[0]);

    await prizeDrawContract._transferOwnership(accounts[1]);
    owner = await prizeDrawContract.owner();
    assert(owner === accounts[1]);
  });

  it('ticket price cant be 0', async () => {
    await prizeDrawContract.createPrizeDraw(); 
    await expectRevert(prizeDrawContract.setTicketPrice(0),'ticket price must be greater than 0');
  });

  it('must create draw before setting ticket price', async () => { 
    await expectRevert(prizeDrawContract.setTicketPrice(0),'Must have created a prize draw');
  });

  it('can set ticket price', async () => {
    await prizeDrawContract.createPrizeDraw();
    let ticketPrice = await prizeDrawContract.getTicketPrice();
    assert(ticketPrice.toNumber() === 0);

    await prizeDrawContract.setTicketPrice(100);
    ticketPrice = await prizeDrawContract.getTicketPrice();
    assert(ticketPrice.toNumber() === 100);
  });

  it('cant start prize draw without setting price', async () => { 
    await prizeDrawContract.createPrizeDraw();
    await expectRevert(prizeDrawContract.startPrizeDraw(),'ticket price needs to be set');
  });

  it('cant update ticket price mid draw', async () => { 
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(100);
    await prizeDrawContract.startPrizeDraw();
    expectRevert(prizeDrawContract.setTicketPrice(200),'current state does not allow this');
  });

  it('can start prize draw', async () => { 
    let state = await prizeDrawContract.currentState();
    assert(state.toNumber() === 0);

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(100);

    await prizeDrawContract.startPrizeDraw();
    state = await prizeDrawContract.currentState();
    assert(state.toNumber() === 1);
  });

  it('only owner can start prize draw', async () => { 
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(100);

    await expectRevert(prizeDrawContract.startPrizeDraw({from: accounts[1]}), 'Ownable: caller is not the owner');
  });

  it('can transfer the new token', async () => {
    await testTokenContract.transfer(accounts[1], "1000");

    balance = await testTokenContract.balanceOf(accounts[1]);
    assert(balance.toNumber() === 1000);
  });

  it('cant buy ticket unless prize draw running', async () => {
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(100);
    await expectRevert(prizeDrawContract.buyTickets(5),'current state does not allow this');
  });
  
  it('cant buy ticket unless correct token sent', async () => {
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(10);
    await prizeDrawContract.startPrizeDraw();
    await testTokenContract.approve(prizeDrawContract.address, 10, {from: accounts[0]});

    await prizeDrawContract.buyTickets(10, {from: accounts[0]}).catch(function(error) {
      assert.include(error.message,'ERC20: transfer amount exceeds allowance')});
  });

  it('ticket amount must be greater than 1', async () => {
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(10);
    await prizeDrawContract.startPrizeDraw();
    expectRevert(prizeDrawContract.buyTickets(0),'must buy at least 1 ticket');
  });

  it('player gets assigned correct amount of tickets after buying', async () => {

    await testTokenContract.transfer(accounts[1], (25 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(10, {from: accounts[1]});

    let result = await prizeDrawContract.getTicketsPerPlayer(accounts[1]);
    assert(result.toNumber() === 10);

    await testTokenContract.approve(prizeDrawContract.address, (15 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(15, {from: accounts[1]});

    result = await prizeDrawContract.getTicketsPerPlayer(accounts[1]);
    assert(result.toNumber() === 25);
  });

  it('contract tracks how many tokens spent per player', async () => {
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (2 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(2);
    let result = await prizeDrawContract.getTokensSpentPerPlayer(accounts[0]);

    assert(result.toString() === (2 * 10 ** 18).toString());

    await testTokenContract.approve(prizeDrawContract.address, (2 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(2);
    result = await prizeDrawContract.getTokensSpentPerPlayer(accounts[0]);
    assert(result.toString() === (4 * 10 ** 18).toString());
  });

  it('contract tracks total number of tickets', async () => {
    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(20);
    await prizeDrawContract.startPrizeDraw();
    await testTokenContract.approve(prizeDrawContract.address, (20 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(1);

    let result = await prizeDrawContract.getPrizeDrawTickets();
    assert(result.toNumber() === 1);
  });

  it('prize draw currentID increments correctly', async () => {
    let result = await prizeDrawContract.getPrizeDrawCount();
    assert(result.toNumber() === 0);

    await prizeDrawContract.createPrizeDraw();

    result = await prizeDrawContract.getPrizeDrawCount();
    assert(result.toNumber() === 1);
  });

  it('tickets per player stored correctly with multiple players and multiple buys', async () => {
    await testTokenContract.transfer(accounts[1], (10 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (1 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(1, {from: accounts[0]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    let result = await prizeDrawContract.getTicketsPerPlayer(accounts[0]);
    assert(result.toNumber() === 1);

    result = await prizeDrawContract.getTicketsPerPlayer(accounts[1]);
    assert(result.toNumber() === 10);

    result = await prizeDrawContract.getTicketsPerPlayer(accounts[2]);
    assert(result.toNumber() === 10);

    result = await prizeDrawContract.getPrizeDrawTickets();
    assert(result.toNumber() === 21);
  });

  it('prize pool gets setup correctly', async () => {
    await testTokenContract.transfer(accounts[1], (5 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (2 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(1, {from: accounts[0]});

    await testTokenContract.approve(prizeDrawContract.address, (5 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    await prizeDrawContract.buyTickets(1, {from: accounts[0]});

    let result = await prizeDrawContract.getTicketAddress(18);
    assert(result === "0x0000000000000000000000000000000000000000");

    result = await prizeDrawContract.getTicketAddress(1);
    assert(result === accounts[0]);

    result = await prizeDrawContract.getTicketAddress(6);
    assert(result === accounts[1]);

    result = await prizeDrawContract.getTicketAddress(7);
    assert(result === accounts[2]);

    result = await prizeDrawContract.getTicketAddress(17);
    assert(result === accounts[0]);
  });

  it('stores correct player count', async () => {
    await testTokenContract.transfer(accounts[1], (10 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (1 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(1, {from: accounts[0]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    let result = await prizeDrawContract.getPrizeDrawPlayers();
    assert(result.toNumber() === 3);
  });

  it('prize draw tokens pool is correct', async () => {
    await testTokenContract.transfer(accounts[1], (10 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (15 * 10 ** 18).toString(), {from: accounts[0]});
    await prizeDrawContract.buyTickets(15, {from: accounts[0]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(10, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    let result = await prizeDrawContract.getTotalPrize();
    assert(result.toString() === (35 * 10 ** 18).toString());
  });

  it('pickWinner works as expected', async () => {
    await testTokenContract.transfer(accounts[1], (5 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (5 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    await prizeDrawContract.pickWinnerTest();

    result = await prizeDrawContract.getWinningTicket();
    assert(result.toNumber() === 3);

    result = await prizeDrawContract.getWinnerAddress();
    assert(result === accounts[1]);

    result = await testTokenContract.balanceOf(accounts[1]);
    assert(result.toString() === (15 * 10 ** 18).toString());

    result = await prizeDrawContract.currentState();
    assert(result.toNumber() === 0);

    result = await prizeDrawContract.getPrevPrizeDraw();
    assert(result.toNumber() === 1);
  });

  it('prize draw cancel works', async () => {
    await testTokenContract.transfer(accounts[1], (10 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (10 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (10 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(10, {from: accounts[2]});

    await prizeDrawContract.cancelPrizeDraw();

    result = await testTokenContract.balanceOf(accounts[1]);
    assert(result.toString() === (10 * 10 ** 18).toString());

    result = await testTokenContract.balanceOf(accounts[2]);
    assert(result.toString() === (10 * 10 ** 18).toString());

    result = await testTokenContract.balanceOf(testTokenContract.address);
    assert(result.toString() === "0");
  });

  it('next prize draw after cancel works', async () => {
    await testTokenContract.transfer(accounts[1], (6 * 10 ** 18).toString());
    await testTokenContract.transfer(accounts[2], (2 * 10 ** 18).toString());

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (5 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (1 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(1, {from: accounts[2]});

    await prizeDrawContract.cancelPrizeDraw();

    await prizeDrawContract.createPrizeDraw();
    await prizeDrawContract.setTicketPrice(1);
    await prizeDrawContract.startPrizeDraw();

    await testTokenContract.approve(prizeDrawContract.address, (5 * 10 ** 18).toString(), {from: accounts[1]});
    await prizeDrawContract.buyTickets(5, {from: accounts[1]});

    await testTokenContract.approve(prizeDrawContract.address, (1 * 10 ** 18).toString(), {from: accounts[2]});
    await prizeDrawContract.buyTickets(1, {from: accounts[2]});

    await prizeDrawContract.pickWinnerTest();

    result = await prizeDrawContract.getWinningTicket();
    assert(result.toNumber() === 3);

    result = await prizeDrawContract.getWinnerAddress();
    assert(result === accounts[1]);

    result = await prizeDrawContract.currentState();
    assert(result.toNumber() === 0);

    result = await prizeDrawContract.getPrevPrizeDraw();
    assert(result.toNumber() === 2);
  });
});
