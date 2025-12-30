/**
 * Animations Module
 * Handles GSAP entrance animations and advanced object animations
 */

export class Animations {
    constructor() {
        this.gsap = window.gsap;
        this.loadingProgress = 0;
    }

    // Loading screen progress animation
    animateLoading(onComplete) {
        const progressBar = document.querySelector('.progress-bar');
        const loaderText = document.querySelector('.loader-text');
        const loadingScreen = document.getElementById('loading-screen');

        const tips = [
            'Preparing 3D Environment...',
            'Loading textures...',
            'Building scene...',
            'Almost ready...'
        ];

        let tipIndex = 0;
        const tipInterval = setInterval(() => {
            tipIndex = (tipIndex + 1) % tips.length;
            loaderText.textContent = tips[tipIndex];
        }, 800);

        // Animate progress bar
        this.gsap.to(progressBar, {
            width: '100%',
            duration: 2.5,
            ease: 'power2.inOut',
            onComplete: () => {
                clearInterval(tipInterval);
                loaderText.textContent = 'Ready!';

                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    if (onComplete) onComplete();
                }, 500);
            }
        });
    }

    // Entrance animations for 3D objects
    animateObjectsEntrance(objects) {
        const timeline = this.gsap.timeline({ delay: 0.5 });

        // Animate each object with stagger
        Object.entries(objects).forEach(([name, obj], index) => {
            // Store original position
            const originalY = obj.position.y;
            const originalScale = obj.scale.clone();

            // Start below and scaled down
            obj.position.y = originalY - 3;
            obj.scale.set(0.01, 0.01, 0.01);
            obj.visible = true;

            timeline.to(obj.position, {
                y: originalY,
                duration: 0.8,
                ease: 'back.out(1.7)'
            }, index * 0.15);

            timeline.to(obj.scale, {
                x: originalScale.x,
                y: originalScale.y,
                z: originalScale.z,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            }, index * 0.15);
        });

        return timeline;
    }

    // UI entrance animations
    animateUIEntrance() {
        const timeline = this.gsap.timeline({ delay: 0.3 });

        // Section label
        timeline.to('#section-label', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        });

        // Scroll progress
        timeline.from('#scroll-progress', {
            opacity: 0,
            x: 50,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.3');

        // Scroll hint
        timeline.from('#scroll-hint', {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.3');

        // Footer
        timeline.from('#footer-overlay', {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: 'power2.out'
        }, '-=0.2');

        return timeline;
    }

    // Pulse animation for highlighting
    pulseObject(object) {
        if (!object.userData.meshes) return;

        object.userData.meshes.forEach(mesh => {
            if (mesh.material) {
                this.gsap.to(mesh.material, {
                    emissiveIntensity: 0.8,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 2,
                    ease: 'power2.inOut'
                });
            }
        });
    }

    // Camera shake effect
    cameraShake(camera, intensity = 0.1) {
        const originalPos = camera.position.clone();

        this.gsap.to(camera.position, {
            x: originalPos.x + (Math.random() - 0.5) * intensity,
            y: originalPos.y + (Math.random() - 0.5) * intensity,
            z: originalPos.z + (Math.random() - 0.5) * intensity,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'power2.inOut',
            onComplete: () => {
                camera.position.copy(originalPos);
            }
        });
    }
}
