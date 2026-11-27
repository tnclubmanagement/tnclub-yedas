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
  { 'layout' => 'post', 'athlete' => { 'geo' => [1, 2], 'avatar' => '/posts/athlete/avatar.jpg' } },
  { 'layout' => 'post', 'geo' => [1, 2], 'category' => 'Ăn Ngon', 'tags' => ['Miền Bắc'], 'url' => '/food/', 'title' => 'Cơm tấm', 'cover-img' => '/food.jpg', 'map_content_score' => 3 },
  { 'layout' => 'post', 'geo' => [1, 2], 'category' => 'Uống Ngon', 'tags' => ['miền trung'], 'url' => '/drinks/', 'cover-img' => '/drinks.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'category' => 'Tráng miệng', 'tags' => ['Miền Nam'], 'url' => '/desserts/', 'cover-img' => '/desserts.jpg' }
]
expected = ['/posts/small/avatar.jpg', '/posts/cover-only/cover.jpg', '/posts/thumbnail/thumb.jpg', 'https://images.example.test/cover.jpg', '/posts/athlete/avatar.jpg', '/food.jpg', '/drinks.jpg', '/desserts.jpg']

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
  images = output.scan(/image:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
  wanted_images = fixtures.map { |post| post['thumbnail-img'] || post['cover-img'] || post.dig('athlete', 'avatar') }.map { |path| path.start_with?('https://', 'http://') ? path : "#{baseurl}#{path}" }
  raise "Quickview must prefer cover/thumbnail over banner for #{baseurl.inspect}: #{images.inspect}" unless images == wanted_images
  raise 'Missing food filter' unless output.include?('data-filter="Ẩm thực"')
  raise 'Wrong food classification' unless output.scan(/topic:\s*"food"/).size == 3 && output.scan(/topic:\s*"travel"/).size == 4
  raise 'Missing food country/region dialog' unless output.include?('id="map-food-dialog"') && output.include?('id="map-food-groups"') && output.include?('data-food-country="all"')
  raise 'Food filters must not list articles' if output.include?('data-food="')
  raise 'Missing content score' unless output.match?(/contentScore:\s*3/)
  regions = output.scan(/region:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
  raise "Wrong region fallbacks: #{regions.inspect}" unless regions == ['', '', '', '', 'Miền Bắc', 'Miền Trung', 'Miền Nam']
end

fixtures[0]['tags'] = ['Miền Bắc']
fixtures[5]['place_region'] = 'Vùng tùy chỉnh'
output = Liquid::Template.parse(source).render!({ 'site' => { 'pages' => fixtures, 'data' => {} } }, filters: [MapImageTestFilters], registers: { site: Struct.new(:filter_cache).new({}) })
regions = output.scan(/region:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
raise 'Explicit region must take priority over tags' unless regions[4] == 'Vùng tùy chỉnh'
raise 'Food region fallback must not change travel regions' unless regions[0] == ''

puts 'Map tests passed: avatar fallbacks, food categories, region fallbacks and overrides, scores and VI/EN base URLs'
