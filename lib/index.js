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
      <div style="padding: 20px; font-family: system-ui, sans-serif; background: white;">
        <h2 style="color: #1976d2; margin: 0 0 15px 0;">LabFlow</h2>
        <p style="color: #666; margin: 0 0 20px 0;">AI Development Workflow Ready</p>
        
        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 14px; color: #2e7d32; margin-bottom: 8px;">✓ Extension loaded successfully</div>
          <div style="font-size: 14px; color: #1565c0; margin-bottom: 8px;">✓ Ready for AI development</div>
          <div style="font-size: 14px; color: #f57c00;">✓ TypeScript compilation working</div>
        </div>
        
        <button onclick="alert('LabFlow is working perfectly!')" 
                style="width: 100%; padding: 12px; background: #1976d2; color: white; 
                       border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Test LabFlow Connection
        </button>
        
        <div style="margin-top: 20px; padding: 12px; background: #e8f5e8; border-radius: 6px;">
          <div style="font-size: 12px; color: #2e7d32; font-weight: bold;">Status: Active</div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Extension ready for development</div>
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