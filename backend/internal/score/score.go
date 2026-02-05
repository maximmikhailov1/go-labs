package score

import (
	"context"
	"fmt"
	"strconv"

	"github.com/maximmikhailov1/go-labs/backend/pkg/redis"
	redisv9 "github.com/redis/go-redis/v9"
)

const keyPrefix = "score"

func keyCompleted(userID, subjectID, groupID uint) string {
	return fmt.Sprintf("%s:completed:%d:%d:%d", keyPrefix, userID, subjectID, groupID)
}

func keyDefended(userID, subjectID, groupID uint) string {
	return fmt.Sprintf("%s:defended:%d:%d:%d", keyPrefix, userID, subjectID, groupID)
}

func IncrementCompleted(ctx context.Context, userID, subjectID, groupID uint) error {
	if redis.Client == nil {
		return nil
	}
	k := keyCompleted(userID, subjectID, groupID)
	return redis.Client.Incr(ctx, k).Err()
}

func IncrementDefended(ctx context.Context, userID, subjectID, groupID uint) error {
	if redis.Client == nil {
		return nil
	}
	k := keyDefended(userID, subjectID, groupID)
	return redis.Client.Incr(ctx, k).Err()
}

func decrementNonNegative(ctx context.Context, key string) error {
	if redis.Client == nil {
		return nil
	}
	if err := redis.Client.Decr(ctx, key).Err(); err != nil {
		return err
	}
	val, err := redis.Client.Get(ctx, key).Int64()
	if err == redisv9.Nil || val >= 0 {
		return nil
	}
	if err != nil {
		return err
	}
	return redis.Client.Set(ctx, key, 0, 0).Err()
}

func DecrementCompleted(ctx context.Context, userID, subjectID, groupID uint) error {
	k := keyCompleted(userID, subjectID, groupID)
	return decrementNonNegative(ctx, k)
}

func DecrementDefended(ctx context.Context, userID, subjectID, groupID uint) error {
	k := keyDefended(userID, subjectID, groupID)
	return decrementNonNegative(ctx, k)
}

func GetScore(ctx context.Context, userID, subjectID, groupID uint) (completed, defended int64, err error) {
	if redis.Client == nil {
		return 0, 0, nil
	}
	completed, _ = getInt(ctx, keyCompleted(userID, subjectID, groupID))
	defended, _ = getInt(ctx, keyDefended(userID, subjectID, groupID))
	return completed, defended, nil
}

func getInt(ctx context.Context, k string) (int64, error) {
	if redis.Client == nil {
		return 0, nil
	}
	s, err := redis.Client.Get(ctx, k).Result()
	if err == redisv9.Nil {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return strconv.ParseInt(s, 10, 64)
}

func GetScoresForUsers(ctx context.Context, userIDs []uint, subjectID, groupID uint) (map[uint]struct{ Completed, Defended int64 }, error) {
	out := make(map[uint]struct{ Completed, Defended int64 })
	if redis.Client == nil {
		for _, uid := range userIDs {
			out[uid] = struct{ Completed, Defended int64 }{0, 0}
		}
		return out, nil
	}
	for _, uid := range userIDs {
		c, d, _ := GetScore(ctx, uid, subjectID, groupID)
		out[uid] = struct{ Completed, Defended int64 }{c, d}
	}
	return out, nil
}
