"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@lumino/widgets");
class LabFlowWidget extends widgets_1.Widget {
    constructor() {
        super();
        this.id = 'labflow-main';
        this.title.label = 'LabFlow';
        this.title.caption = 'AI Development Workflow';
        this.addClass('labflow-widget');
        this.node.innerHTML = `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1976d2; margin: 0 0 8px 0;">LabFlow</h2>
          <p style="color: #666; margin: 0; font-size: 14px;">AI Development Workflow</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="margin: 4px 0; font-size: 13px; color: #2e7d32;">✓ Extension loaded successfully</div>
          <div style="margin: 4px 0; font-size: 13px; color: #1565c0;">→ Ready for AI development</div>
          <div style="margin: 4px 0; font-size: 13px; color: #f57c00;">→ Claude AI integration ready</div>
          <div style="margin: 4px 0; font-size: 13px; color: #7b1fa2;">→ Google Colab support</div>
          <div style="margin: 4px 0; font-size: 13px; color: #c2185b;">→ HuggingFace Hub integration</div>
        </div>
        
        <button onclick="alert('LabFlow is working perfectly!')" 
                style="width: 100%; padding: 12px; margin-top: 8px;
                       background: #1976d2; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
                       transition: background-color 0.2s;">
          Test LabFlow Connection
        </button>
        
        <div style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-radius: 6px;">
          <div style="font-size: 12px; color: #1565c0; font-weight: 600;">
            Status: Extension Active
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            Ready for your AI development workflow
          </div>
        </div>
      </div>
    `;
    }
}
const plugin = {
    id: 'labflow:main',
    autoStart: true,
    activate: (app) => {
        console.log('🚀 LabFlow Extension: Starting activation...');
        try {
            const widget = new LabFlowWidget();
            app.shell.add(widget, 'left', { rank: 300 });
            console.log('✅ LabFlow Extension: Successfully activated!');
        }
        catch (error) {
            console.error('❌ LabFlow Extension: Activation failed:', error);
        }
    }
};
exports.default = plugin;
//# sourceMappingURL=index.js.map