/**
 * Utility functions for the Pong game
 */

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert degrees to radians
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Check if two rectangles are colliding
 */
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

/**
 * Random float between min and max
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
