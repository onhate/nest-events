import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConstructorOptions } from 'eventemitter2';
import { DefaultEventEmitter } from './definitions';
import { EventBus } from './eventbus';
import { EventBusInitializer } from './initializer';

export interface EventBusModuleOptions extends ConstructorOptions {
  /**
   * If "true", registers `EventEmitterModule` as a global module.
   * See: https://docs.nestjs.com/modules#global-modules
   *
   * @default true
   */
  global?: boolean;
}

@Module({})
export class EventBusModule {
  static forRoot(options?: EventBusModuleOptions): DynamicModule {
    return {
      global: options?.global ?? true,
      module: EventBusModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: 'Options', useValue: options },
        EventBusInitializer,
        EventBus,
        DefaultEventEmitter
      ],
      exports: [EventBus, DefaultEventEmitter]
    };
  }
}
