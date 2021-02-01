/**
 * Returns radian converted from degrees
 */
export function degToRad(degree) {
    return (degree) * (Math.PI / 180);
}

/**
 * Returns a random integer value
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}