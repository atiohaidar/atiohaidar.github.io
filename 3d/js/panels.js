/**
 * Panels Module
 * Handles HTML panel content generation and display
 */

import { profileData, educationData, experienceData, skillsData, contactData } from './data.js';

export class Panels {
    constructor() {
        this.panel = document.getElementById('detail-panel');
        this.content = document.getElementById('panel-content');
        this.closeBtn = document.getElementById('close-panel');

        this.setupEvents();
    }

    setupEvents() {
        this.closeBtn.addEventListener('click', () => this.hide());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    }

    show(type) {
        this.content.innerHTML = this.getContent(type);
        this.panel.classList.remove('hidden');
    }

    hide() {
        this.panel.classList.add('hidden');
    }

    getContent(type) {
        switch (type) {
            case 'avatar': return this.getAboutContent();
            case 'education': return this.getEducationContent();
            case 'experience': return this.getExperienceContent();
            case 'skills': return this.getSkillsContent();
            case 'contact': return this.getContactContent();
            default: return '<p>Unknown section</p>';
        }
    }

    getAboutContent() {
        return `
            <h2>👋 About Me</h2>
            <p>${profileData.bio}</p>
            <h3>Core Values</h3>
            <ul>
                ${profileData.coreValues.map(v => `
                    <li><strong>${v.title}</strong>: ${v.description}</li>
                `).join('')}
            </ul>
        `;
    }

    getEducationContent() {
        return `
            <h2>🎓 Education</h2>
            ${educationData.map(edu => `
                <div class="experience-item">
                    <div class="experience-date">${edu.date}</div>
                    <div class="experience-title">${edu.degree}</div>
                    <div class="experience-company">${edu.institution}</div>
                </div>
            `).join('')}
        `;
    }

    getExperienceContent() {
        return `
            <h2>💼 Experience</h2>
            ${experienceData.map(exp => `
                <div class="experience-item">
                    <div class="experience-date">${exp.date}</div>
                    <div class="experience-title">${exp.title}</div>
                    <div class="experience-company">${exp.company}</div>
                    <p style="font-size: 0.85rem; margin-top: 4px;">${exp.description}</p>
                </div>
            `).join('')}
        `;
    }

    getSkillsContent() {
        return `
            <h2>⚡ Skills</h2>
            <h3>Frontend</h3>
            <div>${skillsData.frontend.map(s => `<span class="tag">${s}</span>`).join('')}</div>
            <h3>Backend</h3>
            <div>${skillsData.backend.map(s => `<span class="tag">${s}</span>`).join('')}</div>
            <h3>Database</h3>
            <div>${skillsData.database.map(s => `<span class="tag">${s}</span>`).join('')}</div>
            <h3>Tools</h3>
            <div>${skillsData.tools.map(s => `<span class="tag">${s}</span>`).join('')}</div>
            <h3>Exploring</h3>
            <div>${skillsData.exploring.map(s => `<span class="tag">${s}</span>`).join('')}</div>
        `;
    }

    getContactContent() {
        return `
            <h2>📬 Contact</h2>
            <p>Feel free to connect with me!</p>
            ${Object.values(contactData).map(c => `
                <a href="${c.url}" target="_blank" rel="noopener" class="contact-link">
                    <span>${c.icon}</span>
                    <span>${c.label}</span>
                </a>
            `).join('')}
        `;
    }
}
