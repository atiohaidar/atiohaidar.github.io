/**
 * Scene Module
 * Handles Three.js scene setup, camera, renderer, and lighting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Scene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 15, 50);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.target.set(0, 2, 0);

        // Lighting
        this.setupLighting();

        // Ground
        this.createGround();

        // Grid helper
        this.createGrid();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404050, 0.5);
        this.scene.add(ambient);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        this.scene.add(mainLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x64ffda, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0x4d96ff, 0.2);
        rimLight.position.set(0, 5, -15);
        this.scene.add(rimLight);
    }

    createGround() {
        const groundGeometry = new THREE.CircleGeometry(30, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createGrid() {
        // Custom circular grid
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x64ffda,
            transparent: true,
            opacity: 0.1
        });

        // Radial lines
        const radialCount = 12;
        for (let i = 0; i < radialCount; i++) {
            const angle = (i / radialCount) * Math.PI * 2;
            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(angle) * 20, 0, Math.sin(angle) * 20)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.scene.add(line);
        }

        // Concentric circles
        const circleCount = 5;
        for (let i = 1; i <= circleCount; i++) {
            const radius = i * 4;
            const circleGeometry = new THREE.BufferGeometry();
            const segments = 64;
            const points = [];
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                ));
            }
            circleGeometry.setFromPoints(points);
            const circle = new THREE.Line(circleGeometry, gridMaterial);
            this.scene.add(circle);
        }
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    add(object) {
        this.scene.add(object);
    }

    focusOn(position, offset = new THREE.Vector3(5, 3, 5)) {
        const targetPosition = position.clone().add(offset);

        // Animate camera
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endTarget = position.clone();
        endTarget.y = Math.max(endTarget.y, 1);

        let progress = 0;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            progress = (Date.now() - startTime) / duration;
            if (progress > 1) progress = 1;

            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.controls.target.lerpVectors(startTarget, endTarget, eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}
