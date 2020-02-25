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
	@go mod download

build: deps
	@mkdir -p dist
	@env CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -o ./dist/${NAME}-linux-amd64 ${PKG}
	@cp -r static ./dist/static

docker: clean build
	@echo Building container ${OWNER}/${NAME}:${VERSION}
	@docker build -f dockerfile --build-arg NAME=${NAME}-linux-amd64 -t ${OWNER}/${NAME}:${VERSION} dist

deploy: docker
	@echo Logging into Dockerhub
	@docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

	@echo Pushing container ${OWNER}/${NAME}:${VERSION}
	@docker push ${OWNER}/${NAME}:${VERSION}

clean:
	@go clean
	@rm -rf dist/
