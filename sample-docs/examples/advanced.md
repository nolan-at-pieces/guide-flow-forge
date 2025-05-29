
---
title: "Advanced Examples"
description: "Complex use cases and advanced patterns"
order: 2
tags: ["advanced", "patterns", "optimization"]
---

# Advanced Examples

Explore sophisticated patterns and advanced use cases for power users.

## Streaming Data

### Real-time Data Streams

```javascript
import { MyProject } from 'myproject';

const client = new MyProject({ apiKey: 'your-key' });

// Create a data stream
const stream = client.createStream({
  topic: 'user-events',
  batchSize: 100,
  flushInterval: 1000 // 1 second
});

// Handle incoming data
stream.on('data', (events) => {
  console.log(`Received ${events.length} events`);
  events.forEach(event => {
    processEvent(event);
  });
});

// Handle errors
stream.on('error', (error) => {
  console.error('Stream error:', error);
  // Implement reconnection logic
  setTimeout(() => stream.reconnect(), 5000);
});

// Start streaming
await stream.start();
```

### Batch Processing

```javascript
import { MyProject, BatchProcessor } from 'myproject';

const processor = new BatchProcessor({
  batchSize: 1000,
  maxConcurrency: 5,
  retryAttempts: 3
});

// Process large datasets efficiently
const results = await processor.process(largeDataset, async (batch) => {
  return await client.processBatch(batch);
});

console.log('Processing complete:', results.summary);
```

## Custom Middleware

### Request/Response Middleware

```javascript
import { MyProject } from 'myproject';

const client = new MyProject({ apiKey: 'your-key' });

// Add request middleware
client.use('request', async (request, next) => {
  // Add custom headers
  request.headers['X-Request-ID'] = generateRequestId();
  
  // Log request
  console.log(`Making request to: ${request.url}`);
  
  return next(request);
});

// Add response middleware
client.use('response', async (response, next) => {
  // Log response time
  console.log(`Request completed in: ${response.duration}ms`);
  
  // Transform response
  if (response.data) {
    response.data.timestamp = new Date().toISOString();
  }
  
  return next(response);
});
```

### Rate Limiting Middleware

```javascript
import { RateLimiter } from 'myproject';

const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
});

client.use('request', async (request, next) => {
  await rateLimiter.checkLimit();
  return next(request);
});
```

## Advanced Querying

### Complex Filters

```javascript
// Advanced filtering with multiple conditions
const results = await client.query({
  where: {
    and: [
      { field: 'status', operator: 'eq', value: 'active' },
      { field: 'createdAt', operator: 'gte', value: '2023-01-01' },
      {
        or: [
          { field: 'category', operator: 'in', value: ['tech', 'science'] },
          { field: 'priority', operator: 'eq', value: 'high' }
        ]
      }
    ]
  },
  orderBy: [
    { field: 'priority', direction: 'desc' },
    { field: 'createdAt', direction: 'asc' }
  ],
  limit: 50,
  offset: 0
});
```

### Aggregations

```javascript
// Perform aggregations
const analytics = await client.aggregate({
  groupBy: ['category', 'status'],
  metrics: {
    count: { type: 'count' },
    avgValue: { type: 'avg', field: 'value' },
    maxDate: { type: 'max', field: 'createdAt' }
  },
  where: {
    field: 'createdAt',
    operator: 'gte',
    value: '2023-01-01'
  }
});

console.log('Analytics results:', analytics);
```

## Connection Pooling

### Database Connection Management

```javascript
import { MyProject, ConnectionPool } from 'myproject';

const pool = new ConnectionPool({
  minConnections: 5,
  maxConnections: 50,
  acquireTimeoutMs: 30000,
  idleTimeoutMs: 300000,
  reconnectOnFailure: true
});

const client = new MyProject({
  apiKey: 'your-key',
  connectionPool: pool
});

// Automatic connection management
const results = await Promise.all([
  client.query('SELECT * FROM users'),
  client.query('SELECT * FROM orders'),
  client.query('SELECT * FROM products')
]);
```

