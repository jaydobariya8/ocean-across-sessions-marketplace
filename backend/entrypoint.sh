#!/bin/sh
set -e

echo "Waiting for database..."
while ! python -c "import psycopg2; psycopg2.connect(
    dbname='$DB_NAME',
    user='$DB_USER',
    password='$DB_PASSWORD',
    host='$DB_HOST',
    port='$DB_PORT'
)" 2>/dev/null; do
    sleep 1
done
echo "Database ready."

python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "Ensuring MinIO bucket..."
python -c "from apps.accounts.uploads import ensure_bucket; ensure_bucket()" || echo "MinIO not ready, skipping bucket init"

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120
