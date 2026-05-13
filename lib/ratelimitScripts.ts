export const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local window_ms = tonumber(ARGV[3])
local ttl_ms = tonumber(ARGV[4])
local refill_rate = limit / window_ms
local values = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(values[1])
local last_refill = tonumber(values[2])

if not tokens or not last_refill then
    local remaining = math.max(0, limit - 1)
    redis.call("HSET", key, "tokens", remaining, "lastRefill", now, "lastRequest", now)
    redis.call("PEXPIRE", key, ttl_ms)
    return { 1, math.floor(remaining), now + window_ms, -1 }
end

local elapsed_ms = math.max(0, now - last_refill)
local available = math.min(limit, tokens + (elapsed_ms * refill_rate))

if available < 1 then
    local wait_ms = math.ceil((1 - available) / refill_rate)
    local retry_after = math.max(1, math.ceil(wait_ms / 1000))
    redis.call("HSET", key, "tokens", available, "lastRefill", now, "lastRequest", now)
    redis.call("PEXPIRE", key, ttl_ms)
    return { 0, 0, now + wait_ms, retry_after }
end

local remaining = available - 1
local missing_to_full = math.max(0, limit - remaining)
local reset_time = now + math.ceil(missing_to_full / refill_rate)
redis.call("HSET", key, "tokens", remaining, "lastRefill", now, "lastRequest", now)
redis.call("PEXPIRE", key, ttl_ms)
return { 1, math.max(0, math.floor(remaining)), reset_time, -1 }
`;

export const RATE_LIMIT_STATUS_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local window_ms = tonumber(ARGV[3])
local refill_rate = limit / window_ms
local values = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(values[1])
local last_refill = tonumber(values[2])

if not tokens or not last_refill then
    return { limit, now + window_ms, -1 }
end

local elapsed_ms = math.max(0, now - last_refill)
local available = math.min(limit, tokens + (elapsed_ms * refill_rate))
local missing_to_full = math.max(0, limit - available)
local reset_time = now + math.ceil(missing_to_full / refill_rate)
local retry_after = -1

if available < 1 then
    retry_after = math.max(1, math.ceil((1 - available) / refill_rate / 1000))
end

return { math.max(0, math.floor(available)), reset_time, retry_after }
`;
