FROM node:10.16.0
WORKDIR /usr/src/smart-brain-api-1
COPY ./ ./
RUN npm install
EXPOSE 3000
CMD ["/bin/bash"]

