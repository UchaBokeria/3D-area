import { Route } from '@common/types.common'

export const Router: Route[] = [
    { name: 'Eye', module: async () => await import('@app/eye/eye.controller') },
    { name: 'Room', module: async () => await import('@app/room/room.controller') }
]

export const StartRoute = () => Router.find(({ name }) => name == import.meta.env.VITE_START_POINT)
