var microbitBle = (function microbitBleObj(microbit) {
    'use strict';

    var microbitDevice = null;
    var microbitUartService = null;
    var msgEnding = '\n';

    function connectWebBle() {
        if (!window.navigator.bluetooth) {
            var errorMsg = 'Web Bluetooth is not available in this browser.';
            return Promise.reject(new Error(errorMsg));
        }

        // Connect using Web Bluetooth
        return microbit.requestMicrobit(window.navigator.bluetooth).then(function(device) {
            microbitDevice = device;
            return microbit.getServices(device);
        }).then(function(services) {
            if (services.uartService) {
                microbitUartService = services.uartService;
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
        });
    }

    function sendMsg(msg) {
        if (microbitUartService) {
            microbitUartService.send(new TextEncoder().encode(msg + msgEnding));
        }
    }

    function isConnected() {
        if (!microbitDevice || !microbitDevice.gatt) {
            return false;
        }
        return microbitDevice.gatt.connected;
    }

    return {
        'connect': connectWebBle,
        'sendMsg': sendMsg,
        'isConnected': isConnected,
    };
})(microbit);
