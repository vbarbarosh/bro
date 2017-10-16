Execute JavaScript in context of a browser

## Goals

1) Execute JavaScript on a page, store results in a file.
2) Harvest urls which are spread across several pages.

## Before Install

* [npm install -g puppeteer fails #375](https://github.com/GoogleChrome/puppeteer/issues/375)
* [Using 'npm install' without Sudo](https://medium.com/@sifium/using-npm-install-without-sudo-2de6f8a9e1a3)

## Installation

    $ npm install -g vbarbarosh/bro

## Usage

    $ bro robot.js url1 [url2 [url3 [...]]]
