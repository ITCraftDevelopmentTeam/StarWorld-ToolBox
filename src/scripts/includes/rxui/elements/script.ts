import * as esprima from "esprima";
import * as escodegen from "escodegen";
import * as ESTree from "estree";
import * as HTMLParser from "node-html-parser";

import prettier from "prettier";
import prettierJavaScript from "prettier/parser-babel";

import { RXComponent } from "../rxcomponent";
import { fromString } from "../rxui";


export class RXScriptParser {

    public parsed: esprima.Program;
    public code: string;

    constructor (code: string) {
        this.code = code;
    }

    parse (): this {
        try {
            let that = this;
            this.parsed = esprima.parseModule(
                this.code,
                {
                    jsx: true,
                },
                (node, meta) => this.translate(node, meta)
            );
        } catch (e) {
            let error = new SyntaxError(e.message);
            error.stack = e.stack;
            throw error;
        }
        return this;
    }

    pretty (code: string) {
        return prettier.format(code,
            {
                parser: "babel",
                plugins: [prettierJavaScript]
            }
        );
    }

    generate (pretty: boolean = true) {
        if (pretty) {
            try {
                return this.pretty(escodegen.generate(this.parsed));
            } catch {}
        }
        return escodegen.generate(this.parsed);
    }

    stringToElement (str: string, rxml?: string): ESTree.Node {
        return {"type": "Program", "body": [{"type": "ExpressionStatement", "expression": {"type": "CallExpression", "callee": {"type": "FunctionExpression", "id": null, "params": [{"type": "Identifier", "name": "s"}], "body": {"type": "BlockStatement", "body": [{"type": "VariableDeclaration", "declarations": [{"type": "VariableDeclarator", "id": {"type": "Identifier", "name": "o"}, "init": {"type": "CallExpression", "callee": {"type": "MemberExpression", "computed": false, "object": {"type": "Identifier", "name": "document"}, "property": {"type": "Identifier", "name": "createElement"}}, "arguments": [{"type": "Literal", "value": "div", "raw": "\"div\""}]}}], "kind": "let"}, {"type": "ExpressionStatement", "expression": {"type": "AssignmentExpression", "operator": "=", "left": {"type": "MemberExpression", "computed": false, "object": {"type": "Identifier", "name": "o"}, "property": {"type": "Identifier", "name": "innerHTML"}}, "right": {"type": "Identifier", "name": "s"}}}, {"type": "ReturnStatement", "argument": {"type": "MemberExpression", "computed": true, "object": {"type": "MemberExpression", "computed": false, "object": {"type": "Identifier", "name": "o"}, "property": {"type": "Identifier", "name": "childNodes"}}, "property": {"type": "Literal", "value": 0, "raw": "0"}}}]}, "generator": false, "expression": false, "async": false}, "arguments": [{"type": "Literal", "rxml": rxml, "value": str, "raw": JSON.stringify(str)}]}}]}["body"][0]["expression"] as any;
    }

    translate (node: ESTree.Node, meta: any) {
        if (node.type == "JSXElement" as any) {
            let outerHTML: string;
            if (node["openingElement"]["selfClosing"]) {
                let attributes = "";
                for (let i of node["openingElement"]["attributes"]) {
                    attributes += `${[i["name"]["name"]]}=${i["value"]["raw"]}`;
                }
                outerHTML = `<${node["openingElement"]["name"]["name"]} ${attributes}/>`;
            } else {
                let attributes = "";
                let childrens = "";
                for (let i of node["children"]) {
                    if (i.type == "JSXText") {
                        childrens += i.raw || "";
                    } else {
                        try {
                            childrens += i["arguments"][0]["rxml"] || "";
                        } catch {}
                    }
                }
                for (let i of node["openingElement"]["attributes"]) {
                    attributes += `${[i["name"]["name"]]}=${i["value"]["raw"]}`;
                }
                outerHTML = `<${node["openingElement"]["name"]["name"]} ${attributes}>${childrens}</${node["openingElement"]["name"]["name"]}>`;
            }
            let rxcomp = fromString(outerHTML);
            let nodeResult = this.stringToElement(rxcomp.rendered.prop("outerHTML"), outerHTML);
            for (let i in node) {
                delete node[i];
            }
            for (let i in nodeResult) {
                node[i] = nodeResult[i];
            }
        }
    }

}

export class RXScriptComponent extends RXComponent {

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $("<script>");
    }

    load () {
        let RXScript: boolean = false;
        if (this.raw["attributes"]["type"] == "text/rxscript") RXScript = true;
        this.jquery = $("<script>");
        this.jquery.attr(this.raw["attributes"] || {});
        for (let i of this.raw.childNodes) {
            if (i instanceof HTMLParser.TextNode) this.jquery.append(document.createTextNode(i.rawText));
            else this.jquery.append(document.createTextNode(i["outerHTML"]));
        }
        if (RXScript) {
            try {
                this.jquery.text(
                    new RXScriptParser(this.jquery.text()).parse().generate()
                );
                this.jquery.attr("type", "module");
            } catch {}
        }
        this.loaded = true;
        return this;
    }

}

export default {
    RXScript: RXScriptComponent
}
