# 🚀 Md Faiyaz Ansari — Personal Portfolio

<div align="center">

![Portfolio Preview](photo.jpg)

**Live →** [mdfaiyaz.netlify.app](https://mdfaiyaz.netlify.app)
&nbsp;·&nbsp;
**GitHub →** [github.com/ansfaiz/portfolio](https://github.com/ansfaiz/portfolio)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| **3D Particle Field** | 1,400 interactive WebGL particles built with Three.js — respond to mouse movement |
| **Custom Cursor** | Dual-ring cursor with lerp lag, hover expand, click collapse, label pill |
| **GSAP Animations** | Scroll-triggered reveals, staggered cards, parallax orbs |
| **Dark / Light Mode** | One-click toggle, preference saved to `localStorage` |
| **3D Card Tilt** | Perspective tilt on all project/skill cards following mouse position |
| **Card Shine Effect** | Light sweep gradient follows cursor across card surfaces |
| **Typewriter Effect** | Hero tagline cycles through engineering phrases |
| **Animated Counters** | Stats count up from zero when scrolled into view |
| **Netlify Form** | Working contact form — submissions go straight to email, no backend needed |
| **Magnetic Buttons** | CTAs subtly pull toward cursor on hover |
| **Skill Bar Animation** | Progress bars fill when scrolled into view |
| **Back to Top** | Smooth scroll button appears after 500px |
| **Fully Responsive** | Works on all screen sizes, heavy effects disabled on mobile/low-end devices |

---

## 🛠️ Tech Stack

- **Three.js r128** — WebGL particle field with custom GLSL shaders
- **GSAP 3.12 + ScrollTrigger** — Scroll-driven animations and parallax
- **Vanilla JS (ES6+)** — No framework, zero dependencies beyond the above
- **CSS Custom Properties** — Full design system with dark/light theme tokens
- **Netlify Forms** — Serverless contact form handling
- **Devicons** — Tech stack icons via CDN

---

## 📁 Folder Structure

```
portfolio/
├── index.html      # Full single-page HTML
├── style.css       # All styles — design tokens, components, responsive
├── script.js       # All JS — Three.js, GSAP, cursor, tilt, counters, form
├── photo.jpg       # Profile photo
└── README.md       # This file
```

---

## 🚀 Getting Started

No build tools or package manager needed. It's pure HTML/CSS/JS.

**1. Clone the repo**
```bash
git clone https://github.com/ansfaiz/portfolio.git
cd portfolio
```

**2. Open locally**
```bash
# Option A — just open the file
open index.html

# Option B — use a local server (recommended for Three.js)
npx serve .
# or
python3 -m http.server 3000
```

**3. Deploy to Netlify**

Just drag the folder into [app.netlify.com/drop](https://app.netlify.com/drop) — the contact form will work automatically.

> **Note:** Three.js particles require WebGL. On browsers without WebGL support the page still works — particles are silently skipped.

---

## 📬 Contact Form Setup (Netlify)

The form uses Netlify's built-in form handling. After deploying:

1. Go to **Netlify Dashboard → Your Site → Forms**
2. You'll see the `contact` form with all submissions
3. To get email notifications: **Site Settings → Forms → Form notifications → Add notification**

---

## 🎨 Design Tokens

```css
/* Dark theme */
--bg:     #080b10   /* Page background     */
--accent: #00e5a8   /* Mint green           */
--blue:   #4d9fff   /* Accent blue          */
--ink:    #f0ede8   /* Primary text         */

/* Light theme */
--bg:     #f6f4f0
--accent: #00a87e
```

---

## 📄 License

MIT — feel free to fork and adapt. A credit link back is appreciated but not required.

---

<div align="center">

Built with intent by **Md Faiyaz Ansari**

[LinkedIn](https://www.linkedin.com/in/md-faiyaz-ansari-6719212a4) · [GitHub](https://github.com/ansfaiz) · [LeetCode](https://leetcode.com/u/Ansfaiz1661/) · [CodeChef](https://www.codechef.com/users/ansfaiz)

</div>
