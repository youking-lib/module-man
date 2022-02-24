# use-module

A module abstraction providing component state management, inspire by farrow-module.

# Installation

```bash
# from npm
npm install --save module-man

# from yarn
yarn add module-man

# from pnpm
pnpm install --save module-man
```

# Glossay

- `Module`:
  - Any `Class` which `extends Module`
  - it's a basic unit for writing logic code
  - it should not define custom constructor parameters
  - it should not be instantiated via the `new` keyword manually
  - everything it needed is via `this.use(DepClass)`
- `Container`
  - Any `Class` which `extends Container`
  - it's the entry of our code of `modules`
  - it should be instantiated by the `new` keyword
- `Provider`
  - it can be created via `createProvider<Type>(defaultValue)`
  - it should be attached to `Container` via `this.inject(Provider.provide(value))`
  - it should be placed only once for a `Container`, duplicated is not allow

# Usage

## 数据分离

```tsx
import { Module, useModule } from 'use-module';

type ImageInfo = {
  url: string;
  title: string;
}

class ImageModule extends Module {
  state = {
    images: [];
  }

  async fetchImages () {}
}

export function ImageComp () {
  const imageModule = useModule(ImageModule);

  const imageEls = imageModule.state.images.map(image => {
    return <img src={image.url} alt={image.title} />
  });

  useEffect(() => {
    imageModule.fetchImages();
  }, []);

  return (
    <div>{imageEls}</div>
  )
}
```

# Advance

## 模型依赖

```tsx
import { Module, Container } from 'use-module';

type UserInfo = {
  id: string;
  userName: string;
  auth: 'w';
}

type ImageInfo = {
  ownerId: string;
  url: string;
  title: string;
}

class ImageModule<{ images: ImageInfo[] }> extends Module {
  state: {
    images: []
  }

  getImagesByUserId (userId: string) {
    return this.state.images.filter(image => image.ownerId === userId);
  }

  async addImage (image: ImageInfo) {
    if (this.user.getUser(image.ownerId)?.auth !== 'w') {
			return Promise.reject(new Error('没有权限'));
    }
    this.setState(state => [...state, image]);
    // await api.addImage(image);
  }

  get user () {
    return this.use(UserModule)
  }
}

class UserModule<{ users: UserInfo[] }> extends Module {
  state: {
    users: []
  }

  getImagesByUserId (userId: string) {
    return this.image.getImagesByUserId(userId);
  }

  getUser(userId: string) {
    return this.users.find(user => user.id === userId);
  }

  get image() {
    return this.use(ImageModule)
  }
}

class RootContainer extends Container {
  user = this.user(UserModule);
  image = this.user(ImageModule);
}
```

```tsx
import { useContainer, useModule } from 'use-module'
import { RootContainer, UserModule, ImageModule } from './module'

function RootComp() {
  const rootContainer = useContainer(RootContainer)

  return <RootContainer.Provide value={rootContainer}></RootContainer.Provide>
}

function UserComp() {
  const userModule = useModule(UserModule)
  const userEls = userModule.state.users.map((item) => {
    return <div key={item.id}>{item.userName}</div>
  })

  return <>{userEls}</>
}

function ImageComp() {
  const imageModule = useModule(ImageModule)
  const imageEls = userModule.state.users.map((item) => {
    return <div key={item.id}>{item.userName}</div>
  })

  return <>{imageEls}</>
}
```

## Context

```tsx
import { Module, Container, createContext } from 'use-module';

type GlobalInfo = {
  articleId: string
  env: string
}

const GlobalContextInfo = createContext<GlobalInfo>()

class UserModule<{ users: UserInfo[] }> extends Module {
  get globalInfo() {
    return this.use(GlobalContextInfo)
  }
}

class RootContainer extends Container {
  user = this.user(UserModule);

  globalInfo = this.provide(GlobalContextInfo, {
		articleId: '123',
		env: 'production'
  });
}
```

## With Immer

```tsx
import { Module, Container } from 'use-module/immer';

class UserModule<{ users: UserInfo[] }> extends Module {
  state = {
		users: []
  }

  deleteUser (userId: string) {
		this.setState(draft => {
      draft.users = draft.users.filter(user => user.id !== userId);
    });
  }
}
```

## VallianJS

```tsx
const root = new RootContainer()

root.onStateChange((newState, oldState, patches) => {})
root.user.onStateChange((newState, oldState, patches) => {})
```
