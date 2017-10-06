#!/usr/bin/env node

const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
    usage();
}

main().catch(panic);

async function main()
{
    const [robot, ...urls] = args;
    Promise.promisifyAll(fs);

    // https://github.com/GoogleChrome/puppeteer/issues/290#issuecomment-322921352
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    try {
        const page = await browser.newPage();
        page.on('console', (...args) => console.log(...args));
        page.on('error', (...args) => console.error(...args));
        await page.exposeFunction('bro_read', read);
        await page.exposeFunction('bro_write', write);
        await page.exposeFunction('bro_dirname', (...args) => path.dirname(...args));
        await page.exposeFunction('bro_basename', (...args) => path.basename(...args));
        for (let s of urls) {
            await page.goto(url_from_str(s)/*, {waitUntil: 'networkidle'}*/);
            await page.evaluate(await read(robot));
        }
    }
    finally {
        await browser.close();
    }
}

function usage()
{
    console.log('usage: bro robot.js url1 [url2 [url3 [...]]]');
    process.exit(1);
}

function panic(error)
{
    console.error(error);
    process.exit(1);
}

function url_from_str(str)
{
    if (str.match(/^http/)) {
        return str;
    }
    return 'file://' + path.resolve(process.cwd(), str);
}

function read(pathname, opt = {})
{
    return fs.readFileAsync(pathname, {encoding: 'utf8', ...opt});
}

function write(pathname, contents, opt = {})
{
    return fs.writeFileAsync(pathname, contents, {encoding: 'utf8', ...opt});
}
