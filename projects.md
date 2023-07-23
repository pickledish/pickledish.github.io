---
layout: post
title: "my free time"
permalink: /projects/
---

I'm always working on a few personal projects, but here are a few of my favorites:

#### Cardi Notes
A full-featured, static-generated site that acts as a frontend for notes stored as rows in privately-managed DynamoDB tables. I'd always wanted a note-keeping tool that was free forever, accessible anywhere, self-managed, and didn't involve maintaining a server -- so I wrote it myself! Feel free to [visit the app](https://www.cardinotes.app) or see the [source on Github](https://github.com/pickledish/cardi).

#### Eventrist
A work-in-progress solution to recording and visualizing timestamped event data in the way that's always made the most sense. Uses InfluxDB as an event store (single node, so "small data" only for now) and Starlette for the API layer. [Source on Github](https://github.com/pickledish/eventrist).

#### Spellcheck
A different kind of spelling corrector -- instead of choosing how to correct a word based on edit distance, how common the word is, or randomness, we instead try to find the English word with the smallest _keyboard_ distance to what you typed, as per a standard U.S. layout keyboard. Written in Haskell. [Source on Github](https://github.com/pickledish/spellcheck).

#### Healing Game
An experiment in concurrent message-passing protocols I made while I was teaching myself Elixir! It's little CLI game modeled after World of Warcraft-style boss fights I would play in high school. It may not be balanced, but it doesn't cost $15 a month! [Source on Github](https://github.com/pickledish/heal).
