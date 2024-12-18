# wakeup-normies Project v1.0.0
NPM is used to manage dependencies

## Philosophie du projet
Ce projet a pour objectif de regrouper des articles illustrés par une image ou une vidéo youtube.
Un formulaire permet aux utilisateurs d'alimenter la liste d'articles.


# Backend Node.js
*requirements :*
- node >= 20.15.0
- npm >= 10.7.0
- sequelize-cli
- mysql

first run `npm install`

add `.env` file in the backend folder of project and add following lines
```text
DB_USERNAME='admin'
DB_PASSWORD='azerty'
DB_NAME='wakeup_normies_db_dev'
JWT_SECRET='wakeup_secret'
DB_HOSTNAME=127.0.0.1
HOST=127.0.0.1:5000
```
after you can run
```shell
npx sequelize-cli db:create # Run db creation
npx sequelize-cli db:migrate # Run migrations

node seeds/01_users.js && node seeds/02_articles.js && node seeds/03_tags.js # Run seeds

nodemon # Start server
```
Now you are ready to use this backend project

# App web React
*requirements :*
- node >= 20.15.0
- npm >= 10.7.0

first run `npm install`

write your ipv4 in src/utils/url.js

run `npm start`

Then Signup & Signin with your created credentials.