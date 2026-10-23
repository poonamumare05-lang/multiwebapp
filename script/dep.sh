#!/bin/bash

apt update -y

apt install apache2 -y

rm -f /var/www/html/index.html