import { Inject, Optional } from '@nestjs/common';
import { ConstructorOptions, EventEmitter2 } from 'eventemitter2';

export type IEventEmitter = Pick<EventEmitter2, 'emitAsync' | 'on' | 'off'>;
export const Options = Symbol('EventBusModuleOptions');


export class DefaultEventEmitter extends EventEmitter2 implements IEventEmitter {
  constructor(@Optional() @Inject(Options) options?: ConstructorOptions) {
    super(options);
  }
}
