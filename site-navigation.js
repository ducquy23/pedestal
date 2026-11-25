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

    const navigation = document.querySelector('header[role="banner"] nav[data-slot="navigation-menu"]');
    if (!navigation) return;

    const platformIcons = {
        predictions: '<path d="M3 13l5-5 4 4 9-9M5 17v4m4-7v7m4-5v5m4-8v8m4-12v12"/>',
        intelligence: '<path d="M12 5a3 3 0 0 0-6-1 4 4 0 0 0-2 6 4 4 0 0 0 0 7 4 4 0 0 0 8 1V5ZM6 4a3 3 0 0 0 1 3m-3 3a4 4 0 0 1 2-1m-2 8a4 4 0 0 1 2-2m6-2a3 3 0 0 0-3-3m3 4h6m-6-4h6l2-2m-8-2h3l2-3m-5 15h6l2 2"/><circle cx="17" cy="3" r=".5"/><circle cx="20" cy="8" r=".5"/><circle cx="18" cy="14" r=".5"/><circle cx="20" cy="20" r=".5"/>',
        knowledge: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4m-7 4v-4h14v4"/>',
    };

    const menus = {
        Platform: {
            heading: "The Pedestal platform",
            links: [
                ["Predictions", "/product/predictions", "Build models, put them to work, keep them current", platformIcons.predictions],
                ["Intelligence", "/product/intelligence", "Ask questions and investigate your operation", platformIcons.intelligence],
                ["Knowledge", "/product/knowledge", "The knowledge graph, kept fresh", platformIcons.knowledge],
            ],
        },
        Verticals: {
            heading: "Verticals",
            links: [
                ["Supply Chain & Logistics", "/verticals/supply-chain-logistics"],
                ["Manufacturing", "/verticals/manufacturing"],
                ["Retail", "/verticals/retail"],
            ],
        },
        "Case studies": {
            heading: "Case studies",
            links: [
                ["Fortune 500 Ecommerce Home Retailer", "/customers/ecommerce-home-retailer"],
                ["Maersk", "/customers/maersk"],
                ["Automotive Parts Manufacturer", "/customers/automotive-parts-manufacturer"],
                ["Paper-Goods Manufacturer", "/customers/marcal"],
            ],
        },
    };

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

    for (const trigger of navigation.querySelectorAll('[data-slot="navigation-menu-trigger"]')) {
        const group = menus[trigger.textContent.trim()];
        if (!group) continue;

        const item = trigger.closest("li");
        const dropdown = document.createElement("div");
        const card = document.createElement("div");
        const heading = document.createElement("p");
        const links = document.createElement("ul");
        dropdown.className = "site-navigation-dropdown";
        dropdown.id = "site-navigation-" + group.heading.toLowerCase().replaceAll(" ", "-");
        dropdown.hidden = true;
        card.className = "site-navigation-card";
        heading.textContent = group.heading;
        card.append(heading, links);
        dropdown.append(card);
        trigger.setAttribute("aria-controls", dropdown.id);
        item.append(dropdown);

        for (const [label, path, description, iconMarkup] of group.links) {
            const row = document.createElement("li");
            const link = document.createElement("a");
            link.href = pageUrl(path);
            link.textContent = label;
            if (link.href === location.href.split(/[?#]/, 1)[0]) link.setAttribute("aria-current", "page");
            if (iconMarkup) {
                const icon = document.createElement("span");
                const copy = document.createElement("span");
                const detail = document.createElement("span");
                link.className = "site-navigation-feature";
                icon.className = "site-navigation-icon";
                icon.setAttribute("aria-hidden", "true");
                icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconMarkup}</svg>`;
                copy.className = "site-navigation-copy";
                copy.textContent = label;
                detail.className = "site-navigation-description";
                detail.textContent = description;
                copy.append(detail);
                link.replaceChildren(icon, copy);
            }
            row.append(link);
            links.append(row);
        }

        const menu = { trigger, dropdown };
        item.addEventListener("pointerenter", event => {
            if (event.pointerType === "mouse") showMenu(menu);
        });
        item.addEventListener("pointerleave", event => {
            if (event.pointerType === "mouse" && openMenu === menu && !dropdown.contains(document.activeElement)) closeMenu();
        });
        item.addEventListener("focusout", event => {
            if (openMenu === menu && !item.contains(event.relatedTarget) && !item.matches(":hover")) closeMenu();
        });
        trigger.addEventListener("click", () => {
            if (openMenu === menu) closeMenu();
            else showMenu(menu);
        });
        trigger.addEventListener("keydown", event => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            showMenu(menu);
            links.querySelector("a").focus();
        });
    }

    document.addEventListener("pointerdown", event => {
        if (openMenu && !openMenu.trigger.closest("li").contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", event => {
        if (!openMenu || event.key !== "Escape") return;
        const { trigger, dropdown } = openMenu;
        if (dropdown.contains(document.activeElement)) trigger.focus();
        closeMenu();
    });
})();
