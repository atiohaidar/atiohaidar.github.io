/**
 * Skills Panel Object Module
 * Tech-style building on the LEFT side of the street
 */

import * as THREE from 'three';

export function createSkillsPanel() {
    const group = new THREE.Group();
    group.name = 'skills';
    group.userData = { type: 'skills', label: 'Skills' };

    const color = 0x6bcb77;

    // Main tech building
    const buildingGeometry = new THREE.BoxGeometry(4, 3, 2);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.5;
    building.castShadow = true;
    group.add(building);

    // Skill modules on front
    const skillColors = [0x6bcb77, 0x4d96ff, 0xff6b6b, 0xffd93d, 0x64ffda];
    const categories = ['FE', 'BE', 'DB', 'Tools', 'New'];

    categories.forEach((cat, index) => {
        const moduleGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.2);
        const moduleMaterial = new THREE.MeshStandardMaterial({
            color: skillColors[index],
            emissive: skillColors[index],
            emissiveIntensity: 0.3
        });
        const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
        module.position.set(-1.5 + index * 0.75, 2.2, 1.1);
        module.userData = { blinkIndex: index };
        group.add(module);
    });

    // Screen display
    const screenGeometry = new THREE.BoxGeometry(3.5, 1.2, 0.1);
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1.2, 1.05);
    group.add(screen);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const antenna = new THREE.Mesh(antennaGeometry, new THREE.MeshStandardMaterial({ color: 0x888888 }));
    antenna.position.set(1.5, 3.75, 0);
    group.add(antenna);

    // Position: LEFT side, further down
    group.position.set(-6, 0, -50);
    group.rotation.y = Math.PI / 8;

    group.userData.originalColor = color;
    group.userData.meshes = [building, screen];

    return group;
}

export function animateSkills(skills, time) {
    skills.children.forEach(child => {
        if (child.userData && child.userData.blinkIndex !== undefined) {
            const phase = time * 2 + child.userData.blinkIndex * 0.5;
            child.material.emissiveIntensity = 0.2 + Math.sin(phase) * 0.2;
        }
    });

    // Pulse screen
    const screen = skills.children.find(c => c.geometry?.parameters?.width === 3.5);
    if (screen) {
        screen.material.emissiveIntensity = 0.15 + Math.sin(time * 1.5) * 0.1;
    }
}
