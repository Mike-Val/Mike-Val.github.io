// constants.js

/**
 * Magic byte sequence to identify files processed by this application ("GMEXT").
 * @type {Uint8Array}
 */
const MAGIC_SEQUENCE = new Uint8Array([71, 77, 69, 88, 84]);

/**
 * Byte sequence used as a delimiter in the header to separate extension data ("||").
 * Chosen to be unlikely to appear in typical ASCII or emoji strings.
 * @type {Uint8Array}
 */
const EXTENSION_DELIMITER = new Uint8Array([254, 254]);

/**
 * Maximum expected length for the file header (magic sequence + original extension + custom extension + delimiters).
 * Used to limit the search area for delimiters.
 * @type {number}
 */
const MAX_HEADER_LENGTH = 256; 