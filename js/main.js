(function() {
    'use strict';

    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    var microbitUart = null;

    function log(msg, obj) {
        console.log(msg, obj || '');
    }

    function connectWebBle() {
        if (!window.navigator.bluetooth) {
            return alert('Web Bluetooth is not available in this browser.');
        }

        // Setting button to connecting state
        $("#button-connect").text("Connecting...");
        $("#button-connect").attr('class', 'nes-btn is-disable');

        // Connect using Web Bluetooth
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
            // Change button to successful state
            $("#button-connect").text("Connected");
            $("#button-connect").attr('class', 'nes-btn is-success');
            // Scroll to the controller
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#controller-svg-div").offset().top
            }, 1200);
        }).catch(function(err) {
            log('Connection Error: ', err.msg);
            // Reset button to original state
            $("#button-connect").text("Connect");
            $("#button-connect").attr('class', 'nes-btn is-primary');
        });
    }

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

    function showSettingsModal(show) {
        if (show) {
            $('#settings-modal').fadeIn(500);
            $('body').css('overflow', 'hidden');
        } else {
            $('#settings-modal').fadeOut(500);
            $('body').css('overflow', 'initial');
        }
    }

    function setUpButtonHandlers() {
        $('#button-connect').click(connectWebBle);
        $('#controller-button-up').click(function() {
            sendCommand('U');
        });
        $('#controller-button-down').click(function() {
            sendCommand('D');
        });
        $('#controller-button-left').click(function() {
            sendCommand('L');
        });
        $('#controller-button-right').click(function() {
            sendCommand('R');
        });
        $('#controller-button-centre').click(function() {
            sendCommand('C');
        });
        $('#controller-button-a').click(function() {
            sendCommand('A');
        });
        $('#controller-button-b').click(function() {
            sendCommand('B');
        });
        $('#controller-button-start').click(function() {
            sendCommand('S');
        });
        $('#controller-button-select').click(function() {
            sendCommand('SL');
        });
        $('#full-screen-icon').click(function() {
            if (screenfull.enabled) {
                screenfull.toggle($('#controller-svg-div')[0]);
            } else {
                log('ScreenFull not available.');
            }
        });
        $('#button-settings').click(function() {
            showSettingsModal(true);
        });
        $('#settings-close').click(function() {
            showSettingsModal(false);
        });
    }

    setUpButtonHandlers();
})();
