import { APP } from "../../app";

import rx from "../../../includes/rxui/rxui";
import $ from "jquery";

import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { html, htmlCompletionSourceWith, TagSpec } from "@codemirror/lang-html";
import { historyKeymap, insertTab, standardKeymap } from "@codemirror/commands";
import { autocompletion } from "@codemirror/autocomplete";

import { createTheme } from "@uiw/codemirror-themes";

import highlight from "highlight.js";
import XMLHighLight from "highlight.js/lib/languages/xml"

import { tags } from '@lezer/highlight';
import "highlight.js/styles/atom-one-light.css";

import prettier from "prettier";
import parserHTML from "prettier/parser-html";

highlight.registerLanguage("xml", XMLHighLight);

import { CreateThemeOptions } from "@uiw/codemirror-themes";

export function getThemeOptions (): CreateThemeOptions {
    return {
        theme: "light",
        settings: {
            background: '#fff',
            foreground: '#3D3D3D',
            selection: '#BBDFFF',
            selectionMatch: '#BBDFFF',
            gutterBackground: '#fff',
            gutterForeground: '#AFAFAF',
            lineHighlight: '#EDF4FF',
        },
        styles: [
            {
                tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.url, tags.processingInstruction, tags.meta],
                color: '#4078f2',
            },
            {
                tag: [tags.variableName, tags.attributeName, tags.number],
                color: '#986801',
            },
            {
                tag: [tags.attributeValue, tags.string, tags.regexp, tags.special(tags.propertyName)],
                color: '#50a14f',
            },
            {
                tag: [tags.keyword, tags.moduleKeyword],
                color: '#a626a4',
            },
            {
                tag: [tags.tagName],
                color: '#e45649',
            },
            {
                tag: [tags.comment],
                color: '#a0a1a7',
                "font-style": "italic",
            }
        ]
    } as any;
}

export function strip (str: string, char: string, type?: "left" | "right") {
    if (char) {
        if (type == 'left') {
            return str.replace(new RegExp('^\\' + char + '+', 'g'), '');
        } else if (type == 'right') {
            return str.replace(new RegExp('\\' + char + '+$', 'g'), '');
        }
        return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return str.replace(/^\s+|\s+$/g, '');
}

export function RXMLTags (): { extraTags?: Record<string, TagSpec>, extraGlobalAttributes?: Record<string, null | readonly string[]>} {
    let extraTags = {};
    for (let i of Object.keys(rx.Components.AllComponents)) {
        try {
            extraTags[i] = {
                attrs: rx.Components.AllComponents[i].observedAttributes,
            };
        } catch {}
    }
    return {
        extraTags: extraTags,
    }
}

export function createEditor (parent: JQuery, doc?) {
    return new EditorView(
        {
            state: EditorState.create(
                {
                    doc: doc || [
                        `<RXML>`,
                        `  <Head>`,
                        `    <Title><TextNode>标题</TextNode></Title>`,
                        `    <HTMLNode>`,
                        `      <script>document.write('在此处使用HTML标签，请将其放置在"HTMLNode"中');</script>`,
                        `    </HTMLNode>`,
                        `  </Head>`,
                        `  <Body>`,
                        `    <Text>`,
                        `      <TextNode>使用文本，请将其放置在"TextNode"中</TextNode>`,
                        `    </Text>`,
                        `  </Body>`,
                        `</RXML>`
                    ].join("\n"),
                    extensions: [
                        keymap.of(
                            [
                                ...standardKeymap,
                                ...historyKeymap,
                                {
                                    "key": "Tab",
                                    run: insertTab
                                }
                            ],
                        ),
                        basicSetup, html(), createTheme(getThemeOptions()), autocompletion(
                            {
                                override: [htmlCompletionSourceWith(RXMLTags())]
                            }
                        )
                    ],
                }
            ),
            parent: parent.get(0),
        }
    );
}

export function createTab (titles: string[], pages: JQuery[], id: string) {
    let tabTitle = $("<ul class='nav nav-tabs' role='tablist'>").attr("id", id).append(
        ...(
            titles.map(
                (title, index) => {
                    let titleListItem = $('<li class="nav-item" role="presentation">');
                    if (index == 0) {
                        titleListItem.append(
                            $(`<a class="nav-link active" id="${id}-tab-${index}" data-mdb-toggle="tab" href="#${id}-content-${index}" role="tab">`).text(title)
                        );
                    } else {
                        titleListItem.append(
                            $(`<a class="nav-link" id="${id}-tab-${index}" data-mdb-toggle="tab" href="#${id}-content-${index}" role="tab">`).text(title)
                        );
                    }
                    return titleListItem;
                }
            )
        )
    );
    let tabContent = $(`<div class="tab-content" id="${id}-contents">`).append(
        ...(
            pages.map(
                (value, index) => {
                    let page = $(`<div class="tab-pane fade show" id="${id}-content-${index}" role="tabpanel">`);
                    if (index == 0) page.addClass("active");
                    page.append("<br>", value);
                    return page;
                }
            )
        )
    );
    return $([tabTitle, tabContent]);
}

export function htmlFormat(html, error: boolean = true) {
    try {
        return prettier.format(html,
            {
                parser: "html",
                plugins: [parserHTML]
            }
        );
    } catch (e) {
        if (error) throw e;
        return undefined;
    }
}

export function initialize (app: APP) {
    let container = $("<div class='container'>").appendTo(document.body);
    let editor = $("<div>").appendTo(container).addClass("form-control cm-no-outline sw-editor border-0").css("padding", "0.1rem");
    let codemirror = createEditor(editor);
    let output = $("<code class='language-xml' style='padding: 0;'>");
    let outputEditor = $("<div>").addClass("form-control cm-no-outline sw-editor border-0").css("padding", "0.1rem");
    let outputCodeMirror = createEditor(outputEditor, htmlFormat(rx.fromString([...codemirror.state.doc].join("")).rendered.prop("outerHTML")));
    let accordion = $(`<div class="accordion-item border-0">`).appendTo($("<div class='accordion border-0'>").appendTo(container.append("<br>")));
    try {
        output.text(
            htmlFormat(rx.fromString([...codemirror.state.doc].join("")).rendered.prop("outerHTML"))
        );
    } catch {}
    let tab = createTab(
        ["编译结果 (预览)", "编译结果 (文本)"],
        [
            $("<pre class='form-control border-0' style='margin: 0; padding: 0;'>").append(output),
            outputEditor
        ],
        app.id + "-rxmleditor-output"
    );
    accordion.append(
        $("<h2 class='accordion-header'>").append(
            $("<button class='accordion-button' type='button'>").attr("data-mdb-toggle", "collapse").text("编译结果").attr('data-mdb-target', `#${app.id}-collapse-1`)
        ),
        $("<div class='accordion-collapse collapse'>").attr("id", `${app.id}-collapse-1`).append(...tab.get()),
    );
    highlight.highlightElement(output[0]);
    $(codemirror.contentDOM).on(
        "input keydown",
        () => {
            try {
                let rxml = rx.fromString(Array.from(codemirror.state.doc).join("")).rendered;
                let htmlstring = htmlFormat(rxml.prop("outerHTML") || "\n\n") || rxml.prop("outerHTML") || "\n\n";
                output.text(htmlstring);
                $(outputCodeMirror.contentDOM).text(htmlstring)
                highlight.highlightElement(output[0]);
            } catch {}
        }
    );

}
