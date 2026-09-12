# syntax=docker/dockerfile:1

# Build stage
FROM golang:alpine AS builder

WORKDIR /build

# Install git and certificates
RUN apk add --no-cache git ca-certificates tzdata

# Cache go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
ARG BUILD_TIME=unknown
RUN echo "Build time: $BUILD_TIME"
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /build/dineflow-api cmd/server/main.go cmd/server/seed.go

# Production runner stage
FROM alpine:3.20 AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/dineflow-api /app/dineflow-api

USER appuser

EXPOSE 8080

ENV PORT=8080 \
    APP_ENV=production

CMD ["/app/dineflow-api"]
