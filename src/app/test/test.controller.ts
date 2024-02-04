import * as THREE from 'three'
import { simulate } from '@shared/simulate'
import { FirstPersonControls, GLTF } from 'three/examples/jsm/Addons'

export class test extends simulate {
    controls: FirstPersonControls
    constructor() {
        super()

        // positioning and lights
        // this.camera.position.z = 10

        this.controls = new FirstPersonControls(this.camera, this.render.domElement)
        this.controls.movementSpeed = 1
        this.controls.lookSpeed = 0.1
        // this.controls.activeLook = false
        // this.controls.autoForward = true
        // this.controls.constrainVertical = true
        this.controls.lookSpeed = 0.08
        this.controls.movementSpeed = 0.8
        // this.controls.object
        // this.controls.dispose()

        const AmbientLight = new THREE.AmbientLight(0x333333, 5)
        this.scene.add(AmbientLight)

        const topLight = new THREE.DirectionalLight(0xffffff, 1)
        topLight.position.set(500, 500, 500)
        topLight.castShadow = true
        this.scene.add(topLight)

        // load model
        this.loader.load(`./src/assets/models/collision/collision.gltf`, (gltf: GLTF) => {
            this.objects.room = gltf.scene
            this.scene.add(this.objects.room)
        })

        // rotating eye
        this.loop = () => {
            // if (!this.objects?.eye) return

            this.controls.update(this.clock.getDelta())
            // this.objects.eye.rotation.y = -3 + (this.mouseX / window.innerWidth) * 3
            // this.objects.eye.rotation.x = -1.2 + (this.mouseY * 2.5) / window.innerHeight
        }

        this.resize = () => this.controls.handleResize
    }
}
