---
layout: post
title: "Building a Web Service -- The Managed Parts"
permalink: /posts/bootstrap/
---

I'm making some software!

It's a website hosting service; you can check it out [here](foo) if you're interested. But I don't want to talk about _why_ I created it -- there's enough about that at the link above.

Instead I want to talk about _how_ I created it -- a short retrospective about the choices in technologies I made in building it, what they were like to use, and whether I think I made the right calls in the end, with the hope that these musings might be useful in your own journey.

**This is the first of a two-part series**, where I'll talk about the _managed services_ used by CBNR. These are the parts I'm not hosting myself, and instead relying on other companies' offerings, usually paid (although as you'll see, CBNR fits pretty easily into the "free tier" of several).

So, let's get on with it! There are only 6 in total:

## Namecheap

Namecheap is a domain registrar. This means it allows you to purchase year-long DNS registrations, and gives you a dashboard with which you can set DNS records for those domains (so they point to IP addresses or other URLs).

**Experience: great**! Namecheap doesn't gouge you on the registration pricing, has an easy-to-use domain admin panel, and support has been fine (the one or two times I've needed to use it). No issues!

**Cost**: I pay about $10 a year for the domain name.

## Github

Github (a familiar name to many) is a hosted Git service, allowing developers to `git push` code written on their laptops to a centralized location where others can view and collaborate on it.

**Experience: fine**!

## Docker Hub

Docker Hub is a container registry, which is just a place machines can publish and download [OCI images](). For example, we push images to it from a [Github CI action](), and those images are pulled by Kubernetes pods.

**Experience: fine**! This one's a bit hard to evaluate, since usually it just works and I don't touch it. However, I have been affected by a few downtime events in recent months, which is pretty remarkable considering how I'm only pulling images once or twice a day, always during business hours -- that functionality should be rock-solid.

**Cost**: On the plus side, I only have one private image and thus don't need to pay them any money, so I can't knock it too much with its $0 pricing.

## Hetzner

Hetzner is a company that operates datacenters, primarily in Germany. They offer inexpensive server hosting -- you pay them some money every month, and you get SSH access to a (usually pretty beefy) server in the EU.

**Experience: great**! A server, a Linux-flashing tool, and a firewall -- that's all you need to get something like [k3s]() working great, and that's all Hetzner gives you. The fact that they try to do so little, though, is a boon, since those few things are rock-solid.

**Cost**: The other benefit of Hetzner's small scope is its incredible cost efficiency. I pay just shy of $30 a month for the server, which is by far CBNR's biggest cost, but for that you get a very modern 12-thread Ryzen processor, 64GB of RAM, unlimited bandwidth -- [an equivalent on AWS would cost hundreds](https://instances.vantage.sh/aws/ec2/m5ad.4xlarge).

## Supabase

Supabase, a relatively new startup, provides a hosted database alongside a solution for user authentication and management, and those two integrate nicely with each other -- similar to Google's [Firebase]() offering. This is the only thing I _could_ host myself pretty easily, but choose not to.

**Experience: great**! It took me a minute to wrap my head around, but the RLS-first approach of Supabase has resulted in me writing a _lot_ less boilerplate backend code than I thought I'd need to. It's been fun learning and extending the JWT auth model to fit CBNR's needs, too.

**Cost**: Currently I still fit into the free tier, but I'm not sure how long that'll last.

## Bunny CDN

Bunny is a "content delivery network", which is a service that takes files and distributes them to fast SSD-based servers all over the world so folks can load them quickly.

**Experience: fine**!

---

## Kubernetes

Kubernetes is a container orchestration tool -- it helps you manage the placement, upgrading, and scaling of containerized applications on a (usually large) fleet of servers.

**Verdict: great**! Kubernetes might seem like an odd choice, given that I'm only running one server to start. However, with `k3s` it's extremely quick to set up, and the developer experience of deploying and updating multiple heterogenous services running side-by-side is second to none in how robust and consistent it is.

Granted, I started this adventure familiar with Kubernetes, and I'm sure other container solutions
