/**
 * Street/Road Object Module
 * Creates the walkable path through the resume journey
 */

import * as THREE from 'three';

export function createStreet() {
    const group = new THREE.Group();
    group.name = 'street';

    // Main road
    const roadGeometry = new THREE.PlaneGeometry(6, 80);
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -35);
    road.receiveShadow = true;
    group.add(road);

    // Road markings (dashed center line)
    const dashMaterial = new THREE.MeshStandardMaterial({
        color: 0x64ffda,
        emissive: 0x64ffda,
        emissiveIntensity: 0.3
    });

    for (let z = 5; z > -75; z -= 4) {
        const dashGeometry = new THREE.PlaneGeometry(0.15, 2);
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.02, z);
        group.add(dash);
    }

    // Side path lights (left and right)
    const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0x64ffda,
        emissive: 0x64ffda,
        emissiveIntensity: 0.5
    });

    for (let z = 0; z > -70; z -= 10) {
        // Left side lamp
        const lampPost = createLampPost();
        lampPost.position.set(-4, 0, z);
        group.add(lampPost);

        // Right side lamp
        const lampPost2 = createLampPost();
        lampPost2.position.set(4, 0, z);
        lampPost2.scale.x = -1;
        group.add(lampPost2);
    }

    // Sidewalks
    const sidewalkGeometry = new THREE.PlaneGeometry(2, 80);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.85
    });

    const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    leftSidewalk.rotation.x = -Math.PI / 2;
    leftSidewalk.position.set(-4.5, 0.005, -35);
    leftSidewalk.receiveShadow = true;
    group.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    rightSidewalk.rotation.x = -Math.PI / 2;
    rightSidewalk.position.set(4.5, 0.005, -35);
    rightSidewalk.receiveShadow = true;
    group.add(rightSidewalk);

    return group;
}

function createLampPost() {
    const group = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.08, 3, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.5;
    group.add(pole);

    // Light fixture
    const fixtureGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0x64ffda,
        emissive: 0x64ffda,
        emissiveIntensity: 0.6
    });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    fixture.position.set(0.3, 3, 0);
    group.add(fixture);

    // Arm
    const armGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.05);
    const arm = new THREE.Mesh(armGeometry, poleMaterial);
    arm.position.set(0.15, 2.9, 0);
    group.add(arm);

    return group;
}

export function animateStreet(street, time) {
    // Pulse the road lights
    street.children.forEach(child => {
        if (child.type === 'Group') {
            const light = child.children.find(c => c.material?.emissiveIntensity);
            if (light) {
                light.material.emissiveIntensity = 0.4 + Math.sin(time * 2) * 0.2;
            }
        }
    });
}
