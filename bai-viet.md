---
layout: page
title: Bài viết
subtitle: Tất cả bài viết trên Yedas, mới nhất trước
cover-img: "/assets/img/hero-3.jpg"
permalink: /bai-viet/
---

{% assign all_posts = site.pages | where: 'layout', 'post' | sort: 'date' | reverse %}

{% assign page_tags = "" | split: "" %}
{% for post in all_posts %}
  {% for tag in post.tags %}
    {% assign page_tags = page_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign page_tags = page_tags | uniq | sort %}

<div class="home-controls" role="region" aria-label="Lọc bài viết">
  <label class="home-search">
    <span class="sr-only">Tìm bài viết</span>
    <input type="search" id="home-post-search" placeholder="Tìm bài viết..." autocomplete="off" title="Tìm bài viết theo tên">
  </label>
  <label class="home-filter">
    <span class="sr-only">Lọc theo chủ đề</span>
    <select id="home-tag-filter" title="Lọc bài viết theo chủ đề">
      <option value="">Tất cả chủ đề</option>
      {% for tag in page_tags %}
        <option value="{{ tag | escape }}">{{ tag }}</option>
      {% endfor %}
    </select>
  </label>
  <div class="home-display-mode" role="group" aria-label="Kiểu hiển thị">
    <button type="button" class="home-mode-btn is-active" data-mode="grid" aria-label="Hiển thị dạng lưới" title="Hiển thị dạng lưới" aria-pressed="true">
      <span class="fa fa-th-large" aria-hidden="true"></span>
    </button>
    <button type="button" class="home-mode-btn" data-mode="list" aria-label="Hiển thị dạng danh sách" title="Hiển thị dạng danh sách" aria-pressed="false">
      <span class="fa fa-list" aria-hidden="true"></span>
    </button>
  </div>
</div>

<!-- role="list" needed so that `list-style: none` in Safari doesn't remove the list semantics -->
<ul class="posts-list list-unstyled" role="list" id="bai-viet-list">
  {% for post in all_posts %}
  <li class="post-preview" data-post-title="{{ post.title | strip_html | escape }}" data-post-tags="{{ post.tags | join: ',' | escape }}">
    <article>

      {%- capture thumbnail -%}
        {% if post.thumbnail-img %}
          {{ post.thumbnail-img }}
        {% elsif post.cover-img %}
          {% if post.cover-img.first %}
            {{ post.cover-img[0].first.first }}
          {% else %}
            {{ post.cover-img }}
          {% endif %}
        {% else %}
        {% endif %}
      {%- endcapture -%}
      {% assign thumbnail=thumbnail | strip %}

      {% if thumbnail != "" %}
      <div class="post-image post-image-normal">
        <a href="{{ post.url | relative_url }}" aria-label="Thumbnail">
          <img src="{{ thumbnail | relative_url }}" alt="{{ post.title | strip_html | escape }}">
        </a>
      </div>
      {% endif %}

      <a href="{{ post.url | relative_url }}">
        <h2 class="post-title">{{ post.title | strip_html }}</h2>

        {% if post.subtitle %}
          <h3 class="post-subtitle">
          {{ post.subtitle | strip_html }}
          </h3>
        {% endif %}
      </a>

      <p class="post-meta">
        {% assign date_format = site.date_format | default: "%B %-d, %Y" %}
        {{ post.date | date: date_format }}
      </p>

      {% if post.tags.size > 0 %}
      <div class="blog-tags">
        <ul class="list-inline list-unstyled" role="list">
          {% for tag in post.tags %}
          <li class="list-inline-item">
            <a href="{{ '/tags' | relative_url }}#{{- tag -}}">{{- tag -}}</a>
          </li>
          {% endfor %}
        </ul>
      </div>
      {% endif %}

    </article>
  </li>
  {% endfor %}
</ul>
