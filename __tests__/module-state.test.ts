import { Module, Container, createProvider, initialize, Context, runInContext } from '../src/index'

describe('Module:State', () => {
  it('can update state width setState()', () => {
    class CounterModule extends Module {
      state = {
        count: 0,
      }

      incre() {
        const count = this.state.count + 1

        this.setState({
          count,
        })
      }
    }

    const counter = new CounterModule()

    counter.incre()
    expect(counter.state.count === 1).toBe(true)
  })

  it('can process listener with subscribe() & unsubscribe()', () => {
    class CounterModule extends Module {
      state = {
        count: 0,
      }

      incre() {
        const count = this.state.count + 1

        this.setState({
          count,
        })
      }
    }
    const counter = new CounterModule()

    let count = 0
    const unsubscribe = counter.subscribe(() => {
      expect(counter.state.count === ++count).toBe(true)
    })

    counter.incre()
    counter.incre()
    unsubscribe()
    counter.incre()

    expect(counter.state.count === ++count).toBe(true)
  })
})
