---
layout: post
title: "Building Intuition for Watermarking"
permalink: /posts/watermarking/
styles:
  - /assets/watermarking/watermark.css
scripts:
  - /assets/watermarking/watermark.js
---

{% include disclaimer.html content="
Interactive widgets below were made with AI, but all words are [100% pure old-fashioned home-grown human](https://youtu.be/r4b3JHaxB2M?t=11). Hope you enjoy!
" %}

Since Anthropic's [announcement](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content) a couple of weeks ago that they (along with most other LLM providers) would start adding an "imperceptible" watermark to Claude outputs, there's been a lot of consternation online. Does it degrade the quality of the model's generated text? Some assert [it absolutely does not](), and others assert [it absolutely does]().

Hm!

Well, I guess I just have to go figure the damn thing out so I can make up my own mind.

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

LLM knobs you may have heard of, like `temperature` and `min-p`, can control aspects of this distribution (e.g. how "sharp" it is, or how many distinct options there are), but the process we're talking about here is always the same.

## Stage 2: Sample Two Tokens

Now, let's make a small modification to the sampling process above.

Instead of just sampling one token from the LLM's distribution and emitting that, we're going to sample _two_ tokens, and just flip a coin to determine which of the two we'll emit.

You can try out this modified sampling process yourself:

{% include watermarking/coin-flip.html %}

The important thing to note here is that this is _perfectly equivalent_ to Stage 1 in terms of the outcome. Despite the extra steps here, we have not changed the model's outputs in any way yet, as you can see when we take "mango" as an example:

```rb
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

We're going to change just one thing from Stage 2, which is the coin flip -- we'll replace it with a simple function called `g`, which, sometimes, has a preference between the two candidates in the contest.

Other than that, the process is exactly the same as in Stage 2, as you can see:

{% include watermarking/g-function.html %}

So, the question is -- what is this `g` function, and when does it prefer one token over another?

Fortunately it's pretty simple! Essentially:

* `g` calculates `hash(secret_key ++ previous_4_tokens ++ candidate_token)`
* `g` likes a candidate when that hash comes out as an even number (i.e. ends with 0)

And when `g` is given two tokens to decide between, it just opts for a token it likes, if there is one. If it likes both candidates (or it dislikes both), it selects one at random. This preference is what makes up the watermark!

You can put your own secret in below to see how `g` works:

{% include watermarking/hash.html %}

You might guess that, in our toy example here, there are 16 distinct like/dislike assignments that `g` could have, 16 different "moods" it could be in, depending on the secret key and the 4 prior tokens, shown as 16 columns below:


```
M: 💚 │ 💚 │ 💚 │ 💚 │ 💚 │ 💚 │ 💚 │ 💚 │ 👎 │ 👎 │ 👎 │ 👎 │ 👎 │ 👎 │ 👎 │ 👎
B: 💚 │ 💚 │ 💚 │ 💚 │ 👎 │ 👎 │ 👎 │ 👎 │ 💚 │ 💚 │ 💚 │ 💚 │ 👎 │ 👎 │ 👎 │ 👎
C: 💚 │ 💚 │ 👎 │ 👎 │ 💚 │ 💚 │ 👎 │ 👎 │ 💚 │ 💚 │ 👎 │ 👎 │ 💚 │ 💚 │ 👎 │ 👎
P: 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎 │ 💚 │ 👎
```

And, you'd be right!

---

Each of the elements of the hash serves an important purpose:

* `secret_key` being included in the hash means that only the owner of the LLM can apply, or detect, their own watermark
* `previous_4_tokens` is there so that `g`'s preference for a token is dependent on the tokens that come before it. Without this, `g` might (for example) just universally dislike "banana", which would be noticeable to users
* `candidate_token` is, of course, the subject of our watermarking

An interesting thing is, without _all three_ of these parameters, the hash is totally unpredictable, i.e. indistinguishable from random noise. This means, without the secret key, `g`'s choices seem random -- there's no statistical test you can run on a piece of text to tell whether it came from Stage 2 or Stage 3.

However, that doesn't mean `g` has no impact on token probabilities. That is next!

## Stage 3: Distortion

Let's focus for a moment on the least probable token the LLM could generate: "papaya", at just 5% likelihood. In a contest between "papaya" and any other token, there are 4 possible scenarios of which ones the `g` function will have a preference for:

<!-- don't say they're equally likely -- for a single token generation, like we're talking about here, they're not -->

* `g` likes both of them
* `g` likes neither of them
* `g` likes "papaya" but not the other one
* `g` likes the other one but not "papaya"

In the first two situations, `g` acts the same as the coin flip -- no watermarking business occurs. But in the latter situations, things get weird -- `g` no longer acts like a random coin. In the third scenario for instance, `g` will _always_ choose "papaya" over the other candidate.

So, remember the "probability distribution" created by the LLM in Stage 1? This can distort it pretty substantially. If you try the buttons below, you can see how "papaya" is affected by 2 of the 16 different `g` moods: one that likes "papaya" and no other tokens, and one that likes all tokens _except_ for "papaya":

{% include watermarking/distortion.html %}

In the "`g` likes only papaya" case, "papaya" will automatically win any contest it's in. This nearly _doubles_ the chances that the LLM will emit "papaya" as the next token.

But, the "`g` likes everything except papaya" case is even more extreme -- it means that the only time "papaya" can be emitted is when it appears as _both_ candidates in a contest. This almost never happens, and its real chances drop to almost 0%.

{% include disclaimer.html content="
It's important to note that, when looking across _all_ moods of `g`, the effects \"average out\" -- so, the mood that loves \"papaya\" turns up exactly as often as the mood that hates \"papaya\", and over many generations, le likelihood that \"papaya\" is generated overall comes to exactly 5%.

From what I understand, the \"non-distortionary\" claims in the SynthID paper and articles are based on this fact.

From my understanding, a lot of the \"watermarking does not impact model quality\" argument stems from this fact.
" %}

## Stage 3: Detection

Notice that crucially, `g` only relies on 3 parameters -- two of which you can plainly see in the generated text itself, and `secret_key`, which is just a fixed string that lives on a post-it note in somebody at Anthropic's desk.

What this means is that **we don't need the LLM around to determine if text was watermarked**, we just need the text itself and the secret, and we can run the same calculation `g` did. This part was really non-intuitive to me -- I thought I knew how watermarking worked (seeding the LLM's PRNG), but when I dug in I realized that detection would have more or less required the entire context + re-running the LLM 😅

Anyways, calculating `g` ourselves is important because that's how detection works! You can see the process right here:

{% include watermarking/detection.html %}

We walk through the text, calculating `g` for each token using the 4 tokens before it and our secret key, tallying up how many `g` liked and how many it didn't. Then, we use those counts to find the ratio, the "percent of tokens `g` preferred".

If that ratio is suspiciously high, then the text is watermarked!

## Stage 3: A Suspicious Ratio?

For me, the hand-waving above leaves a bit to be desired -- what should we _expect_ this ratio to be for watermarked and non-watermarked text, exactly? How do we know when it's high enough to be "suspicious"?

To understand, let's revisit the little contests that happen during generation, and look at cases separately -- when `g` is deciding between two different tokens, and when it gets duplicates.

---

First, let's consider the case where `g` is handed two **different** tokens. Remember from earlier the 4 situations, each equally likely on average, and in particular, let's see what kind of token is output in each:

```
g likes both candidates           =>   💚 g picks a token it likes
g likes neither candidate         =>   👎 g picks a token it does not like
g likes the 1st but not the 2nd   =>   💚 g picks a token it likes
g likes the 2nd but not the 1st   =>   💚 g picks a token it likes
```

Do you see how, in 3 of the 4 situations, the LLM ends up emitting a token `g` preferred? Thus the expected ratio is pushed up towards 75% -- pretty high!

---

But, now suppose `g` sees the **same** token twice to "decide between". Well, it's not really much of a decision, right? It returns the token regardless of whether it liked it or not, and moves on. In our running example, that's gonna happen almost half the time in fact:

```rb
P(duplicate) = P("mango" + "mango") + P("banana" + "banana") + P("coconut" + "coconut") + P("papaya" + "papaya")
             = (65% ^ 2) + (20% ^ 2) + (10% ^ 2) + (5% ^ 2)
             = 42.25% + 4% + 1% + 0.25%
             = 47.5%
```

In these cases, it's random whether `g` liked the token, and so the expected ratio is pushed the opposite way, down towards 50%.

rephrase "it's random whether `g` liked the token"

---

So -- "suspicious" means "somewhere between 50% and 75%", depending on the text!

<!-- remember, can only even DO this scoring if you have the secret key! -->

## Stage 3: Predictable Text

You might have noticed that the latter case above -- when `g` is handed two copies of the same token -- is kind of problematic. The more often that situation crops up, the closer the expected ratio is pushed down towards 50%, and the smaller the difference becomes between normal text and watermarked text.

To make this really clear, let's see what happens when an LLM works on regurgitating a piece from Alfred Tennyson's _In Memoriam A. H. H._:

{% include watermarking/predictable.html %}

In this situation, the 2 candidates that `g` must decide between will both be "lost" a whopping _98% of the time_. So even if `g` doesn't like "lost", that's still almost always gonna be what the LLM emits.

And, if we generate a lot of tokens like that, you can see how it affects the "percent of tokens `g` likes" as we run our detection process:

[interactive widget scoring text]

The less "creativity" is involved in the text that's being generated, the harder it is for this process to embed a watermark!

## Stage 4: SynthID

Phew, we made it!

If you thought this was going to be the most complicated section, sorry to disappoint -- in fact we've already done all the hard work.

Google's SynthID is just the process we detailed above, repeated a bunch of times.

There are no problems with the approach from Stage 3 _per se_ -- as we saw, it does effectively watermark text, and we can detect it after the fact -- but in practice researchers found that at detection-time, it takes way too many tokens to build up good confidence about whether text bears the watermark or not.

So, "higher signal" is what SynthID was built for! It's hugely scaled up from what we discussed so far -- instead of 1 `g` function, there are 30, and instead of 2 candidates, there are (literally) a billion, all competing in a March Madness style single-elimination bracket.

A simple 3-round example is below, with its corresponding `2 ^ 3 = 8` candidates:

{% include watermarking/bracket.html %}

The logic here is -- if a token being preferred by one `g`-function gave us a little signal, it being preferred by _all 30 functions_ gives us a lot more signal, since it's so much less likely for that to happen by chance.

This does come at a cost, in that it meddles further with the LLM's original token probabilities. Remember how in the **Stage 3: Distortion**, we saw that `g` could take "papaya" from its original 5% probability to anywhere in [0.25%, 9.75%]? Each additional round takes what the previous round produced and distorts it again, causing the range to stretch wider and wider.

I'm sorry for this chart, which is the last I'll show and also the most insane, as it is a histogram of probabilities. It (I hope) helps to visualize how the ultimate chance the LLM emits "papaya" changes as we add rounds:

{% include watermarking/worlds.html %}

foo foo foo

<!-- It's the bagel thing all over again, except now  except now most customers are leaving with no bagels at all, and a few are leaving with like 100! -->

This said, SynthID is extremely successful at what it set out to do -- detection is much easier. From Section 4.1 of the paper:

<img src="/assets/watermarking/tpr.png" class="halfwidthimage">

When trying the watermark + detection process on 100-token-long bits of text, they saw the TPR ("true positive rate", the percent of actually-watermarked texts that they could correctly identify) increase from a paltry 4% for the 1-round tournament, up to 88% for the 28-round tournament, which is transformative!

## Fin

So, in the end, we learned something that we possibly could have realized before we started -- that watermarking _does_ distort the text -- and I mean, of course it does, since "distortion" and "detectability" are the same thing.

Though, I'm honestly still not sure if "distortion" is even the right word -- is there really much difference between "a 5% chance" and "a 6% chance half the time, and a 4% chance the other half of the time"? I guess if we really _could_ seed the LLM's PRNG, that would turn "a 5% chance" into "a 0% chance most of the time, and a 100% chance occasionally" -- and nobody's calling that "the model being degraded".

Besides, it sounds like empirically this distortion doesn't end up mattering much. A big part of the SynthID paper is dedicated to an A/B test they did where foo, and foo. This is referenced in Anthropic's [later post](https://www.anthropic.com/news/claude-text-watermark) too, where they also ran their own internal tests and saw "no impact of watermarking on the content, level of creativity, or readability of Claude’s text".

So, maybe this is all tilting at windmills, but -- at least they're pretty interesting windmills.

¯\\\_(ツ)\_/¯
