# Cron Trigger Service

Holder for cron triggers.

## Env

- NATS_URL
- TRIGGER_* // trigger expression, `${cron} | ${topic}`. `*` could any string.