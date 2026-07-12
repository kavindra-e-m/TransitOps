# TransitOps Technical Documentation

Welcome to the TransitOps documentation directory. This folder houses technical sheets, deployment guides, and design specifications for developers and operators.

## 📖 Available Guides

- **[System Architecture](file:///c:/projects/Transit-OPS/TransitOps/docs/architecture.md)**: Explains the split client-server design, database schema layout, WebSocket live coordinate simulation engine, and CSS utility tokens.
- **[API Specification](file:///c:/projects/Transit-OPS/TransitOps/docs/api-spec.md)**: Detailed catalog of all REST API routes, parameter validations, authentication header schemas, and response formats.

## 🛠️ Local Setup Guide

1. **Prerequisites**: Ensure you have Node.js (version 18+) installed.
2. **Install Dependencies**:
   ```bash
   # Run installation from the root directory
   npm run install-all
   ```
3. **Run Application**:
   ```bash
   # Launch client and server concurrently from the root directory
   npm start
   ```
4. **Access Portal**: Open your browser at `http://localhost:5173/`.
