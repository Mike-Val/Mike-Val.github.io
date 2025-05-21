// handler.js

/**
 * Updates the enabled/disabled state of the Add and Remove buttons based on input and active page.
 */
function updateButtonStates() {
    const fileInput = document.getElementById('fileInput');
    const extensionInput = document.getElementById('extension');
    const addExtensionBtn = document.getElementById('addExtensionBtn');
    const removeExtensionBtn = document.getElementById('removeExtensionBtn');
    const messageElement = document.getElementById('message');
    const encodingControls = document.getElementById('encoding-controls');

    const fileSelected = fileInput.files.length > 0;
    const extensionEntered = extensionInput.value.trim() !== '';

    // Check which page is active
    const isEncodingPage = encodingControls.style.display !== 'none';

    if (isEncodingPage) {
        // On Encoding page, enable Add button based on file and extension, disable Remove button
        // addExtensionBtn.disabled = !(fileSelected && extensionEntered); // Temporarily disabled for development
        // removeExtensionBtn.disabled = true; // Temporarily disabled for development

        // Clear message when inputs change
        messageElement.textContent = '';

    } else { // Decoding page is active
        // On Decoding page, enable Remove button based on file selection, disable Add button
        // removeExtensionBtn.disabled = !fileSelected; // Temporarily disabled for development
        // addExtensionBtn.disabled = true; // Temporarily disabled for development

         // Clear message when inputs change
        messageElement.textContent = '';
    }
}

/**
 * Handles the process of adding a custom extension to a file and downloading the result.
 */
