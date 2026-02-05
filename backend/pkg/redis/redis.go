package redis

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

func Init() {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		return
	}
	opt, err := redis.ParseURL(url)
	if err != nil {
		return
	}
	Client = redis.NewClient(opt)
}

func Ping(ctx context.Context) error {
	if Client == nil {
		return nil
	}
	return Client.Ping(ctx).Err()
}
