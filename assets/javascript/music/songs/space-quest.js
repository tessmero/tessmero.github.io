/**
 * @file BACH_PRELUDE_SONGE
 */
_ = 'rest';
s = 'sustain';

SONGS['space-quest'] = {

  info: '',

  // like sound effects
  voices: [
    {
      // melody
      wave: 'square',
      volume: 0.05,
      duration: 0.12, // sixteenth notes
      env: 'bachBass',
      freq: 'A3', // 0 note
    },
    {
      // bass
      wave: 'square',
      volume: 0.05,
      duration: 0.12,
      env: 'bachBass',
      freq: 'A2', // 0 note
    },
  ],

  score: [
    [
      [_, _, 7, s, 10, s, 15, s, 19, s, 10, s, 15, s, 19, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 12, s, 17, s, 20, s, 12, s, 17, s, 20, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 10, s, 17, s, 20, s, 10, s, 17, s, 20, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 7, s, 10, s, 15, s, 19, s, 10, s, 15, s, 19, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 7, s, 12, s, 19, s, 24, s, 12, s, 19, s, 24, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 9, s, 12, s, 17, s, 9, s, 12, s, 17, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 10, s, 17, s, 22, s, 10, s, 17, s, 22, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 14, s, 12, s, 10, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 3, s, 7, s, 8, s, 10, s, 3, s, 7, s, 10, s],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 3, s, 7, s, 10, s, 12, s, 11, s, 10, s, 15, s],
      [5, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 3, s, 7, s, 10, s, 15, s, 14, s, 12, s, 10, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 3, s, 7, s, 8, s, 10, s, 3, s, 7, s, 10, s],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 8, s, 12, s, 14, s, 15, s, 14, s, 12, s, 10, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [12, s, 8, s, 12, s, 14, s, 15, s, 14, s, 12, s, 8, s],
      [_, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 10, s, 7, s, 3, s, 7, s, 10, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [7, s, 3, s, 7, s, 10, s, 7, s, 3, s, 8, s, 10, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [11, s, 7, s, 8, s, 10, s, 11, s, 10, s, 12, s, 14, s],
      [4, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [15, s, 10, s, 12, s, 14, s, 15, s, 10, s, 8, s, 7, s],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 7, s, 8, s, 10, s, _, s, 7, s, 8, s, 10, s],
      [3, s, s, s, s, s, 3, s, s, s, s, s, 3, s, s, s],
    ],
    [
      [8, s, 10, s, 11, s, 13, s, 11, s, 8, s, 4, s, _, s],
      [4, s, s, s, s, s, 4, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, _, _],
      [_, _, _, _],
    ],
    [
      [3, _, 7, s, 8, s, 10, s, _, s, 7, s, 8, s, 10, s],
      [3, s, s, s, s, s, 3, s, s, s, s, s, 3, s, s, s],
    ],
    [
      [8, s, 10, s, 11, s, 13, s, 11, s, 8, s, 4, s, _, s],
      [4, s, s, s, s, s, 4, s, s, s, s, s, s, s, s, s],
    ],
    [
      [16, s, _, s, _, s, _, s],
      [4, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 7, s, 10, s, 15, s, 22, s, 20, s, 19, s, 10, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [3, s, 7, s, 10, s, 15, s, 19, s, 17, s, 15, s, 3, s],
      [7, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 19, s, 17, s, 15, s, 11, s],
      [8, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 7, s, 10, s, 15, s, 19, s, 17, s, 15, s, 10, s],
      [11, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [10, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],

    /*
    [
      [_, _, 7, s, 10, s, 15, s, 19, s, 10, s, 15, s, 19, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 12, s, 17, s, 20, s, 12, s, 17, s, 20, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 10, s, 17, s, 20, s, 10, s, 17, s, 20, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 7, s, 10, s, 15, s, 19, s, 10, s, 15, s, 19, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 7, s, 12, s, 19, s, 24, s, 12, s, 19, s, 24, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 9, s, 12, s, 17, s, 9, s, 12, s, 17, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 5, s, 10, s, 17, s, 22, s, 10, s, 17, s, 22, s],
      [2, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],
    [
      [_, _, 3, s, 7, s, 10, s, 15, s, 7, s, 10, s, 15, s],
      [3, s, s, s, s, s, s, s, s, s, s, s, s, s, s, s],
    ],

    //9 /*
    [
      [_,_,3,s,7,s,10,s,15,s,7,s,10,s,15,s,],
      [0,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,0,s,5,s,9,s,15,s,5,s,9,s,15,s,],
      [7,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,2,s,5,s,10,s,14,s,5,s,10,s,14,s,],
      [5,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,3,s,7,s,10,s,16,s,7,s,10,s,16,s,],
      [5,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,0,s,5,s,12,s,17,s,5,s,12,s,17,s,],
      [3,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,-1,s,5,s,8,s,14,s,5,s,8,s,14,s,],
      [3,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,-2,s,3,s,10,s,15,s,3,s,10,s,15,s,],
      [2,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,8,s,12,s,15,s,20,s,12,s,15,s,20,s,],
      [7,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,3,s,12,s,15,s,20,s,12,s,15,s,20,s,],
      [5,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,5,s,10,s,14,s,20,s,10,s,14,s,20,s,],
      [5,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,_,s,_,s,_,s,_,s,_,s,_,s,_,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    [
      [_,_,_,s,_,s,_,s,_,s,_,s,_,s,_,s,],
      [_,s,s,s,s,s,s,s,s,s,s,s,s,s,s,s,],
    ],
    */
  ],
};
