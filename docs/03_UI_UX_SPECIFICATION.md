# 03 — UI/UX Specification: Nexora Prism

## 1. Aesthetic Direction & Layout Systems
- **Glassmorphism Layering**: Backdrop-blur filters (`backdrop-filter: blur(16px)`), semi-transparent container fills (`rgba(11, 15, 25, 0.7)`), and subtle white borders (`rgba(255, 255, 255, 0.08)`).
- **Navigation Model**: Floating bottom glassmorphic dock containing 5 primary tabs + expandable "More" menu for secondary operations.
- **Top Bar**: Fixed header containing application logo, version tag (`v2.4`), operational grid status, theme switcher button, notifications tray bell, and active user profile avatar.
- **Slide-Over Drawers**: Floating bottom-right Luminary AI COO chat drawer and top-right notifications drawer.

## 2. Interactive Component Behavior
- **Hover & Active States**: Scale transitions (`scale-105`), subtle glow shadows (`shadow-sky-500/20`), and font color shifts.
- **Modals**: Centered glass panels with backdrop blur overlays (`bg-black/70 backdrop-blur-md`).
- **Responsive Layout**: Fluid breakpoints supporting mobile (375px), tablet (768px), laptop (1024px), and ultra-wide desktop (1440px+).
