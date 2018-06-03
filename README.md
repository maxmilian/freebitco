# Freebitco js script

1. Install Chrome Extension
   [Custom Javascript For Web](https://chrome.google.com/webstore/detail/custom-javascript-for-web/poakhlngfciodnhlhhgnaaelnpjljija)

2. Save js for Freebitco
   Open [Freebitco](https://freebitco.in/?r=11646056), copy the following javascript code and paste into Custom Javascript For Web  
   ![Custom Js For Freebitco](https://github.com/maxmilian/freebitco/blob/master/custom_js_for_freebitco.png)

3. Enjoy the game

## Manual Bet JS Code
```js
var startValue = '0.00000001', // start value of BET AMOUNT
    stopPercentage = 0.001,    // stop betting if balance is under this percentage
    maxWait = 777,             // max waiting time for next bet
    stopped = false,           // debugging
    multiplier = 2.1,          // multiplier when you lose
    stopBefore = 30,           // In seconds for timer before stopping redirect on webpage
    $hiloButton = $('#double_your_btc_bet_hi_button');  // set as $('#double_your_btc_bet_hi_button') or $('#double_your_btc_bet_lo_button')

function getRandomWait() {
    var wait = Math.floor(Math.random() * maxWait) + 100;
    console.log('Waiting for ' + wait + 'ms before next bet.');
    return wait;
}

function deExponentize(number) {
    return number * 100000000;
}

function multiplyBet() {
    var current = $('#double_your_btc_stake').val();
    var multiply = (current * multiplier).toFixed(8);
    $('#double_your_btc_stake').val(multiply);
}

function startGame() {
    console.log('Game started!');
    reset();
    $hiloButton.click();
}

function stopGame() {
    console.log('Game will stop soon! Let me finish.');
    stopped = true;
}

function reset() {
    $('#double_your_btc_stake').val(startValue);
}

function hasEnoughMoney() {
    var balance = deExponentize(parseFloat($('#balance').text()));
    var current = deExponentize($('#double_your_btc_stake').val());
    return balance * stopPercentage > current;
}

function clickFreeRoll() {
    $('#free_play_form_button').click()
}

function stopBeforeRedirect() {
    var temp = $('title').text().match(/(\d+)/g);
    if (temp == null) {
        return;
    }

    var seconds = parseInt(temp[0]) * 60 + parseInt(temp[1]);
    if (seconds < stopBefore) {
        return true;
    }

    return false;
}

$('#double_your_btc_bet_lose').unbind();
$('#double_your_btc_bet_win').unbind();
$('#double_your_btc_bet_lose').bind("DOMSubtreeModified", function(event) {
    if ($(event.currentTarget).is(':contains("lose")')) {
        console.log('You LOST! Multiplying your bet and betting again.');
        multiplyBet();
        setTimeout(function() {
            $hiloButton.click();
        }, getRandomWait());
    }
});
$('#double_your_btc_bet_win').bind("DOMSubtreeModified", function(event) {
    if ($(event.currentTarget).is(':contains("win")')) {
        if (stopBeforeRedirect()) {
            console.log('Approaching redirect! Stop the game so we don\'t get redirected while loosing.');
            stopGame();

            return;
        }
        if (hasEnoughMoney()) {
            console.log('You WON! But don\'t be greedy. Restart to startValue!');
            reset();
            if (stopped) {
                stopped = false;

                return false;
            }
        } else {
            return;
        }
        setTimeout(function() {
            $hiloButton.click();
        }, getRandomWait());
    }
});

startGame();
```

## Remark
1. Don't use this javascript with AUTO BET in the same time.
