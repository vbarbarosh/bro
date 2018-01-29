#!/usr/bin/env bro

main();

async function main()
{
    await bro_screenshot(location.href + '.png', {fullPage: true});
}
