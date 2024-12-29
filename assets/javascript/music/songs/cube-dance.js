/**
 * @file cube-dance
 */
_ = 'rest';
s = 'sustain';

_DUR = 0.12;

SONGS['cube-dance'] = {
  color: '#aaffaa',

  // like sound effects
  voices: [
    {
      // melody
      wave: 'square',
      volume: 0.015,
      duration: 0.12, // sixteenth notes
      freq: 'A2', // 0 note
      // env: 'bachBass',
    },
    {
      // melody
      wave: 'square',
      volume: 0.015,
      duration: 0.12, // sixteenth notes
      freq: 'A2', // 0 note
      // env: 'bachBass',
    },
    {
      // melody
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A2', // 0 note
      // env: 'bachBass',
    },
    {
      // kick drum
      duration: 0.12, // sixteenth notes
      wave: 'square',
      volume: 0.1,
      env: 'attack',
      startFreq: 150, // 0 note
      endFreq: 10,
    },
    {
      // high hat
      duration: 0.12, // sixteenth notes
      wave: 'sh',
      volume: 0.05,
      env: 'attack',
      freq: 'A4', // 0 note
    },
  ],

  score: [
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'u' } },
    ],
    [
      [12, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [14, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [11, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'u' } },
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [6, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [7, s, s, s, s, s, _, s, s, s, 7, s, s, s, s, s],
      [3, s, s, s, s, s, _, s, s, s, 3, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'r' } },
    ],
    [
      [12, s, s, s, s, s, _, s, s, s, 19, s, s, s, s, s],
      [9, s, s, s, s, s, _, s, s, s, 15, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'lu' } },
    ],
    [
      [14, s, s, s, s, s, _, s, s, s, 19, s, s, s, s, s],
      [11, s, s, s, s, s, _, s, s, s, 15, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'ru' } },
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, 7, s, 9, s, 12, s],
      [6, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, 0, s, 2, s, 4, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'ru' } },
    ],
    [
      [10, s, s, s, s, s, s, s, 14, s, 10, s, 12, s, 14, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 5, s, 5, s, 3, s, 5, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'llll' } },
    ],
    [
      [12, s, s, s, s, s, _, s, s, s, 12, s, s, s, s, s],
      [9, s, s, s, s, s, _, s, s, s, 9, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [14, s, s, s, s, s, s, s, s, s, 13, s, 14, s, 13, s],
      [11, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, 6, s, 7, s, 6, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'rru' } },
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [6, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, 1, 1, 1, _, 1, 1, 1, s, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [7, s, s, s, s, s, s, s, 14, s, 10, s, 12, s, 14, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 5, s, 5, s, 3, s, 5, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'llu' } },
    ],
    [
      [12, s, s, s, s, s, s, s, 14, s, 14, s, 12, s, 10, s],
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'rrrr' } },
    ],
    [
      [14, s, 12, 11, 7, s, 14, s, 14, s, 12, 11, 7, s, 14, s],
      [11, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { seq: 'lllu' } },
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, 11, 12, 14, s, 9, s],
      [6, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [10, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
      { 'dance': { 'rec': true } },
    ],
    [
      [12, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, 1, _, s, s, 1, _, 1, _, 1, _, 1, _],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
    ],
    [
      [14, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [11, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, 1, 1, _, 1, 1, 1, 1, _, 1, 1, _, 1, 1, 1],
      [0, _, s, s, 0, _, s, s, 0, _, s, s, 0, _, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [1, _, s, s, s, _, s, s, s, _, _, _, _, _, _, _],
      [0, _, s, s, s, _, s, s, s, _, s, s, 0, _, s, s],
    ],

    /*
    [
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    */
  ],
};
