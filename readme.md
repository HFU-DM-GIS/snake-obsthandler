# GIS Praktikum Game project WiSe2023/24

## Snake
This is an implementation of the classic game "Snake". The original source is from [CodingNepal](http://youtube.com/codingnepal).

### Bugs
- Fix the bugs:
  - Snake cannot be turned downwards.
  - Food is always in the same corner.
  - Score does not increase.
  - Game stops, if snake reaches the top area.

### Extensions
- The snake's head should have a different color than the tail.
- Make the playground variable in size.
- Increase the speed of the snake after eating N food elements. Or include next levels that can be reached after eating M food elements.
- Include a timer that forces the player to get the next food element quickly.

## Code review (UH 2024-01-04)
- Game is fun to play, but a bit awkward as the timing appears wrong.
  - the update appears to be unregular and it is possible to turn the snake's head about 180 degree which leads to a game over. Check the interval mechanism and wait for the keyup event before updating the direction.
- Update this readme file so that it states the current status of the game and does not display any fixed bugs.
- Rename some variables (e.g. speed) to make the code better readable.
- Restructure the initGame function so that it only initializes the game and call another function like "updateGame" in an interval.
- Some quotes are not displayed completely.

