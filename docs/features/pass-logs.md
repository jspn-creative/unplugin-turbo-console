# Pass Logs

The feature allows you to pass logs between server and client.

## TypeSciprt Configuration

Add the following configurations to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "unplugin-turbo-console/client"
    ]
  }
}
```

## Initialization

Add `~console` to your project entry file.

Here are examples in some frameworks:

::: code-group

```vue [Nuxt]
<!-- app.vue -->
<script setup lang="ts">
import '~console'
</script>
```

```svelte [SvelteKit]
<!-- +page.svelte -->
<script lang="ts">
import '~console'
</script>
```

```tsx{3} [SolidStart]
// entry-client.tsx
import { StartClient, mount } from '@solidjs/start/client'
import '~console'

mount(() => <StartClient />, document.getElementById('app')!)
```

:::

::: details What is `~console`?

Pass logs feature is based on `WebSocket` implementation. `~console` is a virtual module, it will establish a websocket connection between client and server.

More details can be found in [source code](https://github.com/unplugin/unplugin-turbo-console/blob/main/src/core/virtualModules.ts).

:::

## Server → Client

On the server side, replace `console` with `Client`.

Here's an example in `Nuxt`:

```ts{2,9-11} twoslash
// server/api/test.ts
import { Client } from 'unplugin-turbo-console/helper'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const raw = await fetch('https://jsonplaceholder.typicode.com/users')
  const data = await raw.json()

  Client.log({ data })
  Client.warn('A warning message from server!!')
  Client.error('An error message from server!!')

  return {
    data
  }
})
```

![server-client](/features/server-client.gif)

## Client → Server

On the client side, replace `console` with `Server`.

For example:

```vue{2,9} twoslash
<script setup lang="ts">
import { Server } from 'unplugin-turbo-console/helper'
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
  Server.log(count.value)
}
</script>

<template>
  <div>
    {{ count }}
  </div>
  <button @click="increment">
    +
  </button>
</template>
```

![server-client](/features/client-server.gif)

::: tip For Nuxt User
If you are using Nuxt, `Client` and `Server` is auto-imported. So you don't need to import them manually.
:::

<!-- ## 深入：它是如何工作的

服务端与客户端之间的通信是通过 `WebSocket` 实现的，在项目启动时，插件会启动一个WebSocket服务。

在第一步中引入的 `~console` 是一个虚拟模块，它是一个[IIFE](https://developer.mozilla.org/zh-CN/docs/Glossary/IIFE)，作用就是让客户端与服务端的`WebSocket`服务建立连接。[源代码](https://github.com/unplugin/unplugin-turbo-console/blob/main/src/core/virtualModules.ts) -->