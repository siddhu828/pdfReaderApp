FROM node:20
WORKDIR /app
COPY . .
COPY .env .env
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host","0.0.0.0"]