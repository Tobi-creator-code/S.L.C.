#!/bin/sh
set -e
export PORT="${PORT:-80}"
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
php /usr/local/bin/slc-session-ini.php > /usr/local/etc/php/conf.d/zz-session.ini
nginx -t
exec /usr/bin/supervisord -c /etc/supervisord.conf
