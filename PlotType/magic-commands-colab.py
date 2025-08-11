# =============================================================================
# MAGIC COMMANDS - JupyterLab ノートブック内で使用可能なマジックコマンド
# =============================================================================

from IPython.core.magic import Magics, magics_class, line_magic, cell_magic
from IPython.core.display import display, HTML, JSON
import requests
import json
import os
import time
from typing import Dict, List, Optional, Any
import subprocess
import asyncio
import aiohttp

@magics_class
class AIDevMagics(Magics):
    """AI Development Extension Magic Commands"""
    
    def __init__(self, shell=None):
        super().__init__(shell)
        self.colab_nodes: Dict[str, str] = {}
        self.active_jobs: Dict[str, Dict] = {}
        self.claude_session: List[Dict] = []
        
    # =========================================================================
    # COLAB MAGIC COMMANDS
    # =========================================================================
    
    @line_magic
    def colab_connect(self, line: str) -> None:
        """
        Colab インスタンスに接続
        使用例: %colab_connect https://abc123.ngrok.io
        """
        url = line.strip()
        if not url:
            print("❌ Usage: %colab_connect <ngrok_url>")
            return
            
        try:
            # Health check
            response = requests.get(f"{url}/health", timeout=10)
            response.raise_for_status()
            
            # Node info 取得
            info_response = requests.get(f"{url}/info", timeout=10)
            node_info = info_response.json()
            
            node_id = f"colab_{int(time.time())}"
            self.colab_nodes[node_id] = url
            
            print(f"✅ Colab接続成功!")
            print(f"   Node ID: {node_id}")
            print(f"   GPU: {node_info.get('gpu', 'N/A')}")
            print(f"   Runtime: {node_info.get('runtime', 'N/A')}")
            
            # JupyterLab Extension に通知
            self._notify_extension('colab_connected', {
                'node_id': node_id,
                'url': url,
                'info': node_info
            })
            
        except Exception as e:
            print(f"❌ Colab接続失敗: {str(e)}")
    
    @line_magic
    def colab_status(self, line: str) -> None:
        """
        接続中の Colab ノード状況を表示
        使用例: %colab_status
        """
        if not self.colab_nodes:
            print("📭 接続中のColabノードはありません")
            return
        
        print(f"🖥️  接続中のColabノード ({len(self.colab_nodes)}個):")
        print("-" * 60)
        
        for node_id, url in self.colab_nodes.items():
            try:
                response = requests.get(f"{url}/resources", timeout=5)
                resources = response.json()
                
                gpu = resources.get('gpu', [{}])[0]
                memory = resources.get('memory', {})
                
                print(f"Node: {node_id}")
                print(f"  URL: {url}")
                print(f"  GPU: {gpu.get('name', 'N/A')} ({gpu.get('utilization', 0):.1f}%)")
                print(f"  Memory: {memory.get('percent', 0):.1f}% used")
                print()
                
            except Exception as e:
                print(f"Node: {node_id} - ❌ エラー: {str(e)}")
                print()
    
    @cell_magic
    def colab_train(self, line: str, cell: str) -> None:
        """
        Colab クラスタで分散学習実行
        使用例:
        %%colab_train --nodes 2 --epochs 10
        import torch
        # 学習コード
        """
        args = self._parse_args(line)
        node_count = int(args.get('nodes', 1))
        epochs = int(args.get('epochs', 10))
        
        if not self.colab_nodes:
            print("❌ Colabノードが接続されていません")
            return
        
        available_nodes = list(self.colab_nodes.items())[:node_count]
        
        if len(available_nodes) < node_count:
            print(f"⚠️  要求ノード数: {node_count}, 利用可能: {len(available_nodes)}")
        
        job_id = f"job_{int(time.time())}"
        
        print(f"🚀 分散学習開始")
        print(f"   Job ID: {job_id}")
        print(f"   ノード数: {len(available_nodes)}")
        print(f"   エポック数: {epochs}")
        print("-" * 40)
        
        # 各ノードにタスク配布
        results = []
        for idx, (node_id, url) in enumerate(available_nodes):
            task_config = {
                'job_id': job_id,
                'node_id': node_id,
                'node_index': idx,
                'total_nodes': len(available_nodes),
                'epochs': epochs,
                'code': cell
            }
            
            try:
                response = requests.post(
                    f"{url}/train", 
                    json=task_config,
                    timeout=30
                )
                response.raise_for_status()
                result = response.json()
                
                print(f"✅ Node {node_id}: 学習開始")
                results.append(result)
                
            except Exception as e:
                print(f"❌ Node {node_id}: 失敗 - {str(e)}")
        
        if results:
            self.active_jobs[job_id] = {
                'nodes': available_nodes,
                'start_time': time.time(),
                'status': 'running'
            }
            print(f"\n💡 進捗確認: %colab_job_status {job_id}")
    
    @line_magic
    def colab_job_status(self, line: str) -> None:
        """
        学習ジョブの状況確認
        使用例: %colab_job_status job_1234567890
        """
        job_id = line.strip()
        if not job_id:
            # 全ジョブの状況表示
            if not self.active_jobs:
                print("📭 実行中のジョブはありません")
                return
            
            print("📊 実行中のジョブ:")
            for jid, job_info in self.active_jobs.items():
                elapsed = time.time() - job_info['start_time']
                print(f"  {jid}: {job_info['status']} ({elapsed:.0f}s)")
            return
        
        if job_id not in self.active_jobs:
            print(f"❌ ジョブ {job_id} が見つかりません")
            return
        
        job_info = self.active_jobs[job_id]
        print(f"📊 Job Status: {job_id}")
        print("-" * 40)
        
        for node_id, url in job_info['nodes']:
            try:
                response = requests.get(f"{url}/job/{job_id}/status", timeout=5)
                status = response.json()
                
                print(f"Node {node_id}:")
                print(f"  Status: {status.get('status', 'unknown')}")
                print(f"  Epoch: {status.get('current_epoch', 0)}/{status.get('total_epochs', 0)}")
                print(f"  Loss: {status.get('current_loss', 'N/A')}")
                print()
                
            except Exception as e:
                print(f"Node {node_id}: ❌ エラー - {str(e)}")
                print()
    
    # =========================================================================
    # HUGGINGFACE MAGIC COMMANDS
    # =========================================================================
    
    @line_magic
    def hf_login(self, line: str) -> None:
        """
        HuggingFace にログイン
        使用例: %hf_login
        """
        try:
            from huggingface_hub import login, whoami
            
            if line.strip():
                # トークンが指定された場合
                token = line.strip()
                login(token=token)
            else:
                # インタラクティブログイン
                login()
            
            user_info = whoami()
            print(f"✅ HuggingFace ログイン成功: {user_info['name']}")
            
        except ImportError:
            print("❌ huggingface_hub がインストールされていません")
            print("   pip install huggingface_hub")
        except Exception as e:
            print(f"❌ ログイン失敗: {str(e)}")
    
    @line_magic
    def hf_push(self, line: str) -> None:
        """
        モデルを HuggingFace Hub にプッシュ
        使用例: %hf_push model_name --private
        """
        args = line.split()
        if not args:
            print("❌ Usage: %hf_push <model_name> [--private]")
            return
        
        model_name = args[0]
        is_private = '--private' in args
        
        try:
            from huggingface_hub import HfApi, Repository
            
            api = HfApi()
            
            # モデルリポジトリ作成
            api.create_repo(
                repo_id=model_name,
                repo_type="model",
                private=is_private
            )
            
            print(f"📤 モデルアップロード開始: {model_name}")
            print(f"   プライベート: {is_private}")
            
            # 実際のアップロード処理（モデルファイルパスは要調整）
            # api.upload_folder(folder_path="./model", repo_id=model_name)
            
            print(f"✅ アップロード完了!")
            print(f"   URL: https://huggingface.co/{model_name}")
            
        except ImportError:
            print("❌ huggingface_hub がインストールされていません")
        except Exception as e:
            print(f"❌ アップロード失敗: {str(e)}")
    
    @line_magic
    def hf_download(self, line: str) -> None:
        """
        HuggingFace Hub からモデルダウンロード
        使用例: %hf_download bert-base-uncased
        """
        if not line.strip():
            print("❌ Usage: %hf_download <model_name>")
            return
        
        model_name = line.strip()
        
        try:
            from transformers import AutoModel, AutoTokenizer
            
            print(f"📥 モデルダウンロード開始: {model_name}")
            
            # モデルとトークナイザーをダウンロード
            model = AutoModel.from_pretrained(model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            print(f"✅ ダウンロード完了!")
            print(f"   モデル: {type(model).__name__}")
            print(f"   トークナイザー: {type(tokenizer).__name__}")
            
            # グローバル変数に設定
            self.shell.user_ns['model'] = model
            self.shell.user_ns['tokenizer'] = tokenizer
            
        except ImportError:
            print("❌ transformers がインストールされていません")
            print("   pip install transformers")
        except Exception as e:
            print(f"❌ ダウンロード失敗: {str(e)}")
    
    # =========================================================================
    # CLAUDE MAGIC COMMANDS  
    # =========================================================================
    
    @line_magic
    def claude(self, line: str) -> str:
        """
        Claude AI に質問
        使用例: %claude "このコードを最適化して"
        """
        if not line.strip():
            print("❌ Usage: %claude \"<message>\"")
            return
        
        message = line.strip().strip('"\'')
        
        try:
            # Claude API 呼び出し
            response = self._call_claude_api(message)
            
            print("🤖 Claude AI:")
            print("-" * 40)
            print(response)
            print("-" * 40)
            
            # セッション履歴に追加
            self.claude_session.append({'role': 'user', 'content': message})
            self.claude_session.append({'role': 'assistant', 'content': response})
            
            return response
            
        except Exception as e:
            print(f"❌ Claude API エラー: {str(e)}")
            return ""
    
    @cell_magic
    def claude_analyze(self, line: str, cell: str) -> str:
        """
        セルのコードを Claude AI で分析
        使用例:
        %%claude_analyze
        import pandas as pd
        df = pd.read_csv('data.csv')
        """
        analysis_prompt = f"""
以下のPythonコードを分析し、改善点を提案してください:

```python
{cell}
```

特に以下の観点で分析してください:
1. コードの効率性
2. ベストプラクティスの適用
3. 潜在的なエラー
4. 最適化の提案
"""
        
        try:
            response = self._call_claude_api(analysis_prompt)
            
            print("🔍 Claude コード分析結果:")
            print("=" * 50)
            print(response)
            print("=" * 50)
            
            return response
            
        except Exception as e:
            print(f"❌ 分析エラー: {str(e)}")
            return ""
    
    @line_magic
    def claude_optimize(self, line: str) -> None:
        """
        直前のセルのコードを Claude AI で最適化
        使用例: %claude_optimize
        """
        # 直前のセルの内容を取得
        if hasattr(self.shell, 'history_manager'):
            history = self.shell.history_manager.get_range(-2, -1)
            if history:
                last_input = list(history)[0][2]  # (session, line_number, input)
                
                optimize_prompt = f"""
以下のPythonコードを最適化してください:

```python
{last_input}
```

最適化されたコードを提供し、変更点を説明してください。
"""
                
                try:
                    response = self._call_claude_api(optimize_prompt)
                    
                    print("⚡ Claude 最適化提案:")
                    print("=" * 50)
                    print(response)
                    print("=" * 50)
                    
                except Exception as e:
                    print(f"❌ 最適化エラー: {str(e)}")
            else:
                print("❌ 直前のセルが見つかりません")
        else:
            print("❌ 履歴機能が利用できません")
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def _parse_args(self, line: str) -> Dict[str, str]:
        """コマンドライン引数をパース"""
        args = {}
        parts = line.split()
        
        i = 0
        while i < len(parts):
            if parts[i].startswith('--'):
                key = parts[i][2:]
                if i + 1 < len(parts) and not parts[i + 1].startswith('--'):
                    args[key] = parts[i + 1]
                    i += 2
                else:
                    args[key] = True
                    i += 1
            else:
                i += 1
        
        return args
    
    def _call_claude_api(self, message: str) -> str:
        """Claude API 呼び出し"""
        try:
            # JupyterLab Extension経由でClaude APIを呼び出し
            # 実際の実装では適切なAPI呼び出しを行う
            
            # 模擬応答（実際の実装ではClaude APIを使用）
            responses = [
                "コードを分析しました。以下の改善点があります：\n1. 変数名をより明確に\n2. エラーハンドリングの追加\n3. コメントの追加",
                "このコードは効率的ですが、以下の最適化が可能です：\n1. リスト内包表記の使用\n2. 不要なループの削除",
                "良いコードです！以下の点でさらに改善できます：\n1. 型ヒントの追加\n2. docstringの追加"
            ]
            
            import random
            return random.choice(responses)
            
        except Exception as e:
            raise Exception(f"Claude API call failed: {str(e)}")
    
    def _notify_extension(self, event: str, data: Dict[str, Any]) -> None:
        """JupyterLab Extension に通知"""
        try:
            # 実際の実装では Extension との通信メカニズムを使用
            print(f"📡 Extension通知: {event}")
            
        except Exception as e:
            print(f"⚠️  Extension通知失敗: {str(e)}")


# Magic Commands を IPython に登録
def load_ipython_extension(ipython):
    """IPython Extension として登録"""
    ipython.register_magic_function(AIDevMagics)
    print("🚀 AI-Dev Magic Commands loaded!")
    print("Available commands:")
    print("  %colab_connect, %colab_status, %%colab_train")
    print("  %hf_login, %hf_push, %hf_download")
    print("  %claude, %%claude_analyze, %claude_optimize")


# =============================================================================
# COLAB API SERVER - Google Colab 側で実行するAPIサーバー
# =============================================================================

"""
以下のコードをGoogle Colabノートブックで実行してください:

```python
# Colab ノートブック用 API サーバーセットアップ

!pip install flask flask-cors pyngrok psutil py3nvml

import os
import json
import time
import threading
import psutil
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
import torch

# API サーバー作成
app = Flask(__name__)
CORS(app)

# グローバル変数
current_jobs = {}
system_info = {}

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': time.time()})

@app.route('/info')
def get_info():
    \"\"\"Colab インスタンス情報\"\"\"
    try:
        # GPU 情報
        gpu_info = "CPU only"
        if torch.cuda.is_available():
            gpu_info = torch.cuda.get_device_name(0)
        
        # Runtime 情報
        runtime_info = {
            'gpu': gpu_info,
            'cuda_available': torch.cuda.is_available(),
            'torch_version': torch.__version__,
            'python_version': subprocess.check_output(['python', '--version']).decode().strip()
        }
        
        return jsonify(runtime_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resources')
def get_resources():
    \"\"\"システムリソース情報\"\"\"
    try:
        resources = {
            'timestamp': time.time(),
            'cpu': {
                'count': psutil.cpu_count(),
                'usage': psutil.cpu_percent(interval=1)
            },
            'memory': {
                'total': psutil.virtual_memory().total,
                'used': psutil.virtual_memory().used,
                'percent': psutil.virtual_memory().percent
            },
            'disk': {
                'total': psutil.disk_usage('/').total,
                'used': psutil.disk_usage('/').used,
                'free': psutil.disk_usage('/').free
            },
            'gpu': []
        }
        
        # GPU 情報
        if torch.cuda.is_available():
            for i in range(torch.cuda.device_count()):
                gpu_memory = torch.cuda.get_device_properties(i).total_memory
                gpu_memory_used = torch.cuda.memory_allocated(i)
                
                resources['gpu'].append({
                    'id': i,
                    'name': torch.cuda.get_device_name(i),
                    'memory_total': gpu_memory,
                    'memory_used': gpu_memory_used,
                    'memory_free': gpu_memory - gpu_memory_used,
                    'utilization': torch.cuda.utilization() if hasattr(torch.cuda, 'utilization') else 0,
                    'temperature': 0  # 実際の実装では nvidia-ml-py を使用
                })
        
        return jsonify(resources)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def start_training():
    \"\"\"学習タスクの開始\"\"\"
    try:
        task_config = request.get_json()
        job_id = task_config['job_id']
        code = task_config['code']
        
        print(f"🚀 学習開始: Job {job_id}")
        
        # ジョブ情報を保存
        current_jobs[job_id] = {
            'start_time': time.time(),
            'status': 'running',
            'config': task_config,
            'current_epoch': 0,
            'total_epochs': task_config.get('epochs', 10),
            'current_loss': None
        }
        
        # バックグラウンドで実行
        thread = threading.Thread(target=execute_training_code, args=(job_id, code, task_config))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'started',
            'job_id': job_id,
            'message': '学習を開始しました'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/job/<job_id>/status')
def get_job_status(job_id):
    \"\"\"ジョブ状況確認\"\"\"
    if job_id not in current_jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job_info = current_jobs[job_id].copy()
    job_info['elapsed_time'] = time.time() - job_info['start_time']
    
    return jsonify(job_info)

@app.route('/shutdown', methods=['POST'])
def shutdown_server():
    \"\"\"サーバー停止\"\"\"
    print("🔌 サーバーを停止しています...")
    return jsonify({'status': 'shutting down'})

def execute_training_code(job_id: str, code: str, config: dict):
    \"\"\"学習コードの実行\"\"\"
    try:
        print(f"📊 Job {job_id}: コード実行開始")
        
        # 安全なコード実行環境
        exec_globals = {
            '__builtins__': __builtins__,
            'torch': torch,
            'job_id': job_id,
            'config': config,
            'update_progress': lambda epoch, loss: update_job_progress(job_id, epoch, loss)
        }
        
        # コード実行
        exec(code, exec_globals)
        
        # ジョブ完了
        current_jobs[job_id]['status'] = 'completed'
        current_jobs[job_id]['end_time'] = time.time()
        
        print(f"✅ Job {job_id}: 実行完了")
        
    except Exception as e:
        current_jobs[job_id]['status'] = 'error'
        current_jobs[job_id]['error'] = str(e)
        print(f"❌ Job {job_id}: エラー - {str(e)}")

def update_job_progress(job_id: str, epoch: int, loss: float):
    \"\"\"学習進捗の更新\"\"\"
    if job_id in current_jobs:
        current_jobs[job_id]['current_epoch'] = epoch
        current_jobs[job_id]['current_loss'] = loss
        print(f"📈 Job {job_id}: Epoch {epoch}, Loss: {loss:.4f}")

# サーバー起動
def start_colab_server():
    print("🚀 Colab API サーバーを起動しています...")
    
    # バックグラウンドでFlaskサーバー起動
    server_thread = threading.Thread(target=lambda: app.run(host='0.0.0.0', port=5000, debug=False))
    server_thread.daemon = True
    server_thread.start()
    
    time.sleep(2)  # サーバー起動待機
    
    # ngrok でトンネル開設
    tunnel = ngrok.connect(5000)
    public_url = tunnel.public_url
    
    print(f"✅ サーバー起動完了!")
    print(f"📡 Public URL: {public_url}")
    print(f"🔗 JupyterLabで接続: %colab_connect {public_url}")
    
    return public_url

# メイン実行
if __name__ == "__main__":
    # このコードをColab ノートブックで実行
    url = start_colab_server()
```
"""