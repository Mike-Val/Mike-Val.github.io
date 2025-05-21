/**
 * Finds the index of the first occurrence of a byte sequence within a Uint8Array.
 * @param {Uint8Array} source The array to search within.
 * @param {Uint8Array} sequence The sequence to search for.
 * @param {number} start The starting index in the source array to begin the search.
 * @param {number} limit The maximum index in the source array to search up to (exclusive).
 * @returns {number} The starting index of the sequence if found, otherwise -1.
 */
function findSequenceIndex(source, sequence, start, limit) {
    for (let i = start; i <= limit - sequence.length; i++) {
        let match = true;
        for (let j = 0; j < sequence.length; j++) {
            if (source[i + j] !== sequence[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            return i;
        }
    }
    return -1;
} 