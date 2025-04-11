# Memory Matching Game

A simple memory matching game implemented with web components using Lit and TypeScript.

## Playing the Game

- This is a card matching game that requires visual memory to remember where certain cards are in order to find matching pairs.
- There are 12 pairs of cards with different paintings on the front face.
- The cards are shuffled and arranged in an 8x3 grid, face down.
- The user clicks on any two cards to see if there is a match.
- If there is a match, these cards stay face up.
- If there is not a match, both cards flip to be face down after a couple of seconds.
- The game proceeds until all cards have been matched.

## Features
- 24 cards (12 pairs of famous artworks)
- Responsive 8x3 grid layout (adapts to different screen sizes)
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