import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//   import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sections = document.querySelectorAll('.model-section');


sections.forEach((section, sectionIndex) => {
    let model;
    let currentRotation = 0;
    const canvas = document.createElement('canvas');
    section.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(section.clientWidth, section.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xf8f8f8, 0);

    const camera = new THREE.PerspectiveCamera(
        75,
        section.clientWidth / section.clientHeight,
        0.1,
        10000
    );

    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7.5);
    scene.add(ambient, dir);

    // Load GLB
    const loader = new GLTFLoader();
    const modelPath = section.dataset.model;

    loader.load(modelPath, (gltf) => {
        model = gltf.scene;
        scene.add(model);
        centerAndFitModel(model, camera);
    });

    // Center and fit model
    function centerAndFitModel(model, camera) {
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);

            model.position.sub(center);
            model.rotation.y = THREE.MathUtils.degToRad(section.dataset.rotate);
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const distance = (maxDim / 2) / Math.tan(fov / 2);

            camera.position.set(0, 0, distance * 1.2);
            camera.near = distance / 10;
            camera.far = distance * 10;
            camera.updateProjectionMatrix();

        //   controls.target.set(0, 0, 0);
        //   controls.maxDistance = distance * 2;
        //   controls.update();
    }

    // Animate each canvas
    function animate() {
        requestAnimationFrame(animate);
    //   controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        camera.aspect = section.clientWidth / section.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(section.clientWidth, section.clientHeight);
    });

    const sectionTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: `.model-section-${sectionIndex + 1}`,
            start: 'top top',
            end: `+=${window.innerHeight * 2}px`,
            scrub: 1,
            pin: true,
            onUpdate: ({progress}) => {
                if ( model && progress > 0.05 ){
                    const rotationProgress = (progress - 0.05) / 0.95;
                    const targetRotation = Math.PI * 3 * rotationProgress;
                    const rotationDiff = targetRotation - currentRotation;
                    if ( Math.abs(rotationDiff) > 0.001 ){
                        model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff);
                        currentRotation = targetRotation;
                    }
                }
            }
        }
    });

    const weaponNameSplit = new SplitText(`.model-section-${sectionIndex + 1} .weapon-name`, { type: 'chars,words' });
    const weaponDescSplit = new SplitText(`.model-section-${sectionIndex + 1} .weapon-desc`, { type: 'lines, words' });

    sectionTimeline
    .to(weaponNameSplit.chars, {
        y: 200,
        stagger: 0.05,
        duration: 1,
        ease: 'power2.out'
    })
    .to(`.model-section-${sectionIndex + 1} .weapon-desc`, {
        y: -80,
        opacity: 1,
        ease: 'power2.out',
        duration: 2,
    })
    .to(`.model-section-${sectionIndex + 1} .spec-list li`, {
        y: -80,
        opacity: 1,
        stagger: 1,
        ease: 'power2.out'
    })
    .to(`.model-section-${sectionIndex + 1} .bg-color`, {
        backgroundColor: section.dataset.bgcolor,
        scale: 200,
        duration: 2,
        delay: 2
    });
});
