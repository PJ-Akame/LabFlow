// =============================================================================
// JupyterLab AI-Dev Extension - Complete Project Structure
// =============================================================================

/* 
プロジェクト構成:
ai-dev-extension/
├── package.json                 # パッケージ設定
├── tsconfig.json               # TypeScript設定
├── webpack.config.js           # ビルド設定
├── jupyter-config/
│   └── ai_dev_extension.json   # JupyterLab設定
├── src/
│   ├── index.ts               # メインエントリーポイント (このファイル)
│   ├── components/            # React コンポーネント
│   │   ├── ColabPanel.tsx     # Colabクラスタパネル
│   │   ├── HuggingFacePanel.tsx # HF連携パネル
│   │   ├── ClaudeChat.tsx     # Claude AIチャット
│   │   └── SettingsPanel.tsx  # 設定パネル
│   ├── managers/              # 各種マネージャー
│   │   ├── ColabManager.ts    # Colab接続・管理
│   │   ├── AuthManager.ts     # 認証管理
│   │   ├── HFManager.ts       # HuggingFace連携
│   │   └── ClaudeManager.ts   # Claude API管理
│   ├── magics/                # Magic Commands
│   │   ├── colab_magics.py    # %colab_* commands
│   │   ├── hf_magics.py       # %hf_* commands
│   │   └── claude_magics.py   # %claude commands
│   └── styles/
│       └── index.css          # スタイル
├── python_backend/            # Pythonバックエンド
│   ├── ai_dev_server.py       # FastAPI サーバー
│   ├── colab_bridge.py        # Colab連携処理
│   └── auth_handler.py        # 認証処理
└── colab_setup/               # Colab側セットアップ
    └── colab_api_server.py    # Colab側APIサーバー
*/

// =============================================================================
// MAIN INDEX.TS - JupyterLab Extension Entry Point
// =============================================================================

import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Widget } from '@lumino/widgets';
import { Menu } from '@lumino/widgets';

// Custom Components
import { ColabClusterWidget } from './components/ColabClusterWidget';
import { AIDevSidePanel } from './components/AIDevSidePanel';

// Managers
import { ColabManager } from './managers/ColabManager';
import { AuthManager } from './managers/AuthManager';
import { HFManager } from './managers/HFManager';
import { ClaudeManager } from './managers/ClaudeManager';

// Styles
import '../style/index.css';

/**
 * Extension ID and settings
 */
const EXTENSION_ID = 'ai-dev-extension';
const PLUGIN_ID = `${EXTENSION_ID}:plugin`;

/**
 * The main plugin interface
 */
interface IExternalExtension {
  colabManager: ColabManager;
  authManager: AuthManager;
  hfManager: HFManager;
  claudeManager: ClaudeManager;
}

/**
 * Main extension plugin
 */
const plugin: JupyterFrontEndPlugin<IExternalExtension> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer, ISettingRegistry],
  optional: [ILauncher, IMainMenu],
  provides: IExternalExtension,
  activate: activateExtension
};

/**
 * Extension activation function
 */
function activateExtension(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer,
  settingRegistry: ISettingRegistry,
  launcher: ILauncher | null,
  mainMenu: IMainMenu | null
): IExternalExtension {
  
  console.log('🚀 AI-Dev Extension activating...');

  // Initialize managers
  const authManager = new AuthManager(settingRegistry);
  const colabManager = new ColabManager(authManager);
  const hfManager = new HFManager(authManager);
  const claudeManager = new ClaudeManager(authManager);

  // Create side panel widget
  const sidePanel = new AIDevSidePanel({
    colabManager,
    authManager,
    hfManager,
    claudeManager
  });
  sidePanel.id = 'ai-dev-sidepanel';
  sidePanel.title.label = 'AI Dev';
  sidePanel.title.caption = 'AI Development Tools';
  sidePanel.title.iconClass = 'jp-ai-dev-icon';

  // Create main cluster widget
  const clusterWidget = new ColabClusterWidget(colabManager);
  const mainWidget = new MainAreaWidget<ColabClusterWidget>({
    content: clusterWidget
  });
  mainWidget.id = 'ai-dev-cluster';
  mainWidget.title.label = 'AI Cluster Monitor';
  mainWidget.title.closable = true;

  // Widget tracker for state restoration
  const tracker = new WidgetTracker<MainAreaWidget<ColabClusterWidget>>({
    namespace: 'ai-dev-cluster'
  });

  // Add to side panel
  app.shell.add(sidePanel, 'left', { rank: 300 });

  // Register commands
  registerCommands(app, palette, sidePanel, mainWidget, tracker, {
    colabManager,
    authManager, 
    hfManager,
    claudeManager
  });

  // Add to main menu
  if (mainMenu) {
    addToMainMenu(mainMenu, app);
  }

  // Add to launcher
  if (launcher) {
    addToLauncher(launcher, app);
  }

  // Handle state restoration
  restorer.add(sidePanel, 'ai-dev-sidepanel');
  restorer.restore(tracker, {
    command: 'ai-dev:open-cluster',
    name: () => 'ai-dev-cluster'
  });

  console.log('✅ AI-Dev Extension activated successfully');

  return {
    colabManager,
    authManager,
    hfManager,
    claudeManager
  };
}

/**
 * Register all extension commands
 */
function registerCommands(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  sidePanel: AIDevSidePanel,
  mainWidget: MainAreaWidget<ColabClusterWidget>,
  tracker: WidgetTracker<MainAreaWidget<ColabClusterWidget>>,
  managers: IExternalExtension
) {
  
  const { colabManager, authManager, hfManager, claudeManager } = managers;

  // =============================================
  // Colab Commands
  // =============================================
  
  app.commands.addCommand('ai-dev:connect-colab', {
    label: 'Connect to Colab',
    caption: 'Connect to Google Colab instance',
    execute: async () => {
      const url = await showInputDialog('Enter Colab ngrok URL:');
      if (url) {
        try {
          await colabManager.connectToColab(url);
          sidePanel.refreshColabStatus();
          showNotification('✅ Connected to Colab successfully');
        } catch (error) {
          showNotification('❌ Failed to connect to Colab');
        }
      }
    }
  });

  app.commands.addCommand('ai-dev:open-cluster', {
    label: 'Open Cluster Monitor',
    caption: 'Open AI cluster monitoring dashboard',
    execute: () => {
      if (!mainWidget.isAttached) {
        app.shell.add(mainWidget, 'main');
      }
      app.shell.activateById(mainWidget.id);
    }
  });

  app.commands.addCommand('ai-dev:train-distributed', {
    label: 'Start Distributed Training',
    caption: 'Start distributed training across Colab cluster',
    execute: async () => {
      // Get current notebook
      const notebook = app.shell.currentWidget;
      if (notebook) {
        await colabManager.startDistributedTraining(notebook);
      }
    }
  });

  // =============================================
  // HuggingFace Commands  
  // =============================================

  app.commands.addCommand('ai-dev:hf-login', {
    label: 'HuggingFace Login',
    caption: 'Authenticate with HuggingFace Hub',
    execute: async () => {
      const token = await showInputDialog('Enter HuggingFace Token:');
      if (token) {
        await hfManager.login(token);
        sidePanel.refreshHFStatus();
      }
    }
  });

  app.commands.addCommand('ai-dev:hf-push-model', {
    label: 'Push Model to HF Hub',
    caption: 'Upload trained model to HuggingFace Hub',
    execute: async () => {
      const modelName = await showInputDialog('Enter model name:');
      if (modelName) {
        await hfManager.pushModel(modelName);
      }
    }
  });

  // =============================================
  // Claude Commands
  // =============================================

  app.commands.addCommand('ai-dev:claude-analyze', {
    label: 'Analyze with Claude',
    caption: 'Send current cell/notebook to Claude for analysis',
    execute: async () => {
      const notebook = app.shell.currentWidget;
      if (notebook) {
        await claudeManager.analyzeNotebook(notebook);
        sidePanel.showClaudePanel();
      }
    }
  });

  app.commands.addCommand('ai-dev:claude-optimize', {
    label: 'Optimize Code with Claude',
    caption: 'Get code optimization suggestions from Claude',
    execute: async () => {
      const notebook = app.shell.currentWidget;
      if (notebook) {
        await claudeManager.optimizeCode(notebook);
      }
    }
  });

  // =============================================
  // Settings Commands
  // =============================================

  app.commands.addCommand('ai-dev:open-settings', {
    label: 'AI-Dev Settings',
    caption: 'Open AI development extension settings',
    execute: () => {
      sidePanel.showSettingsPanel();
    }
  });

  // Add commands to palette
  const category = 'AI Development';
  
  palette.addItem({ command: 'ai-dev:connect-colab', category });
  palette.addItem({ command: 'ai-dev:open-cluster', category });
  palette.addItem({ command: 'ai-dev:train-distributed', category });
  palette.addItem({ command: 'ai-dev:hf-login', category });
  palette.addItem({ command: 'ai-dev:hf-push-model', category });
  palette.addItem({ command: 'ai-dev:claude-analyze', category });
  palette.addItem({ command: 'ai-dev:claude-optimize', category });
  palette.addItem({ command: 'ai-dev:open-settings', category });
}

/**
 * Add to main menu
 */
