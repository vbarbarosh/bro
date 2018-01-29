#!/usr/bin/env bro

main();

async function main()
{
    // https://stackoverflow.com/a/7398477/1478566
    const body = document.body;
    const html = document.documentElement;
    const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    // +1 is necessary to avoid last empty page
    const height = 1 + Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    await bro_pdf(location.href + '.pdf', {width, height, printBackground: true});
}
