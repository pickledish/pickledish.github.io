---
layout: post
title: "Predictability Over Everything"
permalink: /posts/predictability/
---

Good news, the investors liked our idea and we're starting a company! First things first, we need ____. There are two options on the table:

* A database that's clearly what the future will be built on -- it's written in Rust, is wire-compatible with the old Java DB it's competing against (but blows it out of the water on performance), includes an intelligent sharding setup out of the box for balanced load distribution and uses Raft for consensus across replicas... or,
* A database that does what I expect it to and doesn't often surprise me

And I'll pick the latter every single time, given almost any requirements. No hesitation.

---

I think everybody likes predictable software. It's clearly a good trait for tech to have, right? But the problem comes when, comparared to other more flashy adjectives, it seems to get benched almost immediately. You value predictability... but you chose a NoSQL backend despite never having used one before, because you heard they are more scalable. You want your team's on-call shifts to be uneventful... but you chose to use a brand-new CRDT-based approach because you thought you might want your app to be collaborative someday, and their website says it's good for multi-user data sync.

Cut it out!

Predictability is not a "nice to have". It is the _main consideration_ you should be looking at when choosing technology to adopt. You should be happy to rule out big swaths of software because you don't think your team will be able to get up to speed on them quickly, or because you aren't 100% sure that your potential usecase lines up perfectly with the problem they were created to solve.

To be more explicit about what these sacrifices might look like (the "it sounds good in theory but we should probably go with something else in reality" kind that I'm advocating for), here are a few examples:

* __Predictable over performant__. If I know my data-enrichment service caps out at processing 1,000 messages per second, you might offer me a replacement that can process 2,000 per second... but only as long as the messages are each under 1 kilobyte (_but I mean they almost always are so it's no big deal_)... and unless a certain in-memory buffer is full... in which case it'll drop to 200 per second, and take the developers hours to figure out what happened. I'll stick with the former.
* __Predictable over featureful__. (plain redis is fine)
* __Predictable over resilient__. (self healing, consensus, no)

---

Of course, which software is "predictable" depends on who you're asking. For me, the various behaviors and configuration knobs of Apache Kafka are usually (...unfortunately) not too surprising anymore. But I can also imagine a million situations where ____. Usually, the least surprising solutions are the ones your team already has a lot of experience with.

That being said, some software is a lot more predictable than most. It's usually the really simple stuff [insert the "everybody loves redis for a reason" bit here]

You can work around gaps you know exist. You can't work around gaps that surprise you in the middle of an outage.

