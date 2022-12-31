import * as HTMLParser from "node-html-parser";
import $ from "jquery";
import { fromNode } from "./rxui";

export function parseAttributes (attributes: object): object {
    let newObject = {};
    for (let i in attributes) {
        if (!i.startsWith("@")) {
            newObject[i] = attributes[i];
        }
    }
    return newObject;
}

export class RXComponent {

    public raw: HTMLParser.Node;
    public loaded: boolean = false;
    protected jquery: JQuery<any>;

    public static get observedAttributes (): {[index: string]: string | string[]} {
        return {

        }
    }

    constructor (raw: HTMLParser.Node) {
        this.raw = raw;
        this.jquery = $("");
    }

    public valueOf(): HTMLParser.Node {
        return this.raw;
    }

    public toString(): string {
        return this.raw["outerHTML"];
    }

    public render (): JQuery<any>;
    public render (index: -1): HTMLElement[];
    public render (index: number): HTMLElement;
    public render (index: number = null): JQuery<any> | HTMLElement[] | HTMLElement {
        if (!this.loaded) throw Error("Component Not Loaded");
        if (index === -1) {
            return this.jquery.get();
        } else if (index == null) {
            return this.jquery;
        } else {
            return this.jquery.get(index);
        }
    }

    public load (): this {
        this.loaded = true;
        for (let i of this.raw.childNodes) {
            this.jquery.append(
                fromNode(i).render()
            );
        }
        this.jquery.attr(parseAttributes(this.raw["attributes"]));
        return this;
    }

    public append (...contents: RXComponent[]): this {
        this.jquery.append(...(contents.map((item) => item.render())));
        return this;
    }

    public prepend (...contents: RXComponent[]): this {
        this.jquery.prepend(this.jquery.append(...(contents.map((item) => item.render()))));
        return this;
    }

    public appendTo (target: RXComponent): this {
        this.jquery.appendTo(target.render());
        return this;
    }

    public prependTo (target: RXComponent): this {
        this.jquery.prepend(target.render());
        return this;
    }

    public get css () {
        let that = this;
        return (css: JQuery.PlainObject): typeof that => [that.jquery.css(css), that][1] as typeof that;
    }

    public get prop () {
        let that = this;
        return (prop: JQuery.PlainObject): typeof that => [that.jquery.prop(prop), that][1] as typeof that;
    }

    public get attr () {
        let that = this;
        return (attr: JQuery.PlainObject): typeof that => [that.jquery.attr(attr), that][1] as typeof that;
    }

    public get data () {
        let that = this;
        return (data: JQuery.PlainObject): typeof that => [that.jquery.data(data), that][1] as typeof that;
    }

    public get on () {
        let that = this;
        return (on: JQuery.PlainObject): typeof that => [that.jquery.on(on), that][1] as typeof that;
    }

    public get off () {
        let that = this;
        return (off: string[], selector?): typeof that => {
            for (let i of off) {
                that.jquery.off(i, selector);
            }
            return that;
        };
    }

    public get html () {
        let that = this;
        return (html: string): typeof that => [that.jquery.html(html), that][1] as typeof that;
    }

    public get text() {
        let that = this;
        return (text: string): typeof that => [that.jquery.text(text), that][1] as typeof that;
    }

    public get rendered () {
        return this.render();
    }

    public operationChained (operation: string, ...args) {
        let that = this;
        that.rendered[operation](...args);
        return this;
    }

}

export function RXHTMLElementAlias (tagName: string, tagAttributes: object = {}, replaceAttributes: boolean = true): typeof RXComponent {
    return class extends RXComponent {

        constructor (raw: HTMLParser.Node) {
            super(raw);
            this.jquery = $(document.createElement(tagName)).attr(tagAttributes);
        }

        load () {
            this.loaded = true;
            this.jquery = $(document.createElement(tagName));
            for (let i of this.raw.childNodes) {
                this.jquery.append(
                    fromNode(i).render()
                );
            }
            this.jquery.attr(this.raw["attributes"]);
            if (replaceAttributes) this.jquery.attr(parseAttributes(tagAttributes));
            else {
                for (let i in tagAttributes) {
                    try {
                        if (this.jquery.attr(i)) {
                            this.jquery.attr(i, String(this.jquery.attr(i)) + " " + tagAttributes[i]);
                        } else {
                            this.jquery.attr(i, tagAttributes[i]);
                        }
                    } catch {}
                }
            }
            return this;
        }
    }
}

export class RXUnknownComponent extends RXComponent {

    constructor (raw: HTMLParser.Node) {
        super(raw);
    }

    public load () {
        this.loaded = true;
        return this;
    }

    public render (): JQuery<any>;
    public render (index: -1): HTMLElement[];
    public render (index: number): HTMLElement;
    public render (index: number = null): JQuery<any> | HTMLElement[] | HTMLElement {
        if (!this.loaded) throw Error("Component Not Loaded");
        if (index === -1) {
            return $("").get();
        } else if (index == null) {
            return $("");
        } else {
            return $("").get(index);
        }
    }
}

export class RXComponentCollection extends RXComponent {

    public raws: HTMLParser.Node[];

    constructor (raws) {
        super(null);
        this.jquery = $("");
        this.raws = raws;
    }

    load () {
        let list = [];
        for (let i of this.raws) {
            if (i instanceof HTMLParser.HTMLElement) {
                let item = fromNode(i);
                if (item) list.push(...item.rendered.get());
            }
        }
        this.jquery = $(list);
        this.loaded = true;
        return this;
    }

}
