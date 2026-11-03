/* Shared navigation, page flow, and small interactions for every page.
   Edit PAGES below to add or rename pages. */
(() => {
    "use strict";

    const REQUIRE_LOGIN = true;               // set to false to open pages without logging in
    const OWNER = "John Lester Francisco";
    const SESSION_KEY = "johnLesterLoggedIn";
    const FLOW_KEY = "johnLesterFlow";

    // Page order = panel flow order (used by the Previous / Next links and slide direction).
    const PAGES = [
        { file: "index.html",    label: "Home",      group: null },
        { file: "skills.html",   label: "Skills",    group: "about" },
        { file: "goals.html",    label: "Goals",     group: "about" },
        { file: "funfacts.html", label: "Fun Facts", group: "about" },
        { file: "gallery.html",  label: "Gallery",   group: null },
        { file: "contact.html",  label: "Contact",   group: null }
    ];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const currentIndex = Math.max(0, PAGES.findIndex(p => p.file === currentFile));

    function isLoggedIn() {
        try { return localStorage.getItem(SESSION_KEY) === "true"; } catch (e) { return false; }
    }

    if (REQUIRE_LOGIN && !isLoggedIn()) {
        location.replace("login.html");
        return;
    }

    document.documentElement.classList.add("js");

    function logout(event) {
        if (event) event.preventDefault();
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
        location.href = "login.html";
    }

    /* ---------- Build navigation ---------- */
    function link(page, extraClass) {
        const a = document.createElement("a");
        a.href = page.file;
        a.textContent = page.label;
        if (extraClass) a.className = extraClass;
        if (page.file === currentFile) a.setAttribute("aria-current", "page");
        return a;
    }

    function buildNav() {
        const aboutPages = PAGES.filter(p => p.group === "about");
        const aboutActive = aboutPages.some(p => p.file === currentFile);

        const nav = document.createElement("nav");
        nav.className = "site-nav";
        nav.setAttribute("aria-label", "Main navigation");

        const bar = document.createElement("div");
        bar.className = "nav-bar";

        const brand = document.createElement("a");
        brand.className = "nav-name";
        brand.href = "index.html";
        brand.textContent = OWNER;
        brand.setAttribute("aria-label", OWNER + " - Home");

        const burger = document.createElement("button");
        burger.type = "button";
        burger.className = "nav-burger";
        burger.setAttribute("aria-label", "Open menu");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-controls", "navLinks");
        burger.innerHTML = "<span></span><span></span><span></span>";

        const links = document.createElement("div");
        links.className = "nav-links";
        links.id = "navLinks";

        links.appendChild(link(PAGES[0]));

        const dd = document.createElement("div");
        dd.className = "nav-dropdown";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "about-toggle" + (aboutActive ? " is-current" : "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "aboutDropdown");
        toggle.innerHTML = 'About <span class="arrow" aria-hidden="true">&#9662;</span>';
        const menu = document.createElement("div");
        menu.className = "dropdown-menu";
        menu.id = "aboutDropdown";
        aboutPages.forEach(p => menu.appendChild(link(p)));
        dd.append(toggle, menu);
        links.appendChild(dd);

        PAGES.filter(p => !p.group && p.file !== "index.html").forEach(p => links.appendChild(link(p)));

        const out = document.createElement("a");
        out.href = "#";
        out.className = "logout";
        out.textContent = "Logout";
        out.addEventListener("click", logout);
        links.appendChild(out);

        bar.append(brand, burger, links);

        const progress = document.createElement("div");
        progress.className = "nav-progress";
        progress.setAttribute("aria-hidden", "true");

        nav.append(bar, progress);
        document.body.insertAdjacentElement("afterbegin", nav);

        /* Dropdown + mobile menu logic */
        function setDropdown(open) {
            menu.classList.toggle("show", open);
            toggle.setAttribute("aria-expanded", String(open));
        }
        function setMenu(open) {
            links.classList.toggle("open", open);
            burger.classList.toggle("open", open);
            burger.setAttribute("aria-expanded", String(open));
            burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            if (!open) setDropdown(false);
        }

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            setDropdown(!menu.classList.contains("show"));
        });
        burger.addEventListener("click", (e) => {
            e.stopPropagation();
            setMenu(!links.classList.contains("open"));
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".nav-dropdown")) setDropdown(false);
            if (!e.target.closest(".site-nav")) setMenu(false);
        });
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (menu.classList.contains("show")) { setDropdown(false); toggle.focus(); }
            else if (links.classList.contains("open")) { setMenu(false); burger.focus(); }
        });
        window.addEventListener("resize", () => { if (window.innerWidth > 760) setMenu(false); });

        /* Hide on scroll down, show on scroll up, plus a progress line */
        let lastY = window.scrollY;
        let ticking = false;
        function onScroll() {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
            nav.classList.toggle("scrolled", y > 10);
            const busy = menu.classList.contains("show") || links.classList.contains("open") || nav.contains(document.activeElement);
            if (y > lastY + 6 && y > 140 && !busy) nav.classList.add("hidden");
            else if (y < lastY - 6 || y <= 140) nav.classList.remove("hidden");
            lastY = y;
            ticking = false;
        }
        window.addEventListener("scroll", () => {
            if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
        }, { passive: true });
        nav.addEventListener("focusin", () => nav.classList.remove("hidden"));
        onScroll();
    }

    /* ---------- Panel flow: direction-aware page transitions ---------- */
    function setupFlow() {
        let dir = "";
        try { dir = sessionStorage.getItem(FLOW_KEY) || ""; sessionStorage.removeItem(FLOW_KEY); } catch (e) { /* ignore */ }
        if (dir && !reduceMotion) {
            document.body.classList.add("enter-" + dir);
            window.setTimeout(() => document.body.classList.remove("enter-" + dir), 700);
        }

        document.addEventListener("click", (e) => {
            const a = e.target.closest("a[href]");
            if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || url.pathname === location.pathname) return;
            const file = url.pathname.split("/").pop().toLowerCase();
            const targetIndex = PAGES.findIndex(p => p.file === file);
            if (targetIndex < 0) return;
            e.preventDefault();
            try { sessionStorage.setItem(FLOW_KEY, targetIndex > currentIndex ? "next" : "prev"); } catch (err) { /* ignore */ }
            if (reduceMotion) { location.href = url.href; return; }
            document.body.classList.add(targetIndex > currentIndex ? "leave-next" : "leave-prev");
            window.setTimeout(() => { location.href = url.href; }, 260);
        });

        // Coming back with the browser Back button should not stay faded out.
        window.addEventListener("pageshow", (e) => {
            if (e.persisted) document.body.classList.remove("leave-next", "leave-prev");
        });
    }

    /* ---------- Previous / Next panel links at the bottom of each page ---------- */
    function buildPager() {
        const footer = document.querySelector("footer");
        if (!footer) return;
        const prev = PAGES[currentIndex - 1];
        const next = PAGES[currentIndex + 1];
        if (!prev && !next) return;

        const pager = document.createElement("nav");
        pager.className = "pager";
        pager.setAttribute("aria-label", "Page navigation");
        if (prev) {
            const a = document.createElement("a");
            a.href = prev.file;
            a.className = "pager-prev";
            a.innerHTML = '<small>Previous</small><span></span>';
            a.querySelector("span").textContent = prev.label;
            pager.appendChild(a);
        }
        if (next) {
            const a = document.createElement("a");
            a.href = next.file;
            a.className = "pager-next";
            a.innerHTML = '<small>Next</small><span></span>';
            a.querySelector("span").textContent = next.label;
            pager.appendChild(a);
        }
        footer.insertAdjacentElement("beforebegin", pager);
    }

    /* ---------- Reveal panels as they scroll into view ---------- */
    function setupReveal() {
        const items = document.querySelectorAll(".card, .fact-card, .profile, .hero-card, .contact-form, .slideshow, .section-title");
        if (!("IntersectionObserver" in window) || reduceMotion) {
            items.forEach(el => el.classList.add("in"));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
            });
        }, { threshold: 0.12 });
        items.forEach((el, i) => {
            el.setAttribute("data-reveal", "");
            el.style.setProperty("--d", (i % 3) * 70 + "ms");
            io.observe(el);
        });
    }

    /* ---------- Cards that work with keyboard and touch ---------- */
    function setupCards() {
        document.querySelectorAll(".goal-card").forEach(card => {
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-expanded", "false");
            const toggle = () => {
                const open = card.classList.toggle("open");
                card.setAttribute("aria-expanded", String(open));
            };
            card.addEventListener("click", toggle);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
            });
        });
        document.querySelectorAll(".fact-card").forEach(card => {
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            const flip = () => card.classList.toggle("flipped");
            card.addEventListener("click", flip);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
            });
        });
    }

    function init() {
        buildNav();
        buildPager();
        setupFlow();
        setupCards();
        setupReveal();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
