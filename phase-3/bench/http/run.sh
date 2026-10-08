#!/usr/bin/env bash
# Usage: ./run.sh [duration_s] [runs]. Server pinned to CPU 2, autocannon (4 workers) to CPUs 4-7,12-15 (CPU 10, the HT sibling of 2, left idle).
set -u
cd "$(dirname "$0")"
DUR=${1:-10}; RUNS=${2:-3}; CONN=100
mkdir -p raw; : > raw/summary.tsv
for s in node-http express hono fastify fastify-zod nest-fastify; do
  for route in get post; do
    for r in $(seq 1 "$RUNS"); do
      PORT=3999 taskset -c 2 timeout $((DUR*3+30)) node dist/$s.js & pid=$!
      for i in $(seq 1 100); do curl -s -o /dev/null localhost:3999/ 2>/dev/null && break; sleep 0.1; done
      if [ $route = get ]; then args=(http://127.0.0.1:3999/); else args=(-m POST -H content-type=application/json -i payload.json http://127.0.0.1:3999/orders); fi
      taskset -c 4-7,12-15 timeout 30 npx autocannon -w 4 -c $CONN -d 2 "${args[@]}" > /dev/null 2>&1   # warmup (JIT)
      taskset -c 4-7,12-15 timeout $((DUR+30)) npx autocannon -w 4 -c $CONN -d "$DUR" -j "${args[@]}" > raw/$s-$route-$r.json 2>/dev/null
      kill $pid; wait $pid 2>/dev/null || true
      node --input-type=commonjs -e 'const j=require("./raw/'$s-$route-$r'.json"); console.log(["'$s'","'$route'",'$r',Math.round(j.requests.average),j.latency.p50,j.latency.p99,j.non2xx,j.errors].join("\t"))' | tee -a raw/summary.tsv
    done
  done
done
