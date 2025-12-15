# HUL Photo Booth

A mobile-first web application for capturing photos and compositing them into branded frames — designed for events, conferences, and brand activations.

## ✨ Features

- **Template Selection** – Choose from pre-configured branded frames
- **Native Camera Capture** – Uses device camera on mobile (iOS/Android)
- **Auto-Composition** – Captured photos are automatically placed into the frame
- **Download & Print** – Export final image as PNG or send directly to printer

## 🛠️ Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4** (via @tailwindcss/vite plugin)
- **HTML5 Canvas** for image composition
- Fully client-side — no backend required

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app with step-based flow
├── components/
│   ├── TemplateSelector.jsx   # Frame selection UI
│   ├── CameraCapture.jsx      # Native camera/file input
│   ├── ImageComposer.jsx      # Canvas compositing logic
│   └── OutputActions.jsx      # Download/Print buttons
public/
└── HUL PNG.png                # Template frame asset
```

## 📱 Mobile Usage

For best results on mobile:
1. Open the app URL on your phone
2. Tap the template to select it
3. Use "Take Photo" to open native camera
4. Download or print your framed photo

## 🎨 Customization

**Adding new templates:**
1. Add your PNG frame to `public/`
2. Update the `templates` array in `src/components/TemplateSelector.jsx`

**Adjusting photo placement:**
Edit `INITIAL_CONFIG` in `src/components/ImageComposer.jsx`:
```js
const INITIAL_CONFIG = {
  x: 230,      // Horizontal position
  y: 705,      // Vertical position
  width: 1035, // Photo width
  height: 1140 // Photo height
};
```

## 📄 License

MIT
