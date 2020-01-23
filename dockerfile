FROM gcr.io/distroless/static
MAINTAINER Matthew Smith <mjsmith3@byu.edu>

COPY server /server
COPY static /static
ENTRYPOINT ["/server"]
