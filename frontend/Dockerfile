FROM sickp/alpine-nginx:mainline
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
EXPOSE 80 443

# Copy necessary files
COPY *.js *.json /srv/
COPY app /srv/app/
COPY tasks /srv/tasks/
COPY nginx.conf /etc/nginx/

# Build it
WORKDIR /srv/
RUN apk --update add --no-cache --virtual build-dependencies nodejs python make g++ \
  && npm install \
  && npm install gulp \
  && node_modules/.bin/gulp \
  # TODO Replace upstream server location with environment variable
  # Clean up
  && apk del build-dependencies \
  && rm -r package.json gulpfile.js gulp-utils.js app tasks node_modules .tmp \
  && rm -r /root/.npm /root/.node-gyp /tmp/npm* /var/cache/apk

ENTRYPOINT ["nginx"]