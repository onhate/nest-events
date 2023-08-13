import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DefaultEventEmitter } from './definitions';
import { EventBus } from './eventbus';
import { EventBusInitializer } from './initializer';

@Module({})
export class EventBusModule {
  static forRoot(options?: any): DynamicModule {
    return {
      global: options?.global ?? true,
      module: EventBusModule,
      imports: [DiscoveryModule],
      providers: [EventBusInitializer, EventBus, DefaultEventEmitter],
      exports: [EventBus, DefaultEventEmitter]
    };
  }
}
