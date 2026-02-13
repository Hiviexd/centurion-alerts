/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses a color hex string to an integer.
 * @param {string} color - The color string to parse.
 * @returns {number} The parsed color.
 */
export function parseColor(color) {
    const hex = color.startsWith("#") ? color.slice(1) : color;
    return parseInt(hex, 16);
}
