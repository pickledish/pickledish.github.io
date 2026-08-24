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

The actual implementation is more in-the-weeds than I was hoping, at least for someone with a good decade between them and their last statistics class and no LLM familiarity beyond the basics. Still, after spending a few hours going back and forth with the papers and articles, not only do I think I have a more definitive answer for whether the process degrades the output, but I also believe it's not so hard that only an academic can understand it.

So, I've taken that intuition and tried to distill it into a short explainer here, broken down into 4 stages with each stage building one small new thing upon the last, starting with normal LLM token sampling and ending with full-on SynthID.

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

LLM knobs you may have heard of, like `temperature` and `min-p`, control aspects of this distribution (e.g. how "sharp" it is, or how many distinct options there are), but the process we're talking about here is always the same.

## Stage 2: Sample Two Tokens

Now, let's make a small modification to the sampling process above.

Instead of just sampling one token from the LLM's distribution and emitting that, we're going to sample _two_ tokens, and just flip a coin to determine which of the two we will emit.

You can try out this modified sampling process yourself:

{% include watermarking/coin-flip.html %}

The important thing to note here is that this is _perfectly equivalent_ to Stage 1 in terms of the outcome. Despite the extra steps here, we have not changed the model's outputs in any way yet, as you can see when we take "mango" as an example:

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

## Stage 3: The 'g' Function

Now, the real watermarking begins here in Stage 3.

We're going to change just one thing from Stage 2, which is the coin flip -- we'll replace it with a simple function, called `g`, which, sometimes, has a preference between the two candidates it's given.

Other than that, the process is exactly the same as in Stage 2, as you can see:

{% include watermarking/g-function.html %}

So, the question is -- what is this `g` function, and when does it prefer one token over another?

Fortunately it is pretty simple! Essentially:

* `g` calculates `hash(previous_4_tokens + secret_key + candidate_token)`
* `g` likes a candidate when that hash comes out as an even number (i.e. ends with 0)

And if it likes both candidates (or dislikes both candidates), it just selects one at random. You can put your own secret in below to see how `g` works:

{% include watermarking/hash.html %}

Each of the elements of the hash serves an important purpose:

* `candidate_token` is, of course, the subject of our watermarking
* `previous_4_tokens` is included because otherwise we'd just ALWAYS penalize a certain word
* `secret_key` so that only the LLM provider can watermark, or detect, text

two KEY THINGS to note here!!

1. without secret key, hash is indistinguishable from random noise => indistinguishable from stage 2
2. however, we ARE distorting the probability distribution here -- see below

## Aside: Distortion

Let's focus for a moment on the least probable token the LLM could generate: "papaya", at just 5% likelihood. In a contest between "papaya" and any other token, there are 4 possible scenarios of which ones the `g` function will have a preference for, each showing up with the same frequency:

* `g` likes both of them
* `g` likes neither of them
* `g` likes "papaya" but not the other one
* `g` likes the other one but not "papaya"

In the first two situations, `g` acts the same as the coin flip -- no watermarking business occurs. But in the latter situations, things get weird -- `g` no longer acts like a random coin. In the third scenario for instance, `g` will _always_ choose "papaya" over the other candidate.

So, remember the "probability distribution" created by the LLM in Stage 1? This can distort it pretty substantially. If you try the buttons below, you can see how "papaya" is affected by two `g` functions at the different extremes: one that likes "papaya" and no other tokens, and one that likes all tokens _except_ for "papaya":

{% include watermarking/distortion.html %}

In the "`g` likes only papaya" case, "papaya" will automatically win any contest it's in. This nearly _doubles_ the chances that the LLM will emit "papaya" as the next token.

But, the "`g` likes everything except papaya" case is even more extreme -- it means that the only time "papaya" can be emitted is when it appears as _both_ candidates in a contest. This almost never happens, and so its real chances drop to almost 0%.

{% include disclaimer.html content="
It's important to note that, when looking across _all_ `g` functions, the effects \"average out\" -- as in, the `g` that loves \"papaya\" turns up exactly as often as the `g` that hates \"papaya\", and so when considering ____[broad/large text generation], the overall likelihood that \"papaya\" is generated is the same as what the LLM would've come up with organically.

From my understanding, a lot of the \"watermarking does not impact model quality\" argument stems from this fact.

Personally I'm not totally convinced; to me it sounds a bit like you have a bunch of customers come in, each requesting a dozen bagels, and you decide at random to give them either 0 or 24. Sure, at the end of the day you can claim you gave out a dozen bagels _on average_... But did each customer actually get what they were expecting?
" %}

## Aside: Detection

Notice that crucially, `g` only relies on 3 parameters -- two of which you can plainly see in the generated text itself, and `secret_key` is just a fixed string that lives on a post-it note in somebody's desk.

What this means is that **we don't need the LLM around to determine if text was watermarked**, we just need the text itself and the secret, and we ourselves can re-run the same calculation `g` is doing. This part was really non-intuitive to me -- I thought I knew how watermarking worked (seeding the LLM's PRNG), but when I dug in I realized that detection would have more or less required the entire context + re-running the LLM 😅

Anyways, calculating `g` ourselves is important because that's how detection works!

Let's revisit the 4 equally-likely situations `g` will be presented with, and specifically look at what kind of token gets output in each of those situations:

```
g likes both candidates           =>   💚 g picks a token it likes
g likes neither candidate         =>   👎 g picks a token it does not like
g likes the 1st but not the 2nd   =>   💚 g picks a token it likes
g likes the 2nd but not the 1st   =>   💚 g picks a token it likes
```

Do you see how, in 3 of those 4 situations, the LLM ends up emitting a token `g` preferred?

This means that, in watermarked text, we can expect **75%** of the tokens on average to be `g` preferred tokens, as opposed to only 50% in non-watermarked text. So if we re-run the `g` calculation on some arbitrary text, and keep track of how many tokens

(detection is now possible, widget with example)

## stage 4: synthid (30 g-functions, 2^30 candidates)

(skip for now, we'll come fill this in later)
