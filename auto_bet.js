var baseValue = '0.00000001',           // value of BASE BET
    rollCount = 100000,
    increaseBetPercentWhenLose = 0,     // multiplier when you lose. When set to 0, use dynamic multiplier
    stopBefore = 30,                    // In seconds for timer before stopping redirect on webpage
    stopAfterLoss = '0.00010000',       // stop game after loss, set 0 to disable
    $betOn = $('#autobet_bet_hi');      // set as $('#autobet_bet_hi') or $('#autobet_bet_lo') or $('#autobet_bet_alternate')

function sleep(milliseconds) {
    var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
              break;
            }
    }
}

function deExponentize(number) {
    return number * 100000000;
}

function getDynamicPercentage() {
    var balance = deExponentize($('#balance').text());
    var maxLoseCount = Math.floor(Math.log(balance) / Math.log(2));
    var percent = 2.00;

    console.log('maxLoseCount: '+maxLoseCount);

    do {
        percent += 0.01;
        loseCount = Math.floor(Math.log(balance) / Math.log(percent));
        if (percent > 3) {
            console.log('imposible percent, debug me');
            break;
        }
    } while (loseCount >= maxLoseCount);

    percent -= 0.01;

    return ((percent - 1) * 100).toFixed(0);
}

function watchDog() {
    console.log('Wake up to check');
    if (stopBeforeRedirect()) {
        console.log('Approaching redirect! Stop the game so we don\'t get redirected while loosing.');

        $('#double_your_btc_bet_win').bind("DOMSubtreeModified", function(event) {
            if ($(event.currentTarget).is(':contains("win")')) {
                stopGame();
            }
        });

        return;
    }

    if (rollFinished()) {
        console.log('Auto bet is finished, restart it.');
        reset();
        $('#start_autobet').click();
    }

    setTimeout(watchDog, 10000);
}

function initGame() {

    // try to free roll
    if ($('#free_play_form_button').is(':visible')) {
        $('#free_play_form_button').click();
        sleep(1500);
    }

    // switch to auto bet tab
    if (!$('#auto_bet_on').is(':visible')) {
        $(".double_your_btc_link2").click();

        // switch to auto bet
        if (!$('#auto_bet_start_stop_button').is(':visible')) {
            $('#auto_bet_on').click();
        }
    }
}

function startGame() {
    if ($('#stop_autobet_button').is(':visible')) {
        console.log('Game has started!');
        return;
    }

    setTimeout(watchDog, 10000);

    reset();
    $('#start_autobet').click();
}

function stopGame() {
    $('#stop_autobet_button').click();
}

function reset() {
    $('#autobet_base_bet').val(baseValue);
    $('#autobet_roll_count').val(rollCount);
    if (!$('#autobet_lose_increase_bet').is(':checked')) {
        $('#autobet_lose_increase_bet').click();
    }

    if (parseFloat(stopAfterLoss) != 0) {
        if (!$('#stop_after_loss').is(':checked')) {
            $('#stop_after_loss').click();
        }
        $('#stop_after_loss_value').val(stopAfterLoss);
    }

    if (parseInt(increaseBetPercentWhenLose) == 0) {
        var dynamicPercentage = getDynamicPercentage();
        console.log('dynamicPercentage: ' + dynamicPercentage);

        $('#autobet_lose_increase_bet_percent').val(dynamicPercentage);
    } else {
        $('#autobet_lose_increase_bet_percent').val(increaseBetPercentWhenLose);
    }

    if (!$betOn.is(':checked')) {
        $betOn.click();
    }
}

function rollFinished() {
    return parseInt($('#rolls_remaining_count').html()) <= 0;
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

initGame();
startGame();
