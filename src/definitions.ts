import { EventEmitter2 } from 'eventemitter2';

export type IEventEmitter = Pick<EventEmitter2, 'emitAsync' | 'on' | 'off'>;
export { EventEmitter2 as DefaultEventEmitter };
