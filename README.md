# pickledish.github.io

The source for the site! Just uses jekyll with github pages cause I'm basic. Don't look in the `_drafts` folder, very secret stuff in there, absolutely forbidden, Brandon eyes only 👀

## Setup

You need devbox installed, and thus nix:

* https://www.jetify.com/docs/devbox/installing_devbox/

Then run `devbox install` (for ruby, tailwind) and then `devbox run install`.

## Development

Run `devbox run dev`, then head to `127.0.0.1:4000` to see the site, auto-reloading enabled

## The Fonts

I'm trying this crazy font-subsetting thing to make the font downloads smaller.

Needs this installed:

* https://github.com/zachleat/glyphhanger

Then, run the following to generate the list of glyphs actually necessary:

```bash
$ glyphhanger 'http://127.0.0.1:4000/' --spider --spider-limit=5 --onlyVisible
```

This site was useful for interpreting the ranges output by the above:

* https://www.zachleat.com/unicode-range-interchange/

Anyway, then, cd'd to `assets/fonts/`:

```bash
$ glyphhanger --whitelist='ABOVE OUTPUT' --subset=wotfard-extralight.woff2
$ glyphhanger --whitelist='ABOVE OUTPUT' --subset=wotfard-regular.woff2
$ glyphhanger --whitelist='ABOVE OUTPUT' --subset=wotfard-semibold.woff2
```

I didn't do the italics because I was lazy.
