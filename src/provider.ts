export type ModuleProviderValue<T = any> = {
  Provider: ModuleProvider<T>
  value: T
}

/**
 * ModuleProvider for inject interface/data
 */
export type ModuleProvider<T = any> = {
  isModuleProvider: true
  defaultValue?: T
  provide(value: T): ModuleProviderValue<T>
}

export function createProvider<T>(defaultValue?: T): ModuleProvider<T> {
  const Provider: ModuleProvider<T> = {
    isModuleProvider: true,
    defaultValue,
    provide(value) {
      return {
        Provider,
        value,
      }
    },
  }
  return Provider
}

export const isModuleProviderValue = <T = any>(input: any): input is ModuleProviderValue<T> => {
  return !!(input && 'Provider' in input && 'value' in input)
}
