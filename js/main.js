(function() {
    'use strict';

    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    var microbitUart = null;
    var settings = {
        'vibrate': {
            'value': false,
            'enable': function() {
                if (navigator.vibrate) {
                    window.navigator.vibrate(25);
                } else {
                    alert('This browser or device do not support vibration.');
                }
            },
            'disable': function() {}
        },
        'sound':  {
            'value': false,
            'enable': function() {},
            'disable': function() {}
        },
        'logs':  {
            'value': false,
            'enable': function() {},
            'disable': function() {}
        },
        'tilt':  {
            'value': false,
            'enable': setUpDeviceControllerOrientation,
            'disable': unsetDeviceControllerOrientation,
        },
    };

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
        if (settings.vibrate.value && navigator.vibrate) {
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

    function setUpCrossEffect() {
        var stopEvent = function(event) {
            var e = event || window.event;
            if (e.cancelable) {
                if (e.preventDefault)  e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
            }
            e.cancelBubble = true;
            e.returnValue = false;
            return true;
        };
        $('body').on('touchend touchcancel mouseup',function(e) {
            $('#controller-cross-border').css('transform', '');
            $('#controller-cross').css('transform', '');
        });
        $('#controller-button-right').on('touchstart mousedown', function(e) {
            // These two lines have a more 3D effect on that's less realistic
            //$('#controller-cross-border').css('transform', 'rotate3d(0, 1, 0, -15deg)');
            //$('#controller-cross').css('transform', 'rotate3d(0, 1, 0, 10deg)');
            $('#controller-cross').css('transform', 'rotateY(15deg) translate(-5px)');
            $('#controller-cross').css('transform-origin', 'center');
            return stopEvent(e);
        });
        $('#controller-button-left').on('touchstart mousedown', function(e) {
            $('#controller-cross').css('transform', 'rotateY(345deg) translate(-10px)');
            $('#controller-cross').css('transform-origin', 'center');
            return stopEvent(e);
        });
        $('#controller-button-up').on('touchstart mousedown', function(e) {
            $('#controller-cross').css('transform', 'rotateX(15deg) translate(0, 8px)');
            $('#controller-cross').css('transform-origin', 'center');
            return stopEvent(e);
        });
        $('#controller-button-down').on('touchstart mousedown', function(e) {
            $('#controller-cross').css('transform', 'rotateX(345deg) translate(0px, 13px)');
            $('#controller-cross').css('transform-origin', 'center');
            return stopEvent(e);
        });
    }

    function setUpSettings() {
        Object.keys(settings).forEach(function(key) {
            $('#settings-' + key).prop('checked', settings[key].value);
            $('#settings-' + key).change(function() {
                settings[key].value = this.checked;
                if (settings[key].value) {
                    settings[key].enable();
                } else {
                    settings[key].disable();
                }
                log('Setting ' + key + (this.checked ? ' enabled.' : ' disabled.'));
            });
        });
    }

    function deviceRotationControllerHandler(event) {
        log('d: ' + event.alpha + ', l-r: ' + event.gamma + ', f-b: ' + event.beta);
        var clamp = function (num, min, max) {
            return num <= min ? min : num >= max ? max : num;
        };
        var yaw = clamp(event.alpha, -45, 45);
        var pitch = clamp((event.beta * -1), -45, 45);
        $('#controller-svg-div').css('transform-origin', 'center');
        $('#controller-svg-div').css('transform', 'perspective(5000px) rotateY(' + yaw + 'deg) rotateX(' + pitch + 'deg)');
    }

    function setUpDeviceControllerOrientation() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", deviceRotationControllerHandler, true);
        } else {
            return alert('This browser or device does not support the motion API.');
        }
    }

    function unsetDeviceControllerOrientation() {
        if (window.DeviceOrientationEvent) {
            window.removeEventListener("deviceorientation", deviceRotationControllerHandler, true);
        }
        $('#controller-svg-div').css('transform-origin', '');
        $('#controller-svg-div').css('transform', '');
    }

    setUpSettings();
    setUpButtonHandlers();
    setUpCrossEffect();
})();
