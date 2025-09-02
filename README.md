# cream.fun - Advanced Trading Platform

A modern, responsive trading platform built with Next.js, TypeScript, and Tailwind CSS, featuring real-time market data from Hyperliquid.

## 🚀 Features

- **Real-time Market Data**: Live market information from Hyperliquid API
- **Strategy Creation**: Build long/short strategies with custom leverage and slippage
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean, professional interface with Hyperliquid color palette

## 🛠 Tech Stack

- **Frontend**: Next.js 15.5.2, React 18.3.1, TypeScript
- **Styling**: Tailwind CSS v4 with custom Hyperliquid theme
- **API**: Hyperliquid REST API integration
- **Deployment**: Vercel-ready configuration

## 🎨 Design System

### Color Palette
- **Primary**: Hyperliquid primary colors
- **Success**: Light green accents
- **Danger**: Red highlights for short positions
- **Background**: Dark theme optimized for trading

### Components
- **Cards**: Elevated design with subtle borders
- **Buttons**: Primary, success, and danger variants
- **Sliders**: Custom styled with dark green background and light green thumbs
- **Checkboxes**: Round design with light green styling

## 📱 Interface Components

### Top Bar
- Logo and connect button
- Clean, minimal design

### KPI Panel
- Balance, volume, and PnL metrics
- Real-time data updates
- Color-coded indicators

### Strategy Creation
- **Long Block**: Configure long positions with leverage and slippage
- **Short Block**: Configure short positions with leverage and slippage
- **Pair Selection**: Multi-select interface with search and filters
- **Leverage Display**: Max leverage shown for each ticker

### Active Positions
- Current position overview
- Close all functionality
- Empty state handling

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone https://github.com/rysuntsov/cream_fun_v1.git
cd cream_fun_v1
npm install
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:4000
```

### Build
```bash
npm run build
npm start
```

## 🌐 API Integration

### Hyperliquid Markets
- Real-time market data fetching
- Automatic revalidation (60s cache)
- Error handling and loading states
- Market metadata and asset context

### Endpoints
- `GET /api/markets` - Fetch all available markets
- Real-time price and leverage data
- Market symbols and display names

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── error.tsx          # Error boundary
├── components/             # Shared components
│   ├── MarketDataProvider.tsx
│   └── PageClient.tsx
├── features/               # Feature-based components
│   ├── ui/                # UI components
│   ├── strategy/          # Strategy creation
│   └── positions/         # Position management
└── lib/                    # Utilities and types
    └── hyperliquid/       # Hyperliquid API types
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Import project to Vercel
3. Automatic deployments on push to main

### Environment Variables
No sensitive environment variables required for basic functionality.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Coming soon on Vercel]
- **Hyperliquid API**: [https://hyperliquid.xyz/]
- **Next.js**: [https://nextjs.org/]

---

Built with ❤️ for the Hyperliquid community
