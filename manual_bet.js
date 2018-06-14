// user config variable
var startValue = '0.00000001',  // start value of BET AMOUNT
    startPayout = '2.00',       // start value of PAYOUT
    stopCount = 8,              // stop if loss count greater then this value
    stopPercentage = 0.80,      // stop betting if balance is under this percentage
    stopBeforeSec = 30,         // In seconds for timer before stopping redirect on webpage
    clickButtonId = '#double_your_btc_bet_hi_button'; // #double_your_btc_bet_hi_button or #double_your_btc_bet_lo_button

// system variable (DON'T SET)
var stopped = false,
    stopNow = false,
    loseCount = 0,
    startBalance = 0,
    startTimestamp = 0,
    clickButton = null;

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function getRandomWait(minWait, maxWait) {
    var wait = Math.floor(Math.random() * maxWait) + minWait;
    // console.log('Waiting for ' + wait + 'ms before next bet.');
    return wait;
}

function deExponentize(number) {
    return number * 100000000;
}

function initGame() {

    // try to free roll
    if ($('#free_play_form_button').is(':visible')) {
        $('#free_play_form_button').click();
        sleep(1500);
    }

    // switch to auto bet tab
    if (!$('#double_your_btc_bet_hi_button').is(':visible')) {
        $(".double_your_btc_link2").click();

        // switch to manual bet
        if (!$('#double_your_btc_bet_hi_button').is(':visible')) {
            $('#manual_bet_on').click();
        }
    }

    // hide Jacpots
    $(".width_margin_padding_setting").each(function() {
        $(this).hide();
    });

    bindEvent();

    startBalance = deExponentize(parseFloat($('#balance').text()));
    startTimestamp = new Date().getTime();
}

function getProfitLoss() {
    return (deExponentize(parseFloat($('#balance').text())) - startBalance).toFixed(0);
}

function getElapsed() {
    var now = new Date().getTime();
    var min = ((now - startTimestamp) / 60000).toFixed(0);
    var sec = (((now - startTimestamp) % 60000) / 1000).toFixed(0);

    return min + 'm' + sec + 's';
}

function multiplyBet() {
    var current = $('#double_your_btc_stake').val();
    var payout = '2.00';

    loseCount++;
    // console.log('loseCount: ' + loseCount);

    if (loseCount >= stopCount) {
        return false;
    }

    if (loseCount < 7) {
        multiplier = 2.1;
        payout = '2.00';
    } else if (loseCount < 15) {
        multiplier = 1.55;
        payout = '3.00';
    } else if (loseCount < 22) {
        multiplier = 1.35;
        payout = '4.00';
    } else if (loseCount < 31) {
        multiplier = 1.3;
        payout = '5.00';
    } else {
        multiplier = 1.25;
        payout = '6.00';
    }

    $('#double_your_btc_payout_multiplier').val(payout).keyup();

    if (loseCount == 0) {
        $('#double_your_btc_stake').val('0.00000002');
    } else if (loseCount == 7) {
        $('#double_your_btc_stake').val('0.00000160');
    } else if (loseCount == 15) {
        $('#double_your_btc_stake').val('0.00003500');
    } else if (loseCount == 22) {
        $('#double_your_btc_stake').val('0.00028000');
    } else if (loseCount == 31) {
        $('#double_your_btc_stake').val('0.00160000');
    } else {
        var multiply = (current * multiplier).toFixed(8);
        $('#double_your_btc_stake').val(multiply);
    }

    return true;
}

function startGame() {
    console.log('Game started!');
    reset();
    clickButton.click();
}

function stopImmediately() {
    stopNow = true;
}

function stopAfterWinBet() {
    console.log('Game will stop soon! Let me finish.');
    stopped = true;
}

function stopBeforeRedirect() {
    var temp = $('title').text().match(/(\d+)/g);
    if (temp == null) {
        return;
    }

    var seconds = parseInt(temp[0]) * 60 + parseInt(temp[1]);
    if (seconds < stopBeforeSec) {
        return true;
    }

    return false;
}

function reset() {
    loseCount = 0;
    $('#double_your_btc_stake').val(startValue);
    $('#double_your_btc_payout_multiplier').val(startPayout).keyup();
}

function checkJackpots() {
    if ($('.width_margin_padding_setting span.checked').length) {
        location.reload();
    }
}

function hasEnoughMoney() {
    var balance = deExponentize(parseFloat($('#balance').text()));
    var current = deExponentize($('#double_your_btc_stake').val());

    return balance * stopPercentage > current;
}

function clickFreeRoll() {
    $('#free_play_form_button').click();
}

function bindEvent() {
    $('#double_your_btc_bet_lose').unbind().bind("DOMSubtreeModified", function(event) {
        if (stopNow) {
            return;
        }

        if ($(event.currentTarget).is(':contains("lose")')) {
            console.log('You LOST, PL: ' + getProfitLoss() + ', Elapsed: ' + getElapsed());

            if (!multiplyBet()) {
                var wait = getRandomWait(10000, 60000);
                console.log('reach stopCount, reload after ' + wait + ' msec');
                setTimeout(function() {
                    location.reload();
                }, wait);

                return;
            }

            setTimeout(function() {
                clickButton.click();
            }, getRandomWait(100, 666));
        }
    });

    $('#double_your_btc_bet_win').unbind().bind("DOMSubtreeModified", function(event) {
        if (stopNow) {
            return;
        }

        if ($(event.currentTarget).is(':contains("win")')) {
            if (stopBeforeRedirect()) {
                console.log('Approaching redirect! Stop the game so we don\'t get redirected while loosing.');
                stopAfterWinBet();

                return;
            }

            if (checkJackpots()) {
                console.log('weird, has jackpos! restart');
                return;
            }

            if (hasEnoughMoney()) {
                console.log('You WON, PL: ' + getProfitLoss() + ' elapsed: ' + getElapsed());
                reset();
                if (stopped) {
                    stopped = false;

                    return false;
                }
            } else {
                console.log('no money');
                return;
            }

            setTimeout(function() {
                clickButton.click();
            }, getRandomWait(100, 666));
        }
    });
}

javascript: (function(e, s) {
    e.src = s;
    e.onload = function() {
        jQuery.noConflict();
        console.log('jQuery injected');

        sleep(1000);

        clickButton = $(clickButtonId);

        initGame();
        startGame();
    };
    document.head.appendChild(e);
})(document.createElement('script'), '//code.jquery.com/jquery-3.3.1.min.js')
