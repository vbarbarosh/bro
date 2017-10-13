#!/usr/bin/env bro

main();

async function main()
{
    const elem = document.querySelector('svg');
    const dataurl = await dataurl_from_svg(svg_from_elem(elem)).then(img_from_url).then(img_conv);
    await bro_write(
        location.href.replace(/\.svg$/, '') + '.png',
        base64_from_dataurl(dataurl),
        {encoding: 'base64'}
    );
}

function svg_from_elem(elem)
{
    return new XMLSerializer().serializeToString(elem);
}

function img_from_url(url)
{
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function (event) {
            const error = new Error('img_from_url failed [' + url + ']');
            error.event = event;
            reject(error);
        };
        img.src = url;
    });
}

// TEST: <svg><text>привет</text></svg>
function dataurl_from_svg(svg)
{
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target.result);
        };
        reader.onerror = function (event) {
            const error = new Error('dataurl_from_svg failed');
            error.svg = svg;
            error.event = event;
            reject(error);
        };
        reader.readAsDataURL(new Blob([svg], {type: 'image/svg+xml'}));
    });
}

function base64_from_dataurl(dataurl)
{
    return dataurl.slice(dataurl.indexOf(',') + 1);
}

function img_conv(img, mime = 'image/png', fillStyle)
{
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    if (fillStyle) {
        context.fillStyle = fillStyle;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(img, 0, 0);
    // *quality* argument for image/png represent
    // degree of compression from 1 -- no, to 0 -- maximum
    return canvas.toDataURL(mime, (mime == 'image/png' ? 0.5 : 0.9));
}
