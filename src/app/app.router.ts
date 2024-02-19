import { Route } from '@common/types.common'

export const Router: Route[] = [
    { name: 'Eye', path: 'eye', module: async () => await import('@app/eye/eye.controller') },
    { name: 'Room', path: 'room', module: async () => await import('@app/room/room.controller') },
    { name: 'CatRoom', path: 'room', module: async () => await import('@app/room/room.controller'), config: { load: 'room1/scene.gltf' } },
    { name: 'Gallery', path: 'room', module: async () => await import('@app/room/room.controller'), config: { load: 'gallery/source/Scene 01.glb' } },
    // { name: 'DEMO', path: 'room', module: async () => await import('@app/room/room.controller'), config: { load: 'demo/scene.glb' } },
    { name: 'DEMO', path: 'room', module: async () => await import('@app/room/testroom.controller'), config: { load: 'demo/scene.glb' } }
]

export const StartRoute = () => Router.find(({ name }) => name == import.meta.env.VITE_START_POINT)
