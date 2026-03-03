FROM node:20 as build-stage

WORKDIR /usr/src

COPY ["package.json", "package-lock.json",  "/usr/src/"]

COPY ["./mdb/mdb-vue-ui-kit-3.0.0.tgz", "/usr/src/mdb/"]

RUN npm install

COPY [".", "/usr/src/"]

RUN npm run build

FROM nginx:alpine

COPY --from=build-stage /usr/src/dist /usr/share/nginx/html

EXPOSE 3001

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]