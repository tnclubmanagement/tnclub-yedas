require 'jekyll'
require 'json'

module MapImageTestFilters
  def relative_url(input)
    input.to_s.start_with?('https://', 'http://') ? input : "#{@context['site']['baseurl']}#{input}"
  end
end

source = File.read(File.expand_path('../_includes/site-map.html', __dir__))
fixtures = [
  { 'layout' => 'post', 'geo' => [1, 2], 'cover-img' => '/posts/small/cover.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'cover-img' => '/posts/cover-only/cover.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'cover-img' => '/posts/thumbnail/cover.jpg', 'thumbnail-img' => '/posts/thumbnail/thumb.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'cover-img' => 'https://images.example.test/cover.jpg' },
  { 'layout' => 'post', 'athlete' => { 'geo' => [1, 2], 'avatar' => '/posts/athlete/avatar.jpg' } }
]
expected = ['/posts/small/avatar.jpg', '/posts/cover-only/cover.jpg', '/posts/thumbnail/thumb.jpg', 'https://images.example.test/cover.jpg', '/posts/athlete/avatar.jpg']

['', '/tnclub-yedas', '/tnclub-yedas/en'].each do |baseurl|
  site = {
    'baseurl' => baseurl,
    'pages' => fixtures,
    'static_files' => [{ 'path' => '/posts/small/avatar.jpg' }],
    'active_lang' => 'vi',
    'data' => { 'strings' => { 'vi' => { 'map' => {}, 'spinner' => {} } } }
  }
  output = Liquid::Template.parse(source).render!({ 'site' => site }, filters: [MapImageTestFilters], registers: { site: Struct.new(:filter_cache).new({}) })
  avatars = output.scan(/avatar:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
  wanted = expected.map { |path| path.start_with?('https://', 'http://') ? path : "#{baseurl}#{path}" }
  raise "Wrong map avatars for #{baseurl.inspect}: #{avatars.inspect}" unless avatars == wanted
end

puts 'Map image tests passed: local avatar, cover/thumbnail fallbacks, external image, athlete and VI/EN base URLs'
