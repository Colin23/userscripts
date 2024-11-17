// ==UserScript==
// @name         Recent Changes Highlighter for GitHub
// @namespace    https://github.com/Colin23/userscripts
// @version      1.3.1
// @description  This user script changes the font color of files/folders in GitHub repositories to highlight recent changes.
// @author       Colin Mörbe
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @updateURL    https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/recent-changes-highlighter-for-github.user.js
// @downloadURL  https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/recent-changes-highlighter-for-github.user.js
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    /**
     * Checks if the commit date is more recent than the age the method should check against.
     *
     * @param datetime {string} The commit date
     * @param ageInMonths {number} The age in months that should be checked against
     * @returns {boolean} Returns true if the commit date is more recent than the date to check against, returns false otherwise
     */
    function isRecent(datetime, ageInMonths) {
        const commitDate = new Date(datetime);
        const now = new Date();
        const ageToCalculateAgainst = new Date();
        // This is safe to use.
        // For example, passing 6 when in January will adjust the year and subtract the months starting from December
        // (e.g., January 2024 – 6 months result in July 2023).
        ageToCalculateAgainst.setMonth(now.getMonth() - ageInMonths);
        return commitDate > ageToCalculateAgainst;
    }

    /**
     * Changes the font color, depending on the commit age.
     *
     * @param datetime {string} The commit date
     * @param element {HTMLElement} The HTML element
     */
    function changeFontColor(datetime, element) {
        if (isRecent(datetime, 1)) {
            element.style.color = "green";
            element.style.fontWeight = "bold";
        } else if (isRecent(datetime, 3)) {
            element.style.color = "yellow";
        } else if (isRecent(datetime, 6)) {
            element.style.color = "red";
        }
    }

    /**
     * Extracts the commit dates and calls the {@link changeFontColor} method.
     */
    function highlightRecentChanges() {
        // Select all commit age elements → This works for directories and files.
        const commitDateElements = document.querySelectorAll(".react-directory-commit-age relative-time");
        if (!commitDateElements) {
            return;
        }
        commitDateElements.forEach(commitDateElement => {
            const datetime = commitDateElement.getAttribute("datetime");
            changeFontColor(datetime, commitDateElement);
        });

        // Select the time element for the latest commit date
        const latestCommitDateElement = document.querySelector(
            'div[data-testid="latest-commit-details"] relative-time'
        );
        if (!latestCommitDateElement) {
            return;
        }
        const datetime = latestCommitDateElement.getAttribute("datetime");
        changeFontColor(datetime, latestCommitDateElement);
    }

    // This ensures the DOM is loaded, and the querySelector for the 'latest-commit-details' works.
    // Without it, either null or undefined is thrown.
    document.addEventListener("DOMContentLoaded", () => {
        highlightRecentChanges();
    });

    // Reapply the highlighting when the DOM updates (useful for navigation on GitHub)
    const observer = new MutationObserver(highlightRecentChanges);
    observer.observe(document.body, { childList: true, subtree: true });
})();
