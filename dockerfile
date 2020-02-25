FROM gcr.io/distroless/static
MAINTAINER Matthew Smith <mjsmith3@byu.edu>

ARG NAME

COPY ${NAME} /server
COPY static /static

ENTRYPOINT ["/server"]
