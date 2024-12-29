/**
 * @file LAYERS_SONG
 */
_ = 'rest';
s = 'sustain';

SONGS['rail-layer'] = {

  voices: [
    {
      // melody
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A4', // 0 note
      env: 'bachBass',
    },
    {
      // bass
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      env: 'bachBass',
    },
    {
      // bass
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      env: 'bachBass',
    },
    {
      // bass
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      env: 'bachBass',
    },
    {
      // bass
      wave: 'square',
      volume: 0.02,
      duration: 0.12, // sixteenth notes
      freq: 'A3', // 0 note
      env: 'bachBass',
    },
  ],

  score: [
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, _, 8, s, s, s, 8, s, s, s, 8, s, s, s, 8, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, 10, s, s, s, 12, s, 10, s, 8, s, s, s, 7, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, 7, s, s, s, 8, s, 7, s, 7, s, s, s, 7, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, _, 7, s, s, s, 7, s, 7, s, 7, s, s, s, 7, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 0, s, 3, s, 8, s, 12, s, 10, s, 8, s, 3, s],
      [_, s, 8, s, s, s, 8, s, s, s, 8, s, s, s, 8, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [5, s, 2, s, 5, s, 10, s, 12, s, 7, s, 5, s, 3, s],
      [_, s, 10, s, s, s, 12, s, 10, s, 8, s, s, s, 7, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [2, s, -1, s, 2, s, 7, s, 11, s, 9, s, 7, s, 2, s],
      [_, s, 7, s, s, s, 8, s, 7, s, 7, s, s, s, 7, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 0, s, -5, s],
      [_, s, 7, s, s, s, 7, s, s, s, 7, s, s, _, _, _],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 12, s, 8, s, 5, s, 2, s, -1, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 2, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 12, s, 8, s, 5, s, 2, s, -1, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 2, s, 0, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, s, 5, s, 8, s, 12, s, 8, s, 5, s, 2, s, -1, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 2, s, -1, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 0, s, 3, s, 8, s, 12, s, 10, s, 8, s, 3, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [5, s, 2, s, 5, s, 10, s, 12, s, 7, s, 5, s, 3, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [2, s, -1, s, 2, s, 7, s, 11, s, 9, s, 7, s, 2, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 0, s, -5, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 0, s, 3, s, 8, s, 12, s, 10, s, 8, s, 3, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [5, s, 2, s, 5, s, 10, s, 12, s, 7, s, 5, s, 3, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [2, s, -1, s, 2, s, 7, s, 11, s, 9, s, 7, s, 2, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-1, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 12, s, 7, s, 3, s, 0, s, -5, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
  ],
};
