
---
title: "Basic Usage"
description: "Simple examples to get you started"
order: 1
tags: ["basic", "quickstart", "examples"]
---

# Basic Usage

Get started with the most common use cases and basic functionality.

## Installation and Setup

First, install the package:

```bash
npm install myproject
```

Import and initialize:

```javascript
import { MyProject } from 'myproject';

const client = new MyProject({
  apiKey: 'your-api-key-here'
});
```

## Basic Operations

### Reading Data

```javascript
// Get a single item
const item = await client.get('item-id');
console.log(item);

// Get multiple items
const items = await client.getMany(['id1', 'id2', 'id3']);
console.log(items);

// List all items with pagination
const { data, pagination } = await client.list({
  page: 1,
  limit: 20
});
```

### Creating Data

```javascript
// Create a new item
const newItem = await client.create({
  name: 'My Item',
  description: 'This is a sample item',
  tags: ['sample', 'demo']
});

console.log('Created item:', newItem.id);
```

### Updating Data

```javascript
// Update an existing item
const updatedItem = await client.update('item-id', {
  name: 'Updated Name',
  description: 'Updated description'
});

// Partial update
const partialUpdate = await client.patch('item-id', {
  tags: ['updated', 'sample']
});
```

### Deleting Data

```javascript
// Delete a single item
await client.delete('item-id');

// Delete multiple items
await client.deleteMany(['id1', 'id2', 'id3']);
```

## Error Handling

Always wrap your API calls in try-catch blocks:

```javascript
try {
  const data = await client.get('item-id');
  console.log('Data retrieved:', data);
} catch (error) {
  if (error.status === 404) {
    console.log('Item not found');
  } else if (error.status === 401) {
    console.log('Authentication failed');
  } else {
    console.log('Error:', error.message);
  }
}
```

## Configuration Options

### Environment-based Configuration

```javascript
const client = new MyProject({
  apiKey: process.env.MYPROJECT_API_KEY,
  environment: process.env.NODE_ENV, // 'development' or 'production'
  timeout: 10000, // 10 seconds
  retries: 3
});
```

### Custom Headers

```javascript
const client = new MyProject({
  apiKey: 'your-api-key',
  headers: {
    'Custom-Header': 'value',
    'User-Agent': 'MyApp/1.0'
  }
});
```

## Working with Responses

### Response Format

All API responses follow this structure:

```javascript
{
  success: true,
  data: {
    // Your actual data here
  },
  meta: {
    timestamp: '2023-12-01T10:00:00Z',
    requestId: 'req_123456789'
  }
}
```

### Handling Different Response Types

```javascript
// Single item response
const response = await client.get('item-id');
if (response.success) {
  const item = response.data;
  console.log('Item:', item);
}

// List response with pagination
const listResponse = await client.list();
if (listResponse.success) {
  const { items, pagination } = listResponse.data;
  console.log('Items:', items);
  console.log('Total pages:', pagination.totalPages);
}
```

## Next Steps

Once you're comfortable with basic usage:

1. Explore [Advanced Examples](advanced) for complex scenarios
2. Check the [API Reference](../api-reference) for complete method documentation
3. Learn about [Error Handling](../troubleshooting) best practices
