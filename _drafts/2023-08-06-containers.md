---
layout: post
title: "Containers IRL"
permalink: /posts/containers/
---

Docker confused me for a while. Containers are like VMs... but better, somehow? They're "lightweight", but I need to install some [multi-gigabyte program](https://www.docker.com/products/docker-desktop/) and learn a [special new file format](https://docs.docker.com/engine/reference/builder/) in order to use them on my Mac? I'm developing software just fine right now, why would I want this extra complexity?

Since then, I've had the opportunity to work on containerized services, in both work and personal projects, and I'd say I "get it" now. Still, I wish it hadn't been so hard just to understand what the big deal was.

I think what would have helped me "get it" sooner is concrete examples. No fancy new tech is a silver bullet, right? So, what are the real-life situations where using a container will make my life easier?

To that end, I wanted to write the article that would have helped me a year or two ago. My hope is to deobfuscate the common refrain "containers are the best you should use them for everything" into some (...in this case two) individual, specific use cases, which are easy to articulate and have been useful in my own life.

Without further ado, using containers can...

# Make building and testing easier

To co-opt the ["cattle and pets"](https://devops.stackexchange.com/questions/653/what-is-the-definition-of-cattle-not-pets) analogy for running servers, development machines are _always_ pets. Every person working on a project has a different version of Python installed, a different DNS resolver, different hardware virtualization support... so it's almost impossible to write a step-by-step setup script (or even a guide) that actually works for everyone.

If you've containerized your project's build, it means that those setup steps each happen in an identical, clean Linux environment, no matter what the situation is on the real computer. This way, someone who's just pulled your repoository for the first time can see a successful build, see the tests pass, and start making changes in just a couple of minutes -- great for OSS contributors, coworkers, and your future self when your laptop falls into the ocean and you need to start with a fresh one.

To see an example of this usage of containers, check out the repo for [my resume](). Building the PDF used to require installing LaTeX, editing your PATH, installing subpackages and fonts -- now it's just one `toast build`.

# Make running services easier
