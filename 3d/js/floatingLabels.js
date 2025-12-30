/**
 * Floating Labels Module
 * Creates 3D text labels that float near objects
 */

import * as THREE from 'three';

export class FloatingLabels {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.labels = [];
        this.container = null;

        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'floating-labels';
        this.container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 30;
        `;
        document.body.appendChild(this.container);
    }

    addLabel(object, text, color = '#64ffda') {
        const label = document.createElement('div');
        label.className = 'floating-label';
        label.innerHTML = `<span>${text}</span>`;
        label.style.cssText = `
            position: absolute;
            padding: 6px 12px;
            background: rgba(10, 10, 15, 0.8);
            backdrop-filter: blur(5px);
            border: 1px solid ${color}40;
            border-radius: 20px;
            color: ${color};
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        this.container.appendChild(label);

        this.labels.push({
            element: label,
            object: object,
            offset: new THREE.Vector3(0, 2.5, 0),
            color: color
        });

        return label;
    }

    update() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.labels.forEach(label => {
            const position = new THREE.Vector3();
            label.object.getWorldPosition(position);
            position.add(label.offset);

            // Project to screen
            position.project(this.camera);

            const x = (position.x * 0.5 + 0.5) * width;
            const y = (-position.y * 0.5 + 0.5) * height;

            // Check if visible
            const isVisible = position.z < 1 && x > 0 && x < width && y > 0 && y < height;

            label.element.style.left = `${x}px`;
            label.element.style.top = `${y}px`;
            label.element.style.opacity = isVisible ? '1' : '0';

            // Scale based on distance
            const distance = this.camera.position.distanceTo(label.object.position);
            const scale = Math.max(0.5, Math.min(1.2, 10 / distance));
            label.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        });
    }

    show() {
        this.labels.forEach((label, index) => {
            setTimeout(() => {
                label.element.style.opacity = '1';
            }, index * 100);
        });
    }

    hide() {
        this.labels.forEach(label => {
            label.element.style.opacity = '0';
        });
    }
}
