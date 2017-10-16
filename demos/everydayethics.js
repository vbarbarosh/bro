#!/usr/bin/env bro

main();

async function main()
{
    if (window.location.origin != 'https://www.everydayethics.org') {
        await bro_push('https://www.everydayethics.org/podcasts/');
    }
    else {
        // https://davidwalsh.name/get-absolute-url
        await bro_push(document.querySelector('.older-posts').href);
    }
}
