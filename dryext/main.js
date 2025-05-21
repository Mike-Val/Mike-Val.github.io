// main.js

// Ensure the DOM is fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const extensionInput = document.getElementById('extension');
    const addExtensionBtn = document.getElementById('addExtensionBtn');
    const removeExtensionBtn = document.getElementById('removeExtensionBtn');
    const encodingControls = document.getElementById('encoding-controls');
    const decodingControls = document.getElementById('decoding-controls');
    const showEncodingPageBtn = document.getElementById('showEncodingPage');
    const showDecodingPageBtn = document.getElementById('showDecodingPage');
    const controlSectionsContainer = document.querySelector('.control-sections-container'); // Get the new container

    // Get all page sections for easier handling (still useful for potential future common styling)
    const pageSections = document.querySelectorAll('.control-section');

    /**
     * Switches between the encoding and decoding pages with a drawer transition.
     * @param {string} pageId The ID of the page to show ('encoding' or 'decoding').
     */
    function switchPage(pageId) {
        // Determine which page to show and which to hide
        const pageToShow = pageId === 'encoding' ? encodingControls : decodingControls;
        const pageToHide = pageId === 'encoding' ? decodingControls : encodingControls;

        // Ensure the page to show is visible for animation
        pageToShow.style.display = 'block';

        // Trigger CSS transition by adding/removing class on the container
        if (pageId === 'decoding') {
            controlSectionsContainer.classList.add('show-decoding');
            controlSectionsContainer.classList.remove('show-encoding');
        } else { // pageId === 'encoding'
            controlSectionsContainer.classList.add('show-encoding');
            controlSectionsContainer.classList.remove('show-decoding');
        }

        // Hide the page that slid out after the transition completes
        setTimeout(() => {
             if (pageId === 'encoding') {
                 decodingControls.style.display = 'none';
             } else {
                 encodingControls.style.display = 'none';
             }
        }, 500); // Match CSS transition duration (0.5s)

        // Highlight the active button
        if (pageId === 'encoding') {
            showEncodingPageBtn.classList.add('active');
            showDecodingPageBtn.classList.remove('active');
        } else if (pageId === 'decoding') {
            showEncodingPageBtn.classList.remove('active');
            showDecodingPageBtn.classList.add('active');
        }

        // Update button states after switching pages
        updateButtonStates();
    }

    /**
     * Event listener for the "Add Extension and Download" button.
     * Calls the handleAddExtension function when clicked.
     */
    addExtensionBtn.addEventListener('click', handleAddExtension);

    /**
     * Event listener for the "Remove Extension and Download" button.
     * Calls the handleRemoveExtension function when clicked.
     */
    removeExtensionBtn.addEventListener('click', handleRemoveExtension);

    // Add event listeners for page selection buttons
    showEncodingPageBtn.addEventListener('click', () => switchPage('encoding'));
    showDecodingPageBtn.addEventListener('click', () => switchPage('decoding'));

    // Update button states when a file is selected or the extension input changes
    fileInput.addEventListener('change', updateButtonStates);
    extensionInput.addEventListener('input', updateButtonStates);

    // Initial state setup
    // Ensure encoding page is visible initially and decoding is hidden
    encodingControls.style.display = 'block';
    decodingControls.style.display = 'none';

    // Apply initial class for the container to be in the correct starting position
    controlSectionsContainer.classList.add('show-encoding');

    // Update button states after initial setup
    updateButtonStates();
});