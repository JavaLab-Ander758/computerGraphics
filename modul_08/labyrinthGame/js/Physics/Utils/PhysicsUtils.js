/**
 * Returns enumerable with keyboard key-codes
 */
export function getKeyboardEnums() {
    return {
        W: 87, S: 83, A: 65, D: 68,
        I: 73, K: 75, J: 74, L: 76, SPACE: 32
    }
}

/**
 * Returns radian from degree
 */
export function toRadians(angle) {
    return Math.PI/180 * angle;
}