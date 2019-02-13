
.PHONY: all www paint

build: www

www: www/front/About.html paint

www/front/About.html: README.md www/front/About.template
	nodejs showdown.js README.md www/front/About.template  www/front/About.html


paint:
	cd paint; npm run build
	rm -fr www/paint
	mkdir -p www/paint
	cp -pr paint/server paint/build paint/public www/paint/
