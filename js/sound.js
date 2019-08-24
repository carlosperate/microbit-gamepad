var sound = (function soundObj() {
    'use strict';

    var sounds = {};

    var enable = function() {
        var buttonPress = new Audio('sound/button-press-4.mp3');
        var startSelectPress = new Audio('sound/button-press-2.mp3');
        var dPadPress = new Audio('sound/button-press-1.mp3');
        sounds = {
            'a': buttonPress,
            'b': buttonPress,
            'start': startSelectPress,
            'select': startSelectPress,
            'up': dPadPress,
            'down': dPadPress,
            'left': dPadPress,
            'right': dPadPress,
            'center': dPadPress,
            'connected': new Audio('sound/connect.mp3'),
            'disconnected': new Audio('sound/disconnect.mp3'),
        };
        sounds.connected.play();
    };

    var disable = function() {
        sounds.disconnected.play();
        sounds = {};
    };

    var play = function(action) {
        if (sounds.hasOwnProperty(action)) {
            sounds[action].play();
        }
    };

    return {
        'sounds': sounds,
        'enable': enable,
        'disable': disable,
        'play': play,
    };
})();
