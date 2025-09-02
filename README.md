# Turbodash

A lightweight UI for inspecting [Turbopuffer](https://turbopuffer.com) state and managing your vector databases.

## Features

- Browse and inspect your Turbopuffer namespaces
- View vector embeddings and metadata
- Real-time database state monitoring
- Clean, responsive interface built with React Router and Tailwind CSS

## Installation

```bash
git clone https://github.com/connorjacobsen/turbodash.git
cd turbodash
pnpm install
```

## Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Add your [Turbopuffer API credentials](https://turbopuffer.com/dashboard/api-keys):
   ```env
   TURBOPUFFER_API_KEY=your-api-key-here
   TURBOPUFFER_REGION=aws-us-west-2
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

The application will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURBOPUFFER_API_KEY` | Your Turbopuffer API key from the [dashboard](https://turbopuffer.com/dashboard/api-keys) | Yes |
| `TURBOPUFFER_REGION` | Turbopuffer region (e.g., `aws-us-west-2`) | Yes |

## Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run typecheck` - Run TypeScript type checking

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests on [GitHub](https://github.com/connorjacobsen/turbodash).

## License

MIT
