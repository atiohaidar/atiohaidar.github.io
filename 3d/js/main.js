/**
 * Main Entry Point
 * 3D Resume with linear street journey
 */

import * as THREE from 'three';
import { Scene } from './scene.js';
import { ScrollJourney } from './scrollJourney.js';
import { Animations } from './animations.js';
import { InfoText3D } from './infoText3D.js';
import { Interaction } from './interaction.js';
import { Panels } from './panels.js';

import { createAvatar, animateAvatar } from './objects/avatar.js';
import { createEducationBuilding, animateEducation } from './objects/education.js';
import { createExperiencePath, animateExperience } from './objects/experience.js';
import { createSkillsPanel, animateSkills } from './objects/skills.js';
import { createContactPortal, animateContact } from './objects/contact.js';
import { createStreet, animateStreet } from './objects/street.js';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');

        this.scene = null;
        this.scrollJourney = null;
        this.animations = null;
        this.infoText3D = null;
        this.interaction = null;
        this.panels = null;
        this.objects = {};
        this.clock = new THREE.Clock();
        this.isReady = false;

        this.init();
    }

    init() {
        // Initialize scene
        this.scene = new Scene(this.container);

        // Initialize animations
        this.animations = new Animations();

        // Start loading animation
        this.animations.animateLoading(() => {
            this.onLoadingComplete();
        });

        // Create street first
        this.objects.street = createStreet();
        this.scene.add(this.objects.street);

        // Create 3D objects (hidden initially)
        this.createObjects();

        // Initialize 3D info text
        this.infoText3D = new InfoText3D(this.scene.scene);

        // Initialize scroll journey with infoText3D
        this.scrollJourney = new ScrollJourney(
            this.scene.camera,
            this.scene.controls,
            this.infoText3D
        );

        // Initialize interaction
        this.interaction = new Interaction(
            this.scene.camera,
            this.scene.renderer.domElement
        );

        Object.entries(this.objects).forEach(([key, obj]) => {
            if (key !== 'street') {
                this.interaction.addInteractiveObject(obj);
            }
        });

        // Initialize panels
        this.panels = new Panels();

        // Setup callbacks
        this.interaction.setClickCallback((obj) => this.onObjectClick(obj));

        // Disable orbit controls (scroll controls camera)
        this.scene.controls.enableZoom = false;
        this.scene.controls.enableRotate = false;
        this.scene.controls.enablePan = false;

        // Start animation loop
        this.animate();
    }

    createObjects() {
        // Avatar at start
        this.objects.avatar = createAvatar();
        this.objects.avatar.visible = false;
        this.scene.add(this.objects.avatar);

        // Education on left
        this.objects.education = createEducationBuilding();
        this.objects.education.visible = false;
        this.scene.add(this.objects.education);

        // Experience on right
        this.objects.experience = createExperiencePath();
        this.objects.experience.visible = false;
        this.scene.add(this.objects.experience);

        // Skills on left
        this.objects.skills = createSkillsPanel();
        this.objects.skills.visible = false;
        this.scene.add(this.objects.skills);

        // Contact at end
        this.objects.contact = createContactPortal();
        this.objects.contact.visible = false;
        this.scene.add(this.objects.contact);
    }

    onLoadingComplete() {
        this.isReady = true;

        // Show street immediately
        this.objects.street.visible = true;

        // Animate objects entrance with stagger
        const objectsToAnimate = {
            avatar: this.objects.avatar,
            education: this.objects.education,
            experience: this.objects.experience,
            skills: this.objects.skills,
            contact: this.objects.contact
        };

        this.animations.animateObjectsEntrance(objectsToAnimate);

        // Show UI
        setTimeout(() => {
            this.animations.animateUIEntrance();
            document.getElementById('section-label').classList.add('visible');
        }, 800);
    }

    onObjectClick(object) {
        if (object.userData.type) {
            this.animations.pulseObject(object);
            this.panels.show(object.userData.type);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate objects
        if (this.objects.street) animateStreet(this.objects.street, time);
        if (this.objects.avatar) animateAvatar(this.objects.avatar, time);
        if (this.objects.education) animateEducation(this.objects.education, time);
        if (this.objects.experience) animateExperience(this.objects.experience, time);
        if (this.objects.skills) animateSkills(this.objects.skills, time);
        if (this.objects.contact) animateContact(this.objects.contact, time);

        // Update 3D info text (billboard + animation)
        if (this.infoText3D && this.isReady) {
            this.infoText3D.update(this.scene.camera, time);
        }

        // Render scene
        this.scene.render();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
