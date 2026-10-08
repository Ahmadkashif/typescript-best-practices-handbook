#!/usr/bin/env bash
# Builds 3 bases x 2 shapes, prints image sizes, and boot-checks each image.
# slim/alpine images have ENTRYPOINT docker-entrypoint.sh (runs `node` for CMD js file); distroless has ENTRYPOINT ["/nodejs/bin/node"].
set -e; cd "$(dirname "$0")"
declare -A BASES=([slim]=node:24-slim [alpine]=node:24-alpine [distroless]=gcr.io/distroless/nodejs24-debian13:nonroot)
for k in slim alpine distroless; do for shape in bundle unbundled; do
  timeout 600 docker build -q --build-arg RUNTIME=${BASES[$k]} --target $shape -t tsbench:$k-$shape . >/dev/null
  cid=$(docker run -d -e PORT=8080 -e EXIT_AFTER_LISTEN=1 tsbench:$k-$shape); code=$(timeout 30 docker wait $cid); logs=$(docker logs $cid 2>&1 | tail -1); docker rm $cid >/dev/null
  echo "$k $shape $(docker image inspect tsbench:$k-$shape --format '{{.Size}}') exit=$code $logs"
done; done
for b in "${BASES[@]}"; do echo "base $b $(docker image inspect $b --format '{{.Size}}')"; done
