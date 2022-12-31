import * as $ from "jquery";

function isIn(element: { getBoundingClientRect: () => { top: number } }): boolean {
    let bound = element.getBoundingClientRect();
    let clientHeight = window.innerHeight;
    return bound.top <= clientHeight;
}

export default function lazyload (elements: any): void {
    elements = $(elements);
    for (let i of elements) {
        if (isIn(i)) {
            if (!i.dataset.lazyloaded){
                $(i).hide();
                i.src = i.dataset.src;
                i.dataset.lazyloaded = true;
                $(i).fadeIn(1000);
            }
        }
    }
}
