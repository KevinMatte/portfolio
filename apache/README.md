# Apache

Some notes on apache2 configuration for this site.

## WSGI & Python 3
```
apt-get install libapache2-mod-wsgi
apt-get install libapache2-mod-wsgi-py3
```

## Opened up Firewall port 80

* Port forwarded from 24.64.174.212:80 

Setup new site:
```
<VirtualHost 192.168.1.10:80>
	ServerName http://192.168.1.10:80

	ServerAdmin matte.kevin@gmail.com
	DocumentRoot /var/www/public

	ErrorLog ${APACHE_LOG_DIR}/public_error.log
	CustomLog ${APACHE_LOG_DIR}/public_access.log combined

  <Directory /var/www/public/paint/server>
    #WSGIProcessGroup paint
    WSGIApplicationGroup %{GLOBAL}
    Order deny,allow
    Allow from all
  </Directory>

   ErrorLog /var/www/public/paint/logs/error.log
   CustomLog /var/www/public/paint/logs/access.log combined

</VirtualHost>
```
## WSGI

Updated `/etc/apache2/mods-available/wsgi.conf`

Note: Yes, I'm doing this fast, running right out of my dev directory.
I'll create a Makefile to do a proper push to public later.

```xml
    WSGIScriptAlias /paint /var/www/portfolio/paint/server/paint.py
    WSGIPythonPath /var/www/portfolio/paint/server
    WSGIPythonHome /home/kevin/.virtualenvs/paint
    WSGIPassAuthorization On

```
