---
layout: post
title: "Containers IRL"
permalink: /posts/containers/
---

Docker confused me for a while. Containers are like VMs... but better, somehow? They're "lightweight", but I need to install some [multi-gigabyte program](https://www.docker.com/products/docker-desktop/) and learn a [special new file format](https://docs.docker.com/engine/reference/builder/) in order to use them on my Mac? I'm developing software just fine right now, why would I want to add all this this complexity to my toolchain?

Since then, I've had the chance to work on containerized services in both work and personal projects, and I'd say I "get it" now.

Still, I wish it hadn't been so hard just to understand what the big deal was.

I think what would have helped me "get it" sooner is concrete examples. No fancy new tech is a silver bullet, right? So, what are the real-world situations where using a container will make my life easier?

To that end, I want to write the article that would have helped me a few years ago. My hope is to deobfuscate the refrain "containers r the best u should use them for everything" into some (...two) individual, specific use cases, which are easy to articulate.

Without further ado, using containers can...

## Drastically Reduce Project Onboarding

To co-opt the ["cattle and pets"](https://devops.stackexchange.com/questions/653/what-is-the-definition-of-cattle-not-pets) analogy for running servers, development machines are _always_ pets. Every person working on a project has a different version of Python installed, a different DNS resolver, different hardware virtualization support... so it's almost impossible to write a step-by-step setup script (or even a guide) that actually works for everyone.

If you've containerized your project's build, it means that those setup steps each happen in an identical, clean Linux environment, no matter what the situation is on the host computer. This way, someone who's just pulled your repository for the first time can, just a couple of minutes later, see a successful build, see the tests pass, and start making changes. The barrier to entry is so much lower! This is huge for OSS contributors, coworkers, and your future self when your laptop falls into the ocean and you need to start with a fresh one.

To see an example of this use for containers, check out the repo for [my resume](https://github.com/pickledish/resume). Building the PDF used to require installing LaTeX, editing your PATH, installing subpackages and fonts -- now it's just a single `toast build`.

## Allow Crazy Flexibility in Production

In a perfect world, a product's software stack would be beautiful and homogeneous -- a small number of services with clearly-delineated boundaries and responsibilities, all using the same language and runtime version. Aaaahhhh.

In reality, "prod" is often some combination of Ruby for the web server, C++ at the database layer (oh except the Elasticsearch one, that requires the JVM), nginx serving some static files, and a cronjob someone wrote years ago in Python 2.7 to periodically update a JSON file. All of this running across 3 bespoke servers since Rails couldn't handle the traffic on just one after a few years.

Writing some kind of Ansible setup, able to install and upgrade the dependencies for all of these simultaneously and without downtime, is scary for me to even think about.

But, if these services and cronjobs ran in containers instead? It instantly becomes a non-issue. They can then just be tossed into some kind of orchestration system (Kubernetes is the famous one, but there are lots of simpler alternatives, like Hashicorp's [Nomad](https://www.nomadproject.io/) and Amazon's [ECS](https://aws.amazon.com/ecs/)). There, each service is identical to any other, and both your ops platform and your ops people can start worrying about more important things (or just get some sleep).

## ...But Only Sometimes

There's an important caveat here. Both of the above problems I listed, which containers are great solutions for, are _only problems in certain situations_:

* Reducing the time to onboard to a project is only important when you have a large and rotating group of people all working on the project
* Production environments only require crazy flexibility when they're old, handle a lot of functionality, or again -- are worked on by a large and rotating group of people

In other words, the benefits of containerization are often seen primarily in medium-to-large scale projects. If your software stack is mostly:

* only worked on by one or two people,
* only written in one programming language, or
* only run on a single server

...then wrangling your code into containers will probably be of merely academic interest.

## Further Reading

And that's the blog post!

These days, as you can probably tell, I'm a fan of containers -- both what they allow groups of developers to accomplish, and the surprisingly simple way they work under the hood. If you want to learn more about the implementation behind the "magic" of these lightweight VM-like environments, I can recommend:

* [Build Your Own Docker with Linux Namespaces, cgroups, and chroot](https://akashrajpurohit.com/blog/build-your-own-docker-with-linux-namespaces-cgroups-and-chroot-handson-guide/)
* [How containers work: overlayfs](https://jvns.ca/blog/2019/11/18/how-containers-work--overlayfs/)
