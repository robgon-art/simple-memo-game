# Memory Matching Game Development Plan

## Phase 1: Core Game Structure
1. Show a single card that is flippable to show the front and back faces
2. Refactor the card component into a reusable `Card` class/component
3. Create an image manager to load and manage the 12 distinct card images
4. Implement grid layout (6x4) component show all 24 flippable cards (2 each)

## Phase 2: Game Logic
1. Create a game state model 
   - Cards array with ID, image, matched status, and revealed status
   - Game status (in progress, completed)
2. Create pure functions for:
   - Shuffling cards (Fisher-Yates algorithm)
   - Selecting a card
   - Checking for matches
   - Updating game state
3. Implement turn logic:
   - First card selection
   - Second card selection
   - Match checking
   - Auto-flipping unmatched cards after 2-second delay


## Phase 4: Testing
1. Create unit tests for pure functions:
   - Card shuffling
   - Match checking
   - Game state updates
2. Component tests for:
   - Card rendering
   - Grid layout
   - User interactions
3. Integration tests for game completion flow

## Phase 5: UI Enhancement
1. Add game completion detection and celebration
2. Implement game restart functionality
3. Add turn counter and timer
4. Improve animations and transitions

## Phase 6: Refinement
1. Optimize for performance
2. Add accessibility features
3. Implement responsive design for various screen sizes
4. Add local storage for saving game progress

Each phase will follow functional programming principles including:
- Immutable state management
- Pure functions for game logic
- Function composition
- First-class and higher-order functions

## Project File Structure

```
/
├── public/
│   ├── Back Side.jpg            # Card back image
│   └── cards/                   # Card front images directory
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...                  # More card images
│
├── src/
│   ├── components/
│   │   ├── card.ts              # Refactored reusable card component
│   │   ├── card.test.ts         # Card component tests
│   │   ├── grid.ts              # 6x4 grid layout component
│   │   ├── grid.test.ts         # Grid component tests
│   │   ├── game-board.ts        # Main game board component
│   │   └── game-board.test.ts   # Game board component tests
│   │
│   ├── models/
│   │   ├── game-state.ts        # Game state model
│   │   └── game-state.test.ts   # Game state model tests
│   │
│   ├── functions/
│   │   ├── shuffle.ts           # Card shuffling function (Fisher-Yates)
│   │   ├── shuffle.test.ts      # Shuffle function tests
│   │   ├── card-selection.ts    # Card selection logic
│   │   ├── card-selection.test.ts # Card selection tests
│   │   ├── match-checking.ts    # Match checking function
│   │   └── match-checking.test.ts # Match checking tests
│   │
│   ├── managers/
│   │   ├── image-manager.ts      # Image loading and management
│   │   └── image-manager.test.ts # Image service tests
│   │
│   ├── utils/
│   │   ├── timer.ts             # Timer utility
│   │   ├── timer.test.ts        # Timer tests
│   │   └── storage.ts           # Local storage utilities
│   │
│   ├── index.ts                 # Main application entry point
│   └── index.test.ts            # Integration tests
│
└── README_dev_plan.md           # Development plan
``` 