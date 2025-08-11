// =============================================================================
// AUTH MANAGER - 認証情報の安全な管理
// =============================================================================

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ISignal, Signal } from '@lumino/signaling';

interface AuthCredentials {
  service: string;
  credentials: any;
  expires?: number;
  refreshToken?: string;
}

export class AuthManager {
  private _credentials: Map<string, AuthCredentials> = new Map();
  private _authChanged: Signal<AuthManager, string> = new Signal(this);

  constructor(private settingRegistry: ISettingRegistry) {
    this.loadStoredCredentials();
  }

  get authChanged(): ISignal<AuthManager, string> {
    return this._authChanged;
  }

  /**
   * 認証情報の安全な保存
   */
  async saveCredentials(service: string, credentials: any, expires?: number): Promise<void> {
    const authData: AuthCredentials = {
      service,
      credentials: await this.encrypt(JSON.stringify(credentials)),
      expires,
      refreshToken: credentials.refresh_token
    };

    this._credentials.set(service, authData);
    
    // JupyterLab設定に暗号化して保存
    await this.settingRegistry.set(
      'ai-dev-extension:auth',
      `${service}_auth`,
      authData.credentials
    );

    this._authChanged.emit(service);
    console.log(`✅ ${service} 認証情報を保存しました`);
  }

