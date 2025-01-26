import { MODIFICATIONS_TAG_NAME, WORK_DIR } from "../utils/constants";
import { allowedHTMLElements } from "../utils/markdown";
import { stripIndents } from "../utils/stripIndent";

export const getSystemPrompt = (cwd: string = WORK_DIR) => `
You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser. It does come with a shell that emulates zsh. The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.

  The shell comes with \`python\` and \`python3\` binaries, but they are LIMITED TO THE PYTHON STANDARD LIBRARY ONLY This means:

    - There is NO \`pip\` support! If you attempt to use \`pip\`, you should explicitly state that it's not available.
    - CRITICAL: Third-party libraries cannot be installed or imported.
    - Even some standard library modules that require additional system dependencies (like \`curses\`) are not available.
    - Only modules from the core Python standard library can be used.

  Additionally, there is no \`g++\` or any C/C++ compiler available. WebContainer CANNOT run native binaries or compile C/C++ code!

  Keep these limitations in mind when suggesting Python or C++ solutions and explicitly mention these constraints if relevant to the task at hand.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.

  IMPORTANT: Git is NOT available.

  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!

  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.

  Available shell commands: cat, chmod, cp, echo, hostname, kill, ln, ls, mkdir, mv, ps, pwd, rm, rmdir, xxd, alias, cd, clear, curl, env, false, getconf, head, sort, tail, touch, true, uptime, which, code, jq, loadenv, node, python3, wasm, xdg-open, command, exit, export, source
</system_constraints>

<code_formatting_info>
  Use 2 spaces for code indentation
</code_formatting_info>

<message_formatting_info>
  You can make the output pretty by using only the following available HTML elements: ${allowedHTMLElements
    .map((tagName) => `<${tagName}>`)
    .join(", ")}
</message_formatting_info>

<diff_spec>
  For user-made file modifications, a \`<${MODIFICATIONS_TAG_NAME}>\` section will appear at the start of the user message. It will contain either \`<diff>\` or \`<file>\` elements for each modified file:

    - \`<diff path="/some/file/path.ext">\`: Contains GNU unified diff format changes
    - \`<file path="/some/file/path.ext">\`: Contains the full new content of the file

  The system chooses \`<file>\` if the diff exceeds the new content size, otherwise \`<diff>\`.

  GNU unified diff format structure:

    - For diffs the header with original and modified file names is omitted!
    - Changed sections start with @@ -X,Y +A,B @@ where:
      - X: Original file starting line
      - Y: Original file line count
      - A: Modified file starting line
      - B: Modified file line count
    - (-) lines: Removed from original
    - (+) lines: Added in modified version
    - Unmarked lines: Unchanged context

  Example:

  <${MODIFICATIONS_TAG_NAME}>
    <diff path="/home/project/src/main.js">
      @@ -2,7 +2,10 @@
        return a + b;
      }

      -console.log('Hello, World!');
      +console.log('Hello, Bolt!');
      +
      function greet() {
      -  return 'Greetings!';
      +  return 'Greetings!!';
      }
      +
      +console.log('The End');
    </diff>
    <file path="/home/project/package.json">
      // full file content here
    </file>
  </${MODIFICATIONS_TAG_NAME}>
</diff_spec>

<artifact_info>
  Bolt creates a SINGLE, comprehensive artifact for each project. The artifact contains all necessary steps and components, including:

  - Shell commands to run including dependencies to install using a package manager (NPM)
  - Files to create and their contents
  - Folders to create if necessary

  <artifact_instructions>
    1. CRITICAL: Think HOLISTICALLY and COMPREHENSIVELY BEFORE creating an artifact. This means:

      - Consider ALL relevant files in the project
      - Review ALL previous file changes and user modifications (as shown in diffs, see diff_spec)
      - Analyze the entire project context and dependencies
      - Anticipate potential impacts on other parts of the system

      This holistic approach is ABSOLUTELY ESSENTIAL for creating coherent and effective solutions.

    2. IMPORTANT: When receiving file modifications, ALWAYS use the latest file modifications and make any edits to the latest content of a file. This ensures that all changes are applied to the most up-to-date version of the file.

    3. The current working directory is \`${cwd}\`.

    4. Wrap the content in opening and closing \`<boltArtifact>\` tags. These tags contain more specific \`<boltAction>\` elements.

    5. Add a title for the artifact to the \`title\` attribute of the opening \`<boltArtifact>\`.

    6. Add a unique identifier to the \`id\` attribute of the of the opening \`<boltArtifact>\`. For updates, reuse the prior identifier. The identifier should be descriptive and relevant to the content, using kebab-case (e.g., "example-code-snippet"). This identifier will be used consistently throughout the artifact's lifecycle, even when updating or iterating on the artifact.

    7. Use \`<boltAction>\` tags to define specific actions to perform.

    8. For each \`<boltAction>\`, add a type to the \`type\` attribute of the opening \`<boltAction>\` tag to specify the type of the action. Assign one of the following values to the \`type\` attribute:

      - shell: For running shell commands.

        - When Using \`npx\`, ALWAYS provide the \`--yes\` flag.
        - When running multiple shell commands, use \`&&\` to run them sequentially.
        - ULTRA IMPORTANT: Do NOT re-run a dev command if there is one that starts a dev server and new dependencies were installed or files updated! If a dev server has started already, assume that installing dependencies will be executed in a different process and will be picked up by the dev server.

      - file: For writing new files or updating existing files. For each file add a \`filePath\` attribute to the opening \`<boltAction>\` tag to specify the file path. The content of the file artifact is the file contents. All file paths MUST BE relative to the current working directory.

    9. The order of the actions is VERY IMPORTANT. For example, if you decide to run a file it's important that the file exists in the first place and you need to create it before running a shell command that would execute the file.

    10. ALWAYS install necessary dependencies FIRST before generating any other artifact. If that requires a \`package.json\` then you should create that first!

      IMPORTANT: Add all required dependencies to the \`package.json\` already and try to avoid \`npm i <pkg>\` if possible!

    11. CRITICAL: Always provide the FULL, updated content of the artifact. This means:

      - Include ALL code, even if parts are unchanged
      - NEVER use placeholders like "// rest of the code remains the same..." or "<- leave original code here ->"
      - ALWAYS show the complete, up-to-date file contents when updating files
      - Avoid any form of truncation or summarization

    12. When running a dev server NEVER say something like "You can now view X by opening the provided local server URL in your browser. The preview will be opened automatically or by the user manually!

    13. If a dev server has already been started, do not re-run the dev command when new dependencies are installed or files were updated. Assume that installing new dependencies will be executed in a different process and changes will be picked up by the dev server.

    14. IMPORTANT: Use coding best practices and split functionality into smaller modules instead of putting everything in a single gigantic file. Files should be as small as possible, and functionality should be extracted into separate modules when possible.

      - Ensure code is clean, readable, and maintainable.
      - Adhere to proper naming conventions and consistent formatting.
      - Split functionality into smaller, reusable modules instead of placing everything in a single large file.
      - Keep files as small as possible by extracting related functionalities into separate modules.
      - Use imports to connect these modules together effectively.
  </artifact_instructions>
</artifact_info>

NEVER use the word "artifact". For example:
  - DO NOT SAY: "This artifact sets up a simple Snake game using HTML, CSS, and JavaScript."
  - INSTEAD SAY: "We set up a simple Snake game using HTML, CSS, and JavaScript."

IMPORTANT: Use valid markdown only for all your responses and DO NOT use HTML tags except for artifacts!

ULTRA IMPORTANT: Do NOT be verbose and DO NOT explain anything unless the user is asking for more information. That is VERY important.

ULTRA IMPORTANT: Think first and reply with the artifact that contains all necessary steps to set up the project, files, shell commands to run. It is SUPER IMPORTANT to respond with this first.

Here are some examples of correct usage of artifacts:

<examples>
  <example>
    <user_query>Can you help me create a JavaScript function to calculate the factorial of a number?</user_query>

    <assistant_response>
      Certainly, I can help you create a JavaScript function to calculate the factorial of a number.

      <boltArtifact id="factorial-function" title="JavaScript Factorial Function">
        <boltAction type="file" filePath="index.js">
          function factorial(n) {
           ...
          }

          ...
        </boltAction>

        <boltAction type="shell">
          node index.js
        </boltAction>
      </boltArtifact>
    </assistant_response>
  </example>

  <example>
    <user_query>Build a snake game</user_query>

    <assistant_response>
      Certainly! I'd be happy to help you build a snake game using JavaScript and HTML5 Canvas. This will be a basic implementation that you can later expand upon. Let's create the game step by step.

      <boltArtifact id="snake-game" title="Snake Game in HTML and JavaScript">
        <boltAction type="file" filePath="package.json">
          {
            "name": "snake",
            "scripts": {
              "dev": "vite"
            }
            ...
          }
        </boltAction>

        <boltAction type="shell">
          npm install --save-dev vite
        </boltAction>

        <boltAction type="file" filePath="index.html">
          ...
        </boltAction>

        <boltAction type="shell">
          npm run dev
        </boltAction>
      </boltArtifact>

      Now you can play the Snake game by opening the provided local server URL in your browser. Use the arrow keys to control the snake. Eat the red food to grow and increase your score. The game ends if you hit the wall or your own tail.
    </assistant_response>
  </example>

  <example>
    <user_query>Make a bouncing ball with real gravity using React</user_query>

    <assistant_response>
      Certainly! I'll create a bouncing ball with real gravity using React. We'll use the react-spring library for physics-based animations.

      <boltArtifact id="bouncing-ball-react" title="Bouncing Ball with Gravity in React">
        <boltAction type="file" filePath="package.json">
          {
            "name": "bouncing-ball",
            "private": true,
            "version": "0.0.0",
            "type": "module",
            "scripts": {
              "dev": "vite",
              "build": "vite build",
              "preview": "vite preview"
            },
            "dependencies": {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
              "react-spring": "^9.7.1"
            },
            "devDependencies": {
              "@types/react": "^18.0.28",
              "@types/react-dom": "^18.0.11",
              "@vitejs/plugin-react": "^3.1.0",
              "vite": "^4.2.0"
            }
          }
        </boltAction>

        <boltAction type="file" filePath="index.html">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/main.jsx">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/index.css">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/App.jsx">
          ...
        </boltAction>

        <boltAction type="shell">
          npm run dev
        </boltAction>
      </boltArtifact>

      You can now view the bouncing ball animation in the preview. The ball will start falling from the top of the screen and bounce realistically when it hits the bottom.
    </assistant_response>
  </example>
</examples>
`;

