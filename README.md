# AI Interview - Frontend

This project is a frontend application for an AI Interview platform, built with React and Vite. It utilizes Tailwind CSS for styling and includes various UI components from Radix UI.

## Table of Contents

- [AI Interview - Frontend](#ai-interview---frontend)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
    - [Development Mode](#development-mode)
    - [Build for Production](#build-for-production)
    - [Preview Production Build](#preview-production-build)
  - [Project Structure](#project-structure)
  - [Technologies Used](#technologies-used)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Ai-Interview-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Project

### Development Mode

To run the project in development mode with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### Build for Production

To build the project for production:

```bash
npm run build
# or
yarn build
```

This will generate a `dist` directory containing the optimized production build.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

The project follows a standard React application structure:

- [`public/`](Ai-Interview-Frontend/public/): Static assets.
- [`src/`](Ai-Interview-Frontend/src/): Main application source code.
  - [`assets/`](Ai-Interview-Frontend/src/assets/): Images and other static assets.
  - [`components/`](Ai-Interview-Frontend/src/components/): Reusable UI components.
    - [`Cards/`](Ai-Interview-Frontend/src/components/Cards/): Card components.
    - [`Inputs/`](Ai-Interview-Frontend/src/components/Inputs/): Input components.
    - [`layouts/`](Ai-Interview-Frontend/src/components/layouts/): Layout components.
    - [`Loader/`](Ai-Interview-Frontend/src/components/Loader/): Loader components.
    - [`ui/`](Ai-Interview-Frontend/src/components/ui/): Shadcn UI components.
  - [`context/`](Ai-Interview-Frontend/src/context/): React context for global state management.
  - [`lib/`](Ai-Interview-Frontend/src/lib/): Utility functions and schema definitions.
  - [`pages/`](Ai-Interview-Frontend/src/pages/): Page-level components.
    - [`Auth/`](Ai-Interview-Frontend/src/pages/Auth/): Authentication related pages.
    - [`Home/`](Ai-Interview-Frontend/src/pages/Home/): Home/Dashboard related pages.
    - [`InterviewPrep/`](Ai-Interview-Frontend/src/pages/InterviewPrep/): Interview preparation pages.
  - [`utils/`](Ai-Interview-Frontend/src/utils/): General utility functions and API configurations.
  - [`App.jsx`](Ai-Interview-Frontend/src/App.jsx): Main application component.
  - [`index.css`](Ai-Interview-Frontend/src/index.css): Global CSS styles.
  - [`main.jsx`](Ai-Interview-Frontend/src/main.jsx): Entry point of the application.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A fast build tool that provides a lightning-fast development experience.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Radix UI**: A low-level UI component library for building accessible design systems.
- **Axios**: Promise based HTTP client for the browser and node.js.
- **React Router DOM**: Declarative routing for React.js.
- **Zod**: TypeScript-first schema declaration and validation library.
