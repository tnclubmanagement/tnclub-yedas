require 'jekyll'
require 'json'
require 'tmpdir'
require_relative '../_plugins/map_pins_index'

FakePage = Struct.new(:data, :url)
FakeSite = Struct.new(:pages, :source, :config)

Dir.mktmpdir do |dir|
  FileUtils.mkdir_p(File.join(dir, 'posts/small'))
  File.write(File.join(dir, 'posts/small/avatar.jpg'), 'x')

  pages = [
    FakePage.new({ 'layout' => 'post', 'geo' => [1, 2], 'banner-img' => '/posts/small/cover.jpg',
                   'category' => 'Du lịch', 'place_country' => 'Vietnam', 'map_content_score' => 3 }, '/posts/small/'),
    FakePage.new({ 'layout' => 'post', 'geo' => [1, 2], 'banner-img' => '/posts/missing/cover.jpg' }, '/posts/missing/'),
    FakePage.new({ 'layout' => 'post', 'athlete' => { 'geo' => [3, 4], 'name' => 'VĐV' } }, '/posts/athlete/'),
    FakePage.new({ 'layout' => 'post', 'title' => 'Không geo' }, '/posts/nogeo/'),
    FakePage.new({ 'layout' => 'page', 'geo' => [1, 2] }, '/not-a-post/')
  ]
  site = FakeSite.new(pages, dir, { 'baseurl' => '', 'active_lang' => 'vi', 'default_lang' => 'vi' })

  posts = Yedas::MapPinsIndex.build_posts(site)
  raise "Expected 3 geo posts, got #{posts.size}" unless posts.size == 3

  raise 'pinAvatar must resolve existing avatar.jpg' unless posts[0]['pinAvatar'] == '/posts/small/avatar.jpg'
  raise 'pinAvatar must stay empty when avatar.jpg missing' unless posts[1]['pinAvatar'] == ''
  raise 'Field rename failed' unless posts[0]['placeCountry'] == 'Vietnam' && posts[0]['contentScore'] == 3
  raise 'Athlete entry must keep geo inside athlete hash' unless posts[2]['athlete'] == { 'geo' => [3, 4], 'name' => 'VĐV' }
  raise 'Post url missing' unless posts[0]['url'] == '/posts/small/'
  raise 'Posts without geo must be skipped' if posts.any? { |p| p['title'] == 'Không geo' }

  json = JSON.generate(posts)
  raise 'Posts must serialize to clean JSON' unless JSON.parse(json).size == 3

  encoded = Yedas::MapPinsIndex.encode(json)
  raise 'Encoded output must be base64, not readable JSON' if encoded.include?('placeCountry') || encoded.include?('{')
  key = Yedas::MapPinsIndex::XOR_KEY.bytes
  decoded = Base64.decode64(encoded).bytes.each_with_index.map { |b, i| (b ^ key[i % key.size]).chr }.join
  raise 'XOR + base64 roundtrip must restore original JSON' unless JSON.parse(decoded) == JSON.parse(json)
end

puts 'Map pins index tests passed: geo filter, field renames, pinAvatar disk check, athlete passthrough'
