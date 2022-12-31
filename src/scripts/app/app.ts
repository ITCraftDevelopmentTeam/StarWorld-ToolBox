import * as $ from "jquery";
import * as hashpath from "./utils/hashpath";
import * as pages from "./pages/all";
import * as autocompleter from "../includes/autocomplete";
import lazyload from "../includes/lazyload";

export interface APPConfig {
    api: {
        url: string;
    }
}

export type callbackGetValue <T> = (...args) => T;

export function getCallbackValue (callback, args=[]): any {
    if (typeof callback == "function") {
        return callback(...args);
    } else {
        return callback;
    }
}

export interface PageContext {
    type: string | callbackGetValue <string>;
    id: string | callbackGetValue <string>;
    icon: string | callbackGetValue <string>;
    title: string | callbackGetValue <string>;
    content: (tabPane: JQuery) => void;
}

export interface NavbarContext {
    title: string | callbackGetValue <string>,
    type: string | callbackGetValue <string>,
    body: (
        {
            type: string | callbackGetValue <string>,
            items?: JQuery[] | callbackGetValue <JQuery[]>
        }
    )[] | callbackGetValue <any[]>;
}

export class APP {

    public app: JQuery;
    public config: APPConfig;
    public id: string;
    public events: {
        [index: string]: ((...args) => any)[]
    } = {};

    constructor (element: HTMLElement | JQuery, config: APPConfig) {
        this.app = $(element);
        this.config = config;
        this.id = "app-" + "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);return v.toString(16);}) + "-" + new Date().getTime();
    }

    getConstants() {
        let that = this;
        const defaultNavbarContext: NavbarContext = {
            "type": "navbar",
            "title": "StarWorld 工具箱",
            "body": [
                {
                    "type": "item",
                    "items": [
                        $("<a>").append($("<i>").addClass("fa fa-house")).append(" 主页").addClass("nav-link").on("click", () => location.hash = ""),
                    ],
                }
            ],
        };
        const pageContextData = {};
        const defaultPageContext: PageContext[] = [
            {
                type: "tab",
                id: "all",
                icon: () => {
                    pageContextData["all"] = pageContextData["all"] || {icon: 0};
                    let list = Array.from(new Set(["earth-americas", "earth-oceania", "earth-europe", "earth-asia", "earth-africa"]));
                    setInterval(
                        () => {
                            $(`#${that.id}-tabs-all-tab`).find(
                                "li"
                            ).attr(
                                "class", ""
                            ).addClass(`fa fa-${list[pageContextData["all"]["icon"]]}`);
                            pageContextData["all"]["icon"] ++;
                            if (pageContextData["all"]["icon"] == list.length) pageContextData["all"]["icon"] = 0;
                        }, 100
                    )
                    return `fa fa-${list[pageContextData["all"]["icon"]]}`;
                },
                title: " 全部",
                content: (tabPane: JQuery) => {
                    that.initPageHome(tabPane).hide().fadeIn(250);
                },
            },
        ];
        return {
            defaultNavbarContext, defaultPageContext, pageContextData
        }
    }

    init (): this {
        let that = this;
        let navbarContext, pageContext, doEvent, showSearch;
        if (location.hash == "" || location.hash == "#") {
            const constants = this.getConstants();
            navbarContext = constants.defaultNavbarContext;
            pageContext = constants.defaultPageContext;
            showSearch = true;
            doEvent = true;
            for (let i of pages.categorizes) {
                pageContext.push(
                    {
                        type: "tab", id: i.id, icon: i.icon, title: i.title,
                        content: (tabPane: JQuery) => {
                            let itemCount = 0;
                            for (let j in pages.pages) {
                                let l = pages.pages[j];
                                if (l.button && l.categorizes) {
                                    if (l.categorizes.indexOf(i.id) != -1) {
                                        itemCount ++;
                                        $(tabPane).append(
                                            $(l.button.clone(true)
                                            ).on("click",
                                                () => {
                                                        if (l.newpage == true || l.newpage == null) location.hash = "!" + j;
                                                        else {
                                                            if (l.init) {
                                                                l.init(that);
                                                            }
                                                        }
                                                }
                                            ).css("text-transform", "none"
                                            ).css("margin-right", "0.4rem"
                                            ).css("margin-top", "0.4rem")
                                        );
                                    }
                                }
                            }
                            if (itemCount == 0) $(tabPane).append($("<p>").text("空"))
                        },
                    }
                );
            }
        } else {
            if (hashpath.isHashPath(location.hash)) {
                try {
                    if (new hashpath.HashPath(location.hash).toString(false, true) in pages.pages) {
                        const constants = this.getConstants();
                        let item = pages.pages[new hashpath.HashPath(location.hash).toString(false, true)];
                        doEvent = item.events;
                        showSearch = item.search;
                        if (item.navbar === "default") navbarContext = constants.defaultNavbarContext;
                        else if ("navbar" in item) navbarContext = getCallbackValue(item["navbar"], [that]);
                        if (typeof item.init == "function") this.on("ready", () => item.init(that));
                        if (item.pages === "default") pageContext = constants.defaultPageContext;
                        else if (item.pages != undefined) pageContext = getCallbackValue(item.pages, [that]);
                    } else {
                        doEvent = true;
                        showSearch = true;
                        this.initNavbar(this.getConstants().defaultNavbarContext);
                        this.app.append($("<div class='container'>").append($("<h1>").text(`Page Not Found: ${location.hash}`)));
                    }
                } catch {
                    const constants = this.getConstants();
                    navbarContext = constants.defaultNavbarContext;
                    pageContext = constants.defaultPageContext;
                    showSearch = true;
                    doEvent = true;
                }
            } else {
                doEvent = true;
                showSearch = true;
                this.initNavbar(this.getConstants().defaultNavbarContext);
                this.app.append($("<div class='container'>").append($("<h1>").text(`Cannot Get: ${location.hash}`)));
            }
        }
        if (navbarContext) this.initNavbar(navbarContext);
        if (showSearch) this.initNavbarSearch();
        if (pageContext) this.initPage(pageContext);
        if (doEvent) this.initEvents();
        this.trigger("ready");
        return that;
    }