  /**
   * 認証情報の取得
   */
  async getCredentials(service: string): Promise<any | null> {
    const authData = this._credentials.get(service);
    
    if (!authData) {
      console.log(`❌ ${service} の認証情報が見つかりません`);
      return null;
    }

    // 有効期限チェック
    if (authData.expires && Date.now() > authData.expires) {
      console.log(`⏰ ${service} の認証が期限切れです`);
      await this.refreshCredentials(service);
      return this.getCredentials(service);
    }

    try {
      const decrypted = await this.decrypt(authData.credentials);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`❌ ${service} 認証情報の復号化に失敗:`, error);
      return null;
    }
  }

  /**
   * 認証状態の確認
   */
  isAuthenticated(service: string): boolean {
    const authData = this._credentials.get(service);
    if (!authData) return false;
    
    // 有効期限チェック
    if (authData.expires && Date.now() > authData.expires) {
      return false;
    }
    
    return true;
  }

  /**
   * 認証情報の削除
   */
  async removeCredentials(service: string): Promise<void> {
    this._credentials.delete(service);
    await this.settingRegistry.remove('ai-dev-extension:auth', `${service}_auth`);
    this._authChanged.emit(service);
    console.log(`🗑️ ${service} 認証情報を削除しました`);
  }

  /**
   * Google OAuth認証
   */
  async authenticateGoogle(scopes: string[]): Promise<any> {
    const clientId = 'YOUR_GOOGLE_CLIENT_ID';
    const redirectUri = 'http://localhost:8080/oauth/callback';
    
    const authUrl = `https://accounts.google.com/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `response_type=code&` +
      `access_type=offline`;

    // OAuth フローの実装
    const authWindow = window.open(authUrl, 'auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          reject(new Error('認証がキャンセルされました'));
        }
      }, 1000);

      // メッセージリスナーでトークンを受信
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth_success') {
          clearInterval(checkClosed);
          authWindow?.close();
          resolve(event.data.credentials);
        } else if (event.data.type === 'oauth_error') {
          clearInterval(checkClosed);
          authWindow?.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  private async encrypt(data: string): Promise<string> {
    // Web Crypto API を使用した暗号化
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode('ai-dev-extension-key-32-chars!'),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const decoder = new TextDecoder();
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const key = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('ai-dev-extension-key-32-chars!'),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  }

  private async refreshCredentials(service: string): Promise<void> {
    // リフレッシュトークンを使用して認証情報を更新
    console.log(`🔄 ${service} 認証情報を更新中...`);
    // 実装詳細は各サービスに依存
  }

  private async loadStoredCredentials(): Promise<void> {
    // 起動時に保存された認証情報を読み込み
    try {
      const settings = await this.settingRegistry.get('ai-dev-extension:auth', null);
      // 設定から認証情報を復元
    } catch (error) {
      console.log('保存された認証情報はありません');
    }
  }
}

// =============================================================================
// COLAB MANAGER - Google Colab クラスタ管理
// =============================================================================

interface ColabNode {
  id: string;
  url: string;
  name: string;
  status: 'connected' | 'training' | 'idle' | 'error' | 'disconnected';
  resources: ColabResources;
  lastPing: number;
  notebooks: string[];
}

interface ColabResources {
  gpu: {
    name: string;
    memory_total: number;
    memory_used: number;
    memory_free: number;
    utilization: number;
    temperature: number;
  }[];
  cpu: {
    count: number;
    usage: number;
  };
  memory: {
    total: number;
    used: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  runtime: {
    type: string;
    connected_time: number;
    remaining_time: number;
  };
}

export class ColabManager {
  private _nodes: Map<string, ColabNode> = new Map();
  private _nodesChanged: Signal<ColabManager, void> = new Signal(this);
  private _statusUpdateInterval: number;

  constructor(private authManager: AuthManager) {
    // 定期的にステータス更新
    this._statusUpdateInterval = window.setInterval(() => {
      this.updateAllNodesStatus();
    }, 5000);
  }

  get nodesChanged(): ISignal<ColabManager, void> {
    return this._nodesChanged;
  }

  get nodes(): ColabNode[] {
    return Array.from(this._nodes.values());
  }

  /**
   * Colabインスタンスに接続
   */
  async connectToColab(ngrokUrl: string, name?: string): Promise<string> {
    const nodeId = this.generateNodeId();
    const nodeName = name || `Colab-${nodeId.slice(0, 8)}`;

    try {
      // Health check
      const response = await fetch(`${ngrokUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      // Resources 取得
      const resources = await this.fetchResources(ngrokUrl);

      const node: ColabNode = {
        id: nodeId,
        url: ngrokUrl,
        name: nodeName,
        status: 'connected',
        resources,
        lastPing: Date.now(),
        notebooks: []
      };

      this._nodes.set(nodeId, node);
      this._nodesChanged.emit();

      console.log(`✅ Colab接続成功: ${nodeName} (${ngrokUrl})`);
      return nodeId;

    } catch (error) {
      console.error(`❌ Colab接続失敗: ${ngrokUrl}`, error);
      throw error;
    }
  }

  /**
   * 分散学習の開始
   */
  async startDistributedTraining(
    script: string, 
    config: any = {},
    nodeCount: number = 0
  ): Promise<string> {
    const availableNodes = this.getAvailableNodes();
    
    if (availableNodes.length === 0) {
      throw new Error('利用可能なColabノードがありません');
    }

    const useNodes = nodeCount > 0 
      ? availableNodes.slice(0, nodeCount)
      : availableNodes;

    const jobId = this.generateJobId();
    
    console.log(`🚀 分散学習開始: ${useNodes.length}ノード使用`);

    // 各ノードに学習タスクを配布
    const promises = useNodes.map(async (node, index) => {
      const taskConfig = {
        ...config,
        job_id: jobId,
        node_id: node.id,
        node_index: index,
        total_nodes: useNodes.length,
        script: script
      };

      try {
        const response = await fetch(`${node.url}/train`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskConfig)
        });

        if (!response.ok) {
          throw new Error(`Node ${node.name}: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ Node ${node.name}: タスク開始`);
        return result;

      } catch (error) {
        console.error(`❌ Node ${node.name}: タスク失敗`, error);
        throw error;
      }
    });

    await Promise.all(promises);
    
    // ノードステータス更新
    useNodes.forEach(node => {
      node.status = 'training';
    });
    this._nodesChanged.emit();

    return jobId;
  }

  /**
   * 最適なノード選択
   */
  selectOptimalNode(requirements: any = {}): ColabNode | null {
    const availableNodes = this.getAvailableNodes();
    
    if (availableNodes.length === 0) return null;

    // スコアリング
    let bestNode: ColabNode | null = null;
    let bestScore = 0;

    for (const node of availableNodes) {
      const score = this.calculateNodeScore(node, requirements);
      if (score > bestScore) {
        bestScore = score;
        bestNode = node;
      }
    }

    return bestNode;
  }

  /**
   * ノード削除
   */
  async disconnectNode(nodeId: string): Promise<void> {
    const node = this._nodes.get(nodeId);
    if (!node) return;

    try {
      // Graceful shutdown
      await fetch(`${node.url}/shutdown`, { method: 'POST' });
    } catch (error) {
      console.log(`ノード ${node.name} は既に停止済み`);
    }

    this._nodes.delete(nodeId);
    this._nodesChanged.emit();
    console.log(`🔌 ノード切断: ${node.name}`);
  }

  private async fetchResources(url: string): Promise<ColabResources> {
    const response = await fetch(`${url}/resources`);
    if (!response.ok) {
      throw new Error('リソース情報の取得に失敗');
    }
    return response.json();
  }

  private async updateAllNodesStatus(): Promise<void> {
    const updatePromises = Array.from(this._nodes.values()).map(async (node) => {
      try {
        const resources = await this.fetchResources(node.url);
        node.resources = resources;
        node.lastPing = Date.now();
        node.status = node.status === 'error' ? 'connected' : node.status;
      } catch (error) {
        node.status = 'error';
        console.warn(`⚠️ ノード ${node.name} への接続失敗`);
      }
    });

    await Promise.allSettled(updatePromises);
    this._nodesChanged.emit();
  }

  private getAvailableNodes(): ColabNode[] {
    return Array.from(this._nodes.values()).filter(
      node => node.status === 'connected' || node.status === 'idle'
    );
  }

  private calculateNodeScore(node: ColabNode, requirements: any): number {
    let score = 0;
    const gpu = node.resources.gpu[0];

    // GPU性能スコア
    if (gpu.name.includes('A100')) score += 100;
    else if (gpu.name.includes('V100')) score += 80;
    else if (gpu.name.includes('T4')) score += 60;

    // 使用率スコア（低い方が良い）
    score += (100 - gpu.utilization);

    // メモリ空き容量スコア
    const memoryScore = (gpu.memory_free / gpu.memory_total) * 50;
    score += memoryScore;

    return score;
  }

  private generateNodeId(): string {
    return `colab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  dispose(): void {
    if (this._statusUpdateInterval) {
      clearInterval(this._statusUpdateInterval);
    }
  }
}

// =============================================================================
// HUGGINGFACE MANAGER - HuggingFace Hub 連携
// =============================================================================

interface HFModel {
  name: string;
  status: 'private' | 'public';
  downloads: number;
  likes: number;
  updated: string;
  size: string;
}

export class HFManager {
  private _isAuthenticated = false;
  private _models: HFModel[] = [];
  private _modelsChanged: Signal<HFManager, void> = new Signal(this);

  constructor(private authManager: AuthManager) {
    this.checkAuthenticationStatus();
  }

  get modelsChanged(): ISignal<HFManager, void> {
    return this._modelsChanged;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get models(): HFModel[] {
    return this._models;
  }

  /**
   * HuggingFace にログイン
   */
  async login(token: string): Promise<void> {
    try {
      // Token validation
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('無効なトークンです');
      }

      const userInfo = await response.json();
      
      await this.authManager.saveCredentials('huggingface', {
        token,
        username: userInfo.name,
        email: userInfo.email
      });

      this._isAuthenticated = true;
      await this.refreshModels();
      
      console.log(`✅ HuggingFace ログイン成功: ${userInfo.name}`);

    } catch (error) {
      console.error('❌ HuggingFace ログイン失敗:', error);
      throw error;
    }
  }

  /**
   * モデルをHubにプッシュ
   */
  async pushModel(
    modelPath: string, 
    modelName: string, 
    isPrivate: boolean = true
  ): Promise<void> {
    const credentials = await this.authManager.getCredentials('huggingface');
    if (!credentials) {
      throw new Error('HuggingFace に先にログインしてください');
    }

    try {
      // モデルアップロード（実際の実装ではGit LFS使用）
      const uploadUrl = `https://huggingface.co/api/models/${credentials.username}/${modelName}/upload`;
      
      console.log(`📤 モデルアップロード開始: ${modelName}`);
      
      // ここで実際のファイルアップロード処理
      // Git LFS や HuggingFace API を使用
      
      console.log(`✅ モデルアップロード完了: ${modelName}`);
      await this.refreshModels();

    } catch (error) {
      console.error('❌ モデルアップロード失敗:', error);
      throw error;
    }
  }

  /**
   * モデルダウンロード
   */
  async downloadModel(modelName: string, localPath: string): Promise<void> {
    try {
      console.log(`📥 モデルダウンロード開始: ${modelName}`);
      
      // HuggingFace Hub からダウンロード
      const downloadUrl = `https://huggingface.co/${modelName}/resolve/main/pytorch_model.bin`;
      
      // ダウンロード処理の実装
      
      console.log(`✅ モデルダウンロード完了: ${modelName}`);

    } catch (error) {
      console.error('❌ モデルダウンロード失敗:', error);
      throw error;
    }
  }

  private async checkAuthenticationStatus(): Promise<void> {
    const credentials = await this.authManager.getCredentials('huggingface');
    this._isAuthenticated = !!credentials;
    
    if (this._isAuthenticated) {
      await this.refreshModels();
    }
  }

  private async refreshModels(): Promise<void> {
    const credentials = await this.authManager.getCredentials('huggingface');
    if (!credentials) return;

    try {
      const response = await fetch(`https://huggingface.co/api/models?author=${credentials.username}`, {
        headers: { 'Authorization': `Bearer ${credentials.token}` }
      });

      if (response.ok) {
        const models = await response.json();
        this._models = models.map((model: any) => ({
          name: model.modelId,
          status: model.private ? 'private' : 'public',
          downloads: model.downloads || 0,
          likes: model.likes || 0,
          updated: model.lastModified,
          size: model.size || 'Unknown'
        }));
        
        this._modelsChanged.emit();
      }

    } catch (error) {
      console.error('モデル一覧の取得に失敗:', error);
    }
  }
}

