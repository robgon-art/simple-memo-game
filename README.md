# Memory Matching Game

[Try it live here!](https://memo.robgon.com/)

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

## Testing Features

For testing and development purposes, the game supports URL parameters to control game state:

- `progress`: Automatically reveals and matches the specified number of card pairs
  - Example: `http://localhost:5173/?progress=11` will pre-match 11 out of 12 card pairs
  - Valid values are between 0 and 12
  - This allows easy testing of near-game-completion scenarios

- `num_pairs`: Sets the number of card pairs in the game
  - Example: `http://localhost:5173/?num_pairs=8` will start a game with 8 pairs (16 cards)
  - Valid values are between 2 and 12
  - This allows you to test the game with fewer or more pairs for different difficulty levels

## Next Steps

Future enhancements will include:
- [x] Alternate Cards
- [x] Easy and Hard Modes
