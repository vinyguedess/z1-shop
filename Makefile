cicd:
	rm -rf build coverage

	echo "Running CI/CD pipeline"
	echo "Step #1 - Lint code"
	npm run lint

	echo "Step #2 - Run tests"
	docker-compose up -d db
	npm run test

	echo "Step #3 - Build code"
	node ace build --ignore-ts-errors
	node ace docs:generate

	echo "Step #4 - Build image"
	docker-compose build

	echo "Step #5 - Run service"
	docker-compose up -d

	echo "Running on http://localhost:8001"
