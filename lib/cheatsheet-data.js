// Server-only cheat-sheet Pro content. Lives outside /api (not a serverless
// function, doesn't count against the 12-function limit) and is NEVER shipped to
// the browser bundle — it is imported only by api/check-pro.js and returned to
// verified Pro users. The free teaser (hpf + first 2 PEQ bands) stays in the
// frontend bundle; everything here (extra PEQ bands, compression, GEQ tips,
// effects chain, stream tips) is paid content.

export const CHEATSHEET_PRO = {
  "lead_vocal": {
    "peqExtra": [
      {
        "band": "Presence",
        "freq": "2.5-4 kHz",
        "action": "Boost 1-3 dB",
        "q": "Medium (1.0)",
        "reason": "The intelligibility zone. Helps vocals cut through the mix and sound clear on stream."
      },
      {
        "band": "Air",
        "freq": "10-16 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide shelf",
        "reason": "Add shimmer and openness. Makes the vocal sound polished and modern."
      }
    ],
    "comp": {
      "ratio": "2:1 to 4:1",
      "threshold": "Set so gain reduction is 3-8 dB on loud phrases",
      "attack": "10-30 ms - slower preserves the breath attack",
      "release": "80-150 ms - musical and natural",
      "gain": "Add 2-4 dB makeup gain",
      "notes": "Lead vocal compressor is the most important on the whole board. Tame peaks, add sustain, keep consistent level for stream."
    },
    "geq_stream": "If using a stream GEQ: boost 3-4 kHz slightly for more presence. Cut 200-300 Hz if the stream sounds muddy. Gentle high shelf boost above 8 kHz adds clarity.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Hall or Plate",
        "settings": "Pre-delay 15-25 ms, Decay 1.2-2.0 sec, Mix 15-25%",
        "purpose": "Adds space and depth. Pre-delay keeps the dry vocal forward in the mix."
      },
      {
        "name": "Delay",
        "type": "Short slapback or quarter-note",
        "settings": "80-150 ms slapback or 1/4 note synced to tempo, Mix 8-15%",
        "purpose": "Adds width and thickens the vocal without sounding artificial."
      },
      {
        "name": "De-esser",
        "type": "Dynamic EQ or dedicated de-esser",
        "settings": "Target 5-8 kHz range, threshold where sibilance triggers",
        "purpose": "Controls harsh S and T sounds that sound piercing on stream."
      }
    ],
    "stream_tips": [
      "Use a dedicated aux or mix bus for your stream vocal - keep it slightly higher than FOH",
      "A limiter after your vocal compressor (threshold -3 dBFS) prevents unexpected loud moments from clipping the stream",
      "Mono compatibility: lead vocal should sound full even in mono - test with one earbud"
    ]
  },
  "bgv": {
    "peqExtra": [
      {
        "band": "Air",
        "freq": "12-16 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide shelf",
        "reason": "Air helps BG vocals blend without adding mud. Keeps them bright but not harsh."
      }
    ],
    "comp": {
      "ratio": "4:1 to 6:1",
      "threshold": "More aggressive than lead - set for 5-10 dB of gain reduction",
      "attack": "8-15 ms",
      "release": "60-100 ms",
      "gain": "Makeup as needed",
      "notes": "BG vocals need tighter compression than lead vocals. Keep them consistent and controlled."
    },
    "geq_stream": "In the stream mix: reduce BG vocal send by 3-6 dB compared to lead vocal. They should be barely audible on their own but add fullness to the overall sound.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Same space as lead vocal",
        "settings": "Slightly shorter decay than lead (0.8-1.5 sec), Mix 20-30%",
        "purpose": "Match the acoustic space of the lead to glue the vocals together."
      },
      {
        "name": "Chorus or Doubler",
        "type": "Subtle stereo widener",
        "settings": "Very subtle width or short doubling, Mix 10-20%",
        "purpose": "BG vocals can be spread wider in stereo to surround the lead vocal."
      }
    ],
    "stream_tips": [
      "Pan BG vocals: spread L and R slightly (L-25, R+25 or similar) for width",
      "BG vocals on stream should be lower than you think - they add fill, not focus",
      "Group all BG vocals to a sub-group so you can control the overall level easily"
    ]
  },
  "ac_drums": {
    "peqExtra": [
      {
        "band": "Snare - Body",
        "freq": "150-250 Hz",
        "action": "Boost 1-3 dB on snare channel",
        "q": "Medium (1.2)",
        "reason": "Snare body and fatness. Small boost adds weight without muddiness."
      },
      {
        "band": "Snare - Crack",
        "freq": "2-5 kHz",
        "action": "Boost 2-4 dB on snare channel",
        "q": "Medium (1.0)",
        "reason": "The crack and snap of the snare. The most important frequency for snare on livestream."
      },
      {
        "band": "Overhead - Mud",
        "freq": "200-400 Hz",
        "action": "Cut 3-5 dB on overheads",
        "q": "Wide (0.7)",
        "reason": "Overheads capture lots of low-mid bleed. A wide cut cleans them up significantly."
      }
    ],
    "comp": {
      "ratio": "4:1 to 6:1 on kick and snare, 2:1 on overheads",
      "threshold": "Kick: set for 4-8 dB GR. Snare: 3-6 dB GR",
      "attack": "Kick: 3-8 ms (fast to control transient). Snare: 5-15 ms (keep the crack)",
      "release": "Set to musical feel - too fast sounds pumpy, too slow adds buildup",
      "gain": "Makeup as needed",
      "notes": "Gate the kick and snare channels before the compressor to eliminate bleed from other drums. Set gate threshold around -30 to -40 dBFS."
    },
    "geq_stream": "On the stream output: cut 200-350 Hz to reduce drum bleed muddiness. The kick-snare interaction at 400 Hz often causes a boxy sound on stream.",
    "effects": [
      {
        "name": "Gate",
        "type": "Expander/Gate on kick and snare",
        "settings": "Threshold: -30 to -40 dBFS, Attack: 1 ms, Release: 50-200 ms, Range: 40-60 dB",
        "purpose": "Eliminates bleed between drums. Essential for a clean drum sound on stream."
      },
      {
        "name": "Reverb on Snare",
        "type": "Short plate or room",
        "settings": "Pre-delay 5-15 ms, Decay 0.4-0.8 sec, Mix 15-25%",
        "purpose": "Snare reverb adds crack and power. Keep it short and punchy."
      },
      {
        "name": "Parallel Compression",
        "type": "New York or crush compression",
        "settings": "Heavy compression (10:1+) blended with dry signal at 15-30%",
        "purpose": "Adds density and power to the drum bus without losing dynamics."
      }
    ],
    "stream_tips": [
      "Reduce overhead fader on the stream send by 3-6 dB - cymbals are harsh on stream",
      "The kick and snare should be louder in the stream mix than in FOH",
      "If you only have 2 drum mics, gate them aggressively and compress harder"
    ]
  },
  "ac_guitar": {
    "peqExtra": [
      {
        "band": "Pick Attack",
        "freq": "2-4 kHz",
        "action": "Boost 1-2 dB",
        "q": "Medium (1.0)",
        "reason": "Pick attack and string definition. Helps the guitar cut through the mix and sound articulate."
      },
      {
        "band": "String Brightness",
        "freq": "6-10 kHz",
        "action": "Boost 2-3 dB",
        "q": "Wide shelf",
        "reason": "Shimmer and brightness. The characteristic acoustic guitar sparkle that translates well on stream."
      }
    ],
    "comp": {
      "ratio": "2:1 to 4:1",
      "threshold": "Set for 3-6 dB of gain reduction on strums",
      "attack": "15-30 ms - slower preserves the pick transient",
      "release": "100-200 ms - natural and musical",
      "gain": "Makeup 2-3 dB",
      "notes": "Acoustic guitar compressor should be subtle. The goal is consistency, not squashing. A slower attack preserves the natural pick dynamics."
    },
    "geq_stream": "Stream mix GEQ: cut 250-350 Hz to prevent the acoustic guitar from muddying the vocal range. A gentle boost at 8-10 kHz adds brightness without harshness.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Small room or hall",
        "settings": "Pre-delay 10-20 ms, Decay 0.8-1.5 sec, Mix 10-20%",
        "purpose": "Adds natural space. Keep it subtle - acoustic guitar already has its own natural reverb."
      },
      {
        "name": "Compression",
        "type": "Optical or FET style",
        "settings": "Already covered above - optical gives a musical, transparent sound",
        "purpose": "Tames pick attack peaks and adds sustain to chord strums."
      },
      {
        "name": "Chorus (optional)",
        "type": "Very subtle stereo width",
        "settings": "Rate slow (0.3-0.8 Hz), Depth minimal, Mix 10-15%",
        "purpose": "Adds a gentle shimmer and width to acoustic guitar. Very light touch - should be imperceptible on its own."
      }
    ],
    "stream_tips": [
      "Pan acoustic guitar 15-30 degrees off center if electric guitar is also in the mix",
      "DI acoustic guitar almost always sounds better than microphone for stream",
      "If the guitar sounds harsh, first cut 3-5 kHz before boosting elsewhere"
    ]
  },
  "bass": {
    "peqExtra": [
      {
        "band": "Note Definition",
        "freq": "700-1000 Hz",
        "action": "Boost 1-2 dB if thin",
        "q": "Medium (0.8)",
        "reason": "Note definition and finger noise. Helps each note speak clearly at lower listening levels."
      },
      {
        "band": "Pick or Slap Attack",
        "freq": "2-4 kHz",
        "action": "Boost 1-3 dB for pick bass",
        "q": "Medium (1.0)",
        "reason": "Attack and click for pick or slap bass. Helps bass translate on stream on small speakers where low end is lost."
      }
    ],
    "comp": {
      "ratio": "4:1 to 6:1",
      "threshold": "Set for 4-8 dB of gain reduction during normal playing",
      "attack": "15-30 ms - preserves the pick attack character",
      "release": "150-250 ms - long enough to not pump",
      "gain": "Makeup 3-4 dB",
      "notes": "Bass needs firm compression for stream. Without it, bass level varies wildly from note to note. A limiter (8:1+) as a second stage catches peaks."
    },
    "geq_stream": "Stream output GEQ: the bass and kick occupy similar frequency space (60-120 Hz). Boost the frequency where kick lives, cut slightly where bass dominates. This creates separation.",
    "effects": [
      {
        "name": "Compressor",
        "type": "VCA or optical",
        "settings": "As above - focus on consistency over character",
        "purpose": "Level consistency is the most critical effect for bass on stream."
      },
      {
        "name": "Limiter",
        "type": "Brick wall after compressor",
        "settings": "Threshold -3 to -6 dBFS, Release fast",
        "purpose": "Catches hard transients that slip through the compressor. Protects the stream signal from clipping."
      },
      {
        "name": "Sub Harmonics (optional)",
        "type": "Sub harmonic synthesizer",
        "settings": "Generate one octave below, blend gently",
        "purpose": "If the bass sounds thin on stream, a gentle sub harmonic adds low-end weight without boosting real low frequencies."
      }
    ],
    "stream_tips": [
      "Always DI the bass directly - never use a microphone on a bass cabinet for stream",
      "Sidechain the bass compressor to the kick: when the kick hits, bass ducks slightly. Creates punch and separation",
      "On stream, bass should be felt more than heard. If you can hear it easily, it may be too loud"
    ]
  },
  "el_lead": {
    "peqExtra": [
      {
        "band": "Presence Bite",
        "freq": "2-4 kHz",
        "action": "Boost 1-3 dB",
        "q": "Medium (1.0)",
        "reason": "Lead guitar cuts through here. The bite and aggression that defines the lead guitar character."
      },
      {
        "band": "High End Sparkle",
        "freq": "8-12 kHz",
        "action": "Boost 1-2 dB or Cut 1-2 dB",
        "q": "Wide shelf",
        "reason": "Boost for more pick attack and brightness. Cut if the guitar sounds harsh or shrill."
      }
    ],
    "comp": {
      "ratio": "2:1 to 4:1",
      "threshold": "Light to medium - 3-6 dB of gain reduction",
      "attack": "10-20 ms",
      "release": "100-200 ms",
      "gain": "Makeup as needed",
      "notes": "Lead guitar usually needs less compression than rhythm. The goal is sustain, not level control. A slightly slower attack lets the pick attack breathe."
    },
    "geq_stream": "Lead guitar on stream should be louder in the 2-4 kHz range than the rhythm guitar. This creates separation. If both guitars sound similar, one will disappear on stream.",
    "effects": [
      {
        "name": "Delay",
        "type": "Quarter note or dotted eighth note synced to tempo",
        "settings": "1-2 repeats, Mix 15-25%, High cut on repeats at 4-6 kHz",
        "purpose": "Adds dimension and fills space during lead lines. The classic lead guitar effect for live performance."
      },
      {
        "name": "Reverb",
        "type": "Spring or plate for vintage, hall for modern",
        "settings": "Pre-delay 10-20 ms, Decay 0.8-1.5 sec, Mix 15-25%",
        "purpose": "Glues the lead guitar into the room. Spring reverb is authentic for most genres."
      },
      {
        "name": "Light Compression",
        "type": "Optical (LA-2A style)",
        "settings": "Gentle ratio, slow attack, very natural sound",
        "purpose": "Adds sustain to lead lines without sounding processed. The warmth of optical compression suits lead guitar."
      }
    ],
    "stream_tips": [
      "Lead guitar should be louder in the stream mix than rhythm guitar - it is the focal point",
      "If using distortion, high-pass at 100-120 Hz to prevent low-end mud on stream",
      "Pan lead guitar slightly off-center (10-20 degrees) to leave the center for vocals"
    ]
  },
  "el_rhythm": {
    "peqExtra": [
      {
        "band": "Presence Roll-off",
        "freq": "3-5 kHz",
        "action": "Cut 1-2 dB",
        "q": "Medium (0.8)",
        "reason": "Rhythm guitar should not compete with lead guitar. Roll off presence slightly to keep it supportive."
      },
      {
        "band": "Air",
        "freq": "8-12 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide shelf",
        "reason": "High end sparkle keeps rhythm guitar sounding fresh and detailed without adding harshness."
      }
    ],
    "comp": {
      "ratio": "4:1 to 6:1",
      "threshold": "Set for 4-8 dB gain reduction on loud strums",
      "attack": "5-15 ms - tighter than lead guitar",
      "release": "80-150 ms",
      "gain": "Makeup 2-3 dB",
      "notes": "Rhythm guitar benefits from more compression than lead. The goal is consistency across chord strums and palm mutes. A squashed, controlled rhythm guitar sits in the mix perfectly."
    },
    "geq_stream": "Rhythm guitar on stream should be lower in level and less prominent than lead guitar. Pan it to create width - if lead is slightly right, put rhythm slightly left.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Room or small hall",
        "settings": "Shorter than lead (0.6-1.0 sec), Mix 10-18%",
        "purpose": "Glues rhythm guitar into the room sound. Keep it shorter than any lead guitar reverb."
      },
      {
        "name": "Stereo Width",
        "type": "Doubler or stereo delay",
        "settings": "Very short delays (5-20 ms L and R), blend subtly",
        "purpose": "Widens rhythm guitar in stereo to create a fuller, bigger sound without taking up more frequency space."
      }
    ],
    "stream_tips": [
      "Pan rhythm guitar opposite to lead if both are present",
      "Rhythm guitar in the stream mix should support, not lead - think of it as texture",
      "If using a heavily distorted rhythm tone, consider using a DI and amp sim instead of micing the cabinet for stream"
    ]
  },
  "pad": {
    "peqExtra": [
      {
        "band": "Air and Shimmer",
        "freq": "8-16 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide shelf",
        "reason": "High frequency shimmer is what makes pads sound lush and beautiful. Gentle boost here adds magic."
      }
    ],
    "comp": {
      "ratio": "2:1 to 3:1",
      "threshold": "Very gentle - just 2-4 dB of gain reduction",
      "attack": "50-100 ms - slow to preserve the pad swells",
      "release": "300-500 ms - slow and musical",
      "gain": "Minimal makeup",
      "notes": "Pads usually need light compression. The natural volume swells are part of their character. Over-compressing kills the life of a pad."
    },
    "geq_stream": "In the stream mix: pads should be lower than you think. They add atmosphere, not focus. If you can hear the pad clearly, it is probably too loud.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Large hall or cathedral",
        "settings": "Long decay 2.0-4.0 sec, Mix 25-40%",
        "purpose": "Pads love lots of reverb. A large hall makes them feel massive and immersive."
      },
      {
        "name": "Chorus or Ensemble",
        "type": "Rich chorus",
        "settings": "Rate: slow (0.2-0.5 Hz), Depth: moderate, Mix 30-50%",
        "purpose": "Gives pads that classic lush, wide, moving quality. Essential for worship and ambient music."
      },
      {
        "name": "Stereo Width",
        "type": "Mid-side processing or stereo widener",
        "settings": "Widen the sides, keep the center tight",
        "purpose": "Pads can be spread very wide in stereo. They fill the sides of the stereo field beautifully."
      }
    ],
    "stream_tips": [
      "Pads should be panned wide - full stereo L and R if the instrument allows",
      "If the stream sounds washy or muddy, the pad is usually the culprit - pull it down first",
      "Filter the pad on the stream send: high-pass at 200 Hz and low-pass at 8-10 kHz for a cleaner stream"
    ]
  },
  "piano": {
    "peqExtra": [
      {
        "band": "High Clarity",
        "freq": "5-8 kHz",
        "action": "Boost 1-3 dB",
        "q": "Wide (0.7)",
        "reason": "Brilliance and clarity of the piano keys. Adds the characteristic sparkle of a well-maintained piano."
      },
      {
        "band": "Top Air",
        "freq": "12-16 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide shelf",
        "reason": "High-end shimmer and air. Makes the piano sound open and beautiful on stream."
      }
    ],
    "comp": {
      "ratio": "2:1 to 4:1",
      "threshold": "3-6 dB gain reduction on loud passages",
      "attack": "10-20 ms",
      "release": "100-200 ms",
      "gain": "Makeup 2-3 dB",
      "notes": "Piano benefits from gentle compression to control the dynamic range of different players. A softer attack preserves the hammer strike character."
    },
    "geq_stream": "Piano and vocals share the 200-2000 Hz range. On the stream GEQ: if the piano sounds like it is fighting the vocals, cut 500-800 Hz on the piano send to create space.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Concert hall or plate",
        "settings": "Pre-delay 15-25 ms, Decay 1.5-2.5 sec, Mix 15-25%",
        "purpose": "Piano needs room to breathe. A concert hall reverb sounds most natural and beautiful."
      },
      {
        "name": "Compression",
        "type": "Optical or VCA - gentle",
        "settings": "As above - focused on evening out dynamics across the keyboard range",
        "purpose": "Piano dynamics vary enormously across the keyboard. Compression gives a more consistent level."
      }
    ],
    "stream_tips": [
      "If the piano player plays chords behind the vocalist, reduce the stream send by 3-5 dB during sung sections",
      "Piano recorded as stereo (L and R) should be panned naturally - wide but not extreme",
      "Electric piano (Rhodes, Wurlitzer) often benefits from a slightly more aggressive comp than acoustic"
    ]
  },
  "grand_piano": {
    "peqExtra": [
      {
        "band": "String Brilliance",
        "freq": "3-6 kHz",
        "action": "Boost 1-2 dB",
        "q": "Wide (0.7)",
        "reason": "The bright, clear character of grand piano strings. Very gentle - a grand piano already has this naturally."
      },
      {
        "band": "Hammer Strike",
        "freq": "6-10 kHz",
        "action": "Boost 1-2 dB or leave flat",
        "q": "Medium (0.8)",
        "reason": "The percussive attack of the hammer hitting the strings. Adds definition and presence without harshness."
      }
    ],
    "comp": {
      "ratio": "1.5:1 to 3:1 - very gentle",
      "threshold": "Only 2-4 dB of gain reduction",
      "attack": "20-40 ms - slow, preserves the piano attack",
      "release": "200-400 ms",
      "gain": "Minimal makeup",
      "notes": "Grand piano is the most dynamic instrument. Over-compression destroys what makes it special. Use very gentle settings and rely on the pianist to control their dynamics."
    },
    "geq_stream": "Grand piano on stream: the challenge is its massive frequency range. On the stream GEQ, a gentle mid-range dip (500 Hz-2 kHz, 1-2 dB) creates space for vocals while keeping the piano full.",
    "effects": [
      {
        "name": "Reverb",
        "type": "Concert hall - the longer the better",
        "settings": "Pre-delay 20-40 ms, Decay 2.0-3.5 sec, Mix 20-35%",
        "purpose": "A grand piano sounds best in a large acoustic space. Match the reverb to the music style."
      },
      {
        "name": "Minimal processing is best",
        "type": "EQ and light comp only",
        "settings": "Let the instrument breathe",
        "purpose": "Grand piano is one of the instruments that benefits most from minimal processing. Clean mic placement beats heavy EQ."
      }
    ],
    "stream_tips": [
      "Mic placement matters more than EQ for grand piano - close mics for attack, room mics for character",
      "Blend two or three mic positions for richness on stream",
      "Grand piano and pads together can create a very muddy stream mix - HPF the pad aggressively when both play"
    ]
  },
  "el_drums": {
    "peqExtra": [
      {
        "band": "Snare Crack",
        "freq": "2-5 kHz",
        "action": "Boost 2-4 dB",
        "q": "Medium (1.0)",
        "reason": "Electronic snare can sound flat and lifeless. A boost here adds the crack and snap."
      },
      {
        "band": "Cymbal Harshness",
        "freq": "6-10 kHz",
        "action": "Cut 2-4 dB on electronic cymbal channels",
        "q": "Medium (1.0)",
        "reason": "Electronic cymbals are often harsh and digital-sounding. A cut here makes them more natural."
      }
    ],
    "comp": {
      "ratio": "4:1 to 6:1 on kick and snare",
      "threshold": "4-8 dB gain reduction",
      "attack": "2-5 ms on kick (fast), 8-15 ms on snare (keep the crack)",
      "release": "50-150 ms",
      "gain": "Makeup as needed",
      "notes": "Electronic drums often already have compression baked in from the drum module. Verify the module output is not already clipping before adding more compression."
    },
    "geq_stream": "Electronic drums on stream: often the overhead or room simulation channel is the muddy culprit. Roll off the overheads at 200-300 Hz and reduce their stream send level.",
    "effects": [
      {
        "name": "Reverb on Snare",
        "type": "Plate or short hall",
        "settings": "Decay 0.3-0.8 sec, Mix 20-35%",
        "purpose": "Electronic snare needs reverb to sound real. A plate reverb is the most natural-sounding choice."
      },
      {
        "name": "Reverb on Kick (subtle)",
        "type": "Room",
        "settings": "Decay 0.1-0.3 sec, Mix 10-15%",
        "purpose": "A tiny room reverb makes electronic kick sound less synthetic and more three-dimensional."
      },
      {
        "name": "Transient Shaper on Kick",
        "type": "Transient designer",
        "settings": "Add attack, reduce sustain",
        "purpose": "Sharpens the punch of an electronic kick. Attack knob adds the initial thump, sustain knob removes the ring."
      }
    ],
    "stream_tips": [
      "Run electronic drums through a sub-group and compress the whole kit together for glue",
      "The drum module headphone output is not always the same as the main output - check levels properly",
      "Many e-drum pads have velocity curves - set to maximum dynamic range for the most natural feel"
    ]
  }
};
