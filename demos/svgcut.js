#!/usr/bin/env bro

main();

async function main()
{
    const elem = document.querySelector('svg');
    svgcut(elem);
    await bro_write(location.href, svg_from_elem(elem));
}

function svgcut(elem)
{
    const viewBox = elem.getAttribute('viewBox');
    if (!viewBox) {
        return;
    }
    const [x, y, w, h] = viewBox.split(/\s+/).map(parseFloat);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    elem.appendChild(rect);
    const outer = svg_bcr(rect);
    elem.removeChild(rect);
    svgvcut_walk(elem, outer);
}

function svgvcut_walk(elem, outer)
{
    const tag_names = ['circle', 'ellipse', 'g', 'image', 'line', 'path', 'polygon', 'polyline', 'rect', 'svg', 'switch',  'text', 'tspan'];
    svgvcut_walk.counter = svgvcut_walk.counter || 0;
    const children = [...elem.children];
    while (children.length) {
        const child = children.shift();
        const bcr = svg_bcr(child);
        const tmp = rect_from_bcr(bcr);
        if (!tag_names.includes(child.tagName)) {
            continue;
        }
        if (rect_area(rect_intersect(outer, tmp)) == 0) {
            elem.removeChild(child);
        }
        else {
            svgvcut_walk(child, outer);
        }
    }
}

function svg_bcr(elem)
{
    return rect_inflate(rect_from_bcr(elem.getBoundingClientRect()), parseFloat(getComputedStyle(elem).strokeWidth));
}

function rect_from_bcr(bcr)
{
    return {x: bcr.left, y: bcr.top, w: bcr.right - bcr.left, h: bcr.bottom - bcr.top};
}

function rect_intersect(a, b)
{
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    const y2 = Math.min(a.y + a.h, b.y + b.h);
    return {x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1)};
}

function rect_inflate(a, dx)
{
    return {
        x: a.x - dx/2,
        y: a.y - dx/2,
        w: a.w + dx,
        h: a.h + dx
    };
}

function rect_area(a)
{
    return a.w*a.h;
}

function svg_from_elem(elem)
{
    return new XMLSerializer().serializeToString(elem);
}
