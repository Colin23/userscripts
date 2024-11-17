// ==UserScript==
// @name         Recent Changes Highlighter for GitHub
// @namespace    https://github.com/Colin23/userscripts
// @version      1.1.0
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

    /**
     * Checks if the commit date is more recent than the age the method should check against.
     *
     * @param dateString The commit date
     * @param ageInMonths The age in months that should be checked against
     * @returns {boolean} Returns true if the commit date is more recent than the date to check against, returns false otherwise
     */
    function isRecent(dateString, ageInMonths) {
        const commitDate = new Date(dateString);
        const now = new Date();
        const ageToCalculateAgainst = new Date();
        // This is safe to use.
        // For example, passing 6 when in January will adjust the year and subtract the months starting from December
        // (e.g., January 2024 – 6 months result in July 2023).
        ageToCalculateAgainst.setMonth(now.getMonth() - ageInMonths);
        return commitDate > ageToCalculateAgainst;
    }

    /**
     * Extracts the commit date, passes is into the {@link isRecent} method
     * and changes the font color of the commit date depending on the return of the {@link isRecent} method.
     */
    function highlightRecentChanges() {
        // Select all commit age elements → This works for directories and files.
        const ageElements = document.querySelectorAll(".react-directory-commit-age relative-time");

        ageElements.forEach(element => {
            const datetime = element.getAttribute("datetime");
            if (!datetime) {
                return;
            }
            if (isRecent(datetime, 1)) {
                // If the change is younger than one month, make it red
                element.style.color = "green";
                element.style.fontWeight = "bold";
            } else if (isRecent(datetime, 3)) {
                element.style.color = "yellow";
            } else if (isRecent(datetime, 6)) {
                element.style.color = "red";
            }
        });
    }

    // Run the script initially
    highlightRecentChanges();

    // Reapply the highlighting when the DOM updates (useful for navigation on GitHub)
    const observer = new MutationObserver(highlightRecentChanges);
    observer.observe(document.body, { childList: true, subtree: true });
})();
