/**
 * Experience Path Object Module
 * Multiple stations along the RIGHT side of the street
 */

import * as THREE from 'three';

export function createExperiencePath() {
    const group = new THREE.Group();
    group.name = 'experience';
    group.userData = { type: 'experience', label: 'Experience' };

    const color = 0xffd93d;

    // Create 4 experience stations along the street (RIGHT side)
    const stationPositions = [
        { z: -28, label: 'Asprweb 2025' },
        { z: -32, label: 'Verifikator GS' },
        { z: -36, label: 'Asprak BD' },
        { z: -40, label: 'Asprak AP' }
    ];

    const stationMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.5
    });

    stationPositions.forEach((station, index) => {
        // Station pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 6);
        const pillar = new THREE.Mesh(pillarGeometry, stationMaterial);
        pillar.position.set(5, 1, station.z);
        pillar.castShadow = true;
        group.add(pillar);

        // Floating marker
        const markerGeometry = new THREE.OctahedronGeometry(0.3, 0);
        const markerMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(5, 2.8, station.z);
        marker.userData = { index, baseY: 2.8 };
        group.add(marker);

        // Connecting line (if not last)
        if (index < stationPositions.length - 1) {
            const lineGeometry = new THREE.BoxGeometry(0.1, 0.1, 3.5);
            const lineMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.2
            });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(5, 0.1, station.z - 2);
            group.add(line);
        }
    });

    group.userData.originalColor = color;
    group.userData.meshes = group.children.filter(c => c instanceof THREE.Mesh);

    return group;
}

export function animateExperience(experience, time) {
    experience.children.forEach((child, index) => {
        if (child.userData && child.userData.baseY !== undefined) {
            child.position.y = child.userData.baseY + Math.sin(time * 2 + child.userData.index * 0.5) * 0.15;
            child.rotation.y = time + child.userData.index;
        }
    });
}
