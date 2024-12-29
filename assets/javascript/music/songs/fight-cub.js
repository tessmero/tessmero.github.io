/**
 * @file fight song plays when enemy is on screen
 */
SONGS['fight-cub'] = {
  loop: 100,
  info: '',

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
      volume: 0, // .05,
      env: 'attack',
      freq: 'A2', // 0 note
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
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [10, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [10, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [9, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [0, s, s, s, s, 0, s, s, 0, s, s, s, 0, s, s, s],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    [
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
      [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  ],
};
