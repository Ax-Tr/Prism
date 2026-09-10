# 13 — Performance Specification: Nexora Prism

## 1. Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 1.2s
- **First Input Delay (FID)**: < 50ms
- **Cumulative Layout Shift (CLS)**: < 0.02

## 2. Optimization Techniques
- **CSS GPU Acceleration**: `backdrop-filter` and hardware-accelerated transitions (`transition-all duration-200`).
- **Font Loading**: `display=swap` for Google Fonts (`Outfit`, `Inter`, `Cormorant Garamond`, `Space Mono`).
- **Code Splitting**: Vite ES module chunking for fast sub-second bundle loading.
