---
layout: post
title: "Introducing Cheapskate!"
permalink: /posts/cheapskate/
---

[Cheapskate](foo) is a tool I've made over the last few months to help manage investments.

I built it for me, but it wasn't very much work to also build it for you, so I also built it for you.

(image)

You visit once a month with statements from all your bank accounts, and Cheapskate parses the individual investments from each one to track your holdings over time. More importantly, you assign an asset class to each, and define a target portfolio composition, so the tool can help you diversify according to your own unique goals.

I'm proud of it, and so I wanted to share a little here about how it came to be, what it is today, and where it's going next!

## Origin Story

I'm not really a money person, so now that through some weird twists of fate I have some, my modus operandi is just "don't fuck it up", right. In that vein, it seems like the common-sense approach is "diversification" -- spread your eggs among a few different baskets so you don't lose literally half of worth in an event like 2008. Something simple, like the [Boglehead three-fund portfolio](https://www.bogleheads.org/wiki/Three-fund_portfolio), 60%/20%/20%. Yeah, I can do that!

Turns out, that's easier in theory than in practice. What happens when you have four different accounts -- two 401(k)s, a Roth IRA, and an after-tax one? And so does your wife? Is it better to hold bonds in a tax-advantaged account? What if her 401(k) only really has "target date" funds which are a blend of US stocks, international stocks, and bonds? And most importantly -- even if you do all the math to get the allocation perfect _right now_, how's that going to look next year? You ready to do it all again?

I think this is the point some people might get a money-manager. But not this guy!

I just in general dislike outsourcing problems like this, and besides, this _concept_ isn't difficult, just the math is. Software is great at doing hard math. I'm a software developer. I think we can make something happen here?

My original concept was quite different from where we ended up, and quite simpler -- just use [Plaid](https://plaid.com/) or something to connect to a user's accounts and pull holdings for each, then aggregate with a few pie charts to help them make rebalancing decisions. Easy! But, apparently the "pull holdings" part is... special? And really expensive? Like, the "contact sales" kind of expensive; I saw reports of minimums being in the hundreds of dollars per month, of course an outlandish sum for an open-source app I wanted to offer for free.

So, I had to do something different, and the current Cheapskate was born!

## Architecture

The Cheapskate architecture is super simple, and (not coincidentally) also my favorite format for software :)

It's a "backend-free" web app, which means it is just a static bundle thrown onto Bunny CDN (though any web host will work fine here), plus a database that the frontend talks with directly via e.g. PostgREST (Firebase and Supabase are the usual picks here, and Cheapskate uses the latter one).

I've always felt this is the ideal shape for a one-person software project to take:

* It is extremely cheap, since static site hosting costs pennies, and Firebase/Supabase both have generous free tiers for their DBs
* The codebase stays small and focused, since all that fiddly unrelated-to-my-app-but-must-be-set-up-perfectly stuff (like auth, CORS, load balancer health checks, Helm charts, etc) simply doesn't exist
* It is zero operational burden, since there are no servers to manage, no Docker images to build, no blue/green deployments to watch, stuff like that

