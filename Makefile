
.PHONY: all www

publish:

build: www

www: www/front/About.html www/paint

www/front/About.html: README.md www/front/About.template
	nodejs showdown.js README.md www/front/About.template  www/front/About.html


www/paint: paint/server
	[ \! -h www/paint ] && ln -s www/paint paint/server
