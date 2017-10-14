#!/usr/bin/env bro

main();

async function main()
{
    await bro_screenshot(location.href.replace(/\.[^.]]+$/, '') + '.png', {fullPage: true});
}
