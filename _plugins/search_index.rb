require 'cgi'
require 'digest'
require 'fileutils'
require 'json'
require 'tempfile'

module Yedas
  class SearchIndex
    VERSION = 1
    IMPLEMENTATION = Digest::SHA256.file(__FILE__).hexdigest
    FIELDS = %w[title category url date image country].freeze

    attr_reader :hits, :rebuilt

    def initialize(site)
      @site = site
      @lang = site.config.fetch('active_lang', site.config.fetch('default_lang', 'vi'))
      @default_lang = site.config.fetch('default_lang', 'vi')
      @baseurl = site.config.fetch('baseurl', '').to_s.sub(%r{/$}, '')
      @cache_path = site.in_source_dir('.jekyll-cache', 'yedas-search', "#{@lang}.json")
      @filters = Object.new.extend(Liquid::StandardFilters)
      @hits = @rebuilt = 0
    end

    def build(documents)
      old_entries = read_cache
      entries = {}
      documents.each do |document|
        data = document.data
        next if data['search'] == false || data['draft'] == true || data['published'] == false
        next unless document.url.end_with?('/', '.html')

        title = data['title'].to_s
        title = @site.config['title'].to_s if title.empty? && document.url == '/'
        next if title.strip.empty? || title == '{title}' || document.url == '/404.html'

        date = data['date']
        date = date.strftime(@site.config.fetch('date_format', '%d/%m/%Y')) if date.respond_to?(:strftime)
        fields = {
          'title' => title,
          'category' => Array(data['tags']).map(&:to_s).join(', '),
          'url' => "#{@baseurl}#{@lang == @default_lang ? '' : "/#{@lang}"}#{document.url}",
          'date' => date.to_s,
          'image' => image_url(thumbnail_of(data)),
          'country' => data['place_country'].to_s
        }
        fingerprint = Digest::SHA256.hexdigest(JSON.generate([VERSION, IMPLEMENTATION, @lang, fields]))
        key = document.path.to_s
        cached = old_entries[key]
        entry = if cached.is_a?(Hash) && cached['fingerprint'] == fingerprint && valid_entry?(cached['entry'])
                  @hits += 1
                  cached['entry']
                else
                  @rebuilt += 1
                  fields.merge('title' => plain_text(title), 'category' => plain_text(fields['category']))
                end
        entries[key] = { 'fingerprint' => fingerprint, 'entry' => entry }
      end
      write_cache(entries)
      entries.values.map { |value| value['entry'] }.uniq { |entry| entry['url'] }
    end

    private

    def thumbnail_of(data)
      thumb = data['cover-img'].to_s
      return thumb unless thumb.empty?
      cover = data['banner-img']
      case cover
      when Array then cover.first.is_a?(Hash) ? cover.first.keys.first.to_s : cover.first.to_s
      when Hash then cover.keys.first.to_s
      else cover.to_s
      end
    end

    def image_url(path)
      path = path.to_s
      return '' if path.empty? || (!path.start_with?('/') && !path.start_with?('http'))
      path.start_with?('http') ? path : "#{@baseurl}#{path}"
    end

    def plain_text(text)
      CGI.unescapeHTML(@filters.strip_html(text)).gsub(/\s+/, ' ').strip
    end

    def valid_entry?(entry)
      entry.is_a?(Hash) && FIELDS.all? { |field| entry[field].is_a?(String) }
    end

    def read_cache
      return {} if @site.config['disable_disk_cache']
      cache = JSON.parse(File.read(@cache_path))
      cache['version'] == VERSION && cache['entries'].is_a?(Hash) ? cache['entries'] : {}
    rescue JSON::ParserError, SystemCallError, TypeError, NoMethodError
      {}
    end

    def write_cache(entries)
      return if @site.config['disable_disk_cache']
      directory = File.dirname(@cache_path)
      FileUtils.mkdir_p(directory)
      Tempfile.create(['search-', '.json'], directory) do |file|
        file.write(JSON.generate('version' => VERSION, 'entries' => entries))
        file.close
        File.rename(file.path, @cache_path)
      end
    rescue SystemCallError => error
      Jekyll.logger.warn 'Search cache:', "#{@lang}: #{error.class}; index generated without updating cache"
    end
  end

  class SearchIndexGenerator < Jekyll::Generator
    safe true
    priority :lowest

    IMG_EXT = /\.(jpe?g|png|webp|gif)\z/i

    # Bài viết ở repo này là pages trong posts/YYYY/MM/DD/slug/ (không phải
    # _posts collection). Ảnh của bài nằm ngay trong folder đó hoặc sâu hơn.
    def photo_needs(site, documents)
      # Đếm ảnh thẳng từ đĩa — ảnh trong posts/ không nằm trong
      # site.static_files (được polyglot xử lý riêng).
      img_counts = Hash.new do |hash, key|
        hash[key] = Dir.glob(File.join(site.source, key, '**', '*.{jpg,jpeg,png,webp,gif}')).size
      end

      needs = []
      seen = {}
      documents.each do |doc|
        post = doc.url[%r{\A/posts/(.+)/\z}, 1]
        next unless post
        next if seen[post]
        seen[post] = true

        data = doc.data
        next if data['draft'] == true || data['published'] == false
        next unless yield data # caller chọn nhóm bài (Du lịch / VĐV / ...)
        title = data['title'].to_s
        next if title.strip.empty?
        tags = Array(data['tags']).map(&:to_s)
        country = data['place_country'].to_s
        country = data.dig('athlete', 'country').to_s if country.empty?
        country = nil if country.empty?
        # Ảnh thật sự nhúng trong nội dung (markdown ![...] + <img) —
        # file nằm trong folder chưa chắc đã được đưa vào bài.
        # Quy ước repo: photo-grid loop qua photo_titles "a|b|c" → mỗi mục 1 ảnh.
        content = doc.content.to_s
        inline_count = content.scan(/!\[[^\]]*\]|<img\b/i).size
        if content =~ /photo_titles\s*=\s*"([^"]*)"/
          # loop photo-grid: <img> trong body chỉ là template → trừ template,
          # cộng số title thật
          inline_count += Regexp.last_match(1).split('|').size - 1
        end
        # Quy ước travel_photos: front matter list [file, caption] render qua
        # travel-media.html — mỗi phần tử là 1 ảnh nhúng trong bài.
        inline_count += Array(data['travel_photos']).size
        img_count = img_counts["posts/#{post}"]
        base = {
          'post' => post, 'postDir' => post, 'title' => title,
          'tags' => tags, 'country' => country, 'status' => 'open',
          'imgCount' => inline_count, 'filesCount' => img_count
        }
        if thumbnail_of(data).to_s.empty?
          needs << base.merge('id' => "#{post}#cover", 'kind' => 'cover',
                              'suggestedQuery' => title)
        end
        if inline_count < 3 # bài có <3 ảnh nhúng = đang thiếu
          needs << base.merge('id' => "#{post}#inline", 'kind' => 'inline',
                              'suggestedQuery' => ([title] + tags).join(' '))
        end
      end
      needs
    end

    def thumbnail_of(data)
      thumb = data['cover-img'].to_s
      return thumb unless thumb.empty?
      cover = data['banner-img']
      case cover
      when Array then cover.first.is_a?(Hash) ? cover.first.keys.first.to_s : cover.first.to_s
      when Hash then cover.keys.first.to_s
      else cover.to_s
      end
    end

    def generate(site)
      return unless site.config['post_search']
      documents = (site.pages.select { |page| page.html? } + site.posts.docs).sort_by { |document| document.url }
      index = SearchIndex.new(site)
      content = JSON.generate(index.build(documents))
      page = Jekyll::PageWithoutAFile.new(site, site.source, '', 'search-index.json')
      page.data.merge!('layout' => nil, 'sitemap' => false, 'render_with_liquid' => false)
      page.content = content
      site.pages << page

      # photo-*-needs.json: danh sách bài kèm số ảnh cho photo-tool
      # extension — build sẵn để extension khỏi phải quét thư mục.
      matchers = {
        'photo-tourism-needs.json' => ->(d) { d['category'].to_s =~ /du lịch/i },
        'photo-athlete-needs.json' => ->(d) { !d['athlete'].nil? },
        'photo-photography-needs.json' => ->(d) { d['category'].to_s =~ /chụp ảnh/i },
      }
      primary_matchers = matchers.values
      matchers['photo-other-needs.json'] = ->(d) { primary_matchers.none? { |m| m.call(d) } }
      matchers.each do |fname, match|
        needs_page = Jekyll::PageWithoutAFile.new(site, site.source, '', fname)
        needs_page.data.merge!('layout' => nil, 'sitemap' => false, 'render_with_liquid' => false)
        needs_page.content = JSON.generate(photo_needs(site, documents, &match))
        site.pages << needs_page
      end

      site.config['search_index_digest'] = Digest::SHA256.hexdigest(content)[0, 16]
      Jekyll.logger.info 'Search index:', "#{site.config['active_lang']}: #{index.hits} cached, #{index.rebuilt} rebuilt"
    end
  end
end
