import { Route } from '../common/types.common'

export class App {
    start: string
    routes: Route[]
    current: Route
    version: string
    container: HTMLDivElement

    constructor() {
        this.routes = [
            { name: 'Eye', module: async () => await import('@app/eye/eye.controller') },
            { name: 'Room', module: async () => await import('@app/room/room.controller') }
        ]

        this.start = import.meta.env.VITE_START_POINT
        this.current = this.routes.find(({ name }) => name == this.start)
        this.container = document.querySelector('#app')

        this.buildNavigation()
        this.call(this.current)
    }

    buildNavigation(nav = document.createElement('menu')) {
        this.routes.forEach(route => {
            const el = document.createElement('p')
            el.addEventListener('click', () => this.call(route))
            el.innerHTML = route.name
            nav.appendChild(el)
        })
        this.container.appendChild(nav)
    }

    async call(route: Route) {
        this.current = route
        this.container.innerHTML = ''
        new (await this.current.module())[route.name.toLowerCase()]()
    }
}
