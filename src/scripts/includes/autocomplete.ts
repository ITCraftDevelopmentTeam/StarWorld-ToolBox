// noinspection JSDeprecatedSymbols

import * as $ from "jquery";



export function autocomplete(inp, search: ((inp: string) => Promise<any[]>) | any[], checker: (v: string, i: string) => number, callback?: (jQuery) => void) {
    let currentFocus;
    let input = $(inp).get();
    let getter: (inp: string) => Promise<any[]>;
    if (search instanceof Array) {
        getter = (inp: string) => new Promise(
            (resolve, reject) => {
                resolve(search);
            }
        )
    } else {
        getter = search;
    }
    for (let inp of input) {
        inp.addEventListener("input", function (e) {
            let that = this;
            getter($(inp).val() as string).then(
                function (arr) {
                    let a, b, i;
                    const val = that.value;
                    closeAllLists();
                    if (!val) { return false;}
                    currentFocus = -1;
                    a = document.createElement("ul");
                    a.setAttribute("id", that.id + "-autocomplete-list");
                    a.setAttribute("class", "dropdown-menu");
                    $(a).css(
                        {
                            "display": "block",
                            "overflow": "hidden !important"
                        }
                    );
                    that.parentNode.appendChild(a);
                    if (typeof callback == "function") callback($(a));
                    for (i = 0; i < arr.length; i++) {
                        let checked = checker(arr[i], val);
                        if (checked != -1) {
                            b = document.createElement("li");
                            b.setAttribute("class", "dropdown-item autocomplete-item");
                            let k = $("<p>").hide().appendTo(b);
                            k.text(arr[i] as string);
                            $(b).append(String(arr[i]).slice(0, checked));
                            $("<strong>").html(String(arr[i]).slice(checked, checked + val.length)).appendTo(b);
                            $(b).append(String(arr[i]).slice(checked + val.length));
                            $(b).append($("<input type='hidden'>").val(arr[i]));
                            b.addEventListener("click", function(e) {
                                $(inp).val(k.text());
                                closeAllLists();
                            });
                            a.appendChild(b);
                        }
                    }
                }
            )
        });
        inp.addEventListener("keydown", function(e) {
            let x: any = document.getElementById(this.id + "-autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });
    }
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt?) {
        const x = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
    return inp;
}
