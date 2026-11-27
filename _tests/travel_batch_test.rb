require 'date'
require 'json'
require 'yaml'

root = File.expand_path('..', __dir__)
credits = JSON.parse(File.read(File.join(root, '_data/travel_2027_credits.json')))
articles = Dir.glob(File.join(root, 'posts/**/index.md')).filter_map do |file|
  front, body = File.read(file).split(/^---\s*$\n?/, 3).drop(1)
  next unless front
  data = YAML.safe_load(front, permitted_classes: [Date, Time], aliases: true)
  next unless data.is_a?(Hash) && data['photo_id']
  record = credits.fetch(data['photo_id'])
  %w[title source photo author license license_url alt].each do |key|
    raise "Missing #{key}: #{file}" if record[key].to_s.strip.empty?
  end
  %w[source photo license_url].each do |key|
    raise "Invalid #{key}: #{file}" unless record[key].match?(%r{\Ahttps?://})
  end
  %w[banner-img cover-img].each do |key|
    image = File.join(root, data.fetch(key).delete_prefix('/'))
    raise "Missing or invalid #{key}: #{file}" unless File.file?(image) && File.binread(image, 2) == "\xFF\xD8".b
    raise "Image outside article folder: #{file}" unless File.dirname(image) == File.dirname(file)
  end
  avatar = File.join(File.dirname(file), 'avatar.jpg')
  raise "Missing JPEG avatar: #{file}" unless File.file?(avatar) && File.binread(avatar, 2) == "\xFF\xD8".b
  raise "Avatar too heavy: #{file}" if File.size(avatar) > 100_000
  raise "Missing reference include: #{file}" unless body.include?('{% include travel-cover-reference.html %}')
  raise "Missing map coordinates: #{file}" unless data['geo'].is_a?(Array) && data['geo'].size == 2 && data['geo'].all? { |value| value.is_a?(Numeric) }
  [data['photo_id'], data['place_country']]
end
raise 'No travel batch articles found' if articles.empty?
raise 'Duplicate photo_id' unless articles.map(&:first).uniq.size == articles.size
puts "Travel batch tests passed: #{articles.size} articles, JPEG covers/avatars, map coordinates and source/license metadata"
puts articles.group_by(&:last).transform_values(&:size)
