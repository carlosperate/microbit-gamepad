(function($, screenfull, sound) {
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
            'enable': sound.enable,
            'disable': sound.disable,
        },
        'logs':  {
            'value': false,
            'enable': function() {
                $('#below-controller-content').show();
            },
            'disable': function() {
                $('#below-controller-content').hide();
            }
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
        $('#button-settings').click(function() {
            showSettingsModal(true);
        });
        $('#settings-close').click(function() {
            showSettingsModal(false);
        });
        $('#full-screen-icon').click(function() {
            if (screenfull.enabled) {
                screenfull.toggle($('#controller-svg-div')[0]);
            } else {
                log('ScreenFull not available.');
            }
        });
    }

    function setUpControllerHandlers() {
        $('#controller-button-a').singleTouchClick(function(e) {
            sendCommand('A');
            sound.play('a');
        });
        $('#controller-button-b').singleTouchClick(function(e) {
            sendCommand('B');
            sound.play('b');
        });
        $('#controller-button-start').singleTouchClick(function(e) {
            sendCommand('S');
            sound.play('start');
        });
        $('#controller-button-select').singleTouchClick(function(e) {
            sendCommand('SL');
            sound.play('select');
        });
        $('#controller-button-centre').singleTouchClick(function(e) {
            sendCommand('C');
            sound.play('center');
        });
        // The d-pad also has some CSS changes on click
        $('#controller-button-up').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateX(15deg) translate(0, 8px)');
            $('#controller-cross').css('transform-origin', 'center');
            sendCommand('U');
            sound.play('up');
        });
        $('#controller-button-down').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateX(345deg) translate(0px, 13px)');
            $('#controller-cross').css('transform-origin', 'center');
            sendCommand('D');
            sound.play('down');
        });
        $('#controller-button-left').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateY(345deg) translate(-10px)');
            $('#controller-cross').css('transform-origin', 'center');
            sendCommand('L');
            sound.play('left');
        });
        $('#controller-button-right').singleTouchClick(function(e) {
            // These two lines have a more 3D effect on that's less realistic
            //$('#controller-cross-border').css('transform', 'rotate3d(0, 1, 0, -15deg)');
            //$('#controller-cross').css('transform', 'rotate3d(0, 1, 0, 10deg)');
            $('#controller-cross').css('transform', 'rotateY(15deg) translate(-5px)');
            $('#controller-cross').css('transform-origin', 'center');
            sendCommand('R');
            sound.play('right');
        });
        $('body').singleTouchClickOff(function(e) {
            $('#controller-cross-border').css('transform', '');
            $('#controller-cross').css('transform', '');
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
    setUpControllerHandlers();
})(jQuery, screenfull, sound);
