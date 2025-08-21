
# Open LLM Chat

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/vite-%5E4.0.0-brightgreen)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://react.dev/)

A modern ChatGPT-like AI assistant interface built with React. Start conversations, get intelligent responses, and manage your chat history. Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn-ui**.

**Supported AI Providers:**
- OpenAI (GPT models)
- OpenRouter (Multiple AI models including Mistral, Claude, etc.)

▶️ **[Live Demo](https://open-llm-chat.vercel.app/)**  

![Preview](/public/images/image.png)

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
git clone https://github.com/HadiuzzamanBappy/AI-Chat.git
cd AI-Chat
npm install
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.

## What technologies are used for this project?

- shadcn-ui
- Tailwind CSS

## ✅ Next Steps

# React to APK Project

- [Android Studio](https://developer.android.com/studio) (including the Android SDK)

---

## Part 1: Initial Setup & First APK Build

Follow these steps the first time you are creating the APK.

### Step 1: Install Dependencies & Build Web App

Install all project dependencies and create a production build of the React app.

# Create the production web build

npm run build

```

Initialize Capacitor, configure it, and add the native Android platform.

```bash
# Install Capacitor CLI and core packages
npm install @capacitor/core @capacitor/cli --save-dev
npm install @capacitor/android

# Initialize Capacitor (you will be prompted for app name and package ID)
npx cap init

# IMPORTANT: Edit the new 'capacitor.config.json' file and set the "webDir" to "build" (or "dist" if that's your output folder).
# Example: "webDir": "build"

# Add the Android platform to your project
npx cap add android
```

### Step 3: Sync Your Web App

Copy your production build files into the native Android project.

```bash
### Step 4: Build the APK in Android Studio

npx cap open android
3.  Select **APK** and click **Next**.
# AI-Chat

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/vite-%5E4.0.0-brightgreen)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://react.dev/)

A modern, open-source frontend for a ChatGPT-style AI chat application, built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn-ui**. Designed for extensibility, rapid prototyping, and future backend integration.

4.  Click **Create new...** to generate a new keystore.

5.  **SAVE THIS KEYSTORE FILE AND REMEMBER THE PASSWORDS.** You will need it for every future update.

---

## ✨ Features

- Chat with multiple AI models (OpenAI GPT, Mistral, Claude via OpenRouter)
- Beautiful, responsive UI with dark/light theme support
- Switch between different AI providers and models
- Mobile-ready and Android APK support via Capacitor
- Easy to extend and customize
- Real-time conversations with intelligent responses

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) & npm
- [Android Studio](https://developer.android.com/studio) (for APK builds)

### API Setup

You'll need API keys from the following providers to use AI models:

1. **OpenAI API Key** (for GPT models)
   - Get your API key from [OpenAI Platform](https://platform.openai.com/)
   
2. **OpenRouter API Key** (for multiple AI models)
   - Get your API key from [OpenRouter](https://openrouter.ai/)

Create a `.env.local` file in the root directory:

```bash
VITE_OPENAI_API_KEY="your-openai-api-key-here"
VITE_OPENROUTER_API_KEY="your-openrouter-api-key-here"
```

### Local Development

```sh
git clone https://github.com/HadiuzzamanBappy/AI-Chat.git
cd AI-Chat
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```sh
npm run build
```

### Convert to Android APK

See the "React to APK Project" section below for full instructions.

---

## 📚 Technologies Used

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn-ui

---

## 🤝 How to Contribute

We welcome contributions! To get started:

1. **Fork the repository**
2. **Create a new branch** for your feature or fix
3. **Commit your changes** with clear messages
4. **Open a Pull Request** describing your changes

### Contribution Ideas

- New UI components or templates
- Improved mobile experience
- Integrations with new AI models or APIs
- Bug fixes, performance optimizations
- Documentation improvements

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guidelines](CONTRIBUTING.md) (coming soon).

---

## 📅 Roadmap & Future Plans

- Backend integration (OpenAI, local LLMs, etc.)
- User authentication (JWT, OAuth)
- Database support (PostgreSQL, MongoDB, MySQL)
- Caching, pagination, and performance improvements
- More starter templates and UI themes
- Community plugin system

---

## 📝 License

This project is licensed under the MIT License.

---

## 📦 React to APK Project

This guide outlines the process for converting this React web application into a native Android APK using Capacitor.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) (including the Android SDK)

---

### Part 1: Initial Setup & First APK Build

1. **Install Dependencies & Build Web App**
 ```sh
 npm install
 npm run build
 ```

2. **Setup Capacitor**
 ```sh
 npm install @capacitor/core @capacitor/cli --save-dev
 npm install @capacitor/android
 npx cap init
 # Edit 'capacitor.config.json' and set "webDir" to "build"
 npx cap add android
 ```

3. **Sync Your Web App**
 ```sh
 npx cap sync
 ```

4. **Build the APK in Android Studio**
 ```sh
 npx cap open android
 ```

	- Wait for Android Studio to finish its Gradle sync.
 - Go to **Build > Generate Signed Bundle / APK...**
 - Select **APK** and click **Next**.
 - Click **Create new...** to generate a new keystore.
 - **Save your keystore file and passwords for future updates.**
 - Select the `release` build variant and click **Finish**.
 - Your signed `app-release.apk` will be in `android/app/release/`.

---

### Part 2: Workflow for Updating the App

1. **Build Latest Web App Changes**
 ```sh
 npm run build
 ```

2. **Update App Version**
 - Open `android/app/build.gradle`.
 - Increment `versionCode` and optionally update `versionName`.
3. **Sync Your Changes**
 ```sh
 npx cap sync
 ```

4. **Rebuild the APK**
 ```sh
 npx cap open android
 ```

	- Use your existing keystore file and passwords.
 - Select the `release` build variant and click **Finish**.
 - Your updated APK will be ready for distribution.

---

6. Follow the prompts to select the `release` build variant and click **Finish**.

Your signed `app-release.apk` file will be generated in the `android/app/release/` folder.

---

### Step 1: Build Your Latest Web App Changes

Create a new production build containing your updates.

```bash
npm run build
```

2. Find `versionCode` and increment its integer value (e.g., from `1` to `2`).
3. Optionally, update the `versionName` string (e.g., from `"1.0"` to `"1.1"`).

```bash
npx cap sync
```

### Step 4: Rebuild the APK


```bash
# Open the project in Android Studio
npx cap open android
```

1. Go to the menu: **Build > Generate Signed Bundle / APK...**
2. Select **APK** and click **Next**.
3. **USE YOUR EXISTING KEYSTORE FILE** from the first build. Enter your saved passwords. **Do not create a new one.**
4. Select the `release` build variant and click **Finish**.

This will generate your updated APK, ready for distribution.
