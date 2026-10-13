Fils — E-Commerce Store

A modern e-commerce web application built with Next.js, React, TypeScript, and Tailwind CSS, designed to provide a clean and responsive online shopping experience.

🌐 Live Demo: fils-ecommerce-store.vercel.app

📦 Repository: fils_ecommerce_store

✨ Overview

Fils is a web-based e-commerce project focused on building a modern online storefront with a responsive user interface and a scalable frontend architecture.

The project uses the Next.js framework alongside reusable React components, TypeScript for type safety, and Tailwind CSS for styling.

🚀 Tech Stack

Framework: Next.js 13

Frontend: React 18

Language: TypeScript

Styling: Tailwind CSS

Authentication: Clerk

State Management: Zustand

HTTP Requests: Axios

UI Components: Headless UI

Icons: Lucide React

Notifications: React Hot Toast

Deployment: Vercel

📋 Prerequisites

Before running the project, make sure you have the following installed:

Node.js — a compatible version for Next.js 13

npm (included with Node.js)

Git

⚙️ Getting Started

Follow these steps to run the project locally.

1. Clone the repository

git clone https://github.com/asmacharfi/fils_ecommerce_store.git

2. Navigate to the project directory

cd fils_ecommerce_store

3. Install dependencies

npm install

4. Configure environment variables

Create a .env.local file in the root directory and configure the environment variables required by the application.

Use the provided .env.example file as a reference:

cp .env.example .env.local

Update the values according to your local environment and the services used by the project. Do not commit secret keys or credentials to GitHub.

5. Start the development server

npm run dev

Open http://localhost:3000 in your browser to access the application.

🛠️ Available Scripts

Command

Description

npm run dev

Starts the development server

npm run build

Builds the application for production

npm run start

Starts the production server

npm run lint

Runs the configured linting command

npm run verify:catalog

Runs the catalog API verification script

📁 Project Structure

The repository is organized into the following main directories and files:

fils_ecommerce_store/
├── actions/       # Application actions
├── app/           # Next.js application routes and pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Shared utilities and libraries
├── providers/     # Application providers
├── public/        # Static assets
├── scripts/       # Utility and verification scripts
├── .env.example   # Environment variable template
├── middleware.ts  # Request middleware
├── next.config.js # Next.js configuration
├── package.json   # Dependencies and npm scripts
├── tailwind.config.js
├── tsconfig.json  # TypeScript configuration
└── README.md

🌍 Deployment

The project is deployed on Vercel.

Live application: https://fils-ecommerce-store.vercel.app/

To deploy your own instance:

Fork or import the repository into your GitHub account.

Import the repository into Vercel.

Configure the required environment variables in the project settings.

Deploy the application and verify that all required services are configured correctly.

## AI-Powered Features

Fils aims to enhance the online shopping experience through AI-powered capabilities that help users discover products and interact with the store more intuitively.

Depending on the features implemented in the project, this section can document:

- **AI Shopping Assistant:** Helps users find products and get answers to shopping-related questions through natural-language conversations.
- **Intelligent Product Discovery:** Enables users to describe what they are looking for using natural language.
- **Personalized Recommendations:** Suggests relevant products based on user preferences and shopping context.
- **AI-Powered Customer Support:** Assists users with common product and store-related questions.

### AI Technology

Document the AI provider, model, and integration used in the project, including any required API keys and environment variables.

### How It Works

1. The user interacts with an AI-powered feature.
2. The application processes the request using the configured AI service.
3. Relevant product or store information is retrieved when applicable.
4. The AI generates a response or recommendation and returns it to the user.

*Note: Include only the AI capabilities and workflow that are implemented in the current version of the project.*


GitHub: @asmacharfi

Project: Fils E-Commerce Store

