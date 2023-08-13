import { SetMetadata } from '@nestjs/common';
import { OnOptions } from 'eventemitter2';

export interface OnEventOptions extends OnOptions {
  rethrow?: boolean;
}

export interface OnEvent {
  event: string;
  options?: OnEventOptions;
}

export const emitterKey = 'nest-event:emitter';
export const fromKey: string = 'nest-event:from';
export const onKey: string = 'nest-event:on';

export const Emitter = (emitter: string = 'default') => SetMetadata(emitterKey, emitter);
export const From = (emitter: string) => SetMetadata(fromKey, emitter);
export const On = (event: string, options?: OnEventOptions) => SetMetadata(onKey, { event, options });
