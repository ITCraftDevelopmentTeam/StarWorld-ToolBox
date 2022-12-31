import {APP} from "../../app";

import * as fileSaver from "file-saver";
import * as $ from "jquery";
import * as cocoMessage from "coco-message";

export function readFileAsBuffer (callback: (input: JQuery) => void = (...args) => null): Promise<ArrayBuffer> {
    return new Promise(
        function (resolve, reject) {
            let input: JQuery<HTMLElement> = $("<input accept='image/*'>").attr("type", "file");
            callback(input);
            input.trigger("click").on(
                "change",
                function () {
                    let fileReader = new FileReader();
                    fileReader.onload = function () {
                        resolve(fileReader.result as ArrayBuffer);
                    };
                    fileReader.onabort = reject;
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(input.prop("files")[0]);
                }
            );
        }
    );
}

export function getPageContext (app: APP) {
    return [];
}

export function initialize (app: APP) {
    let element = $("<div class='container'>");
    let input = $(`<textarea class='form-control' id='${app.id}-tool-base64-input' rows="4" placeholder="请输入要进行 编码/解码 的内容">`);
    let output = $(`<textarea class='form-control' id='${app.id}-tool-base64-input' rows="4" placeholder="暂无内容" readonly>`)
    element.append(
        $("<h1>").text("Base64 编码/解码")
    ).append(
        input, "<br>", output, "<br>",
        $("<div class='btn-group'>").append(
            $("<button class='btn btn-primary'>").text("编码").on(
                "click", () => {
                    output.val(Buffer.from(input.val() as string).toString("base64"));
                }
            ),
            $("<button class='btn btn-primary'>").text("解码").on(
                "click", () => {
                    output.val(Buffer.from(input.val() as string, "base64").toString("utf-8"));
                }
            )
        ), "<br><br>",
        $("<div class='btn-group'>").append(
            $("<button class='btn btn-primary'>").text("导入").on(
                "click", () => {
                    readFileAsBuffer().then(
                        (resolve) => {
                            input.val(Buffer.from(resolve).toString());
                            cocoMessage.success("导入成功");
                        },
                        (reject) => {
                            cocoMessage.error("导入失败");
                        }
                    );
                }
            ),
            $("<button class='btn btn-primary'>").text("导出").on(
                "click", () => {
                    let blob = new Blob([output.val() as string], {type: "text/plain;charset=ascii"});
                    fileSaver.saveAs(blob, "base64.txt");
                }
            )
        )
    );
    element.hide().appendTo(app.app).fadeIn(250);
}
