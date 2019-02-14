
.PHONY: all www paint

build: www
	spd-say "Built"

www: www/front/About.html paint

www/front/About.html: README.md www/front/About.template
	nodejs showdown.js README.md www/front/About.template  www/front/About.html


paint:
	cd paint; npm run build
	rm -fr www/paint
	mkdir -p www/paint
	cp -pr paint/server paint/build paint/public www/paint/

dumpdb:
	mysqldump -u paint -p paint > /opt/portfolio/files/backup_$$(date +'%Y%m%d_%H%M%S').sql
