FROM sickp/alpine-nginx:mainline
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
ARG backend_url=127.0.0.1:61337
EXPOSE 80 443

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
  && node_modules/.bin/gulp nginx-conf --backend-url ${backend_url} \
  && mv nginx.conf /etc/nginx/ \
  # Clean up
  && apk del build-dependencies \
  && rm -r package.json gulpfile.js gulp-utils.js nginx.template.conf app tasks node_modules .tmp \
  && rm -r /root/.npm /root/.node-gyp /tmp/npm* /var/cache/apk

ENTRYPOINT ["nginx"]