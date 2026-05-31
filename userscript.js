// ==UserScript==
// @name         Aerotoria (Userscript)
// @namespace    http://icedluau.github.io/
// @version      2026-05-28
// @description  frutiger aero...
// @author       IcedLuau
// @match        https://polytoria.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=polytoria.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const dashItems = {
        "home-friendsOnline": {
            Display: "Friends",
            Maximize: "/my/friends"
        },
        "home-news": {
            Display: "News",
            Maximize: "https://blog.polytoria.com/"
        },
        "home-recommendedPlaces": {
            Display: "Recommended",
            Maximize: undefined
        },
        "home-liveNow": {
            Display: "Recommended",
            Maximize: undefined
        },
        "home-newAndRising": {
            Display: "New and Rising",
            Maximize: undefined
        },
        "home-recentlyPlayed": {
            Display: "Continue",
            Maximize: undefined
        },
    }

    const OtherMappings = {
        "user-avatar-card": {
            Display: (window.location.pathname.startsWith("/u/") ? window.location.pathname.split("/")[2] : "avatar") + ".jpeg",
        },
        "user-stats-card": {
            Display: "stats.xml"
        },
        "user-streak-card": {
            Display: "streak.xml"
        },
        "user-menu-tabs-card": {
            Display: "User Inspector 0.1.2"
        }
    }

    /**
     * Finds the last meaningful text node of a given element and returns the trimmed text.
     * Does not mutate the original elements.
     * @param {HTMLElement} element 
     * @returns {string|null}
     */
    function trimLastTextNode(element) {
        if (!element) return null;

        console.log("Target Element:", element.tagName);
        console.log("Raw OuterHTML:", element.outerHTML);
        console.log("Total Child Nodes found:", element.childNodes.length);
        
        // We iterate backwards through childNodes
        const nodes = element.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            
            // Check if it is a text node and contains non-whitespace characters
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text.length > 0) {
                    return text;
                }
            }
        }

        return null;
    }

    const isDashboard = window.location.pathname.startsWith("/home")

    document.querySelectorAll('.card-dash, .card:not(.place-card)').forEach(el => {
        el.classList.remove('card-dash', 'card', 'border-start', 'rounded-0');
        el.classList.add('window', 'glass', 'active');

        let maximizeLink = undefined;
        let title = "(*) Unsaved";
        let shouldOverflow = false;

        if (el.parentElement.id.startsWith('home-')) {
            el.parentElement.firstElementChild.remove();
            shouldOverflow = true;
            if (dashItems[el.parentElement.id]) {
                maximizeLink = dashItems[el.parentElement.id].Maximize;
                title = dashItems[el.parentElement.id].Display;
            };
        } else if (OtherMappings[el.id]) {
            title = OtherMappings[el.id].Display;
        } else if (el.previousElementSibling && el.previousElementSibling.classList.contains("section-title")) {
            const sectionTitle = el.previousElementSibling;
            title = trimLastTextNode(sectionTitle);
            sectionTitle.remove();
            el.classList.add("mt-4");
        }

        const body = el.querySelector(".card-body")

        if (body) {
            body.classList.remove('card-body');
            body.classList.add('window-body', 'has-space', 'has-scrollbar');
            if (shouldOverflow) {
                body.style.overflow = "auto";
            }
        }

        el.insertAdjacentHTML("afterbegin", `
        <div class="title-bar" style="background-attachment: local;">
            <div class="title-bar-text">${title}</div>
            <div class="title-bar-controls">
${isDashboard ? `<button aria-label="Maximize" ${maximizeLink !== undefined ? `onclick="window.location.href='${maximizeLink}'"` : 'disabled'}></button>` : ''}
                <button aria-label="Close"></button>
            </div>
        </div>`);
    });

    document.querySelectorAll('[class^="border-"], [class^="p"], .shadow').forEach(el => {
        el.classList.remove('shadow');

        const classesToRemove = Array.from(el.classList).filter(cls => cls.startsWith('border-'));

        el.classList.remove(...classesToRemove);
    });

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (!m.addedNodes.length) continue;

            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;

                const tooltipInners = node.querySelectorAll(".tooltip-inner");
                tooltipInners.forEach(child => child.classList.remove("tooltip-inner"));

                if (node.id.startsWith("feed-post-")) {
                    node.classList.remove('card-dash', 'card', 'mcard');
                    node.classList.add('window', 'glass');
                    const body = node.firstElementChild
                    body.classList.add('window-body', 'has-space')

                    node.insertAdjacentHTML("afterbegin", `
                    <div class="title-bar" style="background-attachment: local;">
                        <div class="title-bar-text">${node.id}.fp</div>
                        <div class="title-bar-controls">
                            <button aria-label="Close"></button>
                        </div>
                    </div>`);
                }

                if (node.getAttribute("role") === "tooltip") {
                    node.classList.add('is-top', 'is-right')
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
