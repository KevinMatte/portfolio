
.PHONY: all www paint

build: www
	spd-say -i "-50" "Built"

www: www/front/About.html paint

www/front/About.html: README.md www/front/About.template
	nodejs showdown.js README.md www/front/About.template  www/front/About.html


paint:
	cd paint; npm run build
	rm -fr www/paint
	mkdir -p www/paint
	cp -pr paint/server paint/build paint/public www/paint/
	cp paint/src/styles.css www/css/styles.css

clean:
	rm -fr paint/build


dumpdb:
	file=/opt/portfolio/files/backup_$$(date +'%Y%m%d_%H%M%S').sql; \
	mysqldump -u paint -p paint > /opt/portfolio/files/backup_$$(date +'%Y%m%d_%H%M%S').sql; \
	echo $$file
