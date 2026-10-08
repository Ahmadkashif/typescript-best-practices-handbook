#!/usr/bin/env bash
# Boots each server, checks GET / and a valid + invalid POST.
cd "$(dirname "$0")"
BODY=$(cat payload.json)
for s in node-http express hono fastify fastify-zod nest-fastify; do
  PORT=3999 timeout 20 node dist/$s.js & pid=$!
  for i in $(seq 1 50); do curl -s -o /dev/null localhost:3999/ 2>/dev/null && break; sleep 0.1; done
  a=$(curl -s localhost:3999/); b=$(curl -s -H 'content-type: application/json' -d "$BODY" localhost:3999/orders)
  c=$(curl -s -o /dev/null -w '%{http_code}' -H 'content-type: application/json' -d '{"customerId":"x"}' localhost:3999/orders)
  echo "$s | $a | $b | invalid=$c"
  kill $pid; wait $pid 2>/dev/null || true
done
