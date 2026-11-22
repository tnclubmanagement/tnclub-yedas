(function() {
  'use strict';

  var STORAGE_KEY = 'yedas_playlists_v1';
  var OLD_STORAGE_KEY = 'yedas_playlist_v1';
  var MAX_PLAYLISTS = 10;

  function makeId() {
    return 'playlist-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  function getPlaylists() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(data)) return data;
      var oldItems = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || '[]');
      var migrated = [{ id: makeId(), name: 'Playlist của tôi', items: Array.isArray(oldItems) ? oldItems : [] }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch (e) { return []; }
  }

  function setPlaylists(playlists) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists)); } catch (e) {}
  }

  function hasItem(playlist, url) {
    return playlist.items.some(function(item) { return item.url === url; });
  }

  function addToPlaylist(playlist, item) {
    if (!hasItem(playlist, item.url)) playlist.items.push(item);
  }

  function removeFromPlaylist(playlist, url) {
    playlist.items = playlist.items.filter(function(item) { return item.url !== url; });
  }

  function updatePostButton(url) {
    var btn = document.querySelector('.playlist-save-btn');
    if (!btn) return;
    var count = getPlaylists().filter(function(p) { return hasItem(p, url); }).length;
    btn.textContent = count ? 'Đã lưu trong ' + count + ' playlist' : 'Lưu vào playlist';
    btn.classList.toggle('saved', count > 0);
  }

  function saveSelection(url, title, tags, thumb, selectedIds) {
    var playlists = getPlaylists();
    var item = { url: url, title: title, tags: tags, thumb: thumb };
    playlists.forEach(function(playlist) {
      if (selectedIds.indexOf(playlist.id) !== -1) addToPlaylist(playlist, item);
      else removeFromPlaylist(playlist, url);
    });
    setPlaylists(playlists);
    updatePostButton(url);
    renderPlaylist();
  }

  function createPlaylist(name) {
    var playlists = getPlaylists();
    var cleanName = name.trim();
    if (!cleanName || playlists.length >= MAX_PLAYLISTS) return null;
    var playlist = { id: makeId(), name: cleanName, items: [] };
    playlists.push(playlist);
    setPlaylists(playlists);
    return playlist;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function closePicker() {
    var modal = document.querySelector('.playlist-picker');
    if (modal) modal.remove();
  }

  function openPicker(url, title, tags, thumb) {
    closePicker();
    var playlists = getPlaylists();
    var modal = document.createElement('div');
    modal.className = 'playlist-picker';
    modal.innerHTML = '<div class="playlist-picker-backdrop"></div>' +
      '<div class="playlist-picker-dialog" role="dialog" aria-modal="true" aria-label="Chọn playlist">' +
      '<button class="playlist-picker-close" type="button" aria-label="Đóng" title="Đóng">&times;</button>' +
      '<h2>Lưu vào playlist</h2><p>Chọn một hoặc nhiều playlist:</p>' +
      '<div class="playlist-picker-list"></div>' +
      '<div class="playlist-create-row"><input type="text" placeholder="Tên playlist mới" title="Nhập tên cho playlist mới">' +
      '<button type="button" class="playlist-create-btn" title="Tạo playlist mới">Tạo</button></div>' +
      '<p class="playlist-limit"></p><button type="button" class="playlist-picker-save" title="Lưu bài viết vào playlist đã chọn">Lưu lựa chọn</button>' +
      '</div>';
    document.body.appendChild(modal);

    var list = modal.querySelector('.playlist-picker-list');
    var limit = modal.querySelector('.playlist-limit');
    function renderChoices() {
      playlists = getPlaylists();
      list.innerHTML = playlists.map(function(playlist) {
        return '<label><input type="checkbox" value="' + playlist.id + '"' +
          (hasItem(playlist, url) ? ' checked' : '') + '> ' + escapeHtml(playlist.name) +
          '<small>' + playlist.items.length + ' bài</small></label>';
      }).join('');
      limit.textContent = playlists.length + '/' + MAX_PLAYLISTS + ' playlist';
      modal.querySelector('.playlist-create-btn').disabled = playlists.length >= MAX_PLAYLISTS;
    }
    renderChoices();

    modal.querySelector('.playlist-picker-close').onclick = closePicker;
    modal.querySelector('.playlist-picker-backdrop').onclick = closePicker;
    modal.querySelector('.playlist-create-btn').onclick = function() {
      var input = modal.querySelector('.playlist-create-row input');
      if (createPlaylist(input.value)) {
        input.value = '';
        renderChoices();
      }
    };
    modal.querySelector('.playlist-picker-save').onclick = function() {
      var selected = Array.prototype.slice.call(list.querySelectorAll('input:checked'))
        .map(function(input) { return input.value; });
      saveSelection(url, title, tags, thumb, selected);
      closePicker();
    };
  }

  function initPostButton() {
    var container = document.querySelector('.playlist-button-container');
    if (!container || !container.dataset.url) return;
    var url = container.dataset.url;
    var title = container.dataset.title;
    var tags = container.dataset.tags ? container.dataset.tags.split(',') : [];
    var thumb = container.dataset.thumb || '';
    var btn = document.createElement('button');
    btn.className = 'playlist-save-btn btn btn-primary';
    btn.type = 'button';
    btn.title = 'Lưu bài viết này vào playlist';
    btn.addEventListener('click', function() { openPicker(url, title, tags, thumb); });
    container.appendChild(btn);
    updatePostButton(url);
  }

  function renderPlaylist() {
    var container = document.getElementById('playlist-container');
    if (!container) return;
    var playlists = getPlaylists();
    if (!playlists.length) {
      container.innerHTML = '<div class="playlist-empty-state">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
        '<path d="M9 18V6l10-2v11"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/></svg>' +
        '<h3>Chưa có playlist nào</h3>' +
        '<p>Tạo playlist đầu tiên ở ô phía trên, rồi mở một bài viết và bấm "Lưu vào playlist".</p></div>';
      return;
    }
    container.innerHTML = playlists.map(function(playlist) {
      var covers = playlist.items.filter(function(i) { return i.thumb; }).slice(0, 4);
      var coverHtml;
      if (covers.length > 1) {
        coverHtml = '<span class="playlist-cover playlist-cover--grid">' +
          covers.map(function(i) {
            return '<img src="' + escapeHtml(i.thumb) + '" alt="" loading="lazy">';
          }).join('') + '</span>';
      } else {
        coverHtml = '';
      }
      var items = playlist.items.length ? playlist.items.map(function(item) {
        var thumb = item.thumb
          ? '<span class="playlist-item-thumb"><img src="' + escapeHtml(item.thumb) +
            '" alt="" loading="lazy"></span>'
          : '<span class="playlist-item-thumb playlist-item-thumb--empty" aria-hidden="true">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg></span>';
        var tags = (item.tags && item.tags.length)
          ? '<span class="playlist-item-tags">' + item.tags.map(escapeHtml).join(' · ') + '</span>'
          : '';
        return '<div class="playlist-item">' + thumb +
          '<a class="playlist-item-info" href="' + escapeHtml(item.url) + '">' +
          '<span class="playlist-item-title">' + escapeHtml(item.title) + '</span>' +
          tags + '</a>' +
          '<button class="playlist-remove-btn" data-playlist="' + playlist.id +
          '" data-url="' + escapeHtml(item.url) +
          '" title="Xóa bài này khỏi playlist" aria-label="Xóa bài này khỏi playlist">&times;</button></div>';
      }).join('') : '<p class="playlist-empty">Chưa có bài viết — mở một bài viết và bấm "Lưu vào playlist".</p>';
      return '<section class="playlist-card" data-playlist="' + playlist.id + '">' +
        coverHtml +
        '<div class="playlist-card-body"><header class="playlist-card-head"><h2>' + escapeHtml(playlist.name) +
        ' <small>' + playlist.items.length + ' bài</small></h2>' +
        '<div class="playlist-card-actions">' +
        '<button class="playlist-rename-btn" type="button" title="Đổi tên playlist" aria-label="Đổi tên playlist">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg></button>' +
        '<button class="playlist-delete-btn" type="button" title="Xóa playlist này" aria-label="Xóa playlist này">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg></button>' +
        '</div></header>' +
        '<div class="playlist-items">' + items + '</div></div></section>';
    }).join('');
    container.querySelectorAll('.playlist-remove-btn').forEach(function(btn) {
      btn.onclick = function() {
        var data = getPlaylists();
        var playlist = data.find(function(p) { return p.id === btn.dataset.playlist; });
        if (playlist) removeFromPlaylist(playlist, btn.dataset.url);
        setPlaylists(data);
        renderPlaylist();
      };
    });
    container.querySelectorAll('.playlist-delete-btn').forEach(function(btn) {
      btn.onclick = function() {
        var card = btn.closest('.playlist-card');
        var playlist = getPlaylists().find(function(p) { return p.id === card.dataset.playlist; });
        if (!playlist) return;
        if (!confirm('Xóa playlist "' + playlist.name + '"? Các bài viết vẫn được giữ nguyên.')) return;
        setPlaylists(getPlaylists().filter(function(p) { return p.id !== card.dataset.playlist; }));
        renderPlaylist();
      };
    });
    container.querySelectorAll('.playlist-rename-btn').forEach(function(btn) {
      btn.onclick = function() {
        var card = btn.closest('.playlist-card');
        var data = getPlaylists();
        var playlist = data.find(function(p) { return p.id === card.dataset.playlist; });
        if (!playlist) return;
        var name = prompt('Tên mới cho playlist:', playlist.name);
        if (name && name.trim()) {
          playlist.name = name.trim();
          setPlaylists(data);
          renderPlaylist();
        }
      };
    });
  }

  function initPlaylistCreator() {
    var button = document.getElementById('playlist-create-page-btn');
    var input = document.getElementById('playlist-name-input');
    if (!button || !input) return;
    button.onclick = function() {
      if (createPlaylist(input.value)) {
        input.value = '';
        renderPlaylist();
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    initPostButton();
    initPlaylistCreator();
    renderPlaylist();
  });
})();
