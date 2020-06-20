FROM node:latest

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY tsconfig.json .
COPY src ./src

RUN npm run build

CMD npm start
