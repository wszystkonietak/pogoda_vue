import { createApp } from 'vue'

import App from './App.vue'
import FoodItem from './components/comp.vue'
import Sample from './components/text.vue'

const app = createApp(App)
app.component('food-item', FoodItem)
app.component('sample', Sample)
app.mount('#app')