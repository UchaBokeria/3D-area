import * as THREE from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min'
import Stats from 'three/examples/jsm/libs/stats.module'

import { simulate } from '@shared/simulate'
import { Capsule, Octree, OctreeHelper } from 'three/examples/jsm/Addons'

export class room extends simulate {
    keyStates: {}
    GRAVITY: number
    mouseTime: number

    spheres: any[]
    sphereIdx: number
    NUM_SPHERES: number
    SPHERE_RADIUS: number
    STEPS_PER_FRAME: number
    sphereGeometry: THREE.IcosahedronGeometry
    sphereMaterial: THREE.MeshLambertMaterial

    playerCollider: Capsule
    playerVelocity: THREE.Vector3
    playerDirection: THREE.Vector3
    playerOnFloor: boolean

    vector1: THREE.Vector3
    vector2: THREE.Vector3
    vector3: THREE.Vector3

    gui: GUI
    stats: Stats
    worldOctree: Octree
    opts: any

    constructor(opts: any) {
        super({ render: { antialias: true } })

        this.init()
        this.lights()
        this.mapping()
        this.listeners()

        //collision/collision-world.glb
        this.loader.load(
            opts?.load || 'room/scene.gltf',
            (gltf: any) => {
                this.scene.add(gltf.scene)
                this.worldOctree.fromGraphNode(gltf.scene)
                console.log('has loaded')

                gltf.scene.traverse(
                    (child: { isMesh: any; castShadow: boolean; receiveShadow: boolean; material: { map: { anisotropy: number } } }) => {
                        if (!child.isMesh) return
                        child.castShadow = true
                        child.receiveShadow = true
                        if (child.material.map) child.material.map.anisotropy = 4
                    }
                )

                this.helpers()
            },
            (e: any) => {
                console.log(e)
            }
        )

        this.loop = () => {
            this.stats && this.stats.update()
            const deltaTime = Math.min(0.05, this.clock.getDelta()) / this.STEPS_PER_FRAME

            for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
                this.controls(deltaTime)
                this.updatePlayer(deltaTime)
                this.updateSpheres(deltaTime)
                this.teleportPlayerIfOob()
            }
        }
    }

    init() {
        this.camera.rotation.order = 'YXZ'

        this.GRAVITY = 30
        this.spheres = []
        this.sphereIdx = 0
        this.NUM_SPHERES = 100
        this.SPHERE_RADIUS = 0.2
        this.STEPS_PER_FRAME = 5
        this.sphereGeometry = new THREE.IcosahedronGeometry(this.SPHERE_RADIUS, 5)
        this.sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d })

        this.mouseTime = 0
        this.keyStates = {}
        this.worldOctree = new Octree()

        this.playerOnFloor = false
        this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35)
        this.playerVelocity = new THREE.Vector3()
        this.playerDirection = new THREE.Vector3()

        this.vector1 = new THREE.Vector3()
        this.vector2 = new THREE.Vector3()
        this.vector3 = new THREE.Vector3()

        for (let i = 0; i < this.NUM_SPHERES; i++) {
            const sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial)
            sphere.castShadow = true
            sphere.receiveShadow = true

            this.scene.add(sphere)

            this.spheres.push({
                mesh: sphere,
                collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), this.SPHERE_RADIUS),
                velocity: new THREE.Vector3()
            })
        }
    }

    listeners() {
        this.listen('keyup', (event: { code: string | number }) => (this.keyStates[event.code] = false))
        this.listen('keydown', (event: { code: string | number }) => (this.keyStates[event.code] = true))
        this.listen('mouseup', () => document.pointerLockElement !== null && this.throwBall())

        this.container.addEventListener('mousedown', () => {
            document.body.requestPointerLock()
            this.mouseTime = performance.now()
        })

        document.body.addEventListener('mousemove', event => {
            if (document.pointerLockElement === document.body) {
                this.camera.rotation.y -= event.movementX / 500
                this.camera.rotation.x -= event.movementY / 500
            }
        })
    }

    teleportPlayerIfOob() {
        if (this.camera.position.y > -25) return
        this.playerCollider.start.set(0, 0.35, 0)
        this.playerCollider.end.set(0, 1, 0)
        this.playerCollider.radius = 0.35
        this.camera.position.copy(this.playerCollider.end)
        this.camera.rotation.set(0, 0, 0)
    }

    throwBall() {
        const sphere = this.spheres[this.sphereIdx]
        this.camera.getWorldDirection(this.playerDirection)
        sphere.collider.center.copy(this.playerCollider.end).addScaledVector(this.playerDirection, this.playerCollider.radius * 1.5)

        const impulse = 15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001))
        sphere.velocity.copy(this.playerDirection).multiplyScalar(impulse)
        sphere.velocity.addScaledVector(this.playerVelocity, 2)
        this.sphereIdx = (this.sphereIdx + 1) % this.spheres.length
    }

    playerCollisions() {
        this.playerOnFloor = false
        const result = this.worldOctree.capsuleIntersect(this.playerCollider)
        if (!result) return

        this.playerOnFloor = result.normal.y > 0
        if (!this.playerOnFloor) this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity))
        this.playerCollider.translate(result.normal.multiplyScalar(result.depth))
    }

    updatePlayer(deltaTime: number) {
        let damping = Math.exp(-4 * deltaTime) - 1

        if (!this.playerOnFloor) {
            this.playerVelocity.y -= this.GRAVITY * deltaTime
            damping *= 0.1
        }

        this.playerVelocity.addScaledVector(this.playerVelocity, damping)

        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime)
        this.playerCollider.translate(deltaPosition)

        this.playerCollisions()
        this.camera.position.copy(this.playerCollider.end)
    }

    playerSphereCollision(sphere: { collider: { center: any; radius: number }; velocity: THREE.Vector3 }) {
        const center = this.vector1.addVectors(this.playerCollider.start, this.playerCollider.end).multiplyScalar(0.5)
        const sphere_center = sphere.collider.center

        const r = this.playerCollider.radius + sphere.collider.radius
        const r2 = r * r

        // approximation: player = 3 spheres
        for (const point of [this.playerCollider.start, this.playerCollider.end, center]) {
            const d2 = point.distanceToSquared(sphere_center)

            if (d2 < r2) {
                const normal = this.vector1.subVectors(point, sphere_center).normalize()
                const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(this.playerVelocity))
                const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity))

                this.playerVelocity.add(v2).sub(v1)
                sphere.velocity.add(v1).sub(v2)

                const d = (r - Math.sqrt(d2)) / 2
                sphere_center.addScaledVector(normal, -d)
            }
        }
    }

    spheresCollisions() {
        for (let i = 0, length = this.spheres.length; i < length; i++) {
            const s1 = this.spheres[i]

            for (let j = i + 1; j < length; j++) {
                const s2 = this.spheres[j]

                const d2 = s1.collider.center.distanceToSquared(s2.collider.center)
                const r = s1.collider.radius + s2.collider.radius
                const r2 = r * r

                if (d2 < r2) {
                    const normal = this.vector1.subVectors(s1.collider.center, s2.collider.center).normalize()
                    const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity))
                    const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity))

                    s1.velocity.add(v2).sub(v1)
                    s2.velocity.add(v1).sub(v2)

                    const d = (r - Math.sqrt(d2)) / 2

                    s1.collider.center.addScaledVector(normal, d)
                    s2.collider.center.addScaledVector(normal, -d)
                }
            }
        }
    }

    updateSpheres(deltaTime: number) {
        this.spheres.forEach(sphere => {
            sphere.collider.center.addScaledVector(sphere.velocity, deltaTime)
            const result = this.worldOctree.sphereIntersect(sphere.collider)

            if (result) {
                sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5)
                sphere.collider.center.add(result.normal.multiplyScalar(result.depth))
            } else sphere.velocity.y -= this.GRAVITY * deltaTime

            const damping = Math.exp(-1.5 * deltaTime) - 1
            sphere.velocity.addScaledVector(sphere.velocity, damping)
            this.playerSphereCollision(sphere)
        })

        this.spheresCollisions()
        for (const sphere of this.spheres) sphere.mesh.position.copy(sphere.collider.center)
    }

    getForwardVector() {
        this.camera.getWorldDirection(this.playerDirection)
        this.playerDirection.y = 0
        this.playerDirection.normalize()
        return this.playerDirection
    }

    getSideVector() {
        this.camera.getWorldDirection(this.playerDirection)
        this.playerDirection.y = 0
        this.playerDirection.normalize()
        this.playerDirection.cross(this.camera.up)
        return this.playerDirection
    }

    controls(deltaTime: number) {
        const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8)
        this.keyStates['KeyW'] && this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta))
        this.keyStates['KeyS'] && this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speedDelta))
        this.keyStates['KeyA'] && this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta))
        this.keyStates['KeyD'] && this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta))
        this.playerOnFloor && this.keyStates['Space'] && (this.playerVelocity.y = 15)
    }

    lights = () => {
        const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5)
        fillLight1.position.set(2, 1, 1)
        this.scene.add(fillLight1)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
        directionalLight.position.set(-5, 25, -1)
        directionalLight.castShadow = true
        directionalLight.shadow.camera.near = 0.01
        directionalLight.shadow.camera.far = 500
        directionalLight.shadow.camera.right = 30
        directionalLight.shadow.camera.left = -30
        directionalLight.shadow.camera.top = 30
        directionalLight.shadow.camera.bottom = -30
        directionalLight.shadow.mapSize.width = 1024
        directionalLight.shadow.mapSize.height = 1024
        directionalLight.shadow.radius = 4
        directionalLight.shadow.bias = -0.00006
        this.scene.add(directionalLight)
    }

    mapping() {
        this.render.setPixelRatio(window.devicePixelRatio)
        this.render.shadowMap.enabled = true
        this.render.shadowMap.type = THREE.VSMShadowMap
        this.render.toneMapping = THREE.ACESFilmicToneMapping
        this.container.appendChild(this.render.domElement)
    }

    helpers() {
        const helper = new OctreeHelper(this.worldOctree)
        helper.visible = false
        this.scene.add(helper)

        const gui = new GUI({ width: 200 })
        gui.add({ debug: false }, 'debug').onChange(value => (helper.visible = value))

        this.stats = new Stats()
        this.stats.dom.style.position = 'absolute'
        this.stats.dom.style.top = '0px'
        this.stats.dom.style.right = '200px !imortant'
        this.container.appendChild(this.stats.dom)
    }
}
