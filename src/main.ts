import { createApp } from 'vue'
import App from './App.vue'
import mitt from 'mitt'
import './assets/less/index.less'
import { startMock } from '@/mock'
import router from './router'
import mixin from './utils/mixin'
import VueLazyload from '@jambonn/vue-lazyload'
import { createPinia } from 'pinia'
import { useClick } from '@/utils/hooks/useClick'

window.isMoved = false
HTMLElement.prototype.addEventListener = new Proxy(HTMLElement.prototype.addEventListener, {
  apply(target, ctx, args) {
    const eventName = args[0]
    const listener = args[1]
    if (listener instanceof Function && eventName === 'click') {
      args[1] = new Proxy(listener, {
        apply(target1, ctx1, args1) {
          // console.log('e', args1)
          // console.log('click点击', window.isMoved)
          if (window.isMoved) return
          try {
            return target1.apply(ctx1, args1)
          } catch (e) {
            console.error(`[proxyPlayerEvent][${eventName}]`, listener, e)
          }
        }
      })
    }
    return target.apply(ctx, args)
  }
})

const vClick = useClick()
const pinia = createPinia()
const emitter = mitt()
const app = createApp(App)
app.config.globalProperties.emitter = emitter
app.provide('mitt', emitter)
app.mixin(mixin)
const loadImage = new URL('./assets/img/icon/img-loading.png', import.meta.url).href
app.use(VueLazyload, {
  preLoad: 1.3,
  loading: loadImage,
  attempt: 1
})
app.use(pinia)
app.use(router)
app.mount('#app')
app.directive('click', vClick)

//放到最后才可以使用pinia
startMock()
