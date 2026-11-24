(() => {
    const siteRoot = new URL(".", document.currentScript.src);
    const navigation = document.querySelector('header[role="banner"] nav[data-slot="navigation-menu"]');
    if (!navigation) return;

    const menus = {
        Platform: {
            heading: "The Pedestal platform",
            links: [
                ["Predictions", "product/predictions.html", "Build models, put them to work, keep them current"],
                ["Intelligence", "product/intelligence.html", "Ask questions and investigate your operation"],
                ["Knowledge", "product/knowledge.html", "The knowledge graph, kept fresh"],
            ],
        },
        Verticals: {
            heading: "Verticals",
            links: [
                ["Supply Chain & Logistics", "verticals/supply-chain-logistics.html"],
                ["Manufacturing", "verticals/manufacturing.html"],
                ["Retail", "verticals/retail.html"],
            ],
        },
        "Case studies": {
            heading: "Case studies",
            links: [
                ["Fortune 500 Ecommerce Home Retailer", "customers/ecommerce-home-retailer.html"],
                ["Maersk", "customers/maersk.html"],
                ["Automotive Parts Manufacturer", "customers/automotive-parts-manufacturer.html"],
                ["Paper-Goods Manufacturer", "customers/marcal.html"],
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
            link.href = new URL(path, siteRoot).href;
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
