<!-- FIRST DOWNLOAD MYSQL SERVER AND NODEJS AND INSTALLED AND SETUP IT.

IN VSCODE OPEN THIS FOLDER AND CREATE A .env FILE.

ADD IT -
PORT=8080       #DEFAULT
HOST=localhost  #DEFAULT
USER=root       #DEFAULT
SPORT=3306      #DEFAULT
SPASS=123456    #MYSQL PASSWORD //CHANGE IT
SDNAME=carecool #DATABASE NAME  //CHANGE IT



CREATE DATABASE AND TABLES WHICH IS GIVEN BELOW.

DATABASE NAME -> carecool


create table auth (
    sn int auto_increment not null unique,
    userid varchar(100) not null primary key,
    email varchar(100) not null,
    ucode int not null,
    password varchar(100),
    auth_date date not null DEFAULT (CURRENT_DATE),
    auth_time time DEFAULT (CURRENT_TIME)
);

create table signup (
    sn int auto_increment not null unique,
    userid varchar(100) not null primary key,
    email varchar(100) not null,
    password varchar(100),
    signup_date date not null DEFAULT (CURRENT_DATE),
    signup_time time DEFAULT (CURRENT_TIME)
);


--> appoint

create table appoint (
    sn int auto_increment not null unique,
    userid varchar(100) not null,
    trackid varchar(40) not null primary key,
    signedup varchar(10),
    email varchar(100) not null,
    name varchar(100) not null,
    mob bigint not null,
    service varchar(50) not null,
    district varchar(50),
    city varchar(50),
    appoint_date date not null DEFAULT (CURRENT_DATE),
    appoint_time time DEFAULT (CURRENT_TIME)
);


--> track

create table track (
    sn int auto_increment not null primary key,
    trackid varchar(40) not null,
    muserid varchar(64) default '---',
    visiting_date date,
    visited_date varchar(20) default '---',
    shop_address1 varchar(100) default '---',
    delivery_date date,
    finish varchar(20) default 'requesting',
    review varchar(10) default '---',
    review_msg varchar(500) default '---',
    FOREIGN KEY (trackid) REFERENCES appoint (trackid)
);


--> profile

create table user_profile (
    sn int auto_increment not null unique,
    userid varchar(100) not null primary key,
    email varchar(100),
    name varchar(100),
    mob bigint not null,
    district varchar(50),
    city varchar(50)
);


--> mechanic registration

create table mregistration (
    sn int auto_increment not null unique,
    approvedid varchar(100) not null primary key,
    userid varchar(64) not null,
    email varchar(100) not null,
    name varchar(100) not null,
    mob bigint not null,
    state varchar(50),
    district varchar(50),
    city varchar(50),
    street varchar(150),
    pincode varchar(10),
    ac varchar(5) DEFAULT 'off',
    refrigerator varchar(5) DEFAULT 'off',
    fan varchar(5) DEFAULT 'off',
    tv varchar(5) DEFAULT 'off',
    mobile varchar(5) DEFAULT 'off',
    cooler varchar(5) DEFAULT 'off',
    laptop varchar(5) DEFAULT 'off',
    washingmachine varchar(5) DEFAULT 'off',
    register_date date not null DEFAULT (CURRENT_DATE),
    register_time time DEFAULT (CURRENT_TIME)
);


--> mechanic profile

create table mechanics (
    sn int auto_increment not null unique,
    userid varchar(64) not null primary key,
    email varchar(100) not null,
    name varchar(100) not null,
    mob bigint not null,
    state varchar(50),
    district varchar(50),
    city varchar(50),
    street varchar(150),
    pincode varchar(10),
    ac varchar(5) DEFAULT 'off',
    refrigerator varchar(5) DEFAULT 'off',
    fan varchar(5) DEFAULT 'off',
    tv varchar(5) DEFAULT 'off',
    mobile varchar(5) DEFAULT 'off',
    cooler varchar(5) DEFAULT 'off',
    laptop varchar(5) DEFAULT 'off',
    washingmachine varchar(5) DEFAULT 'off',
    entry_date date not null DEFAULT (CURRENT_DATE),
    entry_time time DEFAULT (CURRENT_TIME)
);



--> review

create table review (
    sn int auto_increment not null primary key,
    name varchar(100),
    rating varchar(10),
    reviewText varchar(300),
    entry_date date not null DEFAULT (CURRENT_DATE),
    entry_time time DEFAULT (CURRENT_TIME)
);

--> contact

create table contact (
    sn int auto_increment not null primary key,
    name varchar(100),
    email varchar(100),
    mob varchar(20),
    msg varchar(300),
    entry_date date not null DEFAULT (CURRENT_DATE),
    entry_time time DEFAULT (CURRENT_TIME)
);



*ALL PACKAGES.JSON NODE MODULE SHOULD BE DOWNLOADED (RUN node install in terminal)* -->

RUN APP.JS FILE AND GO TO http://localhost:8080 ON YOUR BROWSER.