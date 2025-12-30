/**
 * 3D Info Text Module
 * Creates floating 3D text billboards that appear at each section
 */

import * as THREE from 'three';
import { profileData, educationData, experienceData, skillsData, contactData } from './data.js';

export class InfoText3D {
    constructor(scene) {
        this.scene = scene;
        this.textGroups = {};
        this.currentVisible = null;

        this.createAllInfoTexts();
    }

    createAllInfoTexts() {
        // About Me info - near avatar (Z=0)
        this.textGroups.avatar = this.createInfoPanel(
            new THREE.Vector3(4, 3, 2),
            '👋 About Me',
            [profileData.name, 'Software Engineering Graduate', 'Telkom University'],
            0x64ffda
        );

        // Education info - near education building (Z=-15)
        this.textGroups.education = this.createInfoPanel(
            new THREE.Vector3(-2, 4, -13),
            '🎓 Education',
            [educationData[0].degree, educationData[0].institution, educationData[0].date],
            0xff6b6b
        );

        // Experience info - near experience path (Z=-35)
        this.textGroups.experience = this.createInfoPanel(
            new THREE.Vector3(-2, 3, -34),
            '💼 Experience',
            experienceData.slice(0, 3).map(e => e.title),
            0xffd93d
        );

        // Skills info - near skills building (Z=-50)
        this.textGroups.skills = this.createInfoPanel(
            new THREE.Vector3(2, 4, -48),
            '⚡ Skills',
            ['Frontend: React, JS, TS', 'Backend: NestJS, Laravel', 'Database: SQL, Prisma'],
            0x6bcb77
        );

        // Contact info - near portal (Z=-65)
        this.textGroups.contact = this.createInfoPanel(
            new THREE.Vector3(5, 3, -63),
            '📬 Contact',
            ['GitHub: @atiohaidar', 'LinkedIn: atiohaidar', 'Let\'s connect!'],
            0x4d96ff
        );

        // Hide all initially
        Object.values(this.textGroups).forEach(group => {
            group.visible = false;
            group.scale.set(0.01, 0.01, 0.01);
            this.scene.add(group);
        });
    }

    createInfoPanel(position, title, lines, color) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Background panel
        const panelWidth = 5;
        const panelHeight = 2.5;
        const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        group.add(panel);

        // Border frame
        const borderGeometry = new THREE.EdgesGeometry(panelGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: color });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        group.add(border);

        // Glow accent line at top
        const glowGeometry = new THREE.PlaneGeometry(panelWidth - 0.2, 0.05);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = panelHeight / 2 - 0.15;
        glow.position.z = 0.01;
        group.add(glow);

        // Title indicator sphere
        const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(-panelWidth / 2 + 0.3, panelHeight / 2 - 0.4, 0.1);
        group.add(sphere);

        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw text on canvas
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.fillText(title, 50, 50);

        ctx.fillStyle = '#a0a0a0';
        ctx.font = '24px Inter, sans-serif';
        lines.forEach((line, index) => {
            ctx.fillText(line, 30, 100 + index * 35);
        });

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(panelWidth - 0.4, panelHeight - 0.4),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            })
        );
        textPlane.position.z = 0.02;
        group.add(textPlane);

        // Store color for animation
        group.userData = { color, sphere, glow };

        return group;
    }

    showSection(sectionName) {
        // Hide current
        if (this.currentVisible && this.textGroups[this.currentVisible]) {
            this.hidePanel(this.textGroups[this.currentVisible]);
        }

        // Show new
        if (this.textGroups[sectionName]) {
            this.showPanel(this.textGroups[sectionName]);
            this.currentVisible = sectionName;
        }
    }

    showPanel(panel) {
        panel.visible = true;
        if (window.gsap) {
            window.gsap.to(panel.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
            window.gsap.to(panel.position, {
                y: panel.position.y + 0.3,
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            panel.scale.set(1, 1, 1);
        }
    }

    hidePanel(panel) {
        if (window.gsap) {
            window.gsap.to(panel.scale, {
                x: 0.01, y: 0.01, z: 0.01,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    panel.visible = false;
                }
            });
        } else {
            panel.visible = false;
            panel.scale.set(0.01, 0.01, 0.01);
        }
    }

    update(camera, time) {
        // Make panels face camera (billboard effect)
        Object.values(this.textGroups).forEach(group => {
            if (group.visible) {
                group.lookAt(camera.position);

                // Animate glow
                if (group.userData.sphere) {
                    group.userData.sphere.material.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.3;
                }
            }
        });
    }
}
