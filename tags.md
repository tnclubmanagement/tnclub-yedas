---
layout: page
title: Lưu trữ theo chủ đề
subtitle: Tất cả mẹo chụp ảnh, nhóm theo tag
permalink: /tags/
---

{% assign all_posts = site.pages | where: 'layout', 'post' | sort: 'date' | reverse %}
{% assign all_tags = "" | split: "" %}
{% for post in all_posts %}
  {% for tag in post.tags %}
    {% assign all_tags = all_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign sorted_tags = all_tags | uniq | sort %}

{% if sorted_tags.size == 0 %}
Chưa có tag nào.
{% endif %}

{% for tag in sorted_tags %}
## {{ tag }} <a id="{{ tag }}"></a>

<ul>
  {% for post in all_posts %}
    {% if post.tags contains tag %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> — {{ post.date | date: site.date_format }}</li>
    {% endif %}
  {% endfor %}
</ul>
{% endfor %}
