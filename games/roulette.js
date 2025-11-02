const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colorOf = (n) => n === 0 ? 'green' : (REDS.has(n) ? 'red' : 'black');

function spin() {
  const n = Math.floor(Math.random() * 37); // 0..36
  return { number: n, color: colorOf(n) };
}

// payouts: straight 35:1, color 1:1, parity 1:1, dozen 2:1
function settle(bet) {
  const { number, color } = spin();
  let won = false, payout = 0;
  const amt = bet.amount;

  switch (bet.betType) {
    case 'straight':
      won = Number(bet.selection) === number;
      payout = won ? amt * 35 : 0;
      break;
    case 'color':
      won = (bet.selection === color) && color !== 'green';
      payout = won ? amt * 1 : 0;
      break;
    case 'parity':
      if (number === 0) won = false;
      else won = (bet.selection === 'even' && number % 2 === 0) || (bet.selection === 'odd' && number % 2 === 1);
      payout = won ? amt * 1 : 0;
      break;
    case 'dozen': {
      let d = 0;
      if (number >= 1 && number <= 12) d = 1;
      else if (number >= 13 && number <= 24) d = 2;
      else if (number >= 25 && number <= 36) d = 3;
      won = Number(bet.selection) === d;
      payout = won ? amt * 2 : 0;
      break;
    }
    default:
      throw new Error('Bet no soportada');
  }
  const net = payout - amt;
  return { number, color, payout, net, won };
}

module.exports = { spin, settle, colorOf };
