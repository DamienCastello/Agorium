# wakeup-normies Project v1.0.0
NPM is used to manage dependencies

## Project Philosophy
WakeUp Normies is a platform dedicated to empowering free expression and sharing alternative perspectives on vital societal issues. It enables users to post articles, images, videos, and more, fostering dialogue on topics often censored or ignored by mainstream narratives. While encouraging open discussion, the platform uses moderation to block illegal content, offering a space for independent voices to question mainstream views and inform others.

## Road Map:
### CORE v1:
- A form allows users to feed the list of articles.
- Users can comment on articles, like and associate tags.
- Admin users can validate articles and associated tags.
- Sort articles by date, tags, pertinence (and maybe more).
- Filter articles by date, tags, pertinence (and maybe more).
- Implement article reporting.
- Implement gamification.
- Add i18n to all displayed strings to translate into multiple languages.
- Add infinite load on fetch articles.
- Improve general style (border hover and more).
### CORE v2:
- Deploy on a server and make it privately accessible.
- Implement the video streaming system (upload, conversion HLS encoding, secure streaming).
- Optimize file storage (avatars, preview, video, and maybe more).
- Develop a DevOps pipeline (CI/CD with Docker).
### CORE V3:
- Implementing SSR to solve SEO issues.
- Implement an accessibility system (screen readers, keyboard navigation).
- Strengthen security (strong authentication, backups, protection against attacks).
- Improve performance (caching, CDN).
- Buy a domain, setup SSL/TLS, and make the project public.
- Find a way to avoid reporting abusive articles (with IP or another way...)

## Backend Node.js
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

node seeds/01_users.js && node seeds/02_tags.js && node seeds/03_articles.js && node seeds/04_comments.js# Run seeds

nodemon # Start server
```
Now you are ready to use this backend project

## App web Vue3
*requirements :*
- node >= 20.15.0
- npm >= 10.7.0

first run `npm install`

run `npm start`

Then Signup & Signin with your created credentials.
