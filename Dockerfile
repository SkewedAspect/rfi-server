FROM node:0.12-slim
EXPOSE 8008

ADD . /code/
RUN buildDeps='ca-certificates git' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& cd /code \
	&& npm install \
	&& apt-get purge -y --auto-remove $buildDeps \
	&& npm cache clear

VOLUME [ "/code/node_modules" ]

WORKDIR /code
CMD [ "npm", "start" ]
