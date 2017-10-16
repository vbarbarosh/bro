#!/usr/bin/env node

const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const microtime = require('microtime');
const sanitize_filename = require('sanitize-filename');

const args = process.argv.slice(2);
let current_url;

if (args.length < 2) {
    usage();
}

main().catch(panic);

async function main()
{
    const [robot_pathname, ...urls] = args;
    Promise.promisifyAll(fs);

    // https://github.com/GoogleChrome/puppeteer/issues/290#issuecomment-322921352
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    try {
        const page = await browser.newPage();
        const robot = await robot_from_file(robot_pathname);
        page.on('console', (...args) => console.log(...args));
        page.on('error', (...args) => console.error(...args));
        await page.exposeFunction('bro_read', read);
        await page.exposeFunction('bro_write', write);
        await page.exposeFunction('bro_pdf', async function (pathname, opt = {}) {
            await page.pdf({path: await backup(pathname), ...opt});
        });
        await page.exposeFunction('bro_screenshot', async function (pathname, opt = {}) {
            await page.screenshot({path: await backup(pathname), ...opt});
        });
        for (current_url of urls.map(url_from_str)) {
            await page.goto(current_url/*, {waitUntil: 'networkidle'}*/);
            await page.evaluate(robot);
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
    console.error(current_url);
    console.error(error);
    process.exit(1);
}

function url_from_str(str)
{
    if (str == ':' || str == 'about:blank') {
        return 'about:blank';
    }
    if (str.match(/^http/)) {
        return str;
    }
    return 'file://' + path.resolve(process.cwd(), str);
}

async function robot_from_file(pathname)
{
    const contents = await read(pathname);
    if (contents.startsWith('#!')) {
        return contents.slice((contents + '\n').indexOf('\n'));
    }
    return contents;
}

function mkfts()
{
    const now = new Date();
    const [, micro] = microtime.nowStruct();
    const a = now.toISOString().replace(/-|:/g, '').replace('T', '_').substr(0, 15);
    const b = ('000000' + micro).substr(-6);
    return a + '_' + b;
}

async function read(pathname, opt = {})
{
    return await fs.readFileAsync(pathname, {encoding: 'utf8', ...opt});
}

async function exists(pathname)
{
    try {
        await fs.accessAsync(pathname, fs.constants.F_OK);
    }
    catch (error) {
        return false;
    }
    return true;
}

async function backup(pathname)
{
    if (pathname.startsWith('file://')) {
        pathname = pathname.slice(7);
    }
    // ?gws_rd=ssl.pdf -> gws_rd=ssl.pdf
    pathname = sanitize_filename(pathname);
    // .pdf -> bro.pdf
    if (pathname.match(/^\.[^.]*$/)) {
        pathname = 'bro' + pathname;
    }
    // '' -> bro.out
    if (pathname == '') {
        pathname = 'bro.out';
    }
    if (await exists(pathname)) {
        await fs.renameAsync(pathname, path.join(path.dirname(pathname), mkfts() + '-' + path.basename(pathname)));
    }
    return pathname;
}

async function write(pathname, contents, opt = {})
{
    return await fs.writeFileAsync(await backup(pathname), contents, {encoding: 'utf8', ...opt});
}
