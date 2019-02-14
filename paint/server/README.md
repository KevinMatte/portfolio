

# MySQL Database

```
CREATE USER 'paint'@'localhost' IDENTIFIED BY '...';
CREATE DATABASE paint;
GRANT ALL PRIVILEGES ON paint.* TO 'paint'@'localhost';

CREATE TABLE USER (
  id int not null AUTO_INCREMENT,
  userid VARCHAR(20),
  email VARCHAR(120),
  password VARCHAR(20),
  PRIMARY KEY(id)
);


CREATE TABLE  (
  id int not null AUTO_INCREMENT,
  userid VARCHAR(20),
  email VARCHAR(120),
  password VARCHAR(20),
  PRIMARY KEY(id)
);

mysqldump -u paint -p paint


```
