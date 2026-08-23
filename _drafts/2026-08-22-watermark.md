---
layout: post
title: "Building an Intuition for Watermarking"
permalink: /posts/watermarking/
styles:
  - /assets/watermarking/watermark.css
scripts:
  - /assets/watermarking/watermark.js
---

Since Anthropic's [announcement](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content) a couple of weeks ago that they (along with most other LLM providers) would start adding an "imperceptible" watermark to Claude outputs, there's been a lot of consternation online. Does it degrade the quality of the model's generated text? Some assert [it absolutely does not](), and others assert [it absolutely does]().

Hm!

Well, I guess I just have to go understand the damn thing so I can make up my own mind.

The actual implementation is unfortunately more in-the-weeds than I was hoping, at least for someone with a good decade between them and their last statistics class and no familiarity beyond the basics with LLMs. Still, after spending a few hours going back and forth with the papers and articles, I think that not only do I now have a more definitive answer for whether the process degrades the output, but I also believe that it's not so hard that only an academic can understand it.

So, I've taken the intuition I built and distilled it into a short explainer here, broken down into a few iterative stages where each stage just changes one small thing about the last, starting with normal LLM token sampling and ending with full-on SynthID.

Let's see if we can understand it together!

## Stage 1: Sample One Token

We'll start with the normal way an un-watermarked LLM emits text.

In short, the token-generation process is to:

1. Look at all of the text that has preceded the token you want to emit
2. Do a lot of math to generate a probability distribution of what the next token could be
3. Sample from this distribution, emit that token -- then do it all again

So, for a situation where the LLM's next-token probability distribution looks like this:

{% include watermarking/distribution.html %}

Then you can try out the sampling process yourself to get a feel for it:

{% include watermarking/sampling.html %}

LLM knobs you may have heard of, like `termperature` and `min-p`, control aspects of this distribution (e.g. how "sharp" it is, or how distinct options there are), but the process we're talking about here is always the same.

## Stage 2: Sample Two Tokens

Now, let's make a small modification to the sampling process above.

Instead of just sampling one token from the LLM's distribution and emitting that, we're going to sample _two_ tokens, and just flip a coin to determine which of the two we will emit.

You can try out this modified sampling process yourself:

[widget for sampling 2 tokens from the model and then picking one randomly]

The important thing to note here is that this is _perfectly equivalent_ to Stage 1 in terms of outcome. Despite the extra steps here, we haven't changed the model's outputs in any way yet, as you can see when we take "mango" as an example:

```sh
# Stage 1
P("mango") = P("mango" is sampled)
           = 65%

# Stage 2
P("mango") = P("mango" is sampled first) * P(coin is heads) +
             P("mango" is sampled second) * P(coin is tails)
           = (65% * 50%) + (65% * 50%)
           = 65%
```

So yes we've just made it convoluted for no reason but BEAR WITH ME!

## stage 3: The 'g' Function

Now, the real watermarking begins here in Stage 3.

We're going to change just one thing from Stage 2, which is the coin flip -- we're going to replace it with a simple function, called `g`, which sometimes has a preference between the two candidates it's given.

Other than that, the process is exactly the same as in Stage 2, as you can see:

[exact same widget as in stage 2, but with coin replaced by `g`]

So, the question is -- what is this `g` function, and when does it prefer one token over another?

use the prev 4 tokens + secret key to make a hash, give 2 candidates a 0 or 1 score based on parity with hash or whatever

[widget demonstrating this, tokens -> 0 or 1 score]

two KEY THINGS to note here!!

1. without secret key, hash is indistinguishable from random noise => indistinguishable from stage 2
2. however, we ARE distorting the probability distribution here -- show table or something:

if candidates are A and B, say, A with 80% probability and B with 5% probability per vanilla logprobs

A 0 and B 0 => coin flip, no watermark
A 1 and B 1 => same
A 1 and B 0 => distorted distribution becomes A = 1-(0.2)^2, B almost never picked
A 0 and B 1 => B becomes 10% ish

[this can probably be non-interactive but we want it to be really clear]

## stage 4: synthid (30 g-functions, 2^30 candidates)

(skip for now, we'll come fill this in later)







notes from tests

- put g-function interactive RIGHT BELOW coin-flip interactive
  - to show that it's the exact same except `g` instead of `rand`
  - from the outside, g seems like randomness
  - but here's what it's really doing: then show the scoring, 1 vs 0
