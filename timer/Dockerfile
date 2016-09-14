FROM mhart/alpine-node:6.5
MAINTAINER Holi0317 "holliswuhollis@gmail.com"

# Copy necessary files
COPY . /srv/

# Build
WORKDIR /srv/
RUN npm install \
  && npm cache clean \
  && mv crontab /var/spool/cron/crontabs/slh

ENTRYPOINT ["crond", "-l", "2", "-f"]