import { ModuleCtor, Injectable } from './module'
import { ModuleProvider, ModuleProviderValue } from './provider'
import { runInContext } from './context'

export type ModuleContextOptions = {
  modules?: object[]
  providers?: ModuleProviderValue[]
}

export const isModuleProvider = <T>(input: any): input is ModuleProvider<T> => {
  return !!input?.isModuleProvider
}

export class ModuleContext {
  deps = {
    modules: new Map<ModuleCtor, unknown>(),
    providers: new Map<ModuleProvider, unknown>(),
  }

  /**
   * add ModuleCtor instance
   * @param Dep
   * @param module
   * @param replace replace current value or throw error
   */
  addModule<T>(Ctor: ModuleCtor<T>, module: T, replace = false): this {
    if (this.deps.modules.has(Ctor)) {
      const current = this.deps.modules.get(Ctor)! as T

      if (replace) {
        this.deps.modules.set(Ctor, module)
      } else if (module !== current) {
        throw new Error(`Unexpected duplicate ModuleConstructor: ${Ctor}`)
      }

      return this
    }
    this.deps.modules.set(Ctor, module)
    return this
  }

  /**
   * add Provider value
   * @param Provider
   * @param value
   * @param replace replace current value or throw error
   */
  addProvider<T>(Provider: ModuleProvider<T>, value: T, replace = false): this {
    if (this.deps.providers.has(Provider)) {
      const current = this.deps.providers.get(Provider)! as T

      if (replace) {
        this.deps.providers.set(Provider, value)
      } else if (value !== current) {
        throw new Error(`Unexpected duplicate Provider`)
      }

      return this
    }
    this.deps.providers.set(Provider, value)
    return this
  }

  /**
   * get ModuleCtor instance
   * @param ModuleCtor
   */
  useModule<T>(Ctor: ModuleCtor<T>): T {
    if (this.deps.modules.has(Ctor)) {
      return this.deps.modules.get(Ctor)! as T
    }

    if (Ctor.length > 0) {
      throw new Error(`The ModuleConstructor was not found in context: ${Ctor}`)
    }

    return newModule(Ctor, this)
  }

  /**
   * get Provider value
   * @param Provider
   */
  useProvider<T>(Provider: ModuleProvider<T>): T {
    if (this.deps.providers.has(Provider)) {
      return this.deps.providers.get(Provider)! as T
    }

    if (Provider.defaultValue !== undefined) {
      return Provider.defaultValue
    }

    throw new Error(`The Provider is used without injecting or no defaultValue found`)
  }

  /**
   * get dep by Dep key
   * @param Dep
   */
  use<T>(Dep: ModuleCtor<T>): T
  use<T>(Dep: ModuleProvider<T>): T
  use<T>(Dep: Injectable<T>): T {
    if (isModuleProvider(Dep)) {
      return this.useProvider(Dep)
    }
    return this.useModule(Dep)
  }

  /**
   * inject provider-value
   * @param providerValue
   */
  inject<T>(providerValue: ModuleProviderValue<T>): T {
    const { Provider, value } = providerValue
    this.addProvider(Provider, value)
    return value
  }

  /**
   * inject modules to module-context
   * @param modules
   */
  injectModules(modules: object[]) {
    for (const module of modules) {
      if (module.constructor === Object || module.constructor === Array || module.constructor === Function) {
        throw new Error(`Expected module to be an instance of custom Class, instead of ${JSON.stringify(module)}`)
      }
      this.addModule(module.constructor as ModuleCtor, module, true)
    }
    return this
  }

  /**
   * inject provider-values to module-context
   * @param providers
   */
  injectProviderValues(providers: ModuleProviderValue[]) {
    for (const { Provider, value } of providers) {
      this.addProvider(Provider, value, true)
    }
    return this
  }

  /**
   * create a new context for Dep
   * @param Ctor
   * @param options options for reusing deps or others
   */
  new<T>(Ctor: ModuleCtor<T>, options?: ModuleContextOptions): T {
    const ctx = new ModuleContext()

    // reusing provider-values of current-context
    for (const [Provider, value] of this.deps.providers.entries()) {
      ctx.addProvider(Provider, value)
    }

    // inject modules
    if (options?.modules) {
      ctx.injectModules(options.modules)
    }

    // inject provider-values
    if (options?.providers) {
      ctx.injectProviderValues(options.providers)
    }

    return newModule(Ctor, ctx)
  }
}

export const newModule = <T>(Ctor: ModuleCtor<T>, ctx = new ModuleContext()) => {
  if (Ctor.length > 0) {
    throw new Error(`Expected ModuleConstructor without parameters, but got ${Ctor}`)
  }
  return runInContext(() => new Ctor(), ctx)
}
