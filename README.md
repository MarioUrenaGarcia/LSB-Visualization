# LSB Steganography Visualizer

Live demo: https://mariourenagarcia.github.io/LSB-Visualization/

Interactive browser-based tool for understanding Least Significant Bit (LSB) steganography. Shows in real time how message bits are embedded into pixel channel values and how the resulting image differs from the original.

## Overview

LSB steganography works by replacing the least significant bit of each color channel value with a bit from the hidden message. A change of 1 in a channel value (e.g. 182 -> 183) is visually imperceptible, which makes LSB one of the most common spatial-domain steganography techniques.

This tool renders two grids of pixels side by side: the original cover image and the steganographed version. Each pixel card shows the full 8-bit binary representation of its R, G, and B channels, with the LSB highlighted. As the message changes, the affected bits update immediately.

## Features

- Choose any number of pixels from 1 to 64
- Select which channels (R, G, B) to use for embedding
- Type a secret message and watch the LSBs update in real time
- Click any pixel in the original panel to set its color via the native color picker
- Randomize all pixel colors
- Animated color drift to demonstrate that LSB changes are imperceptible
- Live capacity indicator showing how many bits fit and how many are used
- Decoded message extracted from the steganographed pixels

## Getting Started

No build step, no dependencies.

```
git clone https://github.com/MarioUrenaGarcia/lsb-visualizer.git
cd lsb-visualizer
open index.html
```

Or serve it locally if your browser blocks local file access:

```
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Project Structure

```
.
├── index.html        # Markup and entry point
├── css/
│   └── styles.css    # All styles and CSS custom properties
└── js/
    └── lsb.js        # State, codec, rendering, controls, animation loop
```

The JavaScript is split into clearly labeled sections: `STATE`, `UTILS`, `CODEC`, `RENDER`, `COLOR PICKER`, `CONTROLS`, `ANIMATION LOOP`, and `INIT`. There are no frameworks or external dependencies.

## How LSB Embedding Works

Given a pixel with channel values `R=182, G=201, B=95` and the message character `'H'` (binary `01001000`):

1. Take the first bit of the message (`0`) and embed it into R: `182 & 0xFE | 0 = 182`
2. Take the next bit (`1`) and embed it into G: `201 & 0xFE | 1 = 201`
3. Take the next bit (`0`) and embed it into B: `95 & 0xFE | 0 = 94`

The resulting pixel is `R=182, G=201, B=94`. The maximum channel deviation is 1, which is below the human visual threshold.

Capacity formula: `pixels * active_channels` bits, or `floor(pixels * active_channels / 8)` characters.

## License

MIT
