# Cyberpunk Flappy Bird

A browser-based Flappy Bird game with a cyberpunk aesthetic, created with HTML, CSS, and JavaScript. This version features fullscreen gameplay and is designed to be more forgiving than the original game.

## How to Play

1. Open the `index.html` file in your web browser or access it via a local server.
2. The game will start automatically when you click anywhere on the screen.
3. Press the SPACE key or click/tap on the game area to make the bird fly upward.
4. Navigate through the pipes without hitting them or the ground/ceiling.
5. Each pipe you pass earns you one point.
6. The game ends when you hit a pipe or the ground/ceiling.

## Features

- Cyberpunk 8-bit aesthetic with neon colors and glitch effects
- Custom logo as the player character
- Fullscreen gameplay for an immersive experience
- More forgiving collision detection
- Sound effects with toggle control
- High score tracking that resets when the tab is closed
- Game speed increases as you progress
- Responsive design that works on both desktop and mobile devices

## Files

- `index.html` - The main HTML structure
- `style.css` - All the styling for the game
- `game.js` - The JavaScript code that powers the game logic
- `images/LogoNew.png` - The custom bird image

## Game Mechanics

- The bird constantly falls due to gravity (reduced compared to the original)
- Pressing SPACE or clicking/tapping makes the bird jump upward
- Pipes appear from the right side of the screen and move to the left
- The game speed increases by 10% every 5 points
- Collision detection is more forgiving with a smaller hitbox
- High scores are stored in session storage and reset when the tab is closed

## Tips

- Short, gentle taps work better than long presses
- Try to maintain a steady rhythm to navigate through the pipes
- Plan your jumps in advance to navigate through multiple pipes
- The bird's falling speed is capped to give you more control
- Use the sound toggle in the top-right corner to enable/disable sound effects
- Your high score will reset when you close the tab, so take a screenshot if you want to remember it!

Enjoy the game! 