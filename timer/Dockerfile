FROM mhart/alpine-node:6.9
MAINTAINER Holi0317 "holliswuhollis@gmail.com"

# Default environment variable
ENV SLH_CONFIG_PATH /etc/slh-config.yaml
ENV NODE_ENV production

# Copy necessary files
COPY . /srv/

# Build
WORKDIR /srv/
RUN npm install \
  && npm install --only=dev \
  && node_modules/.bin/gulp \
  && npm prune --production \
  && rm -r tasks custom-typings src gulpfile.js package.json tsconfig.json /tmp/npm* \
  && npm cache clean \
  && mv crontab /var/spool/cron/crontabs/root

ENTRYPOINT ["crond", "-d", "8", "-f"]