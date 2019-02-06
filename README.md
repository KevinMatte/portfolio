# portfolio
A place to store portfolio work.

I'm doing this fast, just to get a full stack app react running.

# Setup

[http://24.64.174.212/](http://24.64.174.212/)

Setting up Apache2 and MySql.

## Apache
apache2 and MySql already installed.

apache with mod_wsgi and python 3.

## /etc/apache2/ports.conf
Specified external host IP with **Listen**.

```
apt-get install libapache2-mod-wsgi
apt-get install libapache2-mod-wsgi-py3
```

## Opened up Firewall port 80

## /etc/apache2/sites-available/000-default.conf

Changed VirtualHost to: <VirtualHost 127.0.0.1:80>


## /etc/apache2/sites-available/public.conf


Port forwarded from 24.64.174.212:80 

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
## /etc/apache2/mods-available/wsgi.conf

Note: Yes, I'm doing this fast, running right out of my dev directory.
I'll create a Makefile to do a proper push to public later.

```xml
    WSGIScriptAlias /paint /var/www/public/paint/server/paint.py
    WSGIPythonPath /home/kevin/.virtualenvs/paint/lib/python3.6/site-packages
    WSGIPythonHome /home/kevin/.virtualenvs/paint

```
