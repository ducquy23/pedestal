(() => {
    const siteRoot = new URL(".", document.currentScript.src);
    const usesHtmlPaths = location.protocol === "file:" || location.pathname.endsWith(".html") ||
        Array.from(document.scripts).some(script => script.textContent.includes("IsThisFirstTime_Log_From_LiveServer"));

    function pageUrl(path) {
        const url = new URL(path.slice(1), siteRoot);
        if (usesHtmlPaths) {
            url.pathname += url.pathname === siteRoot.pathname ? "index.html" : ".html";
        }
        return url.href;
    }

    if (usesHtmlPaths) {
        for (const link of document.querySelectorAll('a[href^="/"]:not([href^="//"])')) {
            link.href = pageUrl(link.getAttribute("href"));
        }
    }

    const header = document.querySelector('header[role="banner"]');
    const navigation = header?.querySelector('nav[data-slot="navigation-menu"]');
    if (!navigation) return;

    const mobileToggle = header.querySelector('button[aria-controls="mobile-navigation"]');
    const mobilePanel = navigation.parentElement;
    const mobileLayout = window.matchMedia("(width < 64rem)");

    const icons = {
        predictions: '<path d="M3 13l5-5 4 4 9-9M5 17v4m4-7v7m4-5v5m4-8v8m4-12v12"/>',
        intelligence: '<path d="M12 5a3 3 0 0 0-6-1 4 4 0 0 0-2 6 4 4 0 0 0 0 7 4 4 0 0 0 8 1V5ZM6 4a3 3 0 0 0 1 3m-3 3a4 4 0 0 1 2-1m-2 8a4 4 0 0 1 2-2m6-2a3 3 0 0 0-3-3m3 4h6m-6-4h6l2-2m-8-2h3l2-3m-5 15h6l2 2"/><circle cx="17" cy="3" r=".5"/><circle cx="20" cy="8" r=".5"/><circle cx="18" cy="14" r=".5"/><circle cx="20" cy="20" r=".5"/>',
        knowledge: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4m-7 4v-4h14v4"/>',
        truck: '<path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2m4 0h6m4 0h2a1 1 0 0 0 1-1v-3l-3-5h-5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
        factory: '<path d="M3 20V4h4v9l5-3v3l5-3v3l4-3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm6-3h.01m3.99 0h.01m3.99 0h.01"/>',
        bag: '<rect x="3" y="6" width="18" height="16" rx="2"/><path d="m3.6 6.8 2.8-4A2 2 0 0 1 8 2h8a2 2 0 0 1 1.6.8l2.8 4M16 10a4 4 0 0 1-8 0"/>',
        ship: '<path d="M12 2v3M5 13V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M4 19l-2-5 10-4 10 4-2 5m-8-9v6M2 21c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
        boxes: '<path d="m12 2 5 3v6l-5 3-5-3V5l5-3Zm0 6 5-3m-5 3L7 5m5 3v6M7 10l-5 3v6l5 3 5-3v-5M2 13l5 3 5-2m-5 2v6m10-12 5 3v6l-5 3-5-3m0-5 5 2 5-3m-5 3v6"/>',
        file: '<path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 0v6h6M8 10h2m-2 4h8m-8 4h8"/>',
    };

    const menus = {
        Platform: [{
            heading: "The Pedestal platform",
            links: [
                ["Predictions", "/product/predictions", "Build models, put them to work, keep them current", icons.predictions],
                ["Intelligence", "/product/intelligence", "Ask questions and investigate your operation", icons.intelligence],
                ["Knowledge", "/product/knowledge", "The knowledge graph, kept fresh", icons.knowledge],
            ],
        }],
        Verticals: [{
            heading: "Built for your industry",
            links: [
                ["Supply Chain & Logistics", "/verticals/supply-chain-logistics", "Visibility across carriers, lanes, and handoffs", icons.truck],
                ["Manufacturing", "/verticals/manufacturing", "Plant-level knowledge as governed agents", icons.factory],
                ["Retail", "/verticals/retail", "High-volume coordination at last-mile", icons.bag],
            ],
        }],
        "Case studies": [
            {
                heading: "Retail & E-commerce",
                links: [
                    ["Fortune 500 home retailer", "/customers/ecommerce-home-retailer", "Voice and SMS agents at delivery scale", icons.bag],
                ],
            },
            {
                heading: "Transportation & Logistics",
                links: [
                    ["Maersk", "/customers/maersk", "Years of expertise, ready to query", icons.ship],
                ],
            },
            {
                heading: "Manufacturing",
                links: [
                    ["Automotive parts manufacturer", "/customers/automotive-parts-manufacturer", "Multi-OEM documents, validated at volume", icons.boxes],
                    ["Marcal Paper", "/customers/marcal", "From ERP data to executive intelligence", icons.file],
                ],
            },
        ],
    };

    function createMenuLink([label, path, description, iconMarkup]) {
        const row = document.createElement("li");
        const link = document.createElement("a");
        const icon = document.createElement("span");
        const copy = document.createElement("span");
        const detail = document.createElement("span");
        link.className = "site-navigation-feature";
        link.href = pageUrl(path);
        if (link.href === location.href.split(/[?#]/, 1)[0]) link.setAttribute("aria-current", "page");
        icon.className = "site-navigation-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconMarkup}</svg>`;
        copy.className = "site-navigation-copy";
        copy.textContent = label;
        detail.className = "site-navigation-description";
        detail.textContent = description;
        copy.append(detail);
        link.append(icon, copy);
        row.append(link);
        return row;
    }

    let openMenu;

    function closeMenu() {
        if (!openMenu) return;
        const { trigger, dropdown } = openMenu;
        trigger.setAttribute("aria-expanded", "false");
        trigger.dataset.state = "closed";
        dropdown.hidden = true;
        openMenu = undefined;
    }

    function showMenu(menu) {
        if (openMenu === menu) return;
        closeMenu();
        openMenu = menu;
        menu.trigger.setAttribute("aria-expanded", "true");
        menu.trigger.dataset.state = "open";
        menu.dropdown.hidden = false;
    }

    function setMobileOpen(open) {
        if (!mobileToggle) return;
        if (!open) closeMenu();
        header.classList.toggle("site-navigation-mobile-open", open);
        if (open) mobilePanel.scrollTop = 0;
        mobileToggle.setAttribute("aria-expanded", String(open));
        mobileToggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    }

    if (mobileToggle) {
        mobilePanel.id = "mobile-navigation";
        mobileToggle.classList.add("site-navigation-mobile-toggle");
        mobileToggle.addEventListener("click", () => {
            setMobileOpen(mobileToggle.getAttribute("aria-expanded") !== "true");
        });
        mobilePanel.addEventListener("click", event => {
            if (mobileLayout.matches && event.target.closest("a")) setMobileOpen(false);
        });
        header.addEventListener("focusout", event => {
            if (mobileLayout.matches && event.relatedTarget && !header.contains(event.relatedTarget)) setMobileOpen(false);
        });
        mobileLayout.addEventListener("change", () => setMobileOpen(false));
    }

    for (const trigger of navigation.querySelectorAll('[data-slot="navigation-menu-trigger"]')) {
        const name = trigger.textContent.trim();
        const sections = menus[name];
        if (!sections) continue;

        const item = trigger.closest("li");
        const dropdown = document.createElement("div");
        const card = document.createElement("div");
        dropdown.className = "site-navigation-dropdown";
        dropdown.id = "site-navigation-" + name.toLowerCase().replaceAll(" ", "-");
        dropdown.hidden = true;
        card.className = "site-navigation-card";
        dropdown.append(card);
        trigger.setAttribute("aria-controls", dropdown.id);
        item.append(dropdown);

        for (const { heading, links } of sections) {
            const section = document.createElement("div");
            const title = document.createElement("p");
            const list = document.createElement("ul");
            section.className = "site-navigation-section";
            title.textContent = heading;
            list.setAttribute("aria-label", heading);
            list.append(...links.map(createMenuLink));
            section.append(title, list);
            card.append(section);
        }

        const menu = { trigger, dropdown };
        item.addEventListener("pointerenter", event => {
            if (!mobileLayout.matches && event.pointerType === "mouse") showMenu(menu);
        });
        item.addEventListener("pointerleave", event => {
            if (!mobileLayout.matches && event.pointerType === "mouse" && openMenu === menu && !dropdown.contains(document.activeElement)) closeMenu();
        });
        item.addEventListener("focusout", event => {
            if (!mobileLayout.matches && openMenu === menu && !item.contains(event.relatedTarget) && !item.matches(":hover")) closeMenu();
        });
        trigger.addEventListener("click", () => {
            if (openMenu === menu) closeMenu();
            else showMenu(menu);
        });
        trigger.addEventListener("keydown", event => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            showMenu(menu);
            card.querySelector("a").focus();
        });
    }

    document.addEventListener("pointerdown", event => {
        if (mobileLayout.matches) {
            if (!header.contains(event.target)) setMobileOpen(false);
        } else if (openMenu && !openMenu.trigger.closest("li").contains(event.target)) {
            closeMenu();
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (openMenu) {
            const { trigger, dropdown } = openMenu;
            if (dropdown.contains(document.activeElement)) trigger.focus();
            closeMenu();
        } else if (mobileToggle?.getAttribute("aria-expanded") === "true") {
            setMobileOpen(false);
            mobileToggle.focus();
        }
    });
})();
