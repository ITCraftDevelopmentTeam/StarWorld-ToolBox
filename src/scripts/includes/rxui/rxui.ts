import components from "./elements/all";
import * as HTMLParser from "node-html-parser";
import { RXComponent, RXUnknownComponent, RXComponentCollection } from "./rxcomponent";

export { RXComponent, RXUnknownComponent, RXComponentCollection };


export type ComponentsType =  {
    AllComponents: {
        [name: string]: typeof RXComponent
    },
    define (name: string, elementClass: typeof RXComponent, replace?): typeof elementClass,
}

export const Components: ComponentsType = {
    AllComponents: components,
    define (name: string, elementClass: typeof RXComponent, replace: boolean = false) {
        if (replace) {
            Components.AllComponents[name] = elementClass;
        } else {
            Components.AllComponents[name] = Components.AllComponents[name] || elementClass;
        }
        return elementClass;
    }
};

export function fromString (tag: string): RXComponent {
    /*
    Returns a loaded component
    */
    let elements = HTMLParser.parse(tag);
    let element = HTMLParser.parse("<Unknown></Unknown>");
    for (let i of elements.childNodes) {
        if (i instanceof HTMLParser.HTMLElement) {
            element = i;
            break;
        }
    }
    let tagName = element["rawTagName"];
    if (tagName in Components.AllComponents) {
        return (new (Components.AllComponents[tagName])(element)).load();
    } else {
        return new RXUnknownComponent(element).load();
    }
}

export function fromNode (node: HTMLParser.Node): RXComponent {
    /*
    Returns a loaded component
    */
    let tagName = node["rawTagName"];
    if (tagName in Components.AllComponents) {
        return (new (Components.AllComponents[tagName])(node)).load();
    } else {
        return new RXUnknownComponent(node).load();
    }
}

export function fromName (name: string, options?: HTMLParser.Node): RXComponent {
    /*
        Returns an unloaded component
     */
    if (!(name in Components.AllComponents)) {
        return new RXUnknownComponent(
            options || fromString("<Unknown/>").raw
        );
    } else {
        return (new (Components.AllComponents[name])(options || fromString(`<${name}/>`).raw));
    }
}

export class RX {

    public static fromNode = fromNode;
    public static fromString = fromString;
    public static fromName = fromName;
    public static Components = Components;
    public static Component = RXComponent;
    public static ComponentCollection = RXComponentCollection

    public static from (rxmlString: string);
    public static from (rxmlNode: HTMLParser.Node);
    public static from (rxml: string | HTMLParser.Node): RXComponent {
        if (rxml instanceof HTMLParser.Node) {
            return RX.fromNode(rxml);
        } else if (typeof rxml === "string") {
            return RX.fromString(rxml);
        }
    }

}

export default RX;
