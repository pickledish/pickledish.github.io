# Expand `class="lightbox"` images into HTML Popover markup so the
# lightbox can open/close with a second click, backdrop click, or Escape
# without any JavaScript on the page.
#
# Uses <span> wrappers so the markup stays valid inside the <p> tags
# kramdown wraps standalone images in.

module Lightbox
  IMG = /<img\b([^>]*\bclass\s*=\s*(["'])(?:(?!\2).)*\blightbox\b(?:(?!\2).)*\2[^>]*)>/i

  module_function

  def attr(tag, name)
    tag[/\s#{Regexp.escape(name)}\s*=\s*"([^"]*)"/i, 1] ||
      tag[/\s#{Regexp.escape(name)}\s*=\s*'([^']*)'/i, 1]
  end

  def expand(html)
    index = 0
    html.gsub(IMG) do |tag|
      next tag if tag.match?(/\bpopover\b/i)

      src = attr(tag, "src")
      next tag unless src

      alt = attr(tag, "alt").to_s
      index += 1
      id = "lightbox-#{index}"
      img = tag.sub(/\s+tabindex\s*=\s*(["'])[^"']*\1/i, "")

      %(<span class="lightbox-wrap"><button type="button" class="lightbox-trigger" popovertarget="#{id}" aria-label="Enlarge image">#{img}</button><span id="#{id}" class="lightbox-full" popover="auto"><button type="button" class="lightbox-close" popovertarget="#{id}" popovertargetaction="hide" aria-label="Close image"><img src="#{src}" alt="#{alt}"></button></span></span>)
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_convert do |item|
  next unless item.content&.include?("lightbox")

  item.content = Lightbox.expand(item.content)
end
