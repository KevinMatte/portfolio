

# MySQL Database

```
CREATE DATABASE paint;
CREATE TABLE USER (
  id int not null AUTO_INCREMENT,
  userid VARCHAR(20),
  email VARCHAR(120),
  password VARCHAR(20),
  PRIMARY KEY(id)
);
CREATE USER 'paint'@'localhost' IDENTIFIED BY '...';
GRANT ALL PRIVILEGES ON paint.* TO 'paint'@'localhost';
```
