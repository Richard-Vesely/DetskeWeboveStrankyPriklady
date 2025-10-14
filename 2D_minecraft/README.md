# 2D Minecraft Game

A simple 2D Minecraft-like game built with HTML5 Canvas and JavaScript.

## How to Run

1. Open the `index.html` file in your web browser.
2. The game should start automatically.

## Controls

- **Move Left**: Left Arrow or A key
- **Move Right**: Right Arrow or D key
- **Jump**: Space or Up Arrow
- **Place Block**: W key
- **Mine Block**: Hold E key
- **Select Block Type**: 1 (Dirt), 2 (Wood), 3 (Stone)
- **Switch Tool**: T key
- **Open/Close Crafting Menu**: C key

## Game Features

- Block-based 2D world with three types of blocks:
  - Dirt (mines in 1 second)
  - Wood (mines in 2 seconds)
  - Stone (mines in 3 seconds)
- Player can move left and right
- Player can jump on platforms
- Collision detection prevents walking through blocks
- Block placement and mining
- Separate inventory for each block type:
  - Start with 10 dirt blocks
  - Start with 5 wood blocks
  - Start with 3 stone blocks
- Visual inventory display showing all block types
- Tool system with different mining speeds:
  - Start with just your hands (1x mining speed)
  - Craft various tools in the crafting menu
  - Different tools are more effective on certain materials:
    - Pickaxes are best for stone
    - Axes are best for wood
    - Shovels are best for dirt
- Crafting system:
  - Open crafting menu with C key
  - Click on a tool to craft it if you have enough materials
  - Tools are added to your tool inventory
  - Switch between tools with the T key 