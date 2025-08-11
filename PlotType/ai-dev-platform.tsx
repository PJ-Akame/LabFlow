import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Cloud, 
  Settings, 
  MessageSquare, 
  GitBranch, 
  Monitor, 
  Play, 
  Pause, 
  Server,
  Database,
  Zap,
  Eye,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Terminal,
  FileText,
  Cpu,
  BarChart3,
  Code,
  Send,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  X
} from 'lucide-react';

const JupyterLabExtension = () => {
  const [leftPanelTab, setLeftPanelTab] = useState('cluster');
  const [notebookCells, setNotebookCells] = useState([
    { 
      id: 1, 
      type: 'code', 
      content: '# BERT感情分析モデルの学習\nimport torch\nfrom transformers import BertTokenizer, BertForSequenceClassification\n\n# データセットの読み込み\nprint("データセット準備中...")', 
      output: 'データセット準備中...',
      execution_count: 1
    },
    {
      id: 2,
      type: 'magic',
      content: '%claude "このBERTモデルの最適化方法を教えて"',
      output: '',
      execution_count: null
    }
  ]);
  
  const [claudeMessages, setClaudeMessages] = useState([
    { role: 'assistant', content: 'JupyterLab AI アシスタントが起動しました。コード最適化、デバッグ、AIモデル設計をサポートします。' }
  ]);
  
  const [claudeInput, setClaudeInput] = useState('');
  const [clusterExpanded, setClusterExpanded] = useState(true);
  const [hfExpanded, setHfExpanded] = useState(true);
  
  const [colabNodes, setColabNodes] = useState([
    { id: 'colab-1', name: 'GPU Node 1', status: 'training', gpu: 'V100', usage: 78, task: 'BERT Fine-tuning' },
    { id: 'colab-2', name: 'GPU Node 2', status: 'running', gpu: 'T4', usage: 45, task: 'Data Preprocessing' },
    { id: 'colab-3', name: 'TPU Node', status: 'idle', gpu: 'TPU v3', usage: 0, task: 'Idle' }
  ]);

  const [hfModels, setHfModels] = useState([
    { name: 'my-bert-sentiment', status: 'private', downloads: 245, updated: '2h ago' },
    { name: 'custom-resnet-50', status: 'public', downloads: 1203, updated: '1d ago' },
    { name: 'lstm-timeseries', status: 'private', downloads: 67, updated: '3d ago' }
  ]);

  const StatusDot = ({ status }) => {
    const colors = {
      training: 'bg-blue-500',
      running: 'bg-green-500',
      idle: 'bg-gray-400',
      error: 'bg-red-500'
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>;
  };

  const executeCell = (cellId) => {
    setNotebookCells(prev => prev.map(cell => {
      if (cell.id === cellId) {
        if (cell.type === 'magic' && cell.content.includes('%claude')) {
          // Claude Magic Command の実行をシミュレート
          const query = cell.content.replace('%claude', '').replace(/"/g, '').trim();
          setClaudeMessages(prev => [...prev, 
            { role: 'user', content: query },
            { role: 'assistant', content: 'BERTモデルの最適化について説明します：\n\n1. **学習率スケジューリング**: CosineAnnealingLR\n2. **勾配クリッピング**: max_norm=1.0\n3. **Weight Decay**: 0.01\n4. **Warmup Steps**: 全ステップの10%\n\n下記のコードを次のセルに挿入しますか？' }
          ]);
          return { ...cell, output: '✓ Claude AIに送信完了', execution_count: Date.now() };
        } else if (cell.content.includes('%colab_train')) {
          return { ...cell, output: '🚀 Colab クラスタで学習開始\n📊 ログはクラスタモニターで確認可能', execution_count: Date.now() };
        } else if (cell.content.includes('%hf_push')) {
          return { ...cell, output: '📤 HuggingFace Hubにアップロード中...\n✅ https://huggingface.co/your-username/model-name', execution_count: Date.now() };
        }
        return { ...cell, output: 'セル実行完了', execution_count: Date.now() };
      }
      return cell;
    }));
  };

  const addCell = (type = 'code') => {
    const newCell = {
      id: Date.now(),
      type,
      content: type === 'code' ? '# 新しいコードセル' : '%claude "質問をここに入力"',
      output: '',
      execution_count: null
    };
    setNotebookCells(prev => [...prev, newCell]);
  };

  const sendClaudeMessage = () => {
    if (!claudeInput.trim()) return;
    
    setClaudeMessages(prev => [...prev, { role: 'user', content: claudeInput }]);
    
    setTimeout(() => {
      const responses = [
        'コードを分析し、最適化の提案をします。次のセルに改善されたコードを挿入しますか？',
        'エラーの原因を特定しました。修正版のコードを生成します。',
        'このモデルアーキテクチャなら、以下のハイパーパラメータがおすすめです。',
        'Colab クラスタでの分散学習設定を生成します。'
      ];
      setClaudeMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)] 
      }]);
    }, 1000);
    
    setClaudeInput('');
  };

  const renderLeftPanel = () => (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* パネルタブ */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setLeftPanelTab('cluster')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            leftPanelTab === 'cluster' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Cpu className="w-4 h-4 inline mr-1" />
          Cluster
        </button>
        <button
          onClick={() => setLeftPanelTab('huggingface')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            leftPanelTab === 'huggingface' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="w-4 h-4 inline mr-1" />
          HF Hub
        </button>
        <button
          onClick={() => setLeftPanelTab('claude')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            leftPanelTab === 'claude' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Brain className="w-4 h-4 inline mr-1" />
          Claude
        </button>
      </div>

      {/* パネルコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        {leftPanelTab === 'cluster' && (
          <div className="p-3">
            <div className="mb-4">
              <div 
                className="flex items-center justify-between cursor-pointer py-2"
                onClick={() => setClusterExpanded(!clusterExpanded)}
              >
                <h3 className="font-semibold text-sm">Colab Cluster</h3>
                {clusterExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              
              {clusterExpanded && (
                <div className="space-y-2">
                  {colabNodes.map(node => (
                    <div key={node.id} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{node.name}</span>
                        <StatusDot status={node.status} />
                      </div>
                      <div className="text-gray-600">
                        <div>{node.gpu}</div>
                        <div>{node.task}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span>使用率:</span>
                          <span className="font-medium">{node.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${node.usage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 rounded">
                  <Play className="w-3 h-3 inline mr-1" />
                  新しいColab起動
                </button>
                <button className="w-full text-left px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded">
                  <Monitor className="w-3 h-3 inline mr-1" />
                  クラスタ監視
                </button>
              </div>
            </div>
          </div>
        )}

        {leftPanelTab === 'huggingface' && (
          <div className="p-3">
            <div className="mb-4">
              <div 
                className="flex items-center justify-between cursor-pointer py-2"
                onClick={() => setHfExpanded(!hfExpanded)}
              >
                <h3 className="font-semibold text-sm">My Models</h3>
                {hfExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              
              {hfExpanded && (
                <div className="space-y-2">
                  {hfModels.map(model => (
                    <div key={model.name} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{model.name}</span>
                        <span className={`px-1 rounded text-xs ${
                          model.status === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <div>{model.downloads} downloads</div>
                        <div>Updated {model.updated}</div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-3 h-3" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">Magic Commands</h3>
              <div className="space-y-1 text-xs">
                <div className="bg-gray-100 p-1 rounded font-mono">%hf_login</div>
                <div className="bg-gray-100 p-1 rounded font-mono">%hf_push model_name</div>
                <div className="bg-gray-100 p-1 rounded font-mono">%hf_download bert-base</div>
              </div>
            </div>
          </div>
        )}

        {leftPanelTab === 'claude' && (
          <div className="p-3 flex flex-col h-full">
            <div className="flex-1 mb-3">
              <h3 className="font-semibold text-sm mb-2">AI Assistant</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {claudeMessages.map((msg, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${
                    msg.role === 'user' 
                      ? 'bg-blue-100 ml-2' 
                      : 'bg-gray-100 mr-2'
                  }`}>
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={claudeInput}
                  onChange={(e) => setClaudeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendClaudeMessage()}
                  placeholder="AIに質問..."
                  className="flex-1 text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={sendClaudeMessage}
                  className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotebook = () => (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* ノートブックツールバー */}
      <div className="border-b border-gray-300 p-2 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => addCell('code')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Code
          </button>
          <button 
            onClick={() => addCell('magic')}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            + Magic
          </button>
          <div className="flex-1"></div>
          <div className="text-sm text-gray-600">
            Connected to Colab Cluster (3 nodes)
          </div>
        </div>
      </div>

      {/* ノートブックセル */}
      <div className="p-4">
        {notebookCells.map(cell => (
          <div key={cell.id} className="mb-4 border border-gray-300 rounded">
            {/* セルヘッダー */}
            <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-gray-600">
                  [{cell.execution_count || ' '}]
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  cell.type === 'magic' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cell.type}
                </span>
              </div>
              <button
                onClick={() => executeCell(cell.id)}
                className="text-green-600 hover:text-green-800"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>

            {/* セルコンテンツ */}
            <div className="p-3">
              <textarea
                value={cell.content}
                onChange={(e) => setNotebookCells(prev => 
                  prev.map(c => c.id === cell.id ? {...c, content: e.target.value} : c)
                )}
                className="w-full font-mono text-sm border-none resize-none focus:outline-none"
                rows={cell.content.split('\n').length}
              />
            </div>

            {/* セル出力 */}
            {cell.output && (
              <div className="border-t bg-gray-50 p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {cell.output}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* JupyterLab トップバー */}
      <div className="h-8 bg-gray-800 text-white text-xs flex items-center px-3">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">JupyterLab</span>
          <span>AI-Dev-Extension v1.0.0</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-2">
          <StatusDot status="running" />
          <span>Claude API Connected</span>
        </div>
      </div>

      {/* メニューバー */}
      <div className="h-8 bg-white border-b border-gray-300 flex items-center px-3 text-sm">
        <div className="flex space-x-4">
          <span className="hover:bg-gray-100 px-2 py-1 cursor-pointer">File</span>
          <span className="hover:bg-gray-100 px-2 py-1 cursor-pointer">Edit</span>
          <span className="hover:bg-gray-100 px-2 py-1 cursor-pointer">View</span>
          <span className="hover:bg-gray-100 px-2 py-1 cursor-pointer font-semibold text-blue-600">AI Tools</span>
          <span className="hover:bg-gray-100 px-2 py-1 cursor-pointer">Help</span>
        </div>
      </div>

      {/* ツールバー */}
      <div className="h-10 bg-gray-50 border-b border-gray-300 flex items-center px-3">
        <div className="flex space-x-2">
          <button className="p-1 hover:bg-gray-200 rounded">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded">
            <Pause className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-blue-600">
            <Brain className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded text-green-600">
            <Cloud className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded text-orange-600">
            <Database className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1"></div>
        <div className="text-sm text-gray-600">
          kernel: Python 3.9.16 | Claude Enhanced
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex">
        {renderLeftPanel()}
        {renderNotebook()}
      </div>

      {/* ステータスバー */}
      <div className="h-6 bg-blue-600 text-white text-xs flex items-center px-3">
        <div className="flex items-center space-x-4">
          <span>🚀 3 Colab nodes active</span>
          <span>📊 2 models training</span>
          <span>🤖 Claude API ready</span>
        </div>
        <div className="flex-1"></div>
        <span>Line 1, Column 1</span>
      </div>
    </div>
  );
};

export default JupyterLabExtension;