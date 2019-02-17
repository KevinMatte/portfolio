#!/usr/bin/env mysql

DROP TABLE IF EXISTS `vector3`;
DROP TABLE IF EXISTS `graph`;
DROP TABLE IF EXISTS `drawing`;

CREATE TABLE `drawing` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `userid` int NOT NULL,
    `name` varchar(128) DEFAULT NULL,

    INDEX user_id (userid),
    FOREIGN KEY(`userid`) REFERENCES user(id) ON DELETE CASCADE,
    PRIMARY KEY (`id`)
);

CREATE TABLE `graph` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `type` varchar(128),
    `name` varchar(128) DEFAULT NULL,
    `drawingid` int NOT NULL,

    INDEX drawing_id (drawingid),
    FOREIGN KEY(`drawingid`) REFERENCES drawing(id) ON DELETE CASCADE,
    PRIMARY KEY (`id`)
);

CREATE TABLE `vector3` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `graphid` int NOT NULL,
    `type` varchar(128) DEFAULT NULL,
    `name` varchar(128) DEFAULT NULL,
    `x1` double,
    `x2` double,
    `x3` double,

    INDEX graph_id (graphid),
    FOREIGN KEY(`graphid`) REFERENCES graph(id) ON DELETE CASCADE,
    PRIMARY KEY (`id`)
);

