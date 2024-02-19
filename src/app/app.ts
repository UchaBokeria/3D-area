import { Router, StartRoute } from './app.router'
import { Route } from '@common/types.common'
import { ProjectVersion } from '@common/constants.common'

export class App {
    routes: Route[]
    current: Route
    container: HTMLDivElement

    constructor() {
        this.routes = Router
        this.current = StartRoute()
        this.container = document.querySelector<HTMLDivElement>('#app')
        this.navigation()
        this.versionize(ProjectVersion)
        this.call(this.current)
    }

    async call(route: Route) {
        this.current = route
        this.container.querySelector('canvas')?.remove()
        new (await this.current.module())[route.path.toLowerCase()](route?.config)
    }

    navigation(nav = document.createElement('menu')) {
        this.routes.forEach(route => {
            const el = document.createElement('b')
            import.meta.env.VITE_START_POINT == route.name && el.classList.add('active')

            el.addEventListener('click', () => {
                document.querySelectorAll('menu b').forEach(e => {
                    e.classList.remove('active')
                    e.innerHTML == route.name && el.classList.add('active')
                })
                this.call(route)
            })

            el.innerHTML = route.name
            nav.appendChild(el)
        })
        this.container.appendChild(nav)
    }

    versionize(version = ProjectVersion, el = document.createElement('div')) {
        el.innerHTML = `V${version}`
        el.classList.add('versionizing')
        this.container.appendChild(el)
    }
}
