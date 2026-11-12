-- Run as a PostgreSQL superuser (adjust password before use)
CREATE USER smartspend_user WITH PASSWORD 'change_this_password';
CREATE DATABASE smartspend OWNER smartspend_user;
