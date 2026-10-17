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
{% else %}

<div class="tags-search">
  <input type="text" id="tag-search" placeholder="Tìm tag hoặc bài viết..." autocomplete="off">
</div>

<div class="tags-cloud" id="tags-cloud">
  {% for tag in sorted_tags %}
    {% assign tag_slug = tag | slugify %}
    {% assign count = 0 %}
    {% for post in all_posts %}
      {% if post.tags contains tag %}
        {% assign count = count | plus: 1 %}
      {% endif %}
    {% endfor %}
    <a href="#{{ tag_slug }}" class="tag-pill" data-tag="{{ tag }}" data-count="{{ count }}">
      {{ tag }}<span class="tag-pill-count">{{ count }}</span>
    </a>
  {% endfor %}
</div>

<div class="tags-sections" id="tags-sections">
  {% for tag in sorted_tags %}
    {% assign tag_slug = tag | slugify %}
    <section class="tag-section" id="{{ tag_slug }}" data-tag="{{ tag }}">
      <h2 class="tag-section-title">{{ tag }}</h2>
      <div class="tag-posts">
        {% for post in all_posts %}
          {% if post.tags contains tag %}
            {% assign thumb = post.thumbnail-img | default: post.cover-img %}
            <a class="tag-post-card" href="{{ post.url | relative_url }}">
              {% if thumb %}
                <div class="tag-post-thumb">
                  <img src="{{ thumb | relative_url }}?v={{ site.time | date: "%Y%m%d%H%M%S" }}" alt="{{ post.title }}">
                </div>
              {% endif %}
              <div class="tag-post-info">
                <h3>{{ post.title }}</h3>
                <time>{{ post.date | date: site.date_format }}</time>
              </div>
            </a>
          {% endif %}
        {% endfor %}
      </div>
    </section>
  {% endfor %}
</div>

<script>
(function () {
  const input = document.getElementById('tag-search');
  const cloud = document.getElementById('tags-cloud');
  const sections = document.getElementById('tags-sections');
  if (!input || !cloud || !sections) return;

  const pills = cloud.querySelectorAll('.tag-pill');
  const sectionEls = sections.querySelectorAll('.tag-section');

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();

    pills.forEach(function (pill) {
      const tag = pill.dataset.tag.toLowerCase();
      pill.style.display = tag.includes(q) ? '' : 'none';
    });

    sectionEls.forEach(function (section) {
      const tag = section.dataset.tag.toLowerCase();
      const cards = section.querySelectorAll('.tag-post-card');
      let hasVisible = false;

      if (tag.includes(q)) {
        section.style.display = '';
        cards.forEach(function (c) { c.style.display = ''; });
        hasVisible = true;
      } else {
        cards.forEach(function (c) {
          const title = (c.textContent || '').toLowerCase();
          const match = title.includes(q);
          c.style.display = match ? '' : 'none';
          if (match) hasVisible = true;
        });
        section.style.display = hasVisible ? '' : 'none';
      }
    });
  });
})();
</script>

{% endif %}
