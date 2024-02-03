export interface Route {
    name: string
    module: () => Promise<any>
}
