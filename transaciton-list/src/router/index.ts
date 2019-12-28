import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import UnapplovalTransactionList from '../views/unapploval_transaction/unapploval_transaction_list.vue';
import TransactionList from '../views/transaction/transaction_list.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/transaction',
    name: 'transaction',
    component: TransactionList
  },
  {
    path: '/unapplovalTransaction',
    name: 'unapplovalTransaction',
    component: UnapplovalTransactionList
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
