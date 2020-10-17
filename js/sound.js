var sound = (function soundObj() {
    'use strict';

    var sounds = {};

    var enable = function() {
        try {
            lowLag.init({
                'urlPrefix': 'sound/',
                'debug': 'none',
            });
        } catch (err) {
            console.error(err);
            console.log('Could not initialise the sounds, try again.');
            lowLag.init({
                'urlPrefix': 'sound/',
                'debug': 'console',
                'force': 'audioTag',
            });
        }
        lowLag.load('button-press-4.mp3');
        lowLag.load('button-press-2.mp3');
        lowLag.load('button-press-1.mp3');
        sounds = {
            'a': {
                'play': function() {
                    lowLag.play('button-press-4.mp3');
                }
            },
            'b': {
                'play': function() {
                    lowLag.play('button-press-4.mp3');
                }
            },
            'start': {
                'play': function() {
                    lowLag.play('button-press-2.mp3');
                }
            },
            'select': {
                'play': function() {
                    lowLag.play('button-press-2.mp3');
                }
            },
            'up': {
                'play': function() {
                    lowLag.play('button-press-1.mp3');
                }
            },
            'down': {
                'play': function() {
                    lowLag.play('button-press-1.mp3');
                }
            },
            'left': {
                'play': function() {
                    lowLag.play('button-press-1.mp3');
                }
            },
            'right': {
                'play': function() {
                    lowLag.play('button-press-1.mp3');
                }
            },
            'center': {
                'play': function() {
                    lowLag.play('button-press-1.mp3');
                }
            },
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
