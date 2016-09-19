FROM mhart/alpine-node:6.5
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
ARG port=61337
EXPOSE ${port}

# Setup environment variables
ENV PORT ${port}
ENV NODE_ENV production
ENV SLH_CONFIG_PATH /etc/slh-config.yaml

# Copy necessary files
COPY startserver.js package.json /srv/
COPY src /srv/src/

# Build
WORKDIR /srv/
RUN npm install \
  && npm cache clean

ENTRYPOINT ["node", "startserver.js"]