FROM sickp/alpine-nginx:mainline
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
ARG backend_url=slh-backend:61337
ARG server_url=https://slh.holi0317.net

# Copy necessary files
COPY *.js *.json *.conf /srv/
COPY app /srv/app/
COPY tasks /srv/tasks/

# Build it
WORKDIR /srv/
RUN apk --update add --no-cache --virtual build-dependencies nodejs python make g++ \
  && npm install \
  && npm install gulp \
  && node_modules/.bin/gulp \
  && node_modules/.bin/gulp nginx-conf --backend-url ${backend_url} --server-url ${server_url} \
  && mv nginx.conf /etc/nginx/ \
  # Clean up
  && apk del build-dependencies \
  && rm -r package.json gulpfile.js gulp-utils.js nginx.template.conf app tasks node_modules .tmp \
  && rm -r /root/.npm /root/.node-gyp /tmp/npm* /var/cache/apk