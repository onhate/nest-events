# Nest Events Library

Welcome to the Nest Events library! This library provides event handling and emitting capabilities for
your [NestJS](https://nestjs.com/) applications. With Nest Events, you can easily manage and trigger events within your
application, making it simpler to implement various communication patterns and workflows.

It's the same as `@nestjs/event-emitter` but allowing you to implement your own emitter, like AWS SNS, RabbitMQ, etc.
A default emitter is already provided by default using [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2).

## Installation

To get started with Nest Events, you need to install the library using [npm](https://www.npmjs.com/)
or [yarn](https://yarnpkg.com/). Open your terminal and run the following command:

```bash
npm install nest-events
```

or

```bash
yarn add nest-events
```

## Usage

### Importing the Module

To start using the Nest Events library, you need to import the `EventBusModule` into your NestJS application. In your
module file (e.g., `app.module.ts`), import the module like this:

```typescript
import { Module } from '@nestjs/common';
import { EventBusModule } from 'nest-events';

@Module({
  imports: [EventBusModule.forRoot()],
})
export class AppModule {}
```

### Emitting Events

You can emit events using the `EventBus` service provided by the library. Here's how you can emit an event:

```typescript
import { Injectable } from '@nestjs/common';
import { EventBus } from 'nest-events';

@Injectable()
export class MyService {
  constructor(private readonly eventBus: EventBus) {
  }

  async doSomething() {
    // ... your logic

    // Emit an event
    await this.eventBus.emitAsync('myEvent', eventData);
  }
}
```

### Handling Events

To handle events, you can use decorators provided by the library. Here's an example of how to use the `@On` decorator to
handle an event:

```typescript
import { Injectable } from '@nestjs/common';
import { On } from 'nest-events';

@Injectable()
export class MyEventHandler {
  @On('myEvent')
  handleMyEvent(eventData: any) {
    // Handle the event
    console.log('Event received:', eventData);
  }
}
```

### Custom Emitters

Nest Events allows you to work with multiple emitters for different scenarios. You can define custom emitters and use
them accordingly.

```typescript
import { DefaultEventEmitter, Emitter, EventBus, On } from 'nest-events';

@Emitter('cloud')
export class CloudEmitter extends DefaultEventEmitter {
  private sns: SNS;

  constructor() {
    super();
    this.sns = new SNS();
  }

  async emitAsync(event: string, message: any): Promise<boolean> {
    try {
      const params = {
        Message: JSON.stringify(message),
        TopicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic'
      };
      await this.sns.publish(params).promise();
      return true;
    } catch (error) {
      console.error('Error emitting event:', error);
      return false;
    }
  }
}

@Injectable()
export class MyService {
  constructor(private readonly eventBus: EventBus) {
  }

  async doSomething() {
    // ... your logic

    // Emit an event using the custom emitter
    await this.eventBus.emitter('cloud').emitAsync('myEvent', eventData);
  }
}

@Injectable()
export class MyListener {
  @On('myEvent')
  handleCustomEvent(eventData: any) {
    // Handle the event from the custom emitter
    console.log('Custom event received:', eventData);
  }
}
```

## Configuration

The `EventBusModule.forRoot()` method accepts an optional configuration object.
See [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) for more configuration options details.
Here's an example of how to use it:

```typescript
import { Module } from '@nestjs/common';
import { EventBusModule } from 'nest-events';

@Module({
  imports: [
    EventBusModule.forRoot({
      global: true // Set to "true" (default) to register as a global module
      /* Additional configuration options from eventemitter2 can be added here */
    })
  ]
})
export class AppModule {}
```

## Contributing

We welcome contributions to the Nest Events library! If you find a bug, have a feature request, or want to improve the
documentation, please [open an issue](https://github.com/onhate/nest-events)
or [submit a pull request](https://github.com/onhate/nest-events).

## License

This library is released under the [MIT License](https://opensource.org/licenses/MIT).

---

Happy event handling with Nest Events! 🎉