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

  function saveSelection(url, title, tags, selectedIds) {
    var playlists = getPlaylists();
    var item = { url: url, title: title, tags: tags };
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

  function openPicker(url, title, tags) {
    closePicker();
    var playlists = getPlaylists();
    var modal = document.createElement('div');
    modal.className = 'playlist-picker';
    modal.innerHTML = '<div class="playlist-picker-backdrop"></div>' +
      '<div class="playlist-picker-dialog" role="dialog" aria-modal="true" aria-label="Chọn playlist">' +
      '<button class="playlist-picker-close" type="button" aria-label="Đóng">&times;</button>' +
      '<h2>Lưu vào playlist</h2><p>Chọn một hoặc nhiều playlist:</p>' +
      '<div class="playlist-picker-list"></div>' +
      '<div class="playlist-create-row"><input type="text" placeholder="Tên playlist mới">' +
      '<button type="button" class="playlist-create-btn">Tạo</button></div>' +
      '<p class="playlist-limit"></p><button type="button" class="playlist-picker-save">Lưu lựa chọn</button>' +
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
      saveSelection(url, title, tags, selected);
      closePicker();
    };
  }

  function initPostButton() {
    var container = document.querySelector('.playlist-button-container');
    if (!container || !container.dataset.url) return;
    var url = container.dataset.url;
    var title = container.dataset.title;
    var tags = container.dataset.tags ? container.dataset.tags.split(',') : [];
    var btn = document.createElement('button');
    btn.className = 'playlist-save-btn btn btn-primary';
    btn.type = 'button';
    btn.addEventListener('click', function() { openPicker(url, title, tags); });
    container.appendChild(btn);
    updatePostButton(url);
  }

  function renderPlaylist() {
    var container = document.getElementById('playlist-container');
    if (!container) return;
    var playlists = getPlaylists();
    if (!playlists.length) {
      container.innerHTML = '<p class="playlist-empty">Bạn chưa tạo playlist nào.</p>';
      return;
    }
    container.innerHTML = playlists.map(function(playlist) {
      var items = playlist.items.length ? playlist.items.map(function(item) {
        return '<li class="playlist-item"><a href="' + escapeHtml(item.url) + '">' +
          escapeHtml(item.title) + '</a><button class="playlist-remove-btn" data-playlist="' +
          playlist.id + '" data-url="' + escapeHtml(item.url) + '">Xóa</button></li>';
      }).join('') : '<li class="playlist-empty">Chưa có bài viết.</li>';
      return '<section class="playlist-card"><h2>' + escapeHtml(playlist.name) +
        ' <small>(' + playlist.items.length + ')</small></h2><ul class="playlist-list">' +
        items + '</ul></section>';
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
