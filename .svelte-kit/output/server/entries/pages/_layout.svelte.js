import { V as escape_html, a as ensure_array_like, c as stringify, i as derived, n as attr_class, z as attr } from "../../chunks/dev.js";
import { t as BurgeeLogo } from "../../chunks/BurgeeLogo.js";
//#region src/lib/themes/theme.svelte.ts
var THEMES = [{
	id: "um-dark",
	label: "U-M Dark",
	icon: "🌙"
}, {
	id: "um-light",
	label: "U-M Light",
	icon: "☀️"
}];
var STORAGE_KEY = "raceready-theme";
var DEFAULT_THEME = "um-dark";
function createThemeStore() {
	let current = DEFAULT_THEME;
	function apply(id) {
		current = id;
		document.documentElement.setAttribute("data-theme", id);
		try {
			localStorage.setItem(STORAGE_KEY, id);
		} catch {}
	}
	function init() {
		let saved = DEFAULT_THEME;
		try {
			saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
		} catch {}
		if (!THEMES.find((t) => t.id === saved)) saved = DEFAULT_THEME;
		apply(saved);
	}
	return {
		get current() {
			return current;
		},
		set(id) {
			apply(id);
		},
		toggle() {
			apply(THEMES[(THEMES.findIndex((t) => t.id === current) + 1) % THEMES.length].id);
		},
		init
	};
}
var theme = createThemeStore();
//#endregion
//#region src/lib/components/Dropdown.svelte
function Dropdown($$renderer, $$props) {
	let { label, items, isOpen, onToggle, onClose } = $$props;
	$$renderer.push(`<div class="nav-dropdown svelte-1fd3ybn"><button${attr_class("dropdown-trigger svelte-1fd3ybn", void 0, { "active": isOpen })}${attr("aria-expanded", isOpen)} aria-haspopup="true">${escape_html(label)} <svg${attr_class("chevron svelte-1fd3ybn", void 0, { "rotated": isOpen })} width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> `);
	if (isOpen) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<ul class="dropdown-menu svelte-1fd3ybn" role="menu"><!--[-->`);
		const each_array = ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<li role="menuitem"><a class="dropdown-item svelte-1fd3ybn"${attr("href", item.href)}>`);
			if (item.icon) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="item-icon svelte-1fd3ybn">${escape_html(item.icon)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> ${escape_html(item.label)}</a></li>`);
		}
		$$renderer.push(`<!--]--></ul>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/lib/components/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { theme } = $$props;
		let openDropdown = null;
		function toggleDropdown(name) {
			openDropdown = openDropdown === name ? null : name;
		}
		let nextTheme = derived(() => THEMES[(THEMES.findIndex((t) => t.id === theme.current) + 1) % THEMES.length]);
		const studyItems = [
			{
				label: "Racing Rules",
				href: "/study/racing-rules",
				icon: "⚖️"
			},
			{
				label: "Tactics & Strategy",
				href: "/study/tactics",
				icon: "🧭"
			},
			{
				label: "Boat Knowledge",
				href: "/study/boat-knowledge",
				icon: "⛵"
			},
			{
				label: "General Knowledge",
				href: "/study/general",
				icon: "📚"
			},
			{
				label: "Knots",
				href: "/study/knots",
				icon: "🪢"
			}
		];
		const resourceItems = [{
			label: "Racing Rules of Sailing",
			href: "/resources/rulebook",
			icon: "📖"
		}, {
			label: "Whiteboard",
			href: "/resources/whiteboard",
			icon: "🖊️"
		}];
		const gameItems = [{
			label: "Starboard Showdown",
			href: "/games/starboard",
			icon: "🏁"
		}, {
			label: "Regatta Run",
			href: "/games/regatta-run",
			icon: "🏆"
		}];
		$$renderer.push(`<nav class="navbar svelte-rfuq4y"><div class="nav-inner svelte-rfuq4y"><a class="brand svelte-rfuq4y" href="/">`);
		BurgeeLogo($$renderer, { size: 34 });
		$$renderer.push(`<!----> <span class="brand-name svelte-rfuq4y">RaceReady</span></a> <div class="nav-links svelte-rfuq4y">`);
		Dropdown($$renderer, {
			label: "Study",
			items: studyItems,
			isOpen: openDropdown === "study",
			onToggle: () => toggleDropdown("study"),
			onClose: () => {
				openDropdown = null;
			}
		});
		$$renderer.push(`<!----> `);
		Dropdown($$renderer, {
			label: "Resources",
			items: resourceItems,
			isOpen: openDropdown === "resources",
			onToggle: () => toggleDropdown("resources"),
			onClose: () => {
				openDropdown = null;
			}
		});
		$$renderer.push(`<!----> `);
		Dropdown($$renderer, {
			label: "Games",
			items: gameItems,
			isOpen: openDropdown === "games",
			onToggle: () => toggleDropdown("games"),
			onClose: () => {
				openDropdown = null;
			}
		});
		$$renderer.push(`<!----></div> <div class="nav-actions svelte-rfuq4y"><button class="theme-toggle svelte-rfuq4y"${attr("title", `Switch to ${stringify(nextTheme().label)} theme`)}${attr("aria-label", `Switch to ${stringify(nextTheme().label)} theme`)}><span class="theme-icon svelte-rfuq4y">${escape_html(nextTheme().icon)}</span> <span class="theme-label svelte-rfuq4y">${escape_html(nextTheme().label)}</span></button> <a class="btn-primary nav-cta svelte-rfuq4y" href="/games/starboard">Play Now</a></div></div></nav>`);
	});
}
//#endregion
//#region src/lib/components/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const studyLinks = [
			{
				label: "Racing Rules",
				href: "/study/racing-rules"
			},
			{
				label: "Tactics & Strategy",
				href: "/study/tactics"
			},
			{
				label: "Boat Knowledge",
				href: "/study/boat-knowledge"
			},
			{
				label: "General Knowledge",
				href: "/study/general"
			},
			{
				label: "Knots",
				href: "/study/knots"
			}
		];
		const resourceLinks = [{
			label: "Racing Rules of Sailing",
			href: "/resources/rulebook"
		}, {
			label: "Whiteboard",
			href: "/resources/whiteboard"
		}];
		const gameLinks = [{
			label: "Starboard Showdown",
			href: "/games/starboard"
		}, {
			label: "Regatta Run",
			href: "/games/regatta-run"
		}];
		function linkCol($$renderer, heading, links) {
			$$renderer.push(`<div class="link-col svelte-jz8lnl"><h4 class="col-heading svelte-jz8lnl">${escape_html(heading)}</h4> <ul class="svelte-jz8lnl"><!--[-->`);
			const each_array = ensure_array_like(links);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let link = each_array[$$index];
				$$renderer.push(`<li><a class="footer-link svelte-jz8lnl"${attr("href", link.href)}>${escape_html(link.label)}</a></li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		}
		$$renderer.push(`<footer class="footer svelte-jz8lnl"><div class="container footer-inner svelte-jz8lnl"><div class="footer-brand svelte-jz8lnl"><a class="brand-link svelte-jz8lnl" href="/">`);
		BurgeeLogo($$renderer, { size: 28 });
		$$renderer.push(`<!----> <span class="brand-name svelte-jz8lnl">RaceReady</span></a> <p class="brand-tagline svelte-jz8lnl">Your complete sailing race<br/>education platform.</p></div> <div class="footer-links svelte-jz8lnl">`);
		linkCol($$renderer, "Study", studyLinks);
		$$renderer.push(`<!----> `);
		linkCol($$renderer, "Resources", resourceLinks);
		$$renderer.push(`<!----> `);
		linkCol($$renderer, "Games", gameLinks);
		$$renderer.push(`<!----></div></div> <div class="footer-bottom svelte-jz8lnl"><div class="container footer-bottom-inner svelte-jz8lnl"><p class="copyright svelte-jz8lnl">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} RaceReady. All rights reserved.</p> <p class="rules-note svelte-jz8lnl">Racing Rules of Sailing 2025–2028 · World Sailing</p></div></div></footer>`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		Navbar($$renderer, { theme });
		$$renderer.push(`<!----> <main class="svelte-12qhfyh">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _layout as default };
