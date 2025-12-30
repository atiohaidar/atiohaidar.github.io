/**
 * Scroll Journey Module
 * Handles scroll-based camera path along the street
 */

import * as THREE from 'three';

export class ScrollJourney {
    constructor(camera, controls, infoText3D) {
        this.camera = camera;
        this.controls = controls;
        this.infoText3D = infoText3D;
        this.currentSection = 0;
        this.scrollProgress = 0;
        this.isAnimating = false;

        // Linear street camera waypoints
        this.waypoints = [
            { // Intro - Start of street
                position: new THREE.Vector3(0, 4, 12),
                target: new THREE.Vector3(0, 2, 0),
                section: 'intro',
                label: 'Welcome',
                icon: '👋'
            },
            { // About - Looking at avatar
                position: new THREE.Vector3(3, 3, 5),
                target: new THREE.Vector3(0, 2, 0),
                section: 'avatar',
                label: 'About Me',
                icon: '🧑‍💻'
            },
            { // Education - Walking down, looking left at building
                position: new THREE.Vector3(0, 3, -10),
                target: new THREE.Vector3(-6, 2, -15),
                section: 'education',
                label: 'Education',
                icon: '🎓'
            },
            { // Experience - Looking right at stations
                position: new THREE.Vector3(-2, 3, -32),
                target: new THREE.Vector3(5, 1.5, -35),
                section: 'experience',
                label: 'Experience',
                icon: '💼'
            },
            { // Skills - Looking left at tech building
                position: new THREE.Vector3(2, 3, -45),
                target: new THREE.Vector3(-6, 2, -50),
                section: 'skills',
                label: 'Skills',
                icon: '⚡'
            },
            { // Contact - End of street, facing portal
                position: new THREE.Vector3(0, 3, -55),
                target: new THREE.Vector3(0, 2.5, -65),
                section: 'contact',
                label: 'Contact',
                icon: '📬'
            }
        ];

        this.setupScrollListener();
        this.setupDotNavigation();
    }

    setupScrollListener() {
        const scrollContainer = document.getElementById('scroll-container');
        const totalHeight = scrollContainer.scrollHeight - window.innerHeight;

        window.addEventListener('scroll', () => {
            if (this.isAnimating) return;

            const scrollY = window.scrollY;
            this.scrollProgress = Math.min(scrollY / totalHeight, 1);

            const sectionProgress = this.scrollProgress * (this.waypoints.length - 1);
            const newSection = Math.round(sectionProgress);

            if (newSection !== this.currentSection) {
                this.currentSection = newSection;
                this.updateSectionUI();
                this.updateInfoText();
            }

            this.updateProgressBar();
            this.updateCamera(sectionProgress);
        });
    }

    setupDotNavigation() {
        const dots = document.querySelectorAll('.progress-dots .dot');

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSection(index);
            });
        });
    }

    goToSection(index) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const targetScroll = index * window.innerHeight;

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        const waypoint = this.waypoints[index];
        this.animateCameraTo(waypoint.position, waypoint.target, () => {
            this.isAnimating = false;
            this.currentSection = index;
            this.updateSectionUI();
            this.updateInfoText();
        });
    }

    updateCamera(sectionProgress) {
        const fromIndex = Math.floor(sectionProgress);
        const toIndex = Math.min(fromIndex + 1, this.waypoints.length - 1);
        const t = sectionProgress - fromIndex;

        const from = this.waypoints[fromIndex];
        const to = this.waypoints[toIndex];

        const eased = this.easeInOutCubic(t);

        this.camera.position.lerpVectors(from.position, to.position, eased);

        const target = new THREE.Vector3();
        target.lerpVectors(from.target, to.target, eased);
        this.controls.target.copy(target);
    }

    animateCameraTo(position, target, onComplete) {
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1200;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            this.camera.position.lerpVectors(startPosition, position, eased);
            this.controls.target.lerpVectors(startTarget, target, eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        animate();
    }

    updateSectionUI() {
        const waypoint = this.waypoints[this.currentSection];

        const labelIcon = document.querySelector('.label-icon');
        const labelText = document.querySelector('.label-text');
        const sectionLabel = document.getElementById('section-label');

        labelIcon.textContent = waypoint.icon;
        labelText.textContent = waypoint.label;
        sectionLabel.classList.add('visible');

        const dots = document.querySelectorAll('.progress-dots .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSection);
        });

        if (this.currentSection > 0) {
            document.getElementById('scroll-hint').classList.add('hidden');
        }
    }

    updateInfoText() {
        if (this.infoText3D) {
            const waypoint = this.waypoints[this.currentSection];
            if (waypoint.section !== 'intro') {
                this.infoText3D.showSection(waypoint.section);
            }
        }
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        progressFill.style.height = `${this.scrollProgress * 100}%`;
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
