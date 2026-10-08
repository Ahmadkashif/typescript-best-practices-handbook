#!/usr/bin/env bash
# Each logger in a fresh process, 3 runs, stdout -> /dev/null (file) and -> pipe (like a container log driver). Prints raw JSON lines.
cd "$(dirname "$0")"
for target in file pipe; do
  for k in console-json stdout-write-json pino pino-sync pino-child winston; do
    for r in 1 2 3; do
      if [ $target = file ]; then out=$(taskset -c 3 timeout 60 node bench.js $k 2>&1 >/dev/null)
      else out=$(taskset -c 3 timeout 60 node bench.js $k 2>&1 > >(cat >/dev/null)); fi
      echo "{\"target\":\"$target\",\"run\":$r,${out#\{}"
    done
  done
done