## Caching Strategies

### Multi-level Caching

```javascript
import { MyProject, CacheManager, RedisCache, MemoryCache } from 'myproject';

// Setup multi-level cache
const cache = new CacheManager([
  new MemoryCache({ maxSize: 1000, ttl: 60000 }), // L1: Memory
  new RedisCache({ host: 'localhost', ttl: 300000 }) // L2: Redis
]);

const client = new MyProject({
  apiKey: 'your-key',
  cache: cache
});

// Cache-aware operations
const data = await client.get('expensive-data', {
  cacheKey: 'custom-key',
  cacheTtl: 600000, // 10 minutes
  forceRefresh: false
});
```

### Smart Cache Invalidation

```javascript
// Setup cache invalidation patterns
cache.addInvalidationRule('users:*', {
  on: ['user.created', 'user.updated', 'user.deleted'],
  pattern: /^users:/
});

// Automatic invalidation on events
client.on('user.updated', (event) => {
  cache.invalidate(`users:${event.userId}`);
  cache.invalidate('users:list:*');
});
```

## Event-Driven Architecture

### Event Emitters and Listeners

```javascript
import { MyProject, EventBus } from 'myproject';

const eventBus = new EventBus();
const client = new MyProject({ 
  apiKey: 'your-key',
  eventBus: eventBus
});

// Setup event listeners
eventBus.on('data.created', async (event) => {
  console.log('Data created:', event.data);
  await updateSearchIndex(event.data);
});

eventBus.on('data.updated', async (event) => {
  console.log('Data updated:', event.data);
  await invalidateCache(event.data.id);
});

// Events are automatically emitted
await client.create({ name: 'New Item' }); // Triggers 'data.created'
```

### Saga Pattern Implementation

```javascript
import { Saga, SagaStep } from 'myproject';

const orderSaga = new Saga('process-order');

orderSaga
  .step('validate-order', async (context) => {
    const isValid = await validateOrder(context.order);
    if (!isValid) throw new Error('Invalid order');
    return { validated: true };
  })
  .step('reserve-inventory', async (context) => {
    const reservation = await reserveItems(context.order.items);
    return { reservation };
  })
  .step('process-payment', async (context) => {
    const payment = await processPayment(context.order.payment);
    return { payment };
  })
  .step('fulfill-order', async (context) => {
    const fulfillment = await createFulfillment(context.order);
    return { fulfillment };
  })
  .compensate('reserve-inventory', async (context) => {
    await releaseReservation(context.reservation);
  })
  .compensate('process-payment', async (context) => {
    await refundPayment(context.payment);
  });

// Execute saga
try {
  const result = await orderSaga.execute({ order: orderData });
  console.log('Order processed successfully:', result);
} catch (error) {
  console.log('Order processing failed, compensations executed');
}
```

## Performance Monitoring

### Custom Metrics

```javascript
import { MyProject, MetricsCollector } from 'myproject';

const metrics = new MetricsCollector({
  namespace: 'myapp',
  flushInterval: 30000 // 30 seconds
});

const client = new MyProject({
  apiKey: 'your-key',
  metrics: metrics
});

// Custom performance tracking
client.use('request', async (request, next) => {
  const startTime = Date.now();
  const timer = metrics.timer('api.request.duration');
  
  try {
    const response = await next(request);
    metrics.increment('api.request.success');
    return response;
  } catch (error) {
    metrics.increment('api.request.error');
    metrics.increment(`api.request.error.${error.status}`);
    throw error;
  } finally {
    timer.end();
    metrics.histogram('api.request.duration', Date.now() - startTime);
  }
});
```

## Next Steps

These advanced patterns provide powerful capabilities for complex applications:

- Implement [monitoring and alerting](../troubleshooting) for production systems
- Explore [API Reference](../api-reference) for complete method documentation
- Check out [Integration Examples](integrations) for specific frameworks
