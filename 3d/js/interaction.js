/**
 * Interaction Module
 * Handles raycasting, hover effects, and click detection
 */

import * as THREE from 'three';

export class Interaction {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.interactiveObjects = [];
        this.onClickCallback = null;
        this.onHoverCallback = null;

        this.setupEvents();
    }

    setupEvents() {
        this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.domElement.addEventListener('click', (e) => this.onClick(e));
        this.domElement.addEventListener('touchend', (e) => this.onTouch(e));
    }

    addInteractiveObject(object) {
        this.interactiveObjects.push(object);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.checkHover();
    }

    checkHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const allMeshes = [];
        this.interactiveObjects.forEach(obj => {
            obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    allMeshes.push(child);
                }
            });
        });

        const intersects = this.raycaster.intersectObjects(allMeshes);

        if (intersects.length > 0) {
            let parent = intersects[0].object;
            while (parent.parent && !parent.userData.type) {
                parent = parent.parent;
            }

            if (parent.userData.type && this.hoveredObject !== parent) {
                this.unhover();
                this.hoveredObject = parent;
                this.hover(parent);
            }
        } else {
            this.unhover();
        }
    }

    hover(object) {
        this.domElement.style.cursor = 'pointer';

        if (object.userData.meshes) {
            object.userData.meshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.userData.originalEmissive = mesh.material.emissiveIntensity || 0;
                    mesh.material.emissiveIntensity = 0.5;
                    if (!mesh.material.emissive) {
                        mesh.material.emissive = new THREE.Color(object.userData.originalColor);
                    }
                }
            });
        }

        if (this.onHoverCallback) {
            this.onHoverCallback(object, true);
        }
    }

    unhover() {
        if (this.hoveredObject) {
            this.domElement.style.cursor = 'default';

            if (this.hoveredObject.userData.meshes) {
                this.hoveredObject.userData.meshes.forEach(mesh => {
                    if (mesh.material && mesh.userData.originalEmissive !== undefined) {
                        mesh.material.emissiveIntensity = mesh.userData.originalEmissive;
                    }
                });
            }

            if (this.onHoverCallback) {
                this.onHoverCallback(this.hoveredObject, false);
            }

            this.hoveredObject = null;
        }
    }

    onClick(event) {
        if (this.hoveredObject && this.onClickCallback) {
            this.onClickCallback(this.hoveredObject);
        }
    }

    onTouch(event) {
        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);

            const allMeshes = [];
            this.interactiveObjects.forEach(obj => {
                obj.traverse(child => {
                    if (child instanceof THREE.Mesh) allMeshes.push(child);
                });
            });

            const intersects = this.raycaster.intersectObjects(allMeshes);

            if (intersects.length > 0) {
                let parent = intersects[0].object;
                while (parent.parent && !parent.userData.type) {
                    parent = parent.parent;
                }

                if (parent.userData.type && this.onClickCallback) {
                    this.onClickCallback(parent);
                }
            }
        }
    }

    setClickCallback(callback) {
        this.onClickCallback = callback;
    }

    setHoverCallback(callback) {
        this.onHoverCallback = callback;
    }
}
