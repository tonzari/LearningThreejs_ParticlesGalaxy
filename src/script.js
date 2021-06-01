import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 5
parameters.randomness = 0.2
parameters.randomnessPower = 0.2
parameters.insideColor = "#FF0000"
parameters.outsideColor = "#00FF00"

// declared outside of galaxy generation so we can test for them 
// at the beginning of genGal method
let geometery = null
let material = null
let points = null

const generateGalaxy = () => {

    // test for galaxy existense first 
    // so we can destroy the old galaxy before creating a new one

    if (points !== null) {
        console.log("points are null")
        geometery.dispose()
        material.dispose()
        scene.remove(points)
    }


    geometery = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)

    for (let particleIndex = 0; particleIndex < parameters.count; particleIndex++) {
        
        const nthParticle = particleIndex * 3

        const rad = Math.random() * parameters.radius
        const spinAngle = rad * parameters.spin
        const branchAngle = (particleIndex % parameters.branches) / parameters.branches * Math.PI * 2 // cycle per branch amount, divides to make a percentage
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * rad
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * rad
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * rad


        positions[nthParticle] = Math.cos(branchAngle + spinAngle) * rad + randomX
        positions[nthParticle + 1] = randomY
        positions[nthParticle + 2] = Math.sin(branchAngle + spinAngle) * rad + randomZ
        
    }

    geometery.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // material 

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    // points 

    points = new THREE.Points(geometery, material)
    scene.add(points)
}
generateGalaxy()

gui.add(parameters, 'count').min(100).max(1000000).step(500).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(1).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters,'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()