---
layout: post
title: "Function Declaration Syntax, Compared"
permalink: /posts/function-syntax/
---

One part of a programming language that doesn't get a lot of attention (in my opinion) is the syntax of a function declaration -- how many parameters the function takes, what types they are, what it returns, and so on. It's vitally important information (as I continue to pretend that dynamically-typed languages don't exist), and it's remarkable how each different programming language has an entirely unique way to represent it.

Which of these ways is the most concise, to prevent going over an 80 or 100 character limit and needing to break the definition onto multiple lines? More importantly, which one is the most readable? And do these two properties have to be inversely correlated?

So, in order to compare them all, I've decided to write the declaration for a simple(ish) function in 5 different languages: C++, Java, Scala, Haskell, and OCaml. Let's see how they stack up:

### Scala

The function we'll be using is pretty simple: it takes two parameters, an array of objects belonging to an ordered set and an integer, and returns an array of something comparable (maybe it sorts the array, and then returns a smaller array of the biggest ones, based on the second parameter). Even though this "comparable" property has different names in different languages (`Comparable` in Java, `Ord` in Haskell, etc), but I'll be using `Ord` in each example anyway, for the sake of keeping the comparison just to syntactic overhead.

```scala
def topn_sort[A <: Ord](objects: Array[A], topn: Int): Array[A] = 
```

I feel like Scala is good to start with, because it provides a good baseline in all areas -- not too long (65 characters), and easy enough to read, as the type of each parameter is noted right next to the name of the parameter, with the result type at the end. Interestingly, this short-and-sweet Scala function declaration is (like many things in Scala) syntactic sugar for a slightly uglier (but more true to Scala's actual implementation of generic type constraints) syntax:

```scala
def topn_sort[A](objects: Array[A], topn: Int)(implicit ev: Ord[A]): Array[A] = 
```

So, here, we see a little bit of the nature of Scala's generic type bounds, in that a kind of "typeclass object" is implicitly passed around to any function that would rely on the fact that `A` belongs to (or has an implementation for) `Ord`. It's significantly more verbose and (in my opinion) less readable, so it's a good thing that the first syntax exists. However, it does bother me a bit that it's effectively hiding the way that Scala is truly handling the constraint.

### Java

Now, we'll move on to Scala's ancestor, which I had been expecting to be a bit worse:

```java
public < A extends Ord<A> > Array[A] topn_sort(Array[A] objects, Int topn) {
```

It definitely is longer than the Scala declaration, clocking in at 76 characters for the same amount of information. And, it seems a bit less readable, too -- while the type is still right next to its parameter, it's now in front of the parameter with only a space to separate them, and the return type comes at the front. While it may feel more familiar to developers who've worked a lot with C-style languages, it seems clear to me why most new languages are going the `param: Type` route. Plus, `extends` to show that `A` is ordered takes some familiarity with Java to understand.

Return type is also just floating somewhere, which is hard to grok


### Haskell

Flipping to the other end of the programming universe, we have the functional language Haskell:

```haskell
topn_sort :: (Ord A) => Array A -> Int -> Array A
topn_sort objects topn = 
```

74 total characters. Funny that Haskell functions + type signatures require repeating the name of the function, and yet in this case we still come in underneath the total character count for Java.

Interesting right away is the fact that the function declaration spans two lines, which is quite uncommon even in languages today. I personally enjoy that it separates the type of the function from its implementation (the names of the parameters we use to show what the function does). However, it's undoubtedly a ding against the style that the types are separated from the names of the parameters -- if a Haskell function takes several parameters, you may have to drag a finger along the screen to match up its type on the top line.

In addition, in typical Haskell style, there's no keyword for the fact that `A` is in `Ord`, just a little "implies" arrow before the type signature. Cute, and familiar to mathematicians, but that alone doesn't make it any easier to grasp.

### OCaml

