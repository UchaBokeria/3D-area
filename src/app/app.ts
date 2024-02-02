export class App {
    route = 'room'
    current: any

    constructor() {
        document.querySelectorAll('[route]').forEach((el: any) => {
            el.addEventListener('click', () => {
                const container: any = document.querySelector('#container3D')
                container.innerHTML = ''
                this.build(el.getAttribute('route'))
            })
        })
        ;(async () => await this.build(this.route))()
    }

    async build(route: string) {
        this.route = route
        let DynamicClass

        try {
            const module = await import(
                `./${this.route.toLowerCase()}/${this.route.toLowerCase()}.controller.ts`
            )
            DynamicClass = module[this.route]
        } catch (error: any) {
            throw new Error(
                `Error importing class module for ${this.route}: ${error?.message}`
            )
        }

        if (DynamicClass && typeof DynamicClass === 'function')
            this.current = new DynamicClass()
        else throw new Error(`Class ${this.route} not found`)
    }
}
