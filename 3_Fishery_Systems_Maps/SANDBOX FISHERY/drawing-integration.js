/**
 * Drawing Integration for SANDBOX FISHERY
 * Adds drawing controls and integrates with existing D3.js visualization
 */

// Global drawing layer instance
let drawingLayer = null;

// Initialize drawing functionality after the main visualization loads
function initializeDrawingLayer() {
    // Wait for SVG to be available
    const svg = window.svgElement || d3.select("#graph svg");
    
    if (svg.empty()) {
        console.warn('⚠️ SVG not found, retrying in 1 second...');
        setTimeout(initializeDrawingLayer, 1000);
        return;
    }
    
    // Create drawing layer
    drawingLayer = new DrawingLayer(svg);
    
    // Add drawing toolbar to the page
    addDrawingToolbar();
    
    // Add toolbar toggle button
    addToolbarToggle();
    
    // Load saved annotations
    drawingLayer.loadFromLocalStorage('sandbox-fishery-annotations');
    
    console.log('🎨 Drawing layer initialized for SANDBOX FISHERY');
}

// Add drawing toolbar HTML
function addDrawingToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'drawing-toolbar';
    toolbar.id = 'drawing-toolbar';
    toolbar.innerHTML = `
        <h4>🎨 Drawing Tools</h4>
        <div class="drawing-controls">
            <!-- Toggle Drawing Mode -->
            <button id="toggle-drawing" class="toggle-btn off" onclick="toggleDrawingMode()">
                <span id="toggle-icon">✏️</span>
                <span id="toggle-text">Enable Drawing</span>
            </button>
            
            <!-- Tools -->
            <div class="control-group">
                <label>Tools:</label>
                <div class="tool-buttons">
                    <button class="tool-btn active" onclick="selectTool('pen')" data-tool="pen">
                        ✏️ Pen
                    </button>
                    <button class="tool-btn" onclick="selectTool('text')" data-tool="text">
                        📝 Text
                    </button>
                    <button class="tool-btn" onclick="selectTool('circle')" data-tool="circle">
                        ⭕ Circle
                    </button>
                    <button class="tool-btn" onclick="selectTool('rectangle')" data-tool="rectangle">
                        ⬜ Rectangle
                    </button>
                </div>
            </div>
            
            <!-- Color -->
            <div class="control-group">
                <label>Color:</label>
                <input type="color" id="color-picker" class="color-picker" value="#ff0000" onchange="changeColor(this.value)">
            </div>
            
            <!-- Stroke Width -->
            <div class="control-group">
                <label>Stroke Width:</label>
                <input type="range" id="stroke-slider" class="stroke-slider" min="1" max="10" value="2" oninput="changeStrokeWidth(this.value)">
                <div class="stroke-value" id="stroke-value">2px</div>
            </div>
            
            <!-- Actions -->
            <div class="action-buttons">
                <button class="action-btn" onclick="undoDrawing()">↩️ Undo</button>
                <button class="action-btn" onclick="redoDrawing()">↪️ Redo</button>
                <button class="action-btn" onclick="saveAnnotations()">💾 Save</button>
                <button class="action-btn" onclick="loadAnnotations()">📂 Load</button>
                <button class="action-btn danger" onclick="clearAllDrawings()">🗑️ Clear</button>
                <button class="action-btn" onclick="exportAnnotations()">📤 Export</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(toolbar);
}

// Add toolbar toggle button
function addToolbarToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toolbar-toggle';
    toggleBtn.className = 'toolbar-toggle-btn';
    toggleBtn.innerHTML = '🎨';
    toggleBtn.title = 'Toggle Drawing Tools';
    toggleBtn.onclick = toggleToolbarVisibility;
    
    document.body.appendChild(toggleBtn);
}

// Toggle drawing mode
function toggleDrawingMode() {
    if (!drawingLayer) {
        console.error('❌ Drawing layer not initialized');
        alert('Drawing layer not ready. Please wait a moment and try again.');
        return;
    }
    
    const toggleBtn = document.getElementById('toggle-drawing');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');
    
    if (drawingLayer.drawingMode) {
        drawingLayer.disableDrawing();
        toggleBtn.className = 'toggle-btn off';
        toggleIcon.textContent = '✏️';
        toggleText.textContent = 'Enable Drawing';
        console.log('🎨 Drawing mode disabled');
    } else {
        drawingLayer.enableDrawing();
        toggleBtn.className = 'toggle-btn on';
        toggleIcon.textContent = '🚫';
        toggleText.textContent = 'Disable Drawing';
        console.log('🎨 Drawing mode enabled');
    }
}

// Toggle toolbar visibility
function toggleToolbarVisibility() {
    const toolbar = document.getElementById('drawing-toolbar');
    const toggleBtn = document.getElementById('toolbar-toggle');
    
    if (toolbar.style.display === 'none') {
        toolbar.style.display = 'block';
        toggleBtn.innerHTML = '🎨';
        toggleBtn.title = 'Hide Drawing Tools';
    } else {
        toolbar.style.display = 'none';
        toggleBtn.innerHTML = '🎨';
        toggleBtn.title = 'Show Drawing Tools';
    }
}

// Select drawing tool
function selectTool(tool) {
    if (!drawingLayer) return;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // Update drawing layer
    drawingLayer.setTool(tool);
}

// Change drawing color
function changeColor(color) {
    if (!drawingLayer) return;
    drawingLayer.setColor(color);
}

// Change stroke width
function changeStrokeWidth(width) {
    if (!drawingLayer) return;
    drawingLayer.setStrokeWidth(parseInt(width));
    document.getElementById('stroke-value').textContent = width + 'px';
}

// Undo last drawing action
function undoDrawing() {
    if (!drawingLayer) return;
    drawingLayer.undo();
}

// Redo last undone action
function redoDrawing() {
    if (!drawingLayer) return;
    drawingLayer.redo();
}

// Save annotations to localStorage
function saveAnnotations() {
    if (!drawingLayer) return;
    drawingLayer.saveToLocalStorage('sandbox-fishery-annotations');
    alert('✅ Annotations saved successfully!');
}

// Load annotations from localStorage
function loadAnnotations() {
    if (!drawingLayer) return;
    drawingLayer.loadFromLocalStorage('sandbox-fishery-annotations');
    alert('📂 Annotations loaded successfully!');
}

// Clear all drawings
function clearAllDrawings() {
    if (!drawingLayer) return;
    
    if (confirm('Are you sure you want to clear all drawings? This cannot be undone.')) {
        drawingLayer.clearAll();
        alert('🗑️ All drawings cleared!');
    }
}

// Export annotations as JSON
function exportAnnotations() {
    if (!drawingLayer) return;
    
    const data = drawingLayer.exportAnnotations();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sandbox-fishery-annotations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('📤 Annotations exported successfully!');
}

// Import annotations from file
function importAnnotations() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    drawingLayer.importAnnotations(e.target.result);
                    alert('📥 Annotations imported successfully!');
                } catch (error) {
                    alert('❌ Failed to import annotations: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Auto-save annotations periodically
function startAutoSave() {
    setInterval(() => {
        if (drawingLayer && drawingLayer.annotations.length > 0) {
            drawingLayer.saveToLocalStorage('sandbox-fishery-annotations');
            console.log('💾 Auto-saved annotations');
        }
    }, 30000); // Save every 30 seconds
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the main visualization to load
    setTimeout(initializeDrawingLayer, 2000);
    
    // Start auto-save
    startAutoSave();
});

// Also try to initialize when the main visualization is ready
window.addEventListener('load', function() {
    setTimeout(initializeDrawingLayer, 1000);
});

// Export functions for global access
window.toggleDrawingMode = toggleDrawingMode;
window.toggleToolbarVisibility = toggleToolbarVisibility;
window.selectTool = selectTool;
window.changeColor = changeColor;
window.changeStrokeWidth = changeStrokeWidth;
window.undoDrawing = undoDrawing;
window.redoDrawing = redoDrawing;
window.saveAnnotations = saveAnnotations;
window.loadAnnotations = loadAnnotations;
window.clearAllDrawings = clearAllDrawings;
window.exportAnnotations = exportAnnotations;
window.importAnnotations = importAnnotations;
