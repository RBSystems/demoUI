NAME := demoui
OWNER := byuoitav
PKG := github.com/${OWNER}/${NAME}

# version:
# use the git tag, if this commit
# doesn't have a tag, use the git hash
VERSION := $(shell git rev-parse HEAD)
ifneq ($(shell git describe --exact-match --tags HEAD 2> /dev/null),)
	VERSION = $(shell git describe --exact-match --tags HEAD)
endif

# go stuff
PKG_LIST := $(shell go list ${PKG}/...)

all: clean build

deps:
	@echo Downloading dependencies
	@go mod download

build: deps
	@mkdir -p dist
	@echo Building linux/amd64
	@env CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -o ./dist/${NAME}-linux-amd64 ${PKG}

	@echo Building linux/arm
	@env CGO_ENABLED=0 GOOS=linux GOARCH=arm go build -v -o ./dist/${NAME}-linux-arm ${PKG}

	@echo Copying static files to dist
	@cp -r static ./dist/static

docker: clean build
	@echo Building container ${OWNER}/${NAME}:${VERSION}
	@docker build -f dockerfile --build-arg NAME=${NAME}-linux-amd64 -t ${OWNER}/${NAME}:${VERSION} -t ${OWNER}/${NAME}:latest dist
	@docker build -f dockerfile --build-arg NAME=${NAME}-linux-arm -t ${OWNER}/${NAME}-arm:${VERSION} -t ${OWNER}/${NAME}-arm:latest dist

deploy: docker
	@echo Logging into Dockerhub
	@docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

	@echo Pushing container ${OWNER}/${NAME}:${VERSION}
	@docker push ${OWNER}/${NAME}:${VERSION}

	@echo Pushing container ${OWNER}/${NAME}:latest
	@docker push ${OWNER}/${NAME}:latest

	@echo Pushing container ${OWNER}/${NAME}-arm:${VERSION}
	@docker push ${OWNER}/${NAME}-arm:${VERSION}

	@echo Pushing container ${OWNER}/${NAME}-arm:latest
	@docker push ${OWNER}/${NAME}-arm:latest

clean:
	@go clean
	@rm -rf dist/
