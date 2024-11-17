// ==UserScript==
// @name         Display Repository Creation Date on GitHub
// @namespace    https://github.com/Colin23/userscripts
// @version      1.0.0
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
    const DATE_FORMAT_OPTIONS = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    // Flag to prevent multiple fetches
    let hasFetchedData = false;

    function formatDate(dateString) {
        const createdAt = new Date(dateString);
        return createdAt.toLocaleDateString("de-DE", DATE_FORMAT_OPTIONS);
    }

    // Function to fetch repository creation date from GitHub API
    function fetchRepoCreationDate() {
        if (hasFetchedData) return; // Prevent fetching if data has already been retrieved

        console.log("tmp:");
        // api.github.com/{0-slice}/{1-slice}/{2-slice}/{3-slice}
        // Takes the slices 1 and 2 → repo owner and repo name.
        const repoName = window.location.pathname.split("/").slice(1, 3).join("/");
        const apiUrl = `https://api.github.com/repos/${repoName}`;

        // Check if we have the cached data (with a timestamp for freshness)
        const cachedApiUrl = localStorage.getItem("repoApiUrl");
        const cachedCreationDate = localStorage.getItem("repoCreationDate");
        const cacheTime = localStorage.getItem("repoCreationDateTime");
        const now = new Date().getTime().toString();

        if (cachedCreationDate && cacheTime && now - cacheTime < CACHE_EXPIRY && cachedApiUrl && cachedApiUrl === apiUrl) {
            // Use cached data
            const formattedDate = formatDate(new Date(cachedCreationDate));
            displayCreationDate(formattedDate);
            console.log("tmp: Using cached creation date");
            return;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.created_at) {
                    // Format the created_at date
                    const formattedDate = formatDate(new Date(data.created_at));

                    localStorage.setItem("repoCreationDate", data.created_at);
                    localStorage.setItem("repoCreationDateTime", now);
                    localStorage.setItem("repoApiUrl", apiUrl);
                    // Create and display the date in the about section
                    displayCreationDate(formattedDate);
                    hasFetchedData = true; // Mark as fetched
                } else {
                    console.warn("tmp: Unable to retrieve creation date from API.");
                }
            })
            .catch(error => {
                console.error("tmp: Error fetching repository data:", error);
                displayCreationDate("Creation date not available");
            });
    }

    // Function to display the creation date in the about section
    function displayCreationDate(date) {
        // Find the about section where we want to inject the date
        const aboutSection = document.querySelector('a[href="#readme-ov-file"]')?.parentNode?.parentNode;
        if (!aboutSection) {
            console.warn("tmp: Unable to find the about section.");
            return;
        }

        // Create a new div to display the "Created on" date
        const createdAtDiv = document.createElement("div");
        createdAtDiv.classList.add("mt-2");
        createdAtDiv.innerHTML = `<strong>Created on:</strong> ${date}`;

        const readmeLink = document.querySelector('a[href="#readme-ov-file"]');
        // Check if the Readme link exists, then insert the "Created on" date after it
        if (readmeLink) {
            aboutSection.insertBefore(createdAtDiv, readmeLink.parentNode);
        }
    }

    // Trigger the fetch function on DOM content loaded
    document.addEventListener("DOMContentLoaded", () => {
        fetchRepoCreationDate();
    });

    // Trigger the API fetching when the DOM updates (useful for navigation on GitHub)
    const observer = new MutationObserver(() => {
        // Observe only the about section or relevant areas
        const aboutSection = document.querySelector('a[href="#readme-ov-file"]')?.parentNode?.parentNode;

        if (aboutSection && !hasFetchedData) {
            fetchRepoCreationDate();
            observer.disconnect(); // Disconnect observer after fetching the date
        }
    });

    // Observe changes in the DOM, but limit it to relevant sections
    observer.observe(document.body, { childList: true, subtree: true });
})();
