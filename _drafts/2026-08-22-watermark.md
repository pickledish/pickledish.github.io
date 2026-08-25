---
layout: post
title: "Building an Intuition for Watermarking"
permalink: /posts/watermarking/
styles:
  - /assets/watermarking/watermark.css
scripts:
  - /assets/watermarking/watermark.js
---

{% include disclaimer.html content="
Interactive widgets below are from an LLM, but the words are [100 percent pure old fashioned home-grown human](https://youtu.be/r4b3JHaxB2M?t=11). Hope you enjoy!
" %}

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

LLM knobs you may have heard of, like `temperature` and `min-p`, can control aspects of this distribution (e.g. how "sharp" it is, or how many distinct options there are), but the process we're talking about here is always the same.

## Stage 2: Sample Two Tokens

Now, let's make a small modification to the sampling process above.

Instead of just sampling one token from the LLM's distribution and emitting that, we're going to sample _two_ tokens, and just flip a coin to determine which of the two we'll emit.

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

We're going to change just one thing from Stage 2, which is the coin flip -- we'll replace it with a simple function called `g`, which, sometimes, has a preference between the two candidates in the contest.

Other than that, the process is exactly the same as in Stage 2, as you can see:

{% include watermarking/g-function.html %}

So, the question is -- what is this `g` function, and when does it prefer one token over another?

Fortunately it's pretty simple! Essentially:

* `g` calculates `hash(secret_key ++ previous_4_tokens ++ candidate_token)`
* `g` likes a candidate when that hash comes out as an even number (i.e. ends with 0)

And `g` just opts for a token it likes, if there is one. If it likes both candidates (or dislikes both candidates), it selects one at random.

You can put your own secret in below to see how `g` works:

{% include watermarking/hash.html %}

Each of the elements of the hash serves an important purpose:

* `secret_key` being included in the hash means that only the owner of the LLM can apply, or detect, their own watermark
* `previous_4_tokens` is there so that `g`'s preference for a token is dependent on the tokens that come before it. Without this, `g` might (for example) just universally dislike "banana", which would be noticeable to users
* `candidate_token` is, of course, the subject of our watermarking

The interesting thing is, without _all three_ of these parameters, le hash is totally unpredictable, i.e. indistinguishable from random noise. This means, without the secret key, `g`'s choices seem random -- there's no statistical test you can run on a piece of text to tell whether it came from Stage 2 or Stage 3.

However, that doesn't mean `g` has no impact on token probabilities. That is next!

## Stage 3: Distortion

Let's focus for a moment on the least probable token the LLM could generate: "papaya", at just 5% likelihood. In a contest between "papaya" and any other token, there are 4 possible scenarios of which ones the `g` function will have a preference for, each showing up with the same frequency:

* `g` likes both of them
* `g` likes neither of them
* `g` likes "papaya" but not the other one
* `g` likes the other one but not "papaya"

In the first two situations, `g` acts the same as the coin flip -- no watermarking business occurs. But in the latter situations, things get weird -- `g` no longer acts like a random coin. In the third scenario for instance, `g` will _always_ choose "papaya" over the other candidate.

So, remember the "probability distribution" created by the LLM in Stage 1? This can distort it pretty substantially. If you try the buttons below, you can see how "papaya" is affected by two `g` functions at the different extremes: one that likes "papaya" and no other tokens, and one that likes all tokens _except_ for "papaya":

{% include watermarking/distortion.html %}

In the "`g` likes only papaya" case, "papaya" will automatically win any contest it's in. This nearly _doubles_ the chances that the LLM will emit "papaya" as the next token.

But, the "`g` likes everything except papaya" case is even more extreme -- it means that the only time "papaya" can be emitted is when it appears as _both_ candidates in a contest. This almost never happens, and its real chances drop to almost 0%.

{% include disclaimer.html content="
It's important to note that, when looking across _all_ `g` functions, the effects \"average out\" -- as in, the `g` that loves \"papaya\" turns up exactly as often as the `g` that hates \"papaya\", and so when considering ____[broad/large text generation], the overall likelihood that \"papaya\" is generated is the same as what the LLM would've come up with organically.

From my understanding, a lot of the \"watermarking does not impact model quality\" argument stems from this fact.

Personally I'm not totally convinced; to me it sounds a bit like you have a bunch of customers come in, each requesting a dozen bagels, and you decide at random to give them either 0 or 24. Sure, at the end of the day you can claim you gave out a dozen bagels _on average_... But did each customer actually get what they were expecting?
" %}

## Stage 3: Detection

Notice that crucially, `g` only relies on 3 parameters -- two of which you can plainly see in the generated text itself, and `secret_key`, which is just a fixed string that lives on a post-it note in somebody's desk.

What this means is that **we don't need the LLM around to determine if text was watermarked**, we just need the text itself and the secret, and we ourselves can re-run the same calculation `g` is doing. This part was really non-intuitive to me -- I thought I knew how watermarking worked (seeding the LLM's PRNG), but when I dug in I realized that detection would have more or less required the entire context + re-running the LLM 😅

Anyways, calculating `g` ourselves is important because that's how detection works!

[interactive is 1 row of side-scrolling text (fades on the right to indicate there's more), with braces underneath, sliding window, 4 for prev words and 1 for current word, button at bottom is "step" and "reset", similar to above, when you press "step" it (1) calculates g (2) updates fraction (accumulating) then (3) moves sliding windows 1 to the right]

end prev ^ with "if a suspicious percent of tokens are liked by g, it's watermarked" then

## aisde: what is a "suspicious number"?

> note, you can skip this part if you want, it is not essential, just if you're curious

For me, the hand-waving above leaves a bit to be desired -- what _should_ the `g`-score be for watermarked and non-watermarked text, exactly? How do we know when it's high enough to be "suspicious"?

---

To understand the detection process, we must consider the two kinds of contests separately -- when `g` is deciding between two different tokens, and when it gets duplicates.

First, let's consider the case where `g` is handed two **different** tokens. We'll revisit the 4 equally-likely situations from earlier, and in particular, let's look at what kind of token gets output in each:

```
g likes both candidates           =>   💚 g picks a token it likes
g likes neither candidate         =>   👎 g picks a token it does not like
g likes the 1st but not the 2nd   =>   💚 g picks a token it likes
g likes the 2nd but not the 1st   =>   💚 g picks a token it likes
```

Do you see how, in 3 of the 4 situations, the LLM ends up emitting a token `g` preferred?

That ____ -- 50% vs 75% -- is the difference that is detectable in watermarked text.

---

But, now suppose `g` sees the **same** token twice to "decide between". Well, it's not really much of a decision, right? It returns the token regardless of whether it liked it or not, and moves on. In our running example, that's gonna happen almost half the time in fact:

```
P(duplicate) = P(mango + mango) + P(banana + banana) + P(coconut + coconut) + P(papaya + papaya)
             = (65% ^ 2) + (20% ^ 2) + (10% ^ 2) + (5% ^ 2)
             = 42.25% + 4% + 1% + 0.25%
             = 47.5%
```

In these cases, foo

---

summary below is bad -- we just need to say "so with non-watermarked text, we expect `g` will like 50% of the tokens, but with watermarked text, we expect it'll like more than 50% of them" -- since the 62.5% number only can even be DETERMINED if you have the token prob distribution, so at detection time you don't know what it "should be"

So in summary:

* About half the time, `g` gets a duplicate token, and no watermarking is possible
* The other half the time, we expect `g` to output a token it likes 75% of the time

foo foo 62.5% expected from this generation

[interactive widget scoring text]

remember, can only even DO this scoring if you have the secret key!

## Stage 3: Predictable Text

You might have noticed that the latter case above -- when `g` is handed two copies of the same token -- is kind of problematic. The more often that situation crops up, the more often "no watermarking is possible", and the smaller the difference becomes between watermarked text and normal text.

For example, let's see what happens when an LLM is working on regurgitating a monologue of Shakespeare's _foo_:

[widget showing bad dist -- "lost" is 99% likely, "forgotten" is 1% likely, same dist widget as we've been using]

In this situation, the 2 candidates that `g` must decide between will both be "lost" a whopping _98% of the time_. So even if `g` doesn't like "lost", that's still gonna be what the LLM emits the vast majority of the time.

And, if we generate a lot of tokens like that, you can see how it affects the "percent of tokens `g` likes" as we run our detection process:

[interactive widget scoring text]

So you can see why, the less "creativity" is involved in the text you're generating, the harder it is for this process to embed

## Stage 4: SynthID

If you thought this was going to be the most complicated section, sorry to disappoint -- in fact we've already done all the hard work!

Google's SynthID is just the process we detailed above, repeated a bunch of times.

There are no problems with the approach from Stage 3 _per se_ -- as we saw, it does effectively watermark text, and we can detect it after the fact -- but in practice researchers found that at detection-time, it takes way too many tokens to build up good confidence about whether text bears the watermark or not.

(30 g-functions, 2^30 candidates)

From what I understand, this actually ends up distorting the probability distributions _more_, for the sake of easier detection -- simple method requires X tokens to be confident, synthID only requires Y

## Fin

so, in the end we learned something that we possibly could have realized at the start -- watermarking DOES distort the text, of course it does, since that distortion IS detect-ability

it seems like empirically, the distortion doesn't end up mattering much -- 

note that the other main argument for why this is OK is the 20M gemini test, linked in the anthropic doc too

...shrug
