import * as THREE from 'three'
import { simulate } from '@shared/simulate'
import { FirstPersonControls, GLTF } from 'three/examples/jsm/Addons'

export class room extends simulate {
    controls
    constructor() {
        super()

        // positioning and lights
        // this.camera.position.z = 10

        this.controls = new FirstPersonControls(this.camera, this.render.domElement)
        this.controls.movementSpeed = 150
        this.controls.lookSpeed = 0.1

        const AmbientLight = new THREE.AmbientLight(0x333333, 5)
        this.scene.add(AmbientLight)

        const topLight = new THREE.DirectionalLight(0xffffff, 1)
        topLight.position.set(500, 500, 500)
        topLight.castShadow = true
        this.scene.add(topLight)

        // load model
        this.loader.load(`./src/assets/models/room/scene.gltf`, (gltf: GLTF) => {
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
    }
}
