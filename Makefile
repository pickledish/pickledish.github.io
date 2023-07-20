run:
	git ls-files | entr -c -r -s 'tailwindcss -o assets/css/tailwind.css && bundle exec jekyll serve --no-watch --drafts --config _config.yml,_config-local.yml'
