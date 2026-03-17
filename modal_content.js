// modal_content.js — HTML content for each resume section

export function renderContent(type) {
  switch (type) {

    case 'objective':
      return `
        <div class="section">
          <h3>Professional Objective</h3>
          <div class="obj-text">
            Frontend Developer skilled in <strong>HTML, CSS, JavaScript, React.js,</strong> and <strong>UI/UX Design</strong>
            with hands-on experience in building responsive applications using <strong>Next.js</strong> and <strong>TypeScript</strong>.
            Experienced in building interactive web applications and game development using <strong>C</strong> and <strong>Unreal Engine</strong>.
            Eager to contribute to innovative projects and continuously enhance skills in responsive design, API integration,
            and Agile development environments. Strong problem-solving and communication abilities with a passion for learning new technologies.
          </div>
        </div>`;

    case 'contact':
      return `
        <div class="section">
          <h3>Get In Touch</h3>
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <div>
                <div class="contact-label">Location</div>
                <div class="contact-value">Vazhakulam, Muvattupuzha, India</div>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📱</span>
              <div>
                <div class="contact-label">Phone</div>
                <div class="contact-value">+91-7994279661</div>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">✉️</span>
              <div>
                <div class="contact-label">Email</div>
                <div class="contact-value">jibinjose884@gmail.com</div>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🌐</span>
              <div>
                <div class="contact-label">Portfolio</div>
                <div class="contact-value">portfolio-pi-cyan-64.vercel.app</div>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">💼</span>
              <div>
                <div class="contact-label">LinkedIn</div>
                <div class="contact-value">linkedin.com/in/jibin--jose</div>
              </div>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🐙</span>
              <div>
                <div class="contact-label">GitHub</div>
                <div class="contact-value">github.com/jibin7jose</div>
              </div>
            </div>
          </div>
        </div>`;

    case 'skills':
      return `
        <div class="section">
          <h3>Programming Languages</h3>
          <div class="skill-grid">
            ${['C++','Java','JavaScript','TypeScript'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>
        <div class="section">
          <h3>Frontend Technologies</h3>
          <div class="skill-grid">
            ${['HTML5','CSS3','React.js','Next.js','React Native','Tailwind CSS'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>
        <div class="section">
          <h3>Backend Technologies</h3>
          <div class="skill-grid">
            ${['NestJS','Node.js','PHP','Laravel'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>
        <div class="section">
          <h3>Databases & ORM</h3>
          <div class="skill-grid">
            ${['PostgreSQL','MySQL','SQLite','Prisma','phpMyAdmin'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>
        <div class="section">
          <h3>Tools & Cloud</h3>
          <div class="skill-grid">
            ${['Figma','AWS EC2','AWS RDS','AWS S3','Git','GitHub'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>
        <div class="section">
          <h3>Soft Skills</h3>
          <div class="skill-grid">
            ${['Critical Thinking','Problem Solving','Team Collaboration'].map(s=>`<div class="skill-pill">${s}</div>`).join('')}
          </div>
        </div>`;

    case 'education':
      return `
        <div class="section">
          <h3>Academic Background</h3>
          <div class="edu-card">
            <div class="edu-degree">B.Tech in Computer Science and Engineering</div>
            <div class="edu-school">University College of Engineering, Thodupuzha, Idukki, Kerala</div>
            <div class="edu-period">2021 – 2025</div>
          </div>
          <div class="edu-card">
            <div class="edu-degree">Higher Secondary Education</div>
            <div class="edu-school">SAHSS Kalloorkad, Ernakulam, Kerala</div>
            <div class="edu-period">2019 – 2021</div>
          </div>
        </div>`;

    case 'certifications':
      return `
        <div class="section">
          <h3>Professional Certifications</h3>
          <div class="cert-card">
            <div class="cert-badge">🏅</div>
            <div>
              <div class="cert-name">The MERN Fullstack Guide</div>
              <div class="cert-issuer">Udemy</div>
              <div class="cert-date">June 2024</div>
              <div class="cert-issuer" style="margin-top:6px">
                Covered: React.js, Node.js, Express.js, MongoDB, REST APIs, Git, Deployment
              </div>
            </div>
          </div>
          <div class="cert-card">
            <div class="cert-badge">🎓</div>
            <div>
              <div class="cert-name">Python Mentorship Program</div>
              <div class="cert-issuer">IEEE</div>
              <div class="cert-date">August 2023</div>
              <div class="cert-issuer" style="margin-top:6px">
                Covered: Python basics, problem-solving, algorithmic thinking, data structures
              </div>
            </div>
          </div>
        </div>`;

    case 'projects':
      return `
        <div class="section">
          <h3>Key Projects</h3>
          <div class="project-card">
            <div class="project-name">🎮 OUTBREAK FPS GAME</div>
            <div class="project-tech">Unreal Engine · C++ · Game Development</div>
            <div class="project-desc">
              A First-Person Shooter game built with Unreal Engine — a powerful engine developed by Epic Games.
              Players experience action through the protagonist's eyes. The engine is widely used in games,
              film, architecture, automotive design, and VR.
            </div>
          </div>
          <div class="project-card">
            <div class="project-name">🏢 SOLIDSERVE</div>
            <div class="project-tech">Full Stack · CRUD · Dashboard · Laravel/PHP</div>
            <div class="project-desc">
              A comprehensive CRUD-based web application tailored for Akshaya centers in Kerala.
              Features an intuitive dashboard for staff and admin users, seamless invoice generation,
              efficient wallet management, and robust real-time transaction monitoring.
            </div>
          </div>
          <div class="project-card">
            <div class="project-name">🛋️ Belmountie Furniture Website</div>
            <div class="project-tech">Laravel · PHP · MySQL · JavaScript</div>
            <div class="project-desc">
              Responsive furniture e-commerce website with product listings, category filters,
              inquiry/contact forms, and an admin dashboard for content management.
            </div>
          </div>
          <div class="project-card">
            <div class="project-name">📂 FIG – User Directory Listing Platform</div>
            <div class="project-tech">Laravel · Authentication · CRUD · Admin Panel</div>
            <div class="project-desc">
              A directory-based platform for users to register, create profiles, and list services.
              Features authentication, search and filter, CRUD functionality, and admin control panel.
            </div>
          </div>
        </div>`;

    case 'experience':
      return `
        <div class="section">
          <h3>Professional Experience</h3>
          <div class="exp-card">
            <div class="exp-company">ABHRAM TECHNOLOGIES</div>
            <div class="exp-role">Software Engineer · Onsite</div>
            <div class="exp-period">Nov 2025 – Present</div>
            <ul class="exp-desc">
              <li>Building mobile and web apps using React Native, Next.js, and NestJS</li>
              <li>Developing backend APIs with Prisma and PostgreSQL</li>
              <li>Implementing JWT authentication and RBAC</li>
              <li>Managing file storage with AWS S3 and EC2 hosting</li>
              <li>Handling offline data with SQLite and AsyncStorage</li>
              <li>Collaborating on database design and Git-based deployment</li>
            </ul>
          </div>
          <div class="exp-card">
            <div class="exp-company">MDigitz</div>
            <div class="exp-role">Junior Software Developer Trainee · Onsite</div>
            <div class="exp-period">Jul 30, 2025 – Oct 28, 2025</div>
            <ul class="exp-desc">
              <li>Trained in full stack web development using Laravel, PHP, MySQL, JavaScript</li>
              <li>Developed and maintained dynamic web applications using Laravel + RESTful architecture</li>
              <li>Assisted in debugging, testing, and optimizing applications</li>
              <li>Collaborated on deployment workflows, database schema design, and version control</li>
            </ul>
          </div>
          <div class="exp-card">
            <div class="exp-company">Edu-versity</div>
            <div class="exp-role">Full Stack Development Intern · Remote</div>
            <div class="exp-period">Mar 2025 – Jun 2025</div>
            <ul class="exp-desc">
              <li>Participated in a hands-on full stack web development internship</li>
              <li>Developed and tested web applications using MongoDB, Express.js, React, and Node.js</li>
              <li>Gained experience in building real-time features and working in collaborative environments</li>
            </ul>
          </div>
        </div>`;

    case 'positions':
      return `
        <div class="section">
          <h3>Positions of Responsibility</h3>
          <div class="pos-card">
            <span class="pos-icon">🤝</span>
            <div>
              <div class="pos-title">NSS Volunteer</div>
              <div class="pos-desc">
                Coordinated and participated in community service events focused on health, education,
                and environmental awareness. Developed leadership and communication skills while
                organizing impactful programs.
              </div>
            </div>
          </div>
          <div class="pos-card">
            <span class="pos-icon">🎯</span>
            <div>
              <div class="pos-title">Programme Coordinator – Tech Fest (EDUINO)</div>
              <div class="pos-desc">
                Served as programme coordinator for the EDUINO event at the college Tech Fest.
                Managed logistics, scheduling, and coordination ensuring a smooth and successful event.
              </div>
            </div>
          </div>
        </div>`;

    case 'languages':
      return `
        <div class="section">
          <h3>Languages Known</h3>
          <div class="lang-grid">
            <div class="lang-pill"><span class="lang-dot" style="background:#00e5ff"></span>English</div>
            <div class="lang-pill"><span class="lang-dot" style="background:#7c3aed"></span>Malayalam</div>
            <div class="lang-pill"><span class="lang-dot" style="background:#10b981"></span>Hindi</div>
          </div>
        </div>`;

    default:
      return '<p>Content not found.</p>';
  }
}