function handleAddExtension() {
    const fileInput = document.getElementById('fileInput');
    const extensionInput = document.getElementById('extension');
    const messageElement = document.getElementById('message');

    // Re-check inputs just in case (should be handled by button state, but as a safeguard)
    if (!fileInput.files.length || !extensionInput.value.trim()) {
        messageElement.textContent = 'Please select a file and enter a new extension.';
        return;
    }

    const file = fileInput.files[0];
    const customExtension = extensionInput.value;

    const encoder = new TextEncoder();
    const customExtensionBytes = encoder.encode(customExtension);

    // Validate custom extension: check for control characters or delimiter bytes
    for (const byte of customExtensionBytes) {
        if (byte < 32 || (byte >= 127 && byte <= 159) || byte === EXTENSION_DELIMITER[0] || byte === EXTENSION_DELIMITER[1]) {
             messageElement.textContent = 'Custom extension contains disallowed characters.';
             // Keep buttons disabled after error
             document.getElementById('addExtensionBtn').disabled = true;
             document.getElementById('removeExtensionBtn').disabled = true;
             return;
        }
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
        messageElement.textContent = 'File size exceeds the 100MB limit.';
         // Keep buttons disabled after error
         document.getElementById('addExtensionBtn').disabled = true;
         document.getElementById('removeExtensionBtn').disabled = true;
        return;
    }

    messageElement.textContent = 'Processing...';
    // Disable buttons while processing
    document.getElementById('addExtensionBtn').disabled = true;
    document.getElementById('removeExtensionBtn').disabled = true;

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        addExtensionAndDownload(file, arrayBuffer, customExtension);
        // Re-enable buttons after processing
        updateButtonStates();
    };
    reader.onerror = function() {
        messageElement.textContent = 'Error reading file.';
         // Re-enable buttons after error
        updateButtonStates();
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Handles the process of removing the added extension header from a file and downloading the original content.
 */
function handleRemoveExtension() {
    const fileInput = document.getElementById('fileInput');
    const messageElement = document.getElementById('message');

    // Re-check inputs just in case
    if (!fileInput.files.length) {
        messageElement.textContent = 'Please select a file.';
        return;
    }

    const file = fileInput.files[0];

     if (file.size > 100 * 1024 * 1024) { // 100MB limit
        messageElement.textContent = 'File size exceeds the 100MB limit.';
         // Keep buttons disabled after error
         document.getElementById('addExtensionBtn').disabled = true;
         document.getElementById('removeExtensionBtn').disabled = true;
        return;
    }

    messageElement.textContent = 'Processing...';
     // Disable buttons while processing
    document.getElementById('addExtensionBtn').disabled = true;
    document.getElementById('removeExtensionBtn').disabled = true;

    const reader = new FileReader();
     reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        removeExtensionAndDownload(file, arrayBuffer);
         // Re-enable buttons after processing
        updateButtonStates();
    };
    reader.onerror = function() {
        messageElement.textContent = 'Error reading file.';
         // Re-enable buttons after error
        updateButtonStates();
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Adds the magic sequence, original extension, and custom extension as a header to the file data and triggers download.
 * @param {File} originalFile The original File object.
 * @param {ArrayBuffer} arrayBuffer The binary data of the original file.
 * @param {string} customExtension The custom extension string provided by the user.
 */
function addExtensionAndDownload(originalFile, arrayBuffer, customExtension) {
    const messageElement = document.getElementById('message');
    const encoder = new TextEncoder();

    // Extract original extension
    const originalFileNameParts = originalFile.name.split('.');
    const originalExtension = originalFileNameParts.length > 1 ? originalFileNameParts.pop() : '';
    const baseFileName = originalFileNameParts.join('.');

    const originalExtensionBytes = encoder.encode(originalExtension);
    const customExtensionBytes = encoder.encode(customExtension);

    // Check if the original extension bytes contain delimiter bytes
     for (const byte of originalExtensionBytes) {
        if (byte === EXTENSION_DELIMITER[0] || byte === EXTENSION_DELIMITER[1]) {
             messageElement.textContent = 'Original file extension contains disallowed characters (delimiter bytes).';
              // Keep buttons disabled after error
             document.getElementById('addExtensionBtn').disabled = true;
             document.getElementById('removeExtensionBtn').disabled = true;
             return;
        }
    }

    // Construct the header: MAGIC + originalExt + DELIMITER + customExt + DELIMITER
    const headerArray = [
        MAGIC_SEQUENCE,
        originalExtensionBytes,
        EXTENSION_DELIMITER,
        customExtensionBytes,
        EXTENSION_DELIMITER
    ];

    const headerLength = headerArray.reduce((sum, arr) => sum + arr.length, 0);

    // Check if header exceeds max length
    if (headerLength > MAX_HEADER_LENGTH) {
         messageElement.textContent = `Header length exceeds maximum allowed (${MAX_HEADER_LENGTH} bytes). Please use shorter extensions.`;
          // Keep buttons disabled after error
         document.getElementById('addExtensionBtn').disabled = true;
         document.getElementById('removeExtensionBtn').disabled = true;
         return;
    }

    const headerBytes = new Uint8Array(headerLength);
    let offset = 0;
    headerArray.forEach(arr => {
        headerBytes.set(arr, offset);
        offset += arr.length;
    });

    // Create a new ArrayBuffer with space for the header and original data
    const newArrayBuffer = new ArrayBuffer(headerLength + arrayBuffer.byteLength);
    const newUint8Array = new Uint8Array(newArrayBuffer);

    // Copy header bytes to the beginning
    newUint8Array.set(headerBytes, 0);
    // Copy original file bytes after the header
    newUint8Array.set(new Uint8Array(arrayBuffer), headerLength);

    // Create a Blob from the new ArrayBuffer
    const blob = new Blob([newUint8Array], { type: originalFile.type });

    // Create a download link with the original filename but the custom extension
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}.${customExtension}`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    messageElement.textContent = 'File processed and downloaded.';
     // Re-enable buttons after success
    updateButtonStates();
}

/**
 * Removes the header from a file processed by this app and downloads the original file with its original extension.
 * @param {File} originalFile The original File object.
 * @param {ArrayBuffer} arrayBuffer The binary data of the file (including the header).
 */
function removeExtensionAndDownload(originalFile, arrayBuffer) {
    const messageElement = document.getElementById('message');
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder();

    // Check for the MAGIC_SEQUENCE at the beginning
    if (uint8Array.length < MAGIC_SEQUENCE.length || !uint8Array.slice(0, MAGIC_SEQUENCE.length).every((val, index) => val === MAGIC_SEQUENCE[index])) {
        messageElement.textContent = 'This file was not processed by this application.';
        // Keep remove button disabled if not processed by the app
        document.getElementById('removeExtensionBtn').disabled = true;
         // Re-enable add button only if inputs are valid
        updateButtonStates();
        return;
    }

    const searchLimit = Math.min(uint8Array.length, MAX_HEADER_LENGTH);

    // Search for the first delimiter after the magic sequence using the helper
    const firstDelimiterIndex = findSequenceIndex(uint8Array, EXTENSION_DELIMITER, MAGIC_SEQUENCE.length, searchLimit);

    if (firstDelimiterIndex === -1) {
        messageElement.textContent = 'Could not find the expected extension delimiters in the file header.';
         // Keep remove button disabled after error
        document.getElementById('removeExtensionBtn').disabled = true;
         // Re-enable add button only if inputs are valid
        updateButtonStates();
        return;
    }

    // Search for the second delimiter after the first one using the helper
    const searchStart2 = firstDelimiterIndex + EXTENSION_DELIMITER.length;
    const secondDelimiterIndex = findSequenceIndex(uint8Array, EXTENSION_DELIMITER, searchStart2, searchLimit);

     if (secondDelimiterIndex === -1) {
        messageElement.textContent = 'Could not find the expected extension delimiters in the file header.';
         // Keep remove button disabled after error
        document.getElementById('removeExtensionBtn').disabled = true;
         // Re-enable add button only if inputs are valid
        updateButtonStates();
        return;
    }

    // Extract original extension bytes between magic sequence and first delimiter
    const originalExtensionBytes = uint8Array.slice(MAGIC_SEQUENCE.length, firstDelimiterIndex);

    // Validate original extension bytes do not contain delimiter bytes (should not happen if added correctly, but as a safeguard)
     for (const byte of originalExtensionBytes) {
        if (byte === EXTENSION_DELIMITER[0] || byte === EXTENSION_DELIMITER[1]) {
             messageElement.textContent = 'Error: Original extension data in the header contains disallowed characters (delimiter bytes).';
             // Keep remove button disabled after error
             document.getElementById('removeExtensionBtn').disabled = true;
              // Re-enable add button only if inputs are valid
            updateButtonStates();
             return;
        }
    }

    const originalExtension = decoder.decode(originalExtensionBytes);

    // The original file data starts immediately after the second delimiter
    const originalDataStartIndex = secondDelimiterIndex + EXTENSION_DELIMITER.length;

    // Create a Blob from the original data
    const blob = new Blob([uint8Array.slice(originalDataStartIndex)], { type: originalFile.type });

    // Create a download link with the original filename and original extension
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Reconstruct the original filename
    const originalFileNameParts = originalFile.name.split('.');
    originalFileNameParts.pop(); // Remove the current (custom) extension
    const baseFileName = originalFileNameParts.join('.');
    a.download = `${baseFileName}.${originalExtension}`;

    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    messageElement.textContent = 'File processed and downloaded.';
     // Re-enable buttons after success
    updateButtonStates();
} 