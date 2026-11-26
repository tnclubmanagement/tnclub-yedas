require 'jekyll'
require 'tmpdir'
require 'ostruct'
require_relative '../_plugins/search_index'

def assert(condition, message)
  raise message unless condition
end

Document = Struct.new(:path, :url, :data)

def build(site, documents)
  index = Yedas::SearchIndex.new(site)
  [index, index.build(documents)]
end

Dir.mktmpdir('yedas-search-test') do |directory|
  site = OpenStruct.new(config: {
    'active_lang' => 'vi', 'default_lang' => 'vi', 'baseurl' => '', 'title' => 'Yedas'
  })
  site.define_singleton_method(:in_source_dir) { |*parts| File.join(directory, *parts) }
  documents = [
    Document.new('posts/a.md', '/posts/a/', { 'title' => 'Ảnh <em>đẹp</em> &amp; vui', 'tags' => ['Du lịch'] }),
    Document.new('posts/b.md', '/posts/b/', { 'title' => 'B', 'tags' => ['Thể thao'] }),
    Document.new('draft.md', '/draft/', { 'title' => 'Draft', 'draft' => true }),
    Document.new('private.md', '/private/', { 'title' => 'Private', 'search' => false }),
    Document.new('unpublished.md', '/unpublished/', { 'title' => 'Unpublished', 'published' => false }),
    Document.new('feed.xml', '/feed.xml', { 'title' => 'Feed' })
  ]
  cold, result = build(site, documents)
  assert(cold.hits == 0 && cold.rebuilt == 2, 'Cold cache must build eligible entries only')
  assert(result.first['title'] == 'Ảnh đẹp & vui', 'Titles must be plain text')
  warm, again = build(site, documents)
  assert(warm.hits == 2 && warm.rebuilt == 0 && result == again, 'Warm cache must reuse every unchanged entry')
  documents[0].data['content'] = 'Not part of title/tag search'
  unchanged, = build(site, documents)
  assert(unchanged.hits == 2, 'Unused content must not invalidate metadata index')
  documents[0].data['title'] = 'Updated {{ literal }}'
  changed, result = build(site, documents)
  assert(changed.hits == 1 && changed.rebuilt == 1, 'Changing one title must rebuild one entry')
  assert(result.first['title'] == 'Updated {{ literal }}', 'Liquid text must be kept as data')
  removed, result = build(site, documents.drop(1))
  assert(result.length == 1 && removed.hits == 1, 'Removed documents must disappear from output')
  cache_path = site.in_source_dir('.jekyll-cache', 'yedas-search', 'vi.json')
  assert(JSON.parse(File.read(cache_path))['entries'].keys == ['posts/b.md'], 'Deleted entries must be pruned from cache')
  renamed = [Document.new('posts/c.md', '/posts/c/', { 'title' => 'C' })]
  _, result = build(site, renamed)
  assert(result.first['url'] == '/posts/c/', 'Renamed document must replace its old URL')
  File.write(cache_path, '{invalid')
  corrupt, = build(site, documents)
  assert(corrupt.rebuilt == 2, 'Corrupt cache must rebuild without failing')
  cache = JSON.parse(File.read(cache_path))
  cache['entries']['posts/a.md']['entry'] = []
  File.write(cache_path, JSON.generate(cache))
  invalid, = build(site, documents)
  assert(invalid.rebuilt == 1 && invalid.hits == 1, 'Invalid cached entry must be regenerated')
  site.config['baseurl'] = '/tnclub-yedas'
  production, result = build(site, documents)
  assert(production.rebuilt == 2, 'Base URL changes must invalidate entries')
  assert(result.first['url'] == '/tnclub-yedas/posts/a/', 'Production URL must contain base URL once')
  site.config['active_lang'] = 'en'
  english, result = build(site, documents)
  assert(english.rebuilt == 2 && result.first['url'] == '/tnclub-yedas/en/posts/a/', 'EN fallback URLs must be localized')
  translated = documents.map(&:dup)
  translated[0] = Document.new('posts/a.en.md', '/posts/a/', { 'title' => 'English translation' })
  english, result = build(site, translated)
  assert(english.hits == 1 && english.rebuilt == 1, 'Adding a translation must invalidate only its entry')
  assert(result.first['title'] == 'English translation', 'Active-language translation must be indexed')
  site.config['disable_disk_cache'] = true
  uncached, result = build(site, documents)
  assert(uncached.hits == 0 && uncached.rebuilt == 2, 'Disable disk cache must be respected')
  home = Document.new('index.html', '/', { 'title' => '' })
  _, result = build(site, [home])
  assert(result.first['title'] == 'Yedas', 'Homepage must be searchable by site title')
end
Dir.mktmpdir('yedas-search-groups-test') do |directory|
  site = Jekyll::Site.new(Jekyll.configuration({
    'source' => directory, 'destination' => File.join(directory, '_site'),
    'post_search' => true, 'disable_disk_cache' => true, 'quiet' => true
  }))
  categories = ['Uống Ngon', 'Du lịch', 'Chụp ảnh', nil]
  categories.each_with_index do |category, i|
    page = Jekyll::PageWithoutAFile.new(site, directory, "posts/test-#{i}", 'index.html')
    page.data.merge!('title' => "Test #{i}", 'category' => category)
    page.content = ''
    site.pages << page
  end
  Yedas::SearchIndexGenerator.new.generate(site)
  other = site.pages.find { |page| page.name == 'photo-other-needs.json' }
  posts = JSON.parse(other.content).map { |entry| entry['post'] }.uniq.sort
  assert(posts == ['test-0', 'test-3'], 'Other group must include new/missing categories without recursion or known categories')
end
puts 'Search index tests passed: cache reuse, metadata changes, deletion/rename, corrupt cache, VI/EN, base URL and opt-outs'
