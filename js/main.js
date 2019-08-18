(function() {
'use strict';

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
var microbitUart = null;

function log(msg, obj) {
    console.log(msg, obj || '');
}

$('#connect').click(function() {
    microbit.requestMicrobit(window.navigator.bluetooth).then(function(device) {
        return microbit.getServices(device);
    }).then(function(services) {
        if (services.uartService) {
            microbitUart = services.uartService;
            services.uartService.addEventListener('receiveText', function(msg) {
                log('UART received: ' + msg);
            });
        }
        if (services.deviceInformationService) {
            return services.deviceInformationService.readDeviceInformation();
        } else {
            return new Promise(function(resolve, reject) {
                resolve('No device info.');
            });
        }
    }).then(function(info) {
        log('Ready: ', info);
    }).catch(function(err) {
        log('Connection Error: ', err.msg);
    });
});

function sendCommand(cmd) {
    log('Command: ' + cmd);
    if (microbitUart) {
        microbitUart.send(new TextEncoder().encode(cmd + '\n'));
    } else {
        log('UART not yet available.');
    }
    if (navigator.vibrate) {
        window.navigator.vibrate(25);
    }
}

$('#controller-button-up').click(() => sendCommand('UP'));
$('#controller-button-down').click(() => sendCommand('DOWN'));
$('#controller-button-left').click(() => sendCommand('LEFT'));
$('#controller-button-right').click(() => sendCommand('RIGHT'));
$('#controller-button-centre').click(() => sendCommand('CENTRE'));
$('#controller-button-a').click(() => sendCommand('A'));
$('#controller-button-b').click(() => sendCommand('B'));
$('#controller-button-start').click(() => sendCommand('START'));
$('#controller-button-select').click(() => sendCommand('SELECT'));

window.scrollTo(0,1);
})();
