# cream.fun - Advanced Trading Platform

A modern Next.js trading platform with Hyperliquid-inspired design, built for creating and managing trading strategies.

## 🚀 Features

- **Modern UI**: Clean, dark theme with Hyperliquid color palette
- **Strategy Creation**: Long/Short position management with leverage and slippage controls
- **Real-time Market Data**: Live data from Hyperliquid API with funding rates and open interest
- **API Integration**: RESTful API endpoint for market data with caching
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Type Safety**: Full TypeScript support with strict typing
- **Error Handling**: Graceful error handling with retry functionality

## 🛠 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with CSS variables
- **State Management**: React hooks with custom state management
- **Build Tool**: Turbopack for fast development

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── markets/       # Market data endpoint
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── features/              # Feature-based components
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx     # Button component
│   │   ├── Card.tsx       # Card component
│   │   ├── KPI.tsx        # KPI dashboard
│   │   ├── LoadingState.tsx # Loading and error states
│   │   └── MarketInfo.tsx # Market information display
│   ├── strategy/          # Strategy-related components
│   │   ├── CreateStrategy.tsx
│   │   ├── LongBlock.tsx
│   │   ├── ShortBlock.tsx
│   │   └── PairMultiSelect.tsx
│   └── positions/         # Position management
│       └── ActivePositions.tsx
└── lib/                   # Utilities and types
    ├── hyperliquid/       # Hyperliquid API types
    │   └── types.ts       # Market and API interfaces
    ├── hooks/             # Custom React hooks
    │   └── useMarkets.ts  # Market data hook
    ├── types.ts           # Legacy TypeScript interfaces
    ├── mockData.ts        # Mock market data
    ├── format.ts          # Number formatting utilities
    └── hooks.ts           # Custom React hooks
```

## 🎨 Design System

### Color Palette (Hyperliquid-inspired)
- **Background**: `#051E1C` - Dark teal background
- **Surface**: `#0B2E2C` - Card and component backgrounds
- **Primary**: `#36D7B7` - Main accent color
- **Success**: `#6FFFB0` - Long positions and positive values
- **Danger**: `#FF6F61` - Short positions and negative values
- **Border**: `#12433F` - Subtle borders
- **Text**: `#E6F8F7` - Primary text color
- **Muted**: `#7AA39E` - Secondary text color

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Three variants (primary, success, danger) with hover effects
- **Inputs**: Dark theme with focus states
- **Chips**: Rounded pills for tags and selections

## 📊 Market Data Structure

The application uses a structured approach to market data with real-time integration:

```typescript
interface PerpMarket {
  id: string;         // 'BTC-PERP'
  symbol: string;     // 'BTC'
  display: string;    // 'BTC-PERP'
  base: string;       // 'BTC'
  quote: string;      // 'USDC'
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
  midPx?: number;
  funding?: number;
  openInterest?: number;
}
```

### API Integration

The application fetches real-time market data from Hyperliquid's API:

- **Endpoint**: `/api/markets`
- **Data Source**: Hyperliquid API (`https://api.hyperliquid.xyz/info`)
- **Caching**: 60-second cache for optimal performance
- **Error Handling**: Graceful fallback with retry functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cream_fun_v1
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4000](http://localhost:4000) in your browser

### Available Scripts

- `npm run dev` - Start development server on port 4000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Development

### Adding New Markets

To add new markets, update the `mockMarkets` object in `src/lib/mockData.ts`:

```typescript
{
  id: 'NEW-PERP',
  symbol: 'NEW',
  display: 'NEW-PERP',
  base: 'NEW',
  quote: 'USDC',
  maxLeverage: 20,
  szDecimals: 2,
  markPx: 100.0,
  midPx: 100.5,
  funding: 0.0001,
  openInterest: 50000000
}
```

### Custom Hooks

The application includes custom hooks for state management:

- `useMarkets()` - Fetch and manage real-time market data
- `useMarketSelection()` - Manage market selection state
- `useStrategyState()` - Manage strategy configuration

### Styling

The application uses CSS variables for theming. To modify colors, update the `@theme` block in `src/app/globals.css`:

```css
@theme {
  --color-hl-bg: #051E1C;
  --color-hl-surface: #0B2E2C;
  --color-hl-primary: #36D7B7;
  /* ... other colors */
}
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1200px - Adaptive layout
- **Desktop**: > 1200px - Two-column grid layout

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [x] Real-time market data integration
- [ ] Wallet connection functionality
- [ ] Order placement and management
- [ ] Portfolio tracking
- [ ] Advanced charting
- [ ] Risk management tools
- [ ] Multi-chain support
- [ ] Price alerts and notifications
- [ ] Advanced filtering and search
- [ ] Historical data visualization
