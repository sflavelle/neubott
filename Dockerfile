FROM node:12
WORKDIR /srv/neubott

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy App source
COPY . .

CMD [ "node", "index.js" ]