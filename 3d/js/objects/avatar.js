/**
 * Avatar Object Module
 * Central representation of self - at the start of the journey
 */

import * as THREE from 'three';

export function createAvatar() {
    const group = new THREE.Group();
    group.name = 'avatar';
    group.userData = { type: 'avatar', label: 'About Me' };

    const color = 0x64ffda;
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.6,
        emissive: color,
        emissiveIntensity: 0.1
    });

    // Body (octahedron)
    const bodyGeometry = new THREE.OctahedronGeometry(1, 0);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = 2;
    body.castShadow = true;
    group.add(body);

    // Head (icosahedron)
    const headGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 3.5;
    head.castShadow = true;
    group.add(head);

    // Floating ring
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.05, 8, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.3
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 2;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Base platform
    const platformGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.3, 6);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.15;
    platform.receiveShadow = true;
    platform.castShadow = true;
    group.add(platform);

    // Position at start of street (Z = 0)
    group.position.set(0, 0, 0);

    group.userData.originalColor = color;
    group.userData.meshes = [body, head, ring];

    return group;
}

export function animateAvatar(avatar, time) {
    const body = avatar.children[0];
    const head = avatar.children[1];
    const ring = avatar.children[2];

    body.position.y = 2 + Math.sin(time * 2) * 0.1;
    body.rotation.y = time * 0.5;

    head.position.y = 3.5 + Math.sin(time * 2 + 0.5) * 0.1;
    head.rotation.y = -time * 0.3;

    ring.rotation.z = time * 0.5;
    ring.position.y = 2 + Math.sin(time * 2) * 0.1;
}
