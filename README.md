<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Steps to Run the NestJS Project with Docker and Postgres Database

### 1. Clone the repository
```bash
git clone <REPOSITORY_URL>
cd 04-teslo-shop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and edit it according to your configuration:

```bash
cp .env.example .env
```

Make sure the database connection variables match those in the Docker container.

### 4. Start the database with Docker

```bash
docker-compose up -d
```

This will start a Postgres container configured according to the `docker-compose.yml` file.

### 5. Run migrations (if applicable)

```bash
npm run migration:run
```

### 6. Start the NestJS application

```bash
npm run start:dev
```

### 7. Run SEED

```bash
http://localhost:3000/api/seed
```

The application will be available at `http://localhost:3000`.

---

### Useful resources

- [Official NestJS Documentation](https://docs.nestjs.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Postgres Documentation](https://www.postgresql.org/docs/)