There is some functionality already that can't fit into this simplistic model. For example, both the PDF-parsing and account-deletion bits require secret credentials (an OpenRouter API key and the Supabase service key respectively) that can't be published, and so Cheapskate uses a couple of [Edge Functions](https://supabase.com/docs/guides/functions) for those. Future functionality might lean on more of them.

Still, the system has been very pleasant and functional to develop so far!

## Data Model

The data model was a lot of fun to iterate on, and I really like where it ended up, which is an event-log style that works well for historical queries. 

It has the entity tables you'd expect (an `accounts` table with one row per account, an `assets` table with one row per asset, etc), which hold metadata. Updates to the meat and potatoes, though, like asset prices or holdings in an account, never result in a value being edited in the database; they insert a new row in an `updates` table, like an append-only log, with "effective date" timestamp. 

<img src="/assets/cheapskate/data.svg">

From this, we can reconstruct the state of an account at any point in time just by filtering the updates table for that effective date. This is key for the "portfolio" and "net worth" views, where we have to determine an account's value at the end of every month. A bit reminiscent of [real-time data's unifying abstraction](https://web.archive.org/web/20160401105909/https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) perhaps?

It also means we get statement backfills and a complete audit log essentially for free!

(image)

It isn't truly append-only (Cheapskate does support deleting an update as a means of undoing a mistake) but the benefits are the same, and it also makes it easy to reason about how new kinds of updates should work.

## LLM Stuff

The most interesting part of Cheapskate, to me, is how it leverages LLMs, turning a task that would've been difficult-to-impossible a few years ago into something that can be done on a mid-spec laptop today.

The LLM integration is what enables the app to parse any statement, from any bank, into a list of investment holdings. For this, the "upload statement" flow uses the structured-output mode that's provided by any OpenAI-compatible LLM API (and has actually existed for a pretty long time, [over 2 years](https://openai.com/index/introducing-structured-outputs-in-the-api/) now). It's a great feature for incorporating isolated bits of AI magic in more "normal" applications, and I wish it got more love!

(image)

This did take some experimentation to get right. For example:

* Did you know LLMs can't actually read PDFs? They can read text and sometimes images, and a PDF is neither, so when you upload one to ChatGPT or whatever, they're converting it behind the scenes. Cheapskate v0.1 converted the PDF to an image (and thus required a VLM, a "vision language model", just an LLM with image encoder), under the impression that statements often include weirdness like graphs and multi-column layouts which would be better understood as an image. Totally wrong! It turns out `getTextContent` from [pdf.js](https://mozilla.github.io/pdf.js/) giving extracted text + coordinates from the PDF, while inscrutable to a human, ends up both more accurate and more token-efficient for an LLM.

* There's also a snag using structured output here, in that it's incompatible with reasoning, at least today. This kind of makes sense; from what I understand, structured-output mode constrains the tokens the LLM is able to predict to those which are valid JSON + match the provided schema, right? And a reasoning block is just prose, not JSON, and so can't be generated. Still, this feels like a bug to me, and I hope it's fixed! In the meantime its effect on Cheapskate wasn't great; while large LLMs are smart enough to figure out the answer entirely in [latent reasoning](https://arxiv.org/abs/2507.06203) / "[J-space](https://www.anthropic.com/research/global-workspace)", laptop-scale ones kinda need the help from a little thinking time!

I was able to sort out the latter issue above with a two-step approach -- in one prompt, include the PDF and just ask the LLM to extract the information as regular text, and then a follow-up prompt to ask it to render that same information as JSON in structured-output mode -- which works well (and doesn't incur much latency thanks to the prompt cache).

In the end, we have an approach where a model as small as 4B params can accurately process a 10-page statement (a task that takes under 30 seconds on my base M5 Macbook), which I'm really happy with!

## Sharing and Security

Cheapskate does include family sharing, but it's very basic, just "good enough for now".

It was necessary because I'm married / have combined finances with my wife, and so I wanted to make sure anyone in this situation could use the app effectively. With this model, anyone in a family has full CRUD permissions for all of the family's accounts, assets, and goals.

Implementation-wise, it's woven into the RLS policies for every table. Instead of "each _user_ can CRUD only their own rows" (as is the most common case with RLS), I've gone with a set of "each _family_ can CRUD only its own rows" policies. When a user attempts to run a query against a table, Postgres runs a quick check to see what family that user is a part of, and the RLS is applied from there.

This works well! The implementation scope was small and simple, and it makes it very easy to invite someone else to your family and be sure that they will be able to do everything they need to do.

There are substantial downsides to this approach, though. For one, it's not very flexible; it isn't possible to (for example) add someone as a "limited" member of a family, with visibility of, or write access to, only certain accounts. I believe implementing this would be very difficult with this sharing architecture.

In addition, it is entirely "security by obscurity"! Just knowing a family's UUID is enough to join it; an existing member doesn't need to approve a request to join, and I don't think it'd be easy to allow e.g. kicking someone out of your family. My logic here is that it's impossible to guess a UUID (and we very explicitly deny `SELECT` on the families table so folks can't scan it), so that acting as a sort of very-long password for a family's data is an alright place to start.

<!-- Also I have always liked security-by-obscurity approaches, I think they are cute :) -->

## The Future?

I am excited to continue developing Cheapskate! This is just v1 / the first iteration I feel good enough about to share.

Ultimately, in line with my goal of this being a kind of pseudo-robo-advisor, I'd like to take the "portfolio rebalancing" aspect one small step further than it is today, and enable Cheapskate to make **suggestions** around what assets you could buy or sell in order to achieve a portfolio composition that's more in line with your goals.

To make these suggestions actionable / not annoying, we'll need to pull in some external data -- namely, ticker prices for publicly-traded assets, probably on a daily basis. This way, a suggestion won't just be "you ____", it will be "", which is a lot easier to take action on.

I've been putting this off so far since it'll require some background service, or cron-triggered edge function, to actually update the prices, and likely some kind of integration with a finance API to get that data, which, I don't know how expensive that'll be. Still, it's a "soon" thing, and will (in my opinion) greatly improve the usefulness of the site.

In addition, ____
