#!/usr/bin/env bro

main();

async function main()
{
    await bro_wait();
    const [w, h] = document.querySelector('meta[name=ad\\.size]').content.replace(/\w+=/g, '').split(',');
    await bro_viewport({width: +w, height: +h});
    await bro_screenshot(location.href + '.png');
}
