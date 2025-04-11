# Memory Matching Game

A simple memory matching game implemented with web components using Lit.

## Features
- 24 cards (12 pairs of famous artworks)
- Responsive 6x4 grid layout (adapts to different screen sizes)
- Interactive card flipping
- Modern component architecture

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Implementation Notes

This implementation follows functional programming principles where appropriate:
- Immutable state updates (cards array is recreated on each state change)
- Pure functions in the card handling logic
- Component encapsulation
- Event-based communication between components

The codebase is structured into three main components:
- `card.ts`: Handles individual card rendering and flipping animation
- `grid.ts`: Manages the responsive 6x4 layout
- `game-board.ts`: Coordinates the game state and card interactions

## Next Steps

Future enhancements will include:
- Shuffling algorithm
- Match checking
- Turn counting
- Game completion detection