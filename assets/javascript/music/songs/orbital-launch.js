/**
 * @file ORBITAL_SONG
 */
_ = 'rest';
s = 'sustain';

SONGS['orbital-launch'] = {

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
  ],

  score: [
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      { start: 0 }, // start of envelope and start of measure, volume off
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      { end: 1 }, // end of envelope and end of measure, full volume
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 10, s, 7, s, 5, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 10, s, 7, s, 5, s, 3, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 7, s, 5, s, 3, s, 0, s, 3, s, 7, s, 10, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, s, 8, s, 7, s, 5, s, -2, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, 3, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, 3, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, -2, 5, 7, 10, s, s, 5, s, s, 10, s],
      [s, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, -2, 5, 7, 10, s, 7, s, 5, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7, 10, 3, 5, 7],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      { start: 1 }, // start of envelope and start of measure, full volume
    ],
    [
      [10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8, 10, 0, 3, 8],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [8, 0, 3, 5, 8, 0, 3, 5, 10, 0, 3, 7, 10, 0, 3, 7],
      [5, s, s, s, s, s, s, s, 7, s, s, s, s, s, s, s],
      [3, s, s, s, s, s, s, s, 3, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, 0, s, s, s, s, s, s, s],
    ],
    [
      [10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5, 10, 0, 2, 5],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [-2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      { end: 0 }, // end of envelope and end of measure, volume off
    ],
  ],
};
