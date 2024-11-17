// ==UserScript==
// @name         Recent Changes Highlighter for GitHub
// @namespace    https://github.com/Colin23/userscripts
// @version      1.0.0
// @description  This user script changes the font color of files/folders in GitHub repositories to highlight recent changes.
// @author       Colin Mörbe
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @updateURL    https://github.com/Colin23/userscripts/blob/main/scripts/recent-changes-highlighter-for-github.user.js
// @downloadURL  https://github.com/Colin23/userscripts/blob/main/scripts/recent-changes-highlighter-for-github.user.js
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    // Helper function to check if a date is within the last month
    function isRecent(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return date > oneMonthAgo;
    }

    // Function to update the directory commit age elements
    function highlightRecentChanges() {
        // Select all directory commit age elements
        const ageElements = document.querySelectorAll(".react-directory-commit-age relative-time");

        ageElements.forEach(element => {
            const datetime = element.getAttribute("datetime"); // Get the datetime attribute
            if (datetime && isRecent(datetime)) {
                // If the change is younger than one month, make it red
                element.style.color = "red";
                element.style.fontWeight = "bold"; // Optional: make it bold for emphasis
            }
        });
    }

    // Run the script initially
    highlightRecentChanges();

    // Reapply the highlighting when the DOM updates (useful for navigation on GitHub)
    const observer = new MutationObserver(highlightRecentChanges);
    observer.observe(document.body, { childList: true, subtree: true });
})();
