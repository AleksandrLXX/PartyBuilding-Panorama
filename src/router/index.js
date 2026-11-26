import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/DashboardShell.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'home', component: () => import('../view/dashboard.vue') },
        { path: 'organization', name: 'organization', component: () => import('../view/organization.vue') },
        { path: 'work', name: 'work', component: () => import('../view/work.vue') },
        { path: 'cases', name: 'cases', component: () => import('../view/ComingSoon.vue') },
        { path: 'group', name: 'group', component: () => import('../view/ComingSoon.vue') },
        { path: 'settings', name: 'settings', component: () => import('../view/settings.vue') },
      ],
    },
  ],
})

export default router