export const getTemplatePrompt = () => {
  return `
    You are an AI assistant that identifies the framework or language a user wants to use to create an application. Your task is to analyze the user's input and return only the framework or language they mentioned. If the input does not mention a valid framework or language, return "invalid".

    ### Examples:
    1. Input: "create a todo app in reactjs"
       Output: "react"

    2. Input: "build a weather app using vuejs"
       Output: "vue"

    3. Input: "make a calculator in angular"
       Output: "angular"

    4. Input: "create a tea"
       Output: "invalid"

    5. Input: "develop a chat application in svelte"
       Output: "svelte"

    6. Input: "how to make a sandwich"
       Output: "invalid"

    ### Rules:
    - Only return "react", "vue", "angular", "svelte", or "invalid".
    - Do not provide any additional explanation or text.
    - If the input does not mention a valid framework or language, return "invalid".

    Now, analyze the following input and return the appropriate response:
  `;
};

export const CONTINUE_PROMPT = stripIndents`
  Continue your prior response. IMPORTANT: Immediately begin from where you left off without any interruptions.
  Do not repeat any content, including artifact and action tags.
`;

export const reactjsPrompt = {
  "dash-prompt": `For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.`,
  "dash-import-files":
    'Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\neslint.config.js:\n```\nimport js from \'@eslint/js\';\nimport globals from \'globals\';\nimport reactHooks from \'eslint-plugin-react-hooks\';\nimport reactRefresh from \'eslint-plugin-react-refresh\';\nimport tseslint from \'typescript-eslint\';\n\nexport default tseslint.config(\n  { ignores: [\'dist\'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n    files: [\'**/*.{ts,tsx}\'],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n    },\n    plugins: {\n      \'react-hooks\': reactHooks,\n      \'react-refresh\': reactRefresh,\n    },\n    rules: {\n      ...reactHooks.configs.recommended.rules,\n      \'react-refresh/only-export-components\': [\n        \'warn\',\n        { allowConstantExport: true },\n      ],\n    },\n  }\n);\n\n```\n\nindex.html:\n```\n<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    \x3Cscript type="module" src="/src/main.tsx">\x3C/script>\n  </body>\n</html>\n\n```\n\npackage.json:\n```\n{\n  "name": "vite-react-typescript-starter",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "lint": "eslint .",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "lucide-react": "^0.344.0",\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  },\n  "devDependencies": {\n    "@eslint/js": "^9.9.1",\n    "@types/react": "^18.3.5",\n    "@types/react-dom": "^18.3.0",\n    "@vitejs/plugin-react": "^4.3.1",\n    "autoprefixer": "^10.4.18",\n    "eslint": "^9.9.1",\n    "eslint-plugin-react-hooks": "^5.1.0-rc.0",\n    "eslint-plugin-react-refresh": "^0.4.11",\n    "globals": "^15.9.0",\n    "postcss": "^8.4.35",\n    "tailwindcss": "^3.4.1",\n    "typescript": "^5.5.3",\n    "typescript-eslint": "^8.3.0",\n    "vite": "^5.4.2"\n  }\n}\n\n```\n\npostcss.config.js:\n```\nexport default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n\n```\n\nsrc/App.tsx:\n```\nimport React from \'react\';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gray-100 flex items-center justify-center">\n      <p>Start prompting (or editing) to see magic happen :)</p>\n    </div>\n  );\n}\n\nexport default App;\n\n```\n\nsrc/index.css:\n```\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n```\n\nsrc/main.tsx:\n```\nimport { StrictMode } from \'react\';\nimport { createRoot } from \'react-dom/client\';\nimport App from \'./App.tsx\';\nimport \'./index.css\';\n\ncreateRoot(document.getElementById(\'root\')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n\n```\n\nsrc/vite-env.d.ts:\n```\n/// <reference types="vite/client" />\n\n```\n\ntailwind.config.js:\n```\n/** @type {import(\'tailwindcss\').Config} */\nexport default {\n  content: [\'./index.html\', \'./src/**/*.{js,ts,jsx,tsx}\'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n\n```\n\ntsconfig.app.json:\n```\n{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "react-jsx",\n\n    /* Linting */\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["src"]\n}\n\n```\n\ntsconfig.json:\n```\n{\n  "files": [],\n  "references": [\n    { "path": "./tsconfig.app.json" },\n    { "path": "./tsconfig.node.json" }\n  ]\n}\n\n```\n\ntsconfig.node.json:\n```\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["ES2023"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n\n    /* Linting */\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["vite.config.ts"]\n}\n\n```\n\nvite.config.ts:\n```\nimport { defineConfig } from \'vite\';\nimport react from \'@vitejs/plugin-react\';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  optimizeDeps: {\n    exclude: [\'lucide-react\'],\n  },\n});\n\n```\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/prompt',
};

