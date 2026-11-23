---
layout: page
title: Bài viết
subtitle: Tất cả bài viết trên Yedas, mới nhất trước
cover-img: "/assets/img/hero-3.jpg"
permalink: /posts/
---

{% assign all_posts = site.pages | where: 'layout', 'post' | sort: 'date' | reverse %}

<div class="home-controls" role="region" aria-label="Lọc bài viết">
  <label class="home-search" data-tip="Tìm bài viết theo tên">
    <span class="sr-only">Tìm bài viết</span>
    <input type="search" id="home-post-search" placeholder="Tìm bài viết..." autocomplete="off">
  </label>
  <div class="home-display-mode" role="group" aria-label="Kiểu hiển thị">
    <button type="button" class="home-mode-btn is-active" data-mode="grid" aria-label="Hiển thị dạng lưới" data-tip="Hiển thị dạng lưới" aria-pressed="true">
      <span class="fa fa-th-large" aria-hidden="true"></span>
    </button>
    <button type="button" class="home-mode-btn" data-mode="list" aria-label="Hiển thị dạng danh sách" data-tip="Hiển thị dạng danh sách" aria-pressed="false">
      <span class="fa fa-list" aria-hidden="true"></span>
    </button>
  </div>
</div>
<div class="home-tabs-row">
  <div class="home-tabs" role="group" aria-label="Lọc theo chủ đề">
    <button type="button" class="home-tab is-active" data-tag="" aria-pressed="true" data-tip="Hiện tất cả bài viết">Tất cả</button>
    <button type="button" class="home-tab" data-tag="Chụp ảnh" aria-pressed="false" data-tip="Bài viết chủ đề chụp ảnh">Chụp ảnh</button>
    <button type="button" class="home-tab" data-tag="Thể thao" aria-pressed="false" data-tip="Bài viết chủ đề thể thao">Thể thao</button>
    <button type="button" class="home-tab" data-tag="Du lịch" aria-pressed="false" data-tip="Bài viết chủ đề du lịch">Du lịch</button>
  </div>
  <span class="home-total" id="home-post-total" data-tip="Số bài viết đang hiển thị" aria-live="polite"></span>
</div>

<!-- role="list" needed so that `list-style: none` in Safari doesn't remove the list semantics -->
<ul class="posts-list list-unstyled" role="list" id="posts-list">
  {% for post in all_posts %}
  <li class="post-preview" data-post-title="{{ post.title | strip_html | escape }}" data-post-tags="{{ post.tags | join: ',' | escape }}" data-post-category="{{ post.category | escape }}">
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

      {% assign topic = post.category | default: "" %}
      {% if topic == "" %}
        {% for tag in post.tags %}
          {% if topic == "" and tag != "Chụp ảnh" %}{% assign topic = tag %}{% endif %}
        {% endfor %}
        {% if topic == "" and post.tags.size > 0 %}{% assign topic = post.tags[0] %}{% endif %}
      {% endif %}
      {% case topic %}
        {% when "Chụp ảnh" %}{% assign topic_mod = "photo" %}
        {% when "Thể thao" %}{% assign topic_mod = "sport" %}
        {% when "Du lịch" %}{% assign topic_mod = "travel" %}
        {% else %}{% assign topic_mod = "other" %}
      {% endcase %}

      {% if thumbnail != "" %}
      <div class="post-image post-image-normal">
        <a href="{{ post.url | relative_url }}" aria-label="Thumbnail">
          <img src="{{ thumbnail | relative_url }}" alt="{{ post.title | strip_html | escape }}" loading="lazy">
        </a>
        {% if topic != "" %}<span class="post-topic post-topic-{{ topic_mod }}">{{ topic }}</span>{% endif %}
      </div>
      {% endif %}

      {% if thumbnail == "" and topic != "" %}<span class="post-topic post-topic-inline post-topic-{{ topic_mod }}">{{ topic }}</span>{% endif %}
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

<div class="posts-load-more-wrap">
  <button type="button" class="posts-load-more" id="posts-load-more" hidden>Xem thêm bài viết</button>
</div>
