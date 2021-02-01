/**
 * Returns True if number in range
 */
export function isNumberInRange(number, min, max) {
    return number >= min && number <= max;
}

/**
 * Returns True if number is integer
 */
export function isNumberInteger(number) {
    return number === parseInt(number, 10);
}

/**
 * Returns radian from degree
 */
export function toRadians(angle) {
    return Math.PI/180 * angle;
}

/**
 * Returns radian converted from degrees
 */
export function degToRad(degree) {
    return (degree) * (Math.PI / 180);
}

/**
 * Returns degrees from radians
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI)
}

/**
 * Returns a random integer value
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}