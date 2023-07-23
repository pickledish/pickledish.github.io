---
layout: post
title: "blog"
permalink: /posts/
---
{%- for post in site.posts -%}
{% if post.external_url %}
#### [{{ post.title | escape }}]({{ post.external_url }})
**{{ post.date | date_to_string }}**&nbsp;&nbsp;&nbsp;⋄&nbsp;&nbsp;{{ post.preview_text | strip_html }}
{% else %}
#### [{{ post.title | escape }}]({{ post.url | relative_url }})
**{{ post.date | date_to_string }}**&nbsp;&nbsp;&nbsp;⋄&nbsp;&nbsp;{{ post.content | strip_html | truncatewords: 40 }}
{% endif %}
{%- endfor -%}
