(function() {
  'use strict';
  const STORAGE_KEY = 'yedas_playlist_v1';

  function getPlaylist() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function setPlaylist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage might be full or disabled
    }
  }

  function isSaved(url) {
    return getPlaylist().some(item => item.url === url);
  }

  function savePost(url, title, tags) {
    if (isSaved(url)) return;
    const list = getPlaylist();
    list.push({ url: url, title: title, tags: Array.isArray(tags) ? tags : [] });
    setPlaylist(list);
    updatePostButton(true);
  }

  function removePost(url) {
    const list = getPlaylist().filter(item => item.url !== url);
    setPlaylist(list);
    if (document.getElementById('playlist-container')) {
      renderPlaylist();
    }
  }

  function updatePostButton(saved) {
    const btn = document.querySelector('.playlist-save-btn');
    if (!btn) return;
    btn.textContent = saved ? 'Đã lưu trong playlist' : 'Lưu vào playlist';
    btn.disabled = saved;
    btn.classList.toggle('saved', saved);
  }

  function initPostButton() {
    const container = document.querySelector('.playlist-button-container');
    if (!container) return;
    const url = container.dataset.url;
    const title = container.dataset.title;
    const tags = container.dataset.tags ? container.dataset.tags.split(',').map(t => t.trim()) : [];
    if (!url) return;

    const saved = isSaved(url);
    const btn = document.createElement('button');
    btn.className = 'playlist-save-btn btn btn-primary';
    btn.type = 'button';
    btn.textContent = saved ? 'Đã lưu trong playlist' : 'Lưu vào playlist';
    btn.disabled = saved;
    btn.addEventListener('click', function() { savePost(url, title, tags); });
    container.appendChild(btn);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    const list = getPlaylist();
    if (list.length === 0) {
      container.innerHTML = '<p class="playlist-empty">Bạn chưa lưu bài viết nào. Hãy mở một bài viết và bấm "Lưu vào playlist".</p>';
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'playlist-list list-unstyled';
    list.forEach(function(item) {
      const li = document.createElement('li');
      li.className = 'playlist-item';
      li.innerHTML = '<a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
        '<button class="playlist-remove-btn btn btn-sm btn-outline-danger" type="button" data-url="' + escapeHtml(item.url) + '">Xóa</button>';
      ul.appendChild(li);
    });
    container.innerHTML = '';
    container.appendChild(ul);

    container.querySelectorAll('.playlist-remove-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) { removePost(e.currentTarget.dataset.url); });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initPostButton();
    renderPlaylist();
  });
})();
