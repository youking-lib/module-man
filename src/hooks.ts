import { useMemo, useState } from 'react'
import { Container, ModuleCtor } from './module'

export function useContainer<T extends Container>(instanceOrCtor: ModuleCtor<T> | T) {
  const [, forceUpdate] = useState({})

  return useMemo(() => {
    const container = instanceOrCtor instanceof Container ? instanceOrCtor : new instanceOrCtor()

    container.subscribe(() => {
      forceUpdate({})
    })

    return container
  }, [instanceOrCtor])
}

export const useModule = useContainer
