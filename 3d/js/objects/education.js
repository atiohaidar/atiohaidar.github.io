/**
 * Education Building Object Module
 * Positioned on the LEFT side of the street
 */

import * as THREE from 'three';

export function createEducationBuilding() {
    const group = new THREE.Group();
    group.name = 'education';
    group.userData = { type: 'education', label: 'Education' };

    const color = 0xff6b6b;
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.3
    });

    // Main building body
    const buildingGeometry = new THREE.BoxGeometry(3, 4, 2);
    const building = new THREE.Mesh(buildingGeometry, material);
    building.position.y = 2;
    building.castShadow = true;
    group.add(building);

    // Roof (pyramid)
    const roofGeometry = new THREE.ConeGeometry(2.5, 1.5, 4);
    const roof = new THREE.Mesh(roofGeometry, material);
    roof.position.y = 4.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Columns
    const columnGeometry = new THREE.CylinderGeometry(0.15, 0.18, 3, 6);
    const columnMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const columnPositions = [[-1, 1.5, 1.1], [1, 1.5, 1.1]];
    columnPositions.forEach(pos => {
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(...pos);
        column.castShadow = true;
        group.add(column);
    });

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d3d });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 1.01);
    group.add(door);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x64ffda,
        emissive: 0x64ffda,
        emissiveIntensity: 0.3
    });

    [[-0.8, 3, 1.01], [0.8, 3, 1.01]].forEach(pos => {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(...pos);
        group.add(window);
    });

    // Graduation cap
    const capGeometry = new THREE.BoxGeometry(1, 0.15, 1);
    const cap = new THREE.Mesh(capGeometry, new THREE.MeshStandardMaterial({ color: 0x2d2d3d }));
    cap.position.y = 5.7;
    group.add(cap);

    // Position: LEFT side of street, further down the path
    group.position.set(-6, 0, -15);
    group.rotation.y = Math.PI / 6; // Angle towards street

    group.userData.originalColor = color;
    group.userData.meshes = [building, roof];

    return group;
}

export function animateEducation(education, time) {
    const windows = education.children.filter(child =>
        child.material && child.material.emissiveIntensity !== undefined
    );
    windows.forEach(window => {
        window.material.emissiveIntensity = 0.2 + Math.sin(time * 3) * 0.1;
    });
}