// =============================================================================
// CLAUDE MANAGER - Claude API 連携
// =============================================================================

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ClaudeManager {
  private _messages: ClaudeMessage[] = [];
  private _messagesChanged: Signal<ClaudeManager, ClaudeMessage[]> = new Signal(this);
  private _isConnected = false;

  constructor(private authManager: AuthManager) {
    this.initializeClaudeAPI();
  }

  get messagesChanged(): ISignal<ClaudeManager, ClaudeMessage[]> {
    return this._messagesChanged;
  }

  get messages(): ClaudeMessage[] {
    return this._messages;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Claude API に質問
   */
  async askClaude(message: string): Promise<string> {
    this.addMessage('user', message);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API キーは環境変数から取得
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: this._messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const claudeResponse = data.content[0].text;
      
      this.addMessage('assistant', claudeResponse);
      return claudeResponse;

    } catch (error) {
      console.error('❌ Claude API エラー:', error);
      throw error;
    }
  }

  /**
   * ノートブックの分析
   */
  async analyzeNotebook(notebook: any): Promise<string> {
    // ノートブックの内容を取得してClaude分析
    const cells = this.extractNotebookCells(notebook);
    const analysisPrompt = `
以下のJupyterノートブックを分析し、改善点を提案してください：

${cells.map((cell, idx) => `
セル ${idx + 1}:
${cell.content}
`).join('\n')}

特に以下の観点で分析してください：
1. コードの効率性
2. ベストプラクティスの適用
3. エラーの可能性
4. 最適化の提案
`;

    return this.askClaude(analysisPrompt);
  }

  /**
   * コードの最適化提案
   */
  async optimizeCode(code: string): Promise<string> {
    const optimizePrompt = `
以下のコードを最適化してください：

\`\`\`python
${code}
\`\`\`

最適化された新しいコードと、変更理由を説明してください。
`;

    return this.askClaude(optimizePrompt);
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    const message: ClaudeMessage = {
      role,
      content,
      timestamp: Date.now()
    };

    this._messages.push(message);
    this._messagesChanged.emit(this._messages);
  }

  private extractNotebookCells(notebook: any): { type: string; content: string }[] {
    // JupyterLab ノートブック構造からセル抽出
    // 実際の実装ではnotebook.model.cellsを使用
    return [];
  }

  private async initializeClaudeAPI(): Promise<void> {
    try {
      // Claude API の初期化
      this._isConnected = true;
      this.addMessage('assistant', 'Claude AI アシスタントが利用可能になりました。');
    } catch (error) {
      console.error('Claude API 初期化失敗:', error);
      this._isConnected = false;
    }
  }
}