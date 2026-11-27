require 'jekyll'
require 'json'

module MapImageTestFilters
  def relative_url(input)
    input.to_s.start_with?('https://', 'http://') ? input : "#{@context['site']['baseurl']}#{input}"
  end
end

source = File.read(File.expand_path('../_includes/site-map.html', __dir__))
fixtures = [
  { 'layout' => 'post', 'geo' => [1, 2], 'banner-img' => '/posts/small/cover.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'category' => 'Ăn Ngon', 'tags' => ['Miền Bắc'], 'url' => '/food/', 'title' => 'Cơm tấm', 'banner-img' => '/food.jpg' },
  { 'layout' => 'post', 'geo' => [1, 2], 'category' => 'Du lịch', 'title' => 'Hà Nội' }
]

['', '/tnclub-yedas', '/tnclub-yedas/en'].each do |baseurl|
  site = {
    'baseurl' => baseurl,
    'pages' => fixtures,
    'static_files' => [],
    'active_lang' => 'vi',
    'default_lang' => 'vi',
    'data' => { 'strings' => { 'vi' => { 'map' => {}, 'spinner' => {} } } }
  }
  output = Liquid::Template.parse(source).render!({ 'site' => site }, filters: [MapImageTestFilters], registers: { site: Struct.new(:filter_cache).new({}) })
  raise 'map-pins.js must load before site-map.js' unless output.index('map-pins.js') < output.index('site-map.js')
  urls = output.scan(/pinsUrl:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
  raise "Wrong pinsUrl for #{baseurl.inspect}: #{urls.inspect}" unless urls == ["#{baseurl}/map-pins.json"]
  bases = output.scan(/base:\s*("(?:[^"\\]|\\.)*")/).flatten.map { |value| JSON.parse(value) }
  raise "Wrong base for #{baseurl.inspect}: #{bases.inspect}" unless bases == ["#{baseurl}/"]
  raise 'Missing food categories option' unless output.include?('foodCategories:') && output.include?('ăn ngon')
  raise 'Pin data must live in map-pins.json, not inline' if output.include?('pinAvatar:') || output.include?('placeName:')
  raise 'Missing food filter' unless output.include?('data-filter="Ẩm thực"')
  raise 'Missing food country/region dialog' unless output.include?('id="map-food-dialog"') && output.include?('id="map-food-groups"') && output.include?('data-food-country="all"')
  raise 'Food filters must not list articles' if output.include?('data-food="')
end

puts 'Map tests passed: pinsUrl/base/foodCategories config, data moved to map-pins.json, food dialog and VI/EN base URLs'
