// ==UserScript==
// @name         Hide YouTube Shorts
// @namespace    https://github.com/Colin23/userscripts
// @version      1.0.1
// @description  This user script removes all traces of YouTube Shorts videos across YouTube (including homepage shelves, subscription feed headers, etc.)
// @author       Colin Mörbe
// @match        *://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @updateURL    https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/hide-youtube-shorts.user.js
// @downloadURL  https://github.com/Colin23/userscripts/raw/refs/heads/main/scripts/hide-youtube-shorts.user.js
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    /** @type {string[]} */
    const TEXT_PATTERNS = ["#shorts", "#Shorts", "#short", "#Short", "Shorts", "SHORTS"];

    /**
     * Checks whether an element's text includes any Shorts-related keywords.
     * @param {Element} element - The DOM element to check.
     * @returns {boolean} True if the element contains Shorts text.
     */
    function containsShortsText(element) {
        return TEXT_PATTERNS.some(pattern => element.textContent?.toLowerCase().includes(pattern.toLowerCase()));
    }

    /**
     * Removes Shorts-related content from the given DOM root.
     * @param {ParentNode} root - The root element to search within.
     */
    function removeShortsContent(root = document) {
        const containers = root.querySelectorAll(`
            ytd-grid-video-renderer,
            ytd-rich-item-renderer,
            ytd-video-renderer,
            ytd-item-section-renderer,
            ytd-reel-shelf-renderer,
            ytd-compact-video-renderer,
            ytd-rich-section-renderer,
            ytd-rich-shelf-renderer,
            tp-yt-paper-tab,
            yt-tab-shape,
            ytd-guide-entry-renderer,
            ytd-mini-guide-entry-renderer,
            [overlay-style="SHORTS"]
        `);

        containers.forEach(element => {
            if (containsShortsText(element)) {
                console.debug("Removed Shorts element:", element);
                element.remove();
            }
        });

        root.querySelectorAll("#title-text, #title-container").forEach(titleElement => {
            if (containsShortsText(titleElement)) {
                const shelf = titleElement.closest("ytd-rich-shelf-renderer, ytd-rich-section-renderer");
                if (shelf) shelf.remove();
            }
        });
    }

    removeShortsContent();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    removeShortsContent(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
