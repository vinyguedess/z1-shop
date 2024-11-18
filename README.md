# Z1 Shop
Z1 Bank backend test.

The following description assumes that you have:
- node >= 22 and npm installed
- docker installed
- docker compose installed

## Running tests
Command for running tests is `docker-compose up -d db` and `node ace test`. Due to some limitations in mocking lucid orm transaction database needs to be up although it's not used.
Coverage results can be checked at `coverage/index.html`.

## Running service
Before running service it's needed to build code with `node ace build`, build swagger documentation with `node ace docs:generate` and run database migrations with `node ace migration:run`.
Command for running service is `docker-compose up -d` which will lift database and api container.
Container runs at port 8001 and Swagger documentation can be checked in `http://localhost:8001/docs`.

## CI/CD
To emulate the steps of a CI/CD pipeline, there's a command in [Makefile](/Makefile) called `cicd` that:
- Run linter
- Run tests
- Build code and swagger documentation
- Build image
- And run service at port 8001
