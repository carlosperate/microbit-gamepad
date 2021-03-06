(function($, screenFull, microbitBle, sound) {
    'use strict';

    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    var pageLoadTime = Date.now();
    var settings = {
        'vibrate': {
            'type': 'checkbox',
            'value': false,
            'enable': function() {
                if (navigator.vibrate) {
                    window.navigator.vibrate(25);
                } else {
                    alert('This browser or device do not support vibration.');
                    $('#settings-vibrate').prop('checked', false);
                }
            },
            'disable': function() {}
        },
        'sound': {
            'type': 'checkbox',
            'value': false,
            'enable': sound.enable,
            'disable': sound.disable,
        },
        'logs': {
            'type': 'checkbox',
            'value': false,
            'enable': function() {
                $('#below-controller-content').show();
            },
            'disable': function() {
                $('#below-controller-content').hide();
            }
        },
        'tilt':  {
            'type': 'checkbox',
            'value': false,
            'enable': setUpDeviceControllerOrientation,
            'disable': unsetDeviceControllerOrientation,
        },
        'controller-up': {
            'type': 'input-text',
            'value': 'U',
        },
        'controller-right': {
            'type': 'input-text',
            'value': 'R',
        },
        'controller-down': {
            'type': 'input-text',
            'value': 'D',
        },
        'controller-left': {
            'type': 'input-text',
            'value': 'L',
        },
        'controller-center': {
            'type': 'input-text',
            'value': 'C',
        },
        'controller-a': {
            'type': 'input-text',
            'value': 'A',
        },
        'controller-b': {
            'type': 'input-text',
            'value': 'B',
        },
        'controller-start': {
            'type': 'input-text',
            'value': 'S',
        },
        'controller-select': {
            'type': 'input-text',
            'value': 'SL',
        },
    };

    function log(msg, obj) {
        console.log(msg, obj || '');
        var elapsedMs = Date.now() - pageLoadTime;
        if (obj) {
            try {
                msg += JSON.stringify(obj, null, 2);
            } catch (e) {
                // Do nothing
            }
        }
        $('#commands-log').prepend('<p>[' + elapsedMs + 'ms] ' + msg + '</p>');
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

    function connectButtonActive(active) {
        if (active) {
            $("#button-connect").text("Connected");
            $("#button-connect").attr('class', 'nes-btn is-success');
        } else {
            $("#button-connect").text("Connect");
            $("#button-connect").attr('class', 'nes-btn is-primary');
        }
    }

    function connectWebBle() {
        // Setting button to connecting state
        $("#button-connect").text("Connecting...");
        $("#button-connect").attr('class', 'nes-btn is-disable');
        microbitBle.connect().then(function(info) {
            log('Connected: ', info);
            sound.play('connected');
            connectButtonActive(true);
            // Scroll to the controller
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#controller-svg-div").offset().top
            }, 1200);
        }).catch(function(err) {
            log('Connection Error: ' + err.message);
            // Reset button to original state
            connectButtonActive(false);
        });
    }

    function controllerButtonPressed(buttonName) {
        var logMsg = 'Pressed: ' + buttonName;
        sound.play(buttonName);
        if (settings.vibrate.value && navigator.vibrate) {
            window.navigator.vibrate(25);
        }
        if (microbitBle.isConnected()) {
            microbitBle.sendMsg(settings['controller-' + buttonName].value);
        } else {
            logMsg += ' (not connected)';
        }
        log(logMsg);
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
            if (screenFull.enabled) {
                screenFull.toggle($('#controller-svg-div')[0]);
            } else {
                log('ScreenFull not available.');
            }
        });
    }

    function setUpControllerHandlers() {
        $('#controller-button-a').singleTouchClick(function(e) {
            controllerButtonPressed('a');
        });
        $('#controller-button-b').singleTouchClick(function(e) {
            controllerButtonPressed('b');
        });
        $('#controller-button-start').singleTouchClick(function(e) {
            controllerButtonPressed('start');
        });
        $('#controller-button-select').singleTouchClick(function(e) {
            controllerButtonPressed('select');
        });
        $('#controller-button-centre').singleTouchClick(function(e) {
            controllerButtonPressed('center');
        });
        // The d-pad also has some CSS changes on click
        $('#controller-button-up').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateX(15deg) translate(0, 8px)');
            $('#controller-cross').css('transform-origin', 'center');
            controllerButtonPressed('up');
        });
        $('#controller-button-down').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateX(345deg) translate(0px, 13px)');
            $('#controller-cross').css('transform-origin', 'center');
            controllerButtonPressed('down');
        });
        $('#controller-button-left').singleTouchClick(function(e) {
            $('#controller-cross').css('transform', 'rotateY(345deg) translate(-10px)');
            $('#controller-cross').css('transform-origin', 'center');
            controllerButtonPressed('left');
        });
        $('#controller-button-right').singleTouchClick(function(e) {
            // These two lines have a more 3D effect on that's less realistic
            //$('#controller-cross-border').css('transform', 'rotate3d(0, 1, 0, -15deg)');
            //$('#controller-cross').css('transform', 'rotate3d(0, 1, 0, 10deg)');
            $('#controller-cross').css('transform', 'rotateY(15deg) translate(-5px)');
            $('#controller-cross').css('transform-origin', 'center');
            controllerButtonPressed('right');
        });
        $('body').singleTouchClickOff(function(e) {
            $('#controller-cross-border').css('transform', '');
            $('#controller-cross').css('transform', '');
        });
    }

    function setUpSettings() {
        Object.keys(settings).forEach(function(key) {
            if (settings[key].type === 'checkbox') {
                $('#settings-' + key).prop('checked', settings[key].value);
                if (settings[key].value) {
                    settings[key].enable();
                }
                $('#settings-' + key).change(function() {
                    settings[key].value = this.checked;
                    if (settings[key].value) {
                        settings[key].enable();
                    } else {
                        settings[key].disable();
                    }
                    log('Setting ' + key + (this.checked ? ' enabled.' : ' disabled.'));
                });
            } else if (settings[key].type === 'input-text') {
                $('#settings-' + key).val(settings[key].value);
                $('#settings-' + key).change(function() {
                    var input = $(this);
                    settings[key].value = input.val();
                });
            }
        });
    }

    function setUpInstallBanner() {
        $('#install-close').click(function closeInstallBanner() {
            $('#install-banner').hide();
        });

        var deferredPrompt;
        window.addEventListener('beforeinstallprompt', function(event) {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = event;
            // Attach the install prompt to a user gesture
            $('#button-install').click(function(e) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        log('Accepted the Add To Home Screen prompt.');
                    } else {
                        log('Dismissed the Add To Home Screen prompt.');
                    }
                    closeInstallBanner();
                    deferredPrompt = null;
                });
            });
            $('#install-banner').show();
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
            window.addEventListener('deviceorientation', deviceRotationControllerHandler, true);
        } else {
            return alert('This browser or device does not support the motion API.');
        }
    }

    function unsetDeviceControllerOrientation() {
        if (window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientation', deviceRotationControllerHandler, true);
        }
        $('#controller-svg-div').css('transform-origin', '');
        $('#controller-svg-div').css('transform', '');
    }

    setUpSettings();
    setUpButtonHandlers();
    setUpControllerHandlers();
    setUpInstallBanner();
})(jQuery, screenfull, microbitBle, sound);
