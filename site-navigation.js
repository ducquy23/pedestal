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

    const menus = {
        Platform: {
            heading: "The Pedestal platform",
            links: [
                ["Predictions", "/product/predictions", "Build models, put them to work, keep them current"],
                ["Intelligence", "/product/intelligence", "Ask questions and investigate your operation"],
                ["Knowledge", "/product/knowledge", "The knowledge graph, kept fresh"],
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

        for (const [label, path, description] of group.links) {
            const row = document.createElement("li");
            const link = document.createElement("a");
            link.href = pageUrl(path);
            link.textContent = label;
            if (link.href === location.href.split(/[?#]/, 1)[0]) link.setAttribute("aria-current", "page");
            if (description) {
                const detail = document.createElement("span");
                detail.textContent = description;
                link.append(detail);
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
