import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { emitterKey, fromKey, OnEvent, OnEventOptions, onKey } from './decorators';
import { DefaultEventEmitter, IEventEmitter } from './definitions';

@Injectable()
export class EventBusInitializer implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('EventBus');
  private emitters: Map<string, IEventEmitter>;

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly module: ModuleRef,
    private readonly defaultEventEmitter: DefaultEventEmitter
  ) {}

  public onApplicationBootstrap() {
    this.emitters = this.findEmitters();
    this.subscribeEventListeners();
  }

  onApplicationShutdown() {}

  public getEmitters(): Map<string, IEventEmitter> {
    return this.emitters;
  }

  private findEmitters(): Map<string, IEventEmitter> {
    const entry = (wrapper: InstanceWrapper) => {
      const name = this.reflector.get<string>(emitterKey, wrapper.metatype);
      if (name) {
        return [name, wrapper.instance] as [string, IEventEmitter];
      }
    };

    const entries = this.discovery
      .getProviders()
      .filter(wrapper => wrapper.metatype)
      .map(wrapper => entry(wrapper))
      .filter(entry => entry);

    const emitters = new Map(entries);

    if (!emitters.has('default')) {
      emitters.set('default', this.defaultEventEmitter);
    }

    return emitters;
  }

  private subscribeEventListeners() {
    const providers = this.discovery.getProviders();
    const controllers = this.discovery.getControllers();
    const wrappers = [...providers, ...controllers];
    wrappers
      .filter(wrapper => wrapper.instance)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};

        this.scanner.getAllMethodNames(prototype).forEach(methodKey => {
          this.subscribeToEventIfListener(instance, methodKey, wrapper);
        });
      });
  }

  private subscribeToEventIfListener(instance: any, method: string, wrapper: InstanceWrapper) {
    const fun = instance[method];

    const opts = this.reflector.get<OnEvent>(onKey, fun);
    if (opts === undefined || opts.event === undefined) {
      return undefined;
    }

    // the handler function that will be called when the event is emitted
    const handler = async (...args: any[]) => {
      // global instances we just call the method with the event arguments
      if (wrapper.isDependencyTreeStatic()) {
        return this.call(instance, method, opts.options, args);
      }

      // if the listener is request scoped, for each request we will get an instance and call the method
      // with the event arguments
      const resolved = await this.module.resolve(wrapper.token, undefined, { strict: false });
      return this.call(resolved, method, opts.options, args);
    };

    const from = this.reflector.get<string>(fromKey, fun) ?? 'default';
    const emitter = this.emitters.get(from);

    // register the on event handler
    return emitter.on(opts.event, handler, opts.options);
  }

  private async call(instance: any, method: string, opts: OnEventOptions, args: unknown[]) {
    try {
      return await instance[method].call(instance, ...args);
    } catch (error) {
      if (opts?.rethrow === true) {
        throw error;
      }
      this.logger.error(error, error.stack);
    }
  }
}
