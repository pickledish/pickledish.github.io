---
layout: post
title: "What Does Reliability Look Like Now?"
permalink: /posts/reliability/
---

It's a weird time to be an SRE.

The rise of LLM coding tools (like Claude Code and Cursor), and more recently totally hands-off cloud agents (like Devin and, uh, Cursor), has been meteoric, and never in the past has the average software engineer been shipping more code or reading less code.

At this point it feels kind of futile to argue for the value of writing/reviewing code line-by-line like we always have in the past -- I worry the way most software is created has fundamentally changed, whether we like it or not, and we're nowhere near the end of this ride yet.

So, we adapt!

Though it's still very new, I wanted to spend a minute thinking out loud about what an SRE's job might look like in this new world -- someone whose role isn't to wrangle a dozen agents at once to get features out the door fast, but to manage the fallout of a whole team of engineers (and increasingly, designers and product managers too) shipping code that way.

How do we keep the lights on when Claude writes the code, GPT stamps and merges the PR, an alert goes off an hour later, and the first troubleshooting step the on-call reaches for... is to hand the alert to another LLM?

---

First of all, I don't think we can get away with poor failure isolation anymore.

In a small-to-medium-sized tech company it's very normal to have a "god service" -- as in, one deployment of web servers that handles every endpoint in the backend. Maybe it's got a few other responsibilities too, like a timer it kicks off at startup to do a small scheduled task every hour? It's not a big deal -- standing up a whole separate deployment just for that would have been overkill!

This actually does work OK with small teams. The rate of change is low enough, and when a bug _does_ sneak in and result in an outage, the whole team learns the shape of that problem and takes more care in the future (this being one area that LLM agents ____).

But, I think it's fair to say that what's "overkill" changes a bit when you have the equivalent of dozens or hundreds of chaotic junior developers merging code 24/7.

In that environment, things are going to start breaking a lot more often (something I do think we're already seeing today), and it's becoming more important to make sure that a bug in _one_ endpoint handler doesn't take down the entire platform, as happens all too often with the "god service". Otherwise, you're looking at not even a single 9.

A few weeks ago, a friend at work made a passing comment to the effect of:

> AI companies keep advertising "1 developer can do the work that used to require 10". This is true to an extent, but, it also means that your 50-person dev team is now shipping the changes of a 500-person dev team, and thus kind of needs the operational rigor of a 500-person dev team.

Word!

---

Secondly -- and sadly harder to achieve -- I think the production environment needs to become pretty much _spotless_.

What I mean by this is, it needs to be operationally super boring -- stable, like a cleanroom, free of even a single speck of dust. Zero (or very low) spurious error rates, flat CPU usage and request latencies, no memory leaks, you get the idea.

This is vitally important because any noise in these metrics makes it much harder to ascertain exactly when a problem was introduced. Look at the two graphs below -- can you tell when the bug was introduced in the first one? And when in the second?

<img src="/assets/reliability/good.png">

<img src="/assets/reliability/bad.png">

We need this because it's an area where I've noticed a big difference in the behavior of humans and LLM agents. A human operator working on a system naturally gets used to what "normal" looks like for that system -- the seasonality of request rates and latency, the errors that show up a lot but don't actually mean anything. They learn, over time, to sift through the noise and ____[notice the things that really matter].

LLM agents are NOT GOOD AT THIS! Or at least, not yet. They've been trained to find a "smoking gun" come hell or high water, and they're happy to bring home a nice red herring for you if your error logs point it ____[in the wrong direction]. It's remarkable the extent to which garbage in the context window can render an LLM ____[useless].

A clean working environment is the ____[substrate/mechanism] that allows an LLM to keep iterating autonomously, using observability data to fix its own mistakes, instead of getting itself into confused spirals.

---

Anyway, these are just a few ideas I've had over the last few months.

Like I said, I imagine we're still really early into this, and who knows how the landscape will change over the course of another year... it'll be interesting at least :eyes:
