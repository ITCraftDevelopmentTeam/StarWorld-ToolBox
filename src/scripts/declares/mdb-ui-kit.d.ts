declare module "mdb-ui-kit" {
    class Alert {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
        };
        static DefaultType: {
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Button {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        hide(...args: any[]): void;
        show(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
        };
        static DefaultType: {
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Carousel {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            interval: number;
            keyboard: boolean;
            pause: string;
            ride: boolean;
            touch: boolean;
            wrap: boolean;
        };
        static DefaultType: {
            interval: string;
            keyboard: string;
            pause: string;
            ride: string;
            touch: string;
            wrap: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Collapse {
        constructor(...args: any[]);
        hide(...args: any[]): void;
        show(...args: any[]): void;
        toggle(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            parent: any;
            toggle: boolean;
        };
        static DefaultType: {
            parent: string;
            toggle: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Dropdown {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            autoClose: boolean;
            boundary: string;
            display: string;
            offset: number[];
            popperConfig: any;
            reference: string;
        };
        static DefaultType: {
            autoClose: string;
            boundary: string;
            display: string;
            offset: string;
            popperConfig: string;
            reference: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static clearMenus(...args: any[]): void;
        static dataApiKeydownHandler(...args: any[]): void;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Input {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        forceActive(...args: any[]): void;
        forceInactive(...args: any[]): void;
        init(...args: any[]): void;
        update(...args: any[]): void;
        static NAME: string;
        static activate(...args: any[]): void;
        static deactivate(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Modal {
        constructor(...args: any[]);

        dispose(...args: any[]): void;

        static DATA_KEY: string;
        static Default: {
            backdrop: boolean;
            focus: boolean;
            keyboard: boolean;
        };
        static DefaultType: {
            backdrop: string;
            focus: string;
            keyboard: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;

        static eventName(...args: any[]): void;

        static getInstance(...args: any[]): void;

        static getOrCreateInstance(...args: any[]): void;

        static jQueryInterface(...args: any[]): void;

        show(): void;
        hide(): void;
        toggle(): void;
    }

    class Offcanvas {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        hide(...args: any[]): void;
        show(...args: any[]): void;
        toggle(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            backdrop: boolean;
            keyboard: boolean;
            scroll: boolean;
        };
        static DefaultType: {
            backdrop: string;
            keyboard: string;
            scroll: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Popover {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            allowList: {
                "*": string[];
                a: string[];
                area: any[];
                b: any[];
                br: any[];
                code: any[];
                col: any[];
                div: any[];
                em: any[];
                h1: any[];
                h2: any[];
                h3: any[];
                h4: any[];
                h5: any[];
                h6: any[];
                hr: any[];
                i: any[];
                img: string[];
                li: any[];
                ol: any[];
                p: any[];
                pre: any[];
                s: any[];
                small: any[];
                span: any[];
                strong: any[];
                sub: any[];
                sup: any[];
                u: any[];
                ul: any[];
            };
            animation: boolean;
            boundary: string;
            container: boolean;
            content: string;
            customClass: string;
            delay: number;
            fallbackPlacements: string[];
            html: boolean;
            offset: number[];
            placement: string;
            popperConfig: any;
            sanitize: boolean;
            sanitizeFn: any;
            selector: boolean;
            template: string;
            title: string;
            trigger: string;
        };
        static DefaultType: {
            allowList: string;
            animation: string;
            boundary: string;
            container: string;
            content: string;
            customClass: string;
            delay: string;
            fallbackPlacements: string;
            html: string;
            offset: string;
            placement: string;
            popperConfig: string;
            sanitize: string;
            sanitizeFn: string;
            selector: string;
            template: string;
            title: string;
            trigger: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Range {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        init(...args: any[]): void;
        static NAME: string;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Ripple {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        init(...args: any[]): void;
        static NAME: string;
        static autoInitial(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class ScrollSpy {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            offset: any;
            rootMargin: string;
            smoothScroll: boolean;
            target: any;
            threshold: number[];
        };
        static DefaultType: {
            offset: string;
            rootMargin: string;
            smoothScroll: string;
            target: string;
            threshold: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Tab {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        show(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
        };
        static DefaultType: {
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Toast {
        constructor(...args: any[]);
        hide();
        show();
        toggle();
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            animation: boolean;
            autohide: boolean;
            delay: number;
        };
        static DefaultType: {
            animation: string;
            autohide: string;
            delay: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
    class Tooltip {
        constructor(...args: any[]);
        dispose(...args: any[]): void;
        static DATA_KEY: string;
        static Default: {
            allowList: {
                "*": string[];
                a: string[];
                area: any[];
                b: any[];
                br: any[];
                code: any[];
                col: any[];
                div: any[];
                em: any[];
                h1: any[];
                h2: any[];
                h3: any[];
                h4: any[];
                h5: any[];
                h6: any[];
                hr: any[];
                i: any[];
                img: string[];
                li: any[];
                ol: any[];
                p: any[];
                pre: any[];
                s: any[];
                small: any[];
                span: any[];
                strong: any[];
                sub: any[];
                sup: any[];
                u: any[];
                ul: any[];
            };
            animation: boolean;
            boundary: string;
            container: boolean;
            customClass: string;
            delay: number;
            fallbackPlacements: string[];
            html: boolean;
            offset: number[];
            placement: string;
            popperConfig: any;
            sanitize: boolean;
            sanitizeFn: any;
            selector: boolean;
            template: string;
            title: string;
            trigger: string;
        };
        static DefaultType: {
            allowList: string;
            animation: string;
            boundary: string;
            container: string;
            customClass: string;
            delay: string;
            fallbackPlacements: string;
            html: string;
            offset: string;
            placement: string;
            popperConfig: string;
            sanitize: string;
            sanitizeFn: string;
            selector: string;
            template: string;
            title: string;
            trigger: string;
        };
        static EVENT_KEY: string;
        static NAME: string;
        static VERSION: string;
        static eventName(...args: any[]): void;
        static getInstance(...args: any[]): void;
        static getOrCreateInstance(...args: any[]): void;
        static jQueryInterface(...args: any[]): void;
    }
}