    on (event, handle) {
        if (!(event in this.events)) {
            this.events[event] = [];
        }
        this.events[event].push(handle);
    }

    trigger (event, args?) {
        for (let i of (this.events[event] || [])) {
            i(...(args || []));
        }
    }

    initNavbarSearch () {
        let list = [];
        for (let i in pages.pages) {
            if (pages.pages[i].newpage == true || pages.pages[i].newpage == null) {
                list.push(i);
            }
        }
        let input = $("<input class='form-control' autocomplete='off'>").attr("id", `${this.id}-navbar-input`);
        let checker = (v: string, i: string) => {
            return v.indexOf(i);
        };
        let callback = (e: JQuery) => {};
        let click = () => {
            location.hash = "!" + input.val().toString();
        }
        $(`#${this.id}-navbar`).append(
            $("<div class='d-flex input-group w-auto'>").append(
                $(
                    autocompleter.autocomplete(
                        input,
                        list,
                        checker,
                        callback
                    )
                )
            ).append(
                $("<button class='btn btn-primary'>").append(
                    "<i class='fa fa-search'>"
                ).on("click", click)
            )
        );
    }

    initEvents () {
        /* Image Lazy Load */
        $(window).on("scroll", () => lazyload(".lazyload"));
        lazyload(".lazyload");
    }

    initNavbar (context: NavbarContext): JQuery {
        let navbar = $("<nav>").addClass("navbar navbar-expand-lg navbar-light bg-light sticky-top").appendTo(this.app);
        let navbarContainer = $("<div>").addClass("container").append(
            $("<a>").addClass("navbar-brand").attr("src", "javascript:void(0);").text(getCallbackValue(context.title))
        ).append(
            $(`<button class="navbar-toggler" data-mdb-toggle="collapse" aria-expanded="false">`)
                .attr("data-mdb-target", `#${this.id}-navbar`)
                .append($("<i>").addClass("fas fa-bars"))
        ).appendTo(navbar);
        let navbarCollapse = $("<div>").attr("id", `${this.id}-navbar`).addClass("collapse navbar-collapse").appendTo(navbarContainer);
        let navbarNav = $("<ul class='navbar-nav me-auto mb-2 mb-lg-0'>").appendTo(navbarCollapse);
        for (let i of getCallbackValue(context.body)) {
            void this.initNavbarContext(i, navbarNav);
        }
        $(this.app).append($("<br>"))
        return navbar;
    }

    async initNavbarContext (context, navbar) {
        if (getCallbackValue(context.type) === "item") {
            let navItem = $("<li>").addClass("nav-item").appendTo(navbar);
            for (let item of context.items) navItem.append(getCallbackValue(item));
        }
    }

    initPage (context): JQuery {
        let that = this;
        let tab = $("<div class='row w-100'>");
        let tabNav = $("<div class='col-2'>").append().appendTo(tab);
        let tabList = $("<div class='nav flex-column nav-tabs text-center' role='tablist' aria-orientation='vertical'>").appendTo(tabNav);
        let tabBody = $("<div class='col-8'>").appendTo(tab);
        let tabContent = $("<div class='tab-content'>").appendTo(tabBody);
        for (let k in context) {
            let l = context[k];
            let i = getCallbackValue(l, [l, that, ]);
            if (i.type === "tab") {
                let tabPane;
                if (Number(k) === 0) {
                    tabList.append(
                        $(`<a class="nav-link active" id="${this.id}-tabs-${i.id}-tab" data-mdb-toggle="tab" href="#${this.id}-tabbar-${i.id}" role="tab" aria-controls="${this.id}-tabs-${i.id}-tab" aria-selected="true">`).append($("<li>").addClass(i.icon)).append(i.title)
                    );
                    tabPane = $(`<div class="tab-pane fade show active" id="${this.id}-tabbar-${i.id}" role="tabpanel">`).appendTo(tabContent);
                } else {
                    tabList.append(
                        $(`<a class="nav-link" id="${this.id}-tabs-${i.id}-tab" data-mdb-toggle="tab" href="#${this.id}-tabbar-${i.id}" role="tab" aria-controls="${this.id}-tabs-${i.id}-tab" aria-selected="true">`).append($("<li>").addClass(i.icon)).append(i.title)
                    );
                    tabPane = $(`<div class="tab-pane fade" id="${this.id}-tabbar-${i.id}" role="tabpanel">`).appendTo(tabContent);
                }
                i.content(tabPane);
            }
        }
        return tab.appendTo($("<div class='container'>").appendTo(this.app));
    }

    initPageHome (container): JQuery {
        let that = this;
        for (let j in pages.pages) {
            let i = pages.pages[j];
            if (i.button) {
                $(container).append(
                    $(i.button.clone(true)).on(
                        "click", () => {
                            if (i.newpage == true || i.newpage == null) location.hash = "!" + j;
                            else {
                                if (i.init) {
                                    i.init(that);
                                }
                            }
                        }
                    ).css("text-transform", "none"
                    ).css("margin-right", "0.4rem"
                    ).css("margin-top", "0.4rem")
                );
            }
        }
        return $(container);
    }

    clean (): this {
        this.app.empty();
        return this;
    }

    getAPI (path, args: any[] = []): any {}

}
