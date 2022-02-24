import React from 'react'
import { ModuleProvider, ModuleProviderValue } from './provider'
import { Context } from './context'
import { ModuleContextOptions, ModuleContext } from './module-context'

/**
 * ModuleContext for manager dependencies
 */
export type ModuleCtor<T = any> = new (...args: any[]) => T
export type Injectable<T = any> = ModuleCtor<T> | ModuleProvider<T>
export type MutableContainerState<T extends Container> = Omit<T, 'state'> & {
  state: T['state']
}

/**
 * Container and Module
 */
export class Container<S = {}> {
  static createContext<T extends Container>() {
    return React.createContext<T | null>(null)
  }

  static from<T extends ModuleCtor>(Ctor: T) {
    return class InjectableClass extends Ctor {
      constructor(...args: any[]) {
        super(...args)
        /**
         * add instance to current-context with Constructor as key
         */
        Context.from(this).addModule(this.constructor as ModuleCtor, this)
      }

      /**
       * get dep by Dep key
       * @param Dep
       */
      use<T>(Dep: ModuleCtor<T>): T
      use<T>(Dep: ModuleProvider<T>): T
      use<T>(Dep: Injectable<T>): T {
        return Context.from(this).use(Dep as any)
      }

      /**
       * inject provider-value
       * @param providerValue
       */
      inject<T>(providerValue: ModuleProviderValue<T>): T {
        return Context.from(this).inject(providerValue)
      }

      /**
       * create a new context for Dep
       * @param Ctor
       * @param options options for reusing deps or others
       */
      new<T>(Ctor: ModuleCtor<T>, options?: ModuleContextOptions): T {
        return Context.from(this).new(Ctor, options)
      }
    }
  }

  declare state: Readonly<S>
  private declare _listeners: (() => void)[]

  constructor() {
    this._listeners = []

    /**
     * add instance to current-context with Constructor as key
     */
    Context.from(this).addModule(this.constructor as ModuleCtor, this)
  }

  /**
   * mutate module state
   * @param state module state
   */
  setState<K extends keyof S>(state: ((prevState: Readonly<S>) => Pick<S, K> | S) | (Pick<S, K> | S)) {
    const self: MutableContainerState<typeof this> = this

    if (isFunction(state)) {
      Object.assign(self.state, state(self.state))
    } else {
      Object.assign(self.state, state)
    }

    const listeners = this._listeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
  }

  /**
   * Adds a change listener
   * @param listener listener A callback to be invoked on every dispatch.
   * @returns A function to remove this change listener.
   */
  subscribe(listener: () => void) {
    if (typeof listener !== 'function') {
      throw new Error(`Expected the listener to be a function. Instead, received: '${typeof listener}'`)
    }

    const nextListeners = this._listeners

    nextListeners.push(listener)

    return function unsubscribe() {
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * get dep by Dep key
   * @param Dep
   */
  use<T>(Dep: ModuleCtor<T>): T
  use<T>(Dep: ModuleProvider<T>): T
  use<T>(Dep: Injectable<T>): T {
    return Context.from(this).use(Dep as any)
  }

  /**
   * inject provider-value
   * @param providerValue
   */
  inject<T>(providerValue: ModuleProviderValue<T>): T {
    return Context.from(this).inject(providerValue)
  }

  /**
   * create a new context for Dep
   * @param Ctor
   * @param options options for reusing deps or others
   */
  new<T>(Ctor: ModuleCtor<T>, options?: ModuleContextOptions): T {
    return Context.from(this).new(Ctor, options)
  }
}

export class Module<S = {}> extends Container<S> {}

export const initialize = <T>(Dep: ModuleCtor<T>, options?: ModuleContextOptions, ctx = new ModuleContext()) => {
  return ctx.new(Dep, options)
}

function isFunction(fn: any): fn is Function {
  return typeof fn === 'function'
}
