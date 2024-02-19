export interface Route {
    name: string
    path?: any | undefined
    module: () => Promise<any>
    config?: any | undefined
}
