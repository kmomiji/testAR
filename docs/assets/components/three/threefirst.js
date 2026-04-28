import * as THREE from 'three'

function main() {
    // キャンバス・レンダラーの指定
    const canvas = document.querySelector('#cv')
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    const fov = 80
    const aspect = 2
    const near = 0.1
    const far = 100
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 2

    const scene = new THREE.Scene()

    {
        const color = 0xFFFFFF
        const intensity = 3
        const light = new THREE.DirectionalLight(color, intensity)
        light.position.set(-1, 2, 4)
        scene.add(light)
    }

    const boxWidth = 1
    const boxHeight = 1
    const boxDepth = 1
    const boxGeom = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

    const material = new THREE.MeshBasicMaterial({color: 0x44aa88})
    const cube = new THREE.Mesh(boxGeom, material)

    scene.add(cube)

    // cubeのアニメーション
    function render(time){
        time *= 0.001

        cube.rotation.x = time
        cube.rotation.y = time
        renderer.render(scene, camera)

        requestAnimationFrame(render)
        
    }

    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

main()
