FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 6000

CMD ["npm", "start"]