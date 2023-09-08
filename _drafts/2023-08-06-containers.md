---
layout: post
title: "Containers IRL"
permalink: /posts/containers/
---

Docker confused me for a while. Containers are like VMs... but better, somehow? They're "lightweight", but I need to install some [multi-gigabyte program](https://www.docker.com/products/docker-desktop/) and learn a [special new file format](https://docs.docker.com/engine/reference/builder/) in order to use them on my Mac? I'm developing software just fine right now, why would I want this extra complexity?

Since then, I've had the chance to work on containerized services, in both work and personal projects, and I'd say I "get it" now. Still, I wish it hadn't been so hard just to understand what the big deal was.

I think what would have helped me "get it" sooner is concrete examples. No fancy new tech is a silver bullet, right? So, what are the real-life situations where using a container will make my life easier?

To that end, I wanted to write the article that would have helped me a couple of years ago. My hope is to deobfuscate the common refrain "containers are the best you should use them for everything" into some (...in this case two) individual, specific use cases, which are easy to articulate and have been helpful in my own life.

Without further ado, using containers can...

## Drastically Reduce Project Onboarding

To co-opt the ["cattle and pets"](https://devops.stackexchange.com/questions/653/what-is-the-definition-of-cattle-not-pets) analogy for running servers, development machines are _always_ pets. Every person working on a project has a different version of Python installed, a different DNS resolver, different hardware virtualization support... so it's almost impossible to write a step-by-step setup script (or even a guide) that actually works for everyone.

If you've containerized your project's build, it means that those setup steps each happen in an identical, clean Linux environment, no matter what the situation is on the host computer. This way, someone who's just pulled your repoository for the first time can, just a couple of minutes later, see a successful build, see the tests pass, and start making changes. The barrier to entry is so much lower! This is huge for OSS contributors, coworkers, and your future self when your laptop falls into the ocean and you need to start with a fresh one.

To see an example of this kind of use for containers, check out the repo for [my resume](https://github.com/pickledish/resume). Building the PDF used to require installing LaTeX, editing your PATH, installing subpackages and fonts -- now it's just a single `toast build`.

## Allow Crazy Flexibility in Production

In a perfect world, a product's software stack would be beautiful and homogenous -- a small number of services with clearly-dileneated boundaries and responsibilities, all using the same language and runtime version. Aaaahhhh.

And in reality, "prod" is often some combination of Ruby for the web server, ____ for the databases (oh except the Elasticsearch one, that requires the JVM), nginx serving some static files, and one cronjob someone wrote years ago in Python 2.7 to periodically update a JSON file. All of this running across 3 bespoke servers since Rails couldn't handle the traffic on just one anymore.

Standing up kind of Ansible (or worse) setup, which can install and upgrade the dependencies for all of these simultaneously and without ____, is nightmarish.

But, if you invest the small amount of time needed so your project runs in a container, it instantly becomes a non-issue. It can then just be tossed into some kind of orchestration system (Kubernetes is the standout here, but there are lots of simpler alternatives, like ____ and ____). There, it is identical to any and every other application ("just run this container"), and

## ...But Only Sometimes

There's an important caveat here. Both of the above problems I listed, which containers are great solutions for, are _only problems in certain situations_:

* Reducing the time to onboard to a project is only important when you have a large, rotating group of people all working on the project
* Production environments only require crazy flexibility when they're old, ____, or again -- were worked on by a large and rotating group of people

The gist is that the benefits of containerization are often only seen in medium-to-large-scale projects.

* Is only worked on by one or two people
* Is only written in one programming language
* Is only run on a single server

The wrangling your code into containers will probably be of just academic interest.

## Further Reading

And that's the blog post!

These days, as you can probably tell, I'm a big fan of containers -- both what they allow groups of developers to accomplish, and the suprisingly simple way they work under the hood. If you want to learn more about how the "magic" of these lightweight VM-like

* https://jvns.ca/blog/2016/10/10/what-even-is-a-container/
