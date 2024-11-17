// ==UserScript==
// @name         Display Repository Creation Date on GitHub
// @namespace    https://github.com/Colin23/userscripts
// @version      1.0.1
// @description  Displays the repository creation date in the about section on GitHub repositories
// @author       Colin Mörbe
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @updateURL    https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/display-repo-created-date.user.js
// @downloadURL  https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/display-repo-created-date.user.js
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    // 24 hours in ms
    const CACHE_EXPIRY = 86400000;
    // E.g. 17.11.2024
    const DATE_FORMAT_OPTIONS = {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    };

    // Flag to prevent multiple fetches
    let wasDataAlreadyFetched = false;

    /**
     * Transforms a string into a Date and formats that date via the {@link DATE_FORMAT_OPTIONS}.
     *
     * @param createdAtString {string} The value from the created_at JSON property
     * @returns {string} The formatted createdAt string
     */
    function formatDate(createdAtString) {
        const createdAt = new Date(createdAtString);
        return createdAt.toLocaleDateString("de-DE", DATE_FORMAT_OPTIONS);
    }

    /**
     * Passes the createdAt data to the {@link displayCreationDate} method by either using the localStorage or fetching the data from the GitHub API.
     */
    function fetchRepoCreationDate() {
        if (wasDataAlreadyFetched) return;

        // api.github.com/{0-slice}/{1-slice}/{2-slice}/{3-slice}
        // Takes the slices 1 and 2 → repo owner and repo name.
        const repoName = window.location.pathname.split("/").slice(1, 3).join("/");
        const apiUrl = `https://api.github.com/repos/${repoName}`;

        // Extracts the cached data from the local storage
        const cachedApiUrl = localStorage.getItem("repoApiUrl");
        const cachedCreationDate = localStorage.getItem("repoCreationDate");
        const cacheTime = localStorage.getItem("repoCreationDateTime");
        const now = new Date().getTime().toString();

        const isCacheValid = now - cacheTime < CACHE_EXPIRY;

        if (
            cachedApiUrl &&
            cachedApiUrl === apiUrl &&
            cachedCreationDate &&
            cacheTime &&
            isCacheValid
        ) {
            // Use cached data
            const formattedDate = formatDate(cachedCreationDate);
            console.log("Using cached creation date");
            displayCreationDate(formattedDate);
            return;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.created_at) {
                    // Format the created_at date
                    const formattedDate = formatDate(data.created_at);

                    localStorage.setItem("repoCreationDate", data.created_at);
                    localStorage.setItem("repoCreationDateTime", now);
                    localStorage.setItem("repoApiUrl", apiUrl);

                    displayCreationDate(formattedDate);
                    wasDataAlreadyFetched = true;
                } else {
                    console.warn("Unable to retrieve creation date from API.");
                }
            })
            .catch(error => {
                console.error("Error fetching repository data:", error);
                displayCreationDate("Creation date not available");
            });
    }

    /**
     * Retrieves the 'About' section and the 'Readme' element.
     * Then created a new DIV above the 'Readme' element with the createdAt date.
     *
     * @param createdAt {string} The createdAt date
     */
    function displayCreationDate(createdAt) {
        // Find the about section
        const aboutSection = document.querySelector('a[href="#readme-ov-file"]')?.parentNode?.parentNode;
        if (!aboutSection) {
            console.warn("Unable to find the about section.");
            return;
        }

        const createdAtDiv = document.createElement("div");
        createdAtDiv.classList.add("mt-2");
        createdAtDiv.innerHTML = `<strong>Created on:</strong> ${createdAt}`;

        const readmeLink = document.querySelector('a[href="#readme-ov-file"]');
        if (readmeLink) {
            aboutSection.insertBefore(createdAtDiv, readmeLink.parentNode);
        }
    }

    // Trigger the API fetching when the DOM updates (useful for navigation on GitHub)
    const observer = new MutationObserver(() => {
        // Observe only the about section or relevant areas
        const aboutSection = document.querySelector('a[href="#readme-ov-file"]')?.parentNode?.parentNode;

        if (aboutSection && !wasDataAlreadyFetched) {
            fetchRepoCreationDate();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
