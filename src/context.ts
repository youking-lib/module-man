import { ModuleCtor, Injectable } from './module'
import { ModuleProvider, ModuleProviderValue } from './provider'
import { ModuleContext, ModuleContextOptions } from './module-context'

let currentModuleContext: ModuleContext | undefined

export const runInContext = <T>(f: () => T, ctx = new ModuleContext()) => {
  const prevModuleContext = currentModuleContext
  try {
    currentModuleContext = ctx
    const module = f()
    if (module && typeof module !== 'object') {
      throw new Error(`Expected function return object, but got ${module}`)
    }
    currentModuleContext.injectModules([module as unknown as object])
    Context.set(module as unknown as object, currentModuleContext)
    return module
  } finally {
    currentModuleContext = prevModuleContext
  }
}

class ModuleContextManager {
  contexts = new WeakMap<object, ModuleContext>()

  set(object: object, ctx: ModuleContext) {
    this.contexts.set(object, ctx)
  }

  from(object: object): ModuleContext {
    if (this.contexts.has(object)) {
      return this.contexts.get(object)!
    }

    const context = currentModuleContext ?? new ModuleContext()

    this.set(object, context)
    context.injectModules([object])

    return context
  }

  /**
   * get dep by Dep key
   * @param Dep
   */
  use<T>(Dep: ModuleCtor<T>): T
  use<T>(Dep: ModuleProvider<T>): T
  use<T>(Dep: Injectable<T>): T {
    if (!currentModuleContext) {
      throw new Error(`Expected use(...) call with runInContext(f)`)
    }
    return currentModuleContext.use(Dep as any)
  }

  /**
   * inject provider-value
   * @param providerValue
   */
  inject<T>(providerValue: ModuleProviderValue<T>): T {
    if (!currentModuleContext) {
      throw new Error(`Expected inject(...) call with runInContext(f)`)
    }
    return currentModuleContext.inject(providerValue)
  }

  /**
   * create a new context for Dep
   * @param Ctor
   * @param options options for reusing deps or others
   */
  new<T>(Ctor: ModuleCtor<T>, options?: ModuleContextOptions): T {
    if (!currentModuleContext) {
      throw new Error(`Expected new(...) call with runInContext(f)`)
    }
    return currentModuleContext.new(Ctor, options)
  }
}

export const Context = new ModuleContextManager()
