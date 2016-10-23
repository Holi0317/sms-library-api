FROM mhart/alpine-node:6.9
MAINTAINER Holi0317 "holliswuhollis@gmail.com"
ARG port=61337
EXPOSE ${port}

# Setup environment variables
ENV PORT ${port}
ENV NODE_ENV production
ENV SLH_CONFIG_PATH /etc/slh-config.yaml

# Copy necessary files
COPY . /srv/

# Build
WORKDIR /srv/
RUN npm install \
  && npm install --only=dev \
  && node_modules/.bin/gulp \
  && npm prune --production \
  && rm -r custom-typings src tasks gulpfile.js package.json tsconfig.json \
  && npm cache clean \
  && rm -r /tmp/npm*

ENTRYPOINT ["node", "startserver.js"]