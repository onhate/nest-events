import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IEventEmitter } from './definitions';
import { EventBusInitializer } from './initializer';

@Injectable()
export class EventBus {
  constructor(private readonly module: EventBusInitializer) {}

  public async emitAsync(event: string | symbol, ...args: any[]) {
    return await this.emitter().emitAsync(event, ...args);
  }

  public emitter(emitter: string = 'default'): IEventEmitter | undefined {
    if (this.module.getEmitters().has(emitter)) {
      return this.module.getEmitters().get(emitter);
    }

    throw new InternalServerErrorException(`Emitter with name: '${emitter}' not found`);
  }
}