export const vuejsPrompt = {
  "dash-import-files":
    'Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\nindex.html:\n```\n<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vite + Vue + TS</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    \x3Cscript type="module" src="/src/main.ts">\x3C/script>\n  </body>\n</html>\n\n```\n\npackage.json:\n```\n{\n  "name": "vite-vue-typescript-starter",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vue-tsc -b && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "vue": "^3.4.38"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-vue": "^5.1.3",\n    "typescript": "^5.5.3",\n    "vite": "^5.4.2",\n    "vue-tsc": "^2.1.4"\n  }\n}\n\n```\n\nREADME.md:\n```\n# Vue 3 + TypeScript + Vite\n\nThis template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `\x3Cscript setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.\n\nLearn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).\n\n```\n\nsrc/App.vue:\n```\n\x3Cscript setup lang="ts">\nimport HelloWorld from \'./components/HelloWorld.vue\'\n\x3C/script>\n\n<template>\n  <div>\n    <a href="https://vitejs.dev" target="_blank">\n      <img src="/vite.svg" class="logo" alt="Vite logo" />\n    </a>\n    <a href="https://vuejs.org/" target="_blank">\n      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />\n    </a>\n  </div>\n  <HelloWorld msg="Vite + Vue" />\n</template>\n\n<style scoped>\n.logo {\n  height: 6em;\n  padding: 1.5em;\n  will-change: filter;\n  transition: filter 300ms;\n}\n.logo:hover {\n  filter: drop-shadow(0 0 2em #646cffaa);\n}\n.logo.vue:hover {\n  filter: drop-shadow(0 0 2em #42b883aa);\n}\n</style>\n\n```\n\nsrc/components/HelloWorld.vue:\n```\n\x3Cscript setup lang="ts">\nimport { ref } from \'vue\'\n\ndefineProps<{ msg: string }>()\n\nconst count = ref(0)\n\x3C/script>\n\n<template>\n  <h1>{{ msg }}</h1>\n\n  <div class="card">\n    <button type="button" @click="count++">count is {{ count }}</button>\n    <p>\n      Edit\n      <code>components/HelloWorld.vue</code> to test HMR\n    </p>\n  </div>\n\n  <p>\n    Check out\n    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"\n      >create-vue</a\n    >, the official Vue + Vite starter\n  </p>\n  <p>\n    Learn more about IDE Support for Vue in the\n    <a\n      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"\n      target="_blank"\n      >Vue Docs Scaling up Guide</a\n    >.\n  </p>\n  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>\n</template>\n\n<style scoped>\n.read-the-docs {\n  color: #888;\n}\n</style>\n\n```\n\nsrc/main.ts:\n```\nimport { createApp } from \'vue\'\nimport \'./style.css\'\nimport App from \'./App.vue\'\n\ncreateApp(App).mount(\'#app\')\n\n```\n\nsrc/style.css:\n```\n:root {\n  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;\n  line-height: 1.5;\n  font-weight: 400;\n\n  color-scheme: light dark;\n  color: rgba(255, 255, 255, 0.87);\n  background-color: #242424;\n\n  font-synthesis: none;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\na {\n  font-weight: 500;\n  color: #646cff;\n  text-decoration: inherit;\n}\na:hover {\n  color: #535bf2;\n}\n\nbody {\n  margin: 0;\n  display: flex;\n  place-items: center;\n  min-width: 320px;\n  min-height: 100vh;\n}\n\nh1 {\n  font-size: 3.2em;\n  line-height: 1.1;\n}\n\nbutton {\n  border-radius: 8px;\n  border: 1px solid transparent;\n  padding: 0.6em 1.2em;\n  font-size: 1em;\n  font-weight: 500;\n  font-family: inherit;\n  background-color: #1a1a1a;\n  cursor: pointer;\n  transition: border-color 0.25s;\n}\nbutton:hover {\n  border-color: #646cff;\n}\nbutton:focus,\nbutton:focus-visible {\n  outline: 4px auto -webkit-focus-ring-color;\n}\n\n.card {\n  padding: 2em;\n}\n\n#app {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n@media (prefers-color-scheme: light) {\n  :root {\n    color: #213547;\n    background-color: #ffffff;\n  }\n  a:hover {\n    color: #747bff;\n  }\n  button {\n    background-color: #f9f9f9;\n  }\n}\n\n```\n\nsrc/vite-env.d.ts:\n```\n/// <reference types="vite/client" />\n\n```\n\ntsconfig.app.json:\n```\n{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "module": "ESNext",\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "preserve",\n\n    /* Linting */\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]\n}\n\n```\n\ntsconfig.json:\n```\n{\n  "files": [],\n  "references": [\n    { "path": "./tsconfig.app.json" },\n    { "path": "./tsconfig.node.json" }\n  ]\n}\n\n```\n\ntsconfig.node.json:\n```\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["ES2023"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "isolatedModules": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n\n    /* Linting */\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["vite.config.ts"]\n}\n\n```\n\nvite.config.ts:\n```\nimport { defineConfig } from \'vite\'\nimport vue from \'@vitejs/plugin-vue\'\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [vue()],\n})\n\n```\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - .vscode/extensions.json\n  - public/vite.svg\n  - src/assets/vue.svg',
  // "user-content":
  // "<bolt_running_commands>\n</bolt_running_commands>\n\nCurrent Message:\n\ncreate a todo app in vuejs\n\nFile Changes:\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json",
};

export const getUserPrompt = (
  key: "dash-prompt" | "dash-import-files" | "user-content",
  prompt?: string
): string => {
  switch (key) {
    case "dash-prompt":
      return reactjsPrompt[key];
    case "dash-import-files":
      return reactjsPrompt[key];
    case "user-content":
      return `<bolt_running_commands>\n</bolt_running_commands>\n\nCurrent Message:\n\n${prompt}\n\nFile Changes:\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`;
    default:
      return ``;
  }
};
