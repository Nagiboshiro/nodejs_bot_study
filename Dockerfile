FROM node:18.12.1
WORKDIR /tg-backend
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]