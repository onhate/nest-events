import { Injectable, Scope } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DefaultEventEmitter, Emitter, EventBus, EventBusModule, EventBusModuleOptions, From, On } from './index';

@Emitter('mocked')
class MockEmitter extends DefaultEventEmitter {}

@Injectable({ scope: Scope.REQUEST })
class MockOnRequest {
  public calls = jest.fn();
  public static instance: MockOnRequest;

  constructor() {
    MockOnRequest.instance = this;
  }

  @On('test')
  onTest(payload: any) {
    this.calls('default', payload);
  }

  @From('mocked')
  @On('test')
  onTestFromMocked(payload: any) {
    this.calls('mocked', payload);
  }
}

class MockOn {
  public calls = jest.fn();

  @On('throw')
  onThrowDelayed(payload: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.calls('delayed', payload);
        resolve(true);
      }, 300);
    });
  }

  @On('throw')
  onThrow() {
    throw new Error('throw');
  }

  @On('rethrow', { rethrow: true })
  onReThrow() {
    throw new Error('rethrow');
  }

  @On('test')
  onTest(payload: any) {
    this.calls('default', payload);
  }

  @From('mocked')
  @On('test')
  onTestFromMocked(payload: any) {
    this.calls('mocked', payload);
  }

  @On('test.*')
  onTestWildcard(payload: any) {
    this.calls('test.*', payload);
  }
}

describe('Module Tests', () => {
  async function setup(config?: EventBusModuleOptions) {
    const module = Test.createTestingModule({
      imports: [EventBusModule.forRoot(config)],
      providers: [MockEmitter, MockOn, MockOnRequest]
    });
    return module.compile().then(module => module.init());
  }

  it('should call on method for default emitter', async () => {
    const module = await setup();

    await module.get(EventBus).emitAsync('test', { _: 'testing' });

    const actual = module.get(MockOn).calls;
    expect(actual).toBeCalledTimes(1);
    expect(actual).toBeCalledWith('default', { _: 'testing' });
  });

  it('should call on method for custom emitter', async () => {
    const module = await setup();

    await module.get(EventBus).emitter('mocked').emitAsync('test', { _: 'testing' });

    const actual = module.get(MockOn).calls;
    expect(actual).toBeCalledTimes(1);
    expect(actual).toBeCalledWith('mocked', { _: 'testing' });
  });

  it('should call on method for default emitter for request scoped listeners', async () => {
    const module = await setup();

    await module.get(EventBus).emitAsync('test', { _: 'testing' });

    const actual = MockOnRequest.instance.calls;
    expect(actual).toBeCalledTimes(1);
    expect(actual).toBeCalledWith('default', { _: 'testing' });
  });

  it('should call on method for custom emitter for request scoped listeners', async () => {
    const module = await setup();

    await module.get(EventBus).emitter('mocked').emitAsync('test', { _: 'testing' });

    const actual = MockOnRequest.instance.calls;
    expect(actual).toBeCalledTimes(1);
    expect(actual).toBeCalledWith('mocked', { _: 'testing' });
  });

  it('should not fail fast and still call other listeners on exception', async () => {
    const module = await setup();

    await module.get(EventBus).emitAsync('throw', { _: 'error' });

    const actual = module.get(MockOn).calls;
    expect(actual).toBeCalledTimes(1);
    expect(actual).toBeCalledWith('delayed', { _: 'error' });
  });

  it('should re-throw when on error and configured', async () => {
    const module = await setup();

    const actual = module.get(EventBus).emitAsync('rethrow', { _: 'error' });
    await expect(actual).rejects.toThrow('rethrow');
  });

  it('should work with evementemitter2 options (wildcard)', async () => {
    const module = await setup({
      wildcard: true,
      delimiter: '.'
    });

    await module.get(EventBus).emitAsync('test.one', { _: '1' });
    await module.get(EventBus).emitAsync('test.two', { _: '2' });

    const actual = module.get(MockOn).calls;
    expect(actual).toBeCalledTimes(2);
    expect(actual).toBeCalledWith('test.*', { _: '1' });
    expect(actual).toBeCalledWith('test.*', { _: '2' });
  });
});