function addToMainMenu(mainMenu: IMainMenu, app: JupyterFrontEnd) {
  const aiDevMenu = new Menu({ commands: app.commands });
  aiDevMenu.title.label = 'AI-Dev';
  
  // Colab submenu
  const colabMenu = new Menu({ commands: app.commands });
  colabMenu.title.label = 'Colab';
  colabMenu.addItem({ command: 'ai-dev:connect-colab' });
  colabMenu.addItem({ command: 'ai-dev:train-distributed' });
  colabMenu.addItem({ command: 'ai-dev:open-cluster' });
  
  // HuggingFace submenu
  const hfMenu = new Menu({ commands: app.commands });
  hfMenu.title.label = 'HuggingFace';
  hfMenu.addItem({ command: 'ai-dev:hf-login' });
  hfMenu.addItem({ command: 'ai-dev:hf-push-model' });
  
  // Claude submenu
  const claudeMenu = new Menu({ commands: app.commands });
  claudeMenu.title.label = 'Claude AI';
  claudeMenu.addItem({ command: 'ai-dev:claude-analyze' });
  claudeMenu.addItem({ command: 'ai-dev:claude-optimize' });
  
  aiDevMenu.addItem({ type: 'submenu', submenu: colabMenu });
  aiDevMenu.addItem({ type: 'submenu', submenu: hfMenu });
  aiDevMenu.addItem({ type: 'submenu', submenu: claudeMenu });
  aiDevMenu.addItem({ type: 'separator' });
  aiDevMenu.addItem({ command: 'ai-dev:open-settings' });
  
  mainMenu.addMenu(aiDevMenu, { rank: 80 });
}

/**
 * Add to launcher
 */
function addToLauncher(launcher: ILauncher, app: JupyterFrontEnd) {
  launcher.add({
    command: 'ai-dev:open-cluster',
    category: 'AI Development',
    rank: 1
  });
}

/**
 * Utility functions
 */
async function showInputDialog(message: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = prompt(message);
    resolve(input);
  });
}

function showNotification(message: string) {
  console.log(message);
  // 実際の実装では JupyterLab notification system を使用
}

// Export the plugin
export default plugin;

// =============================================================================
// PACKAGE.JSON CONFIGURATION
// =============================================================================

/*
{
  "name": "ai-dev-extension",
  "version": "1.0.0",
  "description": "AI Development Extension for JupyterLab with Colab & HuggingFace integration",
  "keywords": [
    "jupyter",
    "jupyterlab",
    "jupyterlab-extension",
    "ai",
    "colab",
    "huggingface",
    "claude"
  ],
  "homepage": "https://github.com/username/ai-dev-extension",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/ai-dev-extension.git"
  },
  "license": "MIT",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "files": [
    "lib/**/*.{d.ts,eot,gif,html,jpg,js,js.map,json,png,svg,woff2,ttf}",
    "style/**/*.{css,js,eot,gif,html,jpg,json,png,svg,woff2,ttf}",
    "python_backend/**/*.py"
  ],
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "style": "style/index.css",
  "scripts": {
    "build": "jlpm build:lib && jlpm build:labextension:dev",
    "build:prod": "jlpm clean && jlpm build:lib && jlpm build:labextension",
    "build:labextension": "jupyter labextension build .",
    "build:labextension:dev": "jupyter labextension build --development True .",
    "build:lib": "tsc",
    "clean": "jlpm clean:lib",
    "clean:lib": "rimraf lib tsconfig.tsbuildinfo",
    "clean:lintcache": "rimraf .eslintcache .stylelintcache",
    "clean:labextension": "rimraf ai_dev_extension/labextension",
    "clean:all": "jlpm clean:lib && jlpm clean:labextension && jlpm clean:lintcache",
    "eslint": "jlpm eslint:check --fix",
    "eslint:check": "eslint . --cache --ext .ts,.tsx",
    "install:extension": "jlpm build",
    "lint": "jlpm stylelint && jlpm prettier && jlpm eslint",
    "lint:check": "jlpm stylelint:check && jlpm prettier:check && jlpm eslint:check",
    "prettier": "jlpm prettier:base --write --list-different",
    "prettier:base": "prettier \"**/*{.ts,.tsx,.js,.jsx,.css,.json,.md}\"",
    "prettier:check": "jlpm prettier:base --check",
    "stylelint": "jlpm stylelint:check --fix",
    "stylelint:check": "stylelint --cache \"style/**/*.css\"",
    "watch": "run-p watch:src watch:labextension",
    "watch:src": "tsc -w",
    "watch:labextension": "jupyter labextension watch ."
  },
  "dependencies": {
    "@jupyterlab/application": "^4.0.0",
    "@jupyterlab/apputils": "^4.0.0",
    "@jupyterlab/coreutils": "^6.0.0",
    "@jupyterlab/launcher": "^4.0.0",
    "@jupyterlab/mainmenu": "^4.0.0",
    "@jupyterlab/notebook": "^4.0.0",
    "@jupyterlab/services": "^7.0.0",
    "@jupyterlab/settingregistry": "^4.0.0",
    "@lumino/widgets": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@jupyterlab/builder": "^4.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "rimraf": "^5.0.0",
    "typescript": "~5.0.0"
  },
  "jupyterlab": {
    "extension": true,
    "outputDir": "ai_dev_extension/labextension",
    "schemaDir": "schema"
  }
}
*/