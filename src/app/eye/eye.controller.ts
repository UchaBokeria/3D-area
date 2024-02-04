import * as THREE from 'three'
import { simulate } from '@shared/simulate'
import { GLTF } from 'three/examples/jsm/Addons'
import { FirstPersonControls } from 'three/examples/jsm/Addons'

export class eye extends simulate {
    constructor() {
        super()

        // positioning and lights
        this.camera.position.z = 500

        const AmbientLight = new THREE.AmbientLight(0x333333, 5)
        this.scene.add(AmbientLight)

        const topLight = new THREE.DirectionalLight(0xffffff, 1)
        topLight.position.set(500, 500, 500)
        topLight.castShadow = true
        this.scene.add(topLight)

        // load model
        this.loader.load(`eye/scene.gltf`, (gltf: GLTF) => {
            this.objects.eye = gltf.scene
            this.scene.add(this.objects.eye)
        })

        // rotating eye
        this.loop = () => {
            if (!this.objects?.eye) return
            this.objects.eye.rotation.y = -3 + (this.mouseX / window.innerWidth) * 3
            this.objects.eye.rotation.x = -1.2 + (this.mouseY * 2.5) / window.innerHeight
        }
    }
}
