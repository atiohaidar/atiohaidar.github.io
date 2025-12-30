/**
 * Contact Portal Object Module
 * End of the street - contact portal
 */

import * as THREE from 'three';

export function createContactPortal() {
    const group = new THREE.Group();
    group.name = 'contact';
    group.userData = { type: 'contact', label: 'Contact' };

    const color = 0x4d96ff;

    // Portal arch
    const archGeometry = new THREE.TorusGeometry(2.5, 0.2, 8, 32, Math.PI);
    const archMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.7
    });
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    arch.position.set(0, 2.5, 0);
    arch.rotation.z = Math.PI;
    arch.castShadow = true;
    group.add(arch);

    // Portal pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.25, 0.3, 2.5, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4
    });

    [[-2.3, 1.25, 0], [2.3, 1.25, 0]].forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(...pos);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Portal glow
    const portalGeometry = new THREE.CircleGeometry(2, 32);
    const portalMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.set(0, 2.5, 0.1);
    group.add(portal);

    // Social icons (floating boxes)
    const iconColors = [0x333333, 0x0077b5, 0xe4405f]; // GitHub, LinkedIn, Instagram
    const iconPositions = [[-1.2, 2.5, 0.5], [0, 3, 0.5], [1.2, 2.5, 0.5]];

    iconPositions.forEach((pos, index) => {
        const iconGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.15);
        const iconMaterial = new THREE.MeshStandardMaterial({
            color: iconColors[index],
            emissive: iconColors[index],
            emissiveIntensity: 0.3
        });
        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.position.set(...pos);
        icon.userData = { iconIndex: index, baseY: pos[1] };
        group.add(icon);
    });

    // Position: END of street
    group.position.set(0, 0, -65);

    group.userData.originalColor = color;
    group.userData.meshes = [arch, portal];

    return group;
}

export function animateContact(contact, time) {
    // Rotate arch glow
    const portal = contact.children.find(c => c.geometry?.type === 'CircleGeometry');
    if (portal) {
        portal.material.emissiveIntensity = 0.4 + Math.sin(time * 2) * 0.2;
        portal.rotation.z = time * 0.3;
    }

    // Float icons
    contact.children.forEach(child => {
        if (child.userData && child.userData.iconIndex !== undefined) {
            child.position.y = child.userData.baseY + Math.sin(time * 2 + child.userData.iconIndex) * 0.1;
            child.rotation.y = time;
        }
    });
}
