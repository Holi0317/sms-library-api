FROM nginx:mainline-alpine
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
ARG backend_url=slh-backend:61337
ARG server_name=https://slh.holi0317.net

# Copy necessary files
COPY . /srv/

# Build it
WORKDIR /srv/
RUN apk --update add --no-cache --virtual build-dependencies nodejs python make g++ \
  && npm install \
  && npm install --only=dev \
  && node_modules/.bin/gulp \
  && node_modules/.bin/gulp nginx-conf --backend-url ${backend_url} --server-name ${server_name} \
  && mv nginx.conf /etc/nginx/ \
  # Clean up
  && npm cache clean \
  && apk del build-dependencies \
  && rm -r .tmp app node_modules tasks gulpfile.js nginx.template.conf package.json \
  && rm -r /tmp/npm* /var/cache/apk /root/.node-gyp