# Agorium Project v1.3.2

## Project Philosophy
Agorium is a platform dedicated to empowering free expression and sharing alternative perspectives on vital societal issues. It enables users to post articles, images, videos, and more, fostering dialogue on topics often censored or ignored by mainstream narratives. While encouraging open discussion, the platform uses moderation to block illegal content, offering a space for independent voices to question mainstream views and inform others.

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
- Buy domain & server & deploy.
- Dockerize project.
- Implement the video streaming system (upload, conversion HLS encoding, secure streaming).
- Optimize file storage (avatars, preview, video, and maybe more).
- Improve general style (use element+ to redisign).
- Develop a DevOps pipeline (CI/CD with Docker).
- Find a way to avoid reporting abusive articles (with IP or another way...)


### CORE V2:
- Implementing SSR to solve SEO issues.
- Implement an accessibility system (screen readers, keyboard navigation).
- Strengthen security (strong authentication, backups, protection against attacks).
- Improve performance (caching, CDN).

## Dockerized Version

#### To run the project with Docker, follow these simplified steps:

1. **Prerequisites**:
   - Docker >= 20.10.0
   - Docker Compose >= 1.29.0

2. **Clone the repository**:
   Clone the repository to your local directory:
   ```shell
    git clone https://github.com/your-repository/agorium.git
    cd agorium
   ```

3. **Configure the environment**:
   Create a `.env` file in the root folder with the following parameters:
   ```env
    JWT_SECRET=agorium_secret
    VITE_AGORIUM_VERSION=1.3.2
    ```

    Create a `.env.dev` file in the root folder with the following parameters:
   ```env
    NODE_ENV=development

    # Backend
    DB_USERNAME=admin
    DB_PASSWORD=azerty
    DB_PORT=3306
    DB_NAME=agorium_db_dev
    DB_HOSTNAME=mysql
    HOST=backend:3000

    # Frontend
    VITE_BASE_URL=http://localhost
    VITE_PORT_BACK=3000
    VITE_PORT_FRONT=5173
    VITE_AGORIUM_VERSION=1.3.2


    SMTP_HOST=sandbox.smtp.mailtrap.io
    SMTP_PORT=2525
    SMTP_USER=ea0dedca063ecb
    SMTP_PASS=33b31adaece03c
    EMAIL_FROM=no-reply@agorium.local
    ```

    Create a `.env.preprod` file in the root folder with the following parameters:
   ```env
    NODE_ENV=preprod

    # Backend
    DB_USERNAME=admin
    DB_PASSWORD=azerty
    DB_PORT=3306
    DB_NAME=agorium_db_preprod
    DB_HOSTNAME=mysql
    HOST=agorium-preprod-backend.castello.ovh:3000

    # Frontend
    VITE_BASE_URL=http://agorium-preprod-backend.castello.ovh
    VITE_PORT_BACK=3000
    VITE_PORT_FRONT=8080
    VITE_APP_MODE=preprod
    VITE_AGORIUM_VERSION=1.3.2


    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=zanmato.13200@gmail.com
    SMTP_PASS=********
    EMAIL_FROM=zanmato.13200@gmail.com
    ```

    Create a `.env.prod` file in the root folder with the following parameters:
   ```env
    NODE_ENV=production

    # Backend
    DB_USERNAME=admin
    DB_PASSWORD=caS*gg<5050.
    DB_PORT=3306
    DB_NAME=agorium_db_prod
    DB_HOSTNAME=mysql
    HOST=agorium-backend.castello.ovh:3000

    # Frontend
    VITE_BASE_URL=https://agorium-backend.castello.ovh
    VITE_PORT_BACK=3000
    VITE_PORT_FRONT=8080
    VITE_AGORIUM_VERSION=1.3.2


    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=zanmato.13200@gmail.com
    SMTP_PASS=********
    EMAIL_FROM=zanmato.13200@gmail.com
    ```

    Mailtrap is used to test email sent in local.

4. **Start with Docker**: 
    Use docker-compose to build and start all services (backend, frontend, and database):
    ```shell
    docker-compose up --build
    ```
5. **Access the application**:
    - Frontend: http://localhost:8080
    - Backend API: http://localhost:5000

6. **Useful Docker commands**:
    - Restart all services:
    ```shell
    docker compose restart
    ```
    - Stop all services:
    ```shell
    docker compose down
    ```
    - Open a shell in a container (e.g., backend):
    ```shell
    docker compose exec agorium-backend sh
    ```

## Backend Node.js
⚠️ If you are not using Docker, you can still run the backend manually as below.
*requirements :*
- node >= 20.15.0
- npm >= 10.7.0
- sequelize-cli
- mysql

first run `npm install`

Create a `.env` file in the backend folder with the following parameters:

```env
JWT_SECRET=agorium_secret

# Backend
DB_USERNAME=admin
DB_PASSWORD=azerty
DB_PORT=3306
DB_NAME=agorium_db_dev
DB_HOSTNAME=localhost

HOST=localhost:3000

# Frontend
VITE_BASE_URL=http://localhost
VITE_PORT_BACK=3000
VITE_PORT_FRONT=5173
```

after you can run
```shell
npx sequelize-cli db:create # Run db creation
npx sequelize-cli db:migrate # Run migrations

node seeds/01_users.js && node seeds/02_tags.js && node seeds/03_articles.js && node seeds/04_comments.js && node seeds/05_achievements.js # Run seeds

nodemon # Start server
```
Now you are ready to use this backend project

## Frontend Vue3
⚠️ Docker is recommended, but here’s how to run manually if needed.
*requirements :*
- node >= 20.15.0
- npm >= 10.7.0

first run `npm install`

Create a `env.json` file in the frontend/public/ folder with the following parameters:
```env
{
"VITE_BASE_URL": "http://localhost",
"VITE_PORT_BACK": 3000,
"VITE_PORT_FRONT": 5173
}
```

run `npm run dev`

The app will be accessible at http://localhost:5173 by default.

Then Signup & Signin with your created credentials.
