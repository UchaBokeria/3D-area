import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class simulate {
    conf: any | null
    loop: null | Function
    axesHelper: null | THREE.AxesHelper
    container: null | HTMLDivElement
    scene: null | THREE.Scene
    loader: null | THREE.Loader
    camera: null | THREE.PerspectiveCamera
    render: null | THREE.WebGLRenderer
    mouseX: null | any
    mouseY: null | any
    objects: null | [] | any
    resize: null | any
    clock: THREE.Clock

    constructor(_conf = null) {
        this.container = document.createElement('div')
        this.container.id = 'VrAreaContainer'
        document.querySelector<HTMLDivElement>('#app').appendChild(this.container)

        this.conf = {
            loop: null,
            axesHelper: false,
            container: this.container,
            scene: new THREE.Scene(),
            loader: new GLTFLoader(),
            camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
            render: { alpha: true },
            presets: null,
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2,
            objects: null,
            resize: null,
            clock: new THREE.Clock()
        }

        if (_conf) this.conf = { ...this.conf, ..._conf }

        this.loop = this.conf?.loop
        this.axesHelper = this.conf?.axesHelper
        this.container = this.conf?.container
        this.scene = this.conf?.scene
        this.loader = this.conf?.loader
        this.camera = this.conf?.camera
        this.render = new THREE.WebGLRenderer(this.conf?.render)
        this.mouseX = null
        this.mouseY = null
        this.resize = null
        this.objects = {}
        this.clock = new THREE.Clock()

        // set loader pre path
        this.loader.setPath('./src/assets/models/')

        // mouse state update
        document.onmousemove = e => {
            this.mouseX = e.clientX
            this.mouseY = e.clientY
        }

        // responsive on resize
        this.listen('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.render.setSize(window.innerWidth, window.innerHeight)
            this.resize && this.resize()
        })

        // render to dom
        this.render.setPixelRatio(window.devicePixelRatio)
        this.render.setSize(window.innerWidth, window.innerHeight)
        this.conf?.presets && this.conf?.presets(this)
        this.container.appendChild(this.render.domElement)

        // loop frames
        this.animate()
    }

    animate: any = () => {
        requestAnimationFrame(this.animate)
        if (this.loop) this.loop(this)

        if (this.axesHelper) {
            this.axesHelper = new THREE.AxesHelper(5)
            this.scene.add(this.axesHelper)
        }

        this.render.render(this.scene, this.camera)
    }

    listen: any = (event: keyof WindowEventMap, cb: any) => window.addEventListener(event, cb)
}
