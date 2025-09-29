/**
 * Drawing Layer for Fishery System Maps
 * Provides annotation and drawing capabilities over D3.js visualizations
 */

class DrawingLayer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.drawingMode = false;
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
        this.currentStrokeWidth = 2;
        this.isDrawing = false;
        this.currentPath = null;
        this.annotations = [];
        this.history = [];
        this.historyIndex = -1;
        
        this.initializeLayer();
        this.setupEventListeners();
    }
    
    initializeLayer() {
        // Create drawing layer group
        this.drawingGroup = this.svg.append('g')
            .attr('class', 'drawing-layer')
            .style('pointer-events', 'none'); // Initially disabled
            
        // Create separate groups for different annotation types
        this.pathGroup = this.drawingGroup.append('g').attr('class', 'drawing-paths');
        this.shapeGroup = this.drawingGroup.append('g').attr('class', 'drawing-shapes');
        this.textGroup = this.drawingGroup.append('g').attr('class', 'drawing-text');
        
        console.log('🎨 Drawing layer initialized');
    }
    
    setupEventListeners() {
        // Store references for event handling
        this.mouseDownHandler = this.onMouseDown.bind(this);
        this.mouseMoveHandler = this.onMouseMove.bind(this);
        this.mouseUpHandler = this.onMouseUp.bind(this);
        this.clickHandler = this.onClick.bind(this);
    }
    
    enableDrawing() {
        this.drawingMode = true;
        this.drawingGroup.style('pointer-events', 'all');
        
        // Add event listeners
        this.svg.on('mousedown.drawing', this.mouseDownHandler);
        this.svg.on('mousemove.drawing', this.mouseMoveHandler);
        this.svg.on('mouseup.drawing', this.mouseUpHandler);
        this.svg.on('click.drawing', this.clickHandler);
        
        // Change cursor
        this.svg.style('cursor', 'crosshair');
        
        console.log('🎨 Drawing mode enabled');
    }
    
    disableDrawing() {
        this.drawingMode = false;
        this.drawingGroup.style('pointer-events', 'none');
        
        // Remove event listeners
        this.svg.on('mousedown.drawing', null);
        this.svg.on('mousemove.drawing', null);
        this.svg.on('mouseup.drawing', null);
        this.svg.on('click.drawing', null);
        
        // Reset cursor
        this.svg.style('cursor', 'default');
        
        console.log('🎨 Drawing mode disabled');
    }
    
    onMouseDown(event) {
        if (!this.drawingMode) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const [x, y] = d3.pointer(event, this.drawingGroup.node());
        
        if (this.currentTool === 'pen') {
            this.startPath(x, y);
        } else if (this.currentTool === 'circle' || this.currentTool === 'rectangle') {
            this.startShape(x, y);
        }
    }
    
    onMouseMove(event) {
        if (!this.drawingMode || !this.isDrawing) return;
        
        const [x, y] = d3.pointer(event, this.drawingGroup.node());
        
        if (this.currentTool === 'pen' && this.currentPath) {
            this.continuePath(x, y);
        } else if ((this.currentTool === 'circle' || this.currentTool === 'rectangle') && this.currentShape) {
            this.updateShape(x, y);
        }
    }
    
    onMouseUp(event) {
        if (!this.drawingMode || !this.isDrawing) return;
        
        if (this.currentTool === 'pen' && this.currentPath) {
            this.finishPath();
        } else if ((this.currentTool === 'circle' || this.currentTool === 'rectangle') && this.currentShape) {
            this.finishShape();
        }
    }
    
    onClick(event) {
        if (!this.drawingMode) return;
        
        if (this.currentTool === 'text') {
            event.preventDefault();
            event.stopPropagation();
            
            const [x, y] = d3.pointer(event, this.drawingGroup.node());
            this.addText(x, y);
        }
    }
    
    startPath(x, y) {
        this.isDrawing = true;
        this.currentPath = this.pathGroup.append('path')
            .attr('d', `M${x},${y}`)
            .attr('stroke', this.currentColor)
            .attr('stroke-width', this.currentStrokeWidth)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round');
            
        this.pathData = `M${x},${y}`;
    }
    
    continuePath(x, y) {
        this.pathData += `L${x},${y}`;
        this.currentPath.attr('d', this.pathData);
    }
    
    finishPath() {
        if (this.currentPath) {
            this.saveAnnotation({
                type: 'path',
                element: this.currentPath,
                data: this.pathData,
                color: this.currentColor,
                strokeWidth: this.currentStrokeWidth
            });
        }
        
        this.isDrawing = false;
        this.currentPath = null;
        this.pathData = null;
    }
    
    startShape(x, y) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        
        if (this.currentTool === 'circle') {
            this.currentShape = this.shapeGroup.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 0)
                .attr('stroke', this.currentColor)
                .attr('stroke-width', this.currentStrokeWidth)
                .attr('fill', 'none');
        } else if (this.currentTool === 'rectangle') {
            this.currentShape = this.shapeGroup.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', 0)
                .attr('height', 0)
                .attr('stroke', this.currentColor)
                .attr('stroke-width', this.currentStrokeWidth)
                .attr('fill', 'none');
        }
    }
    
    updateShape(x, y) {
        if (this.currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
            this.currentShape.attr('r', radius);
        } else if (this.currentTool === 'rectangle') {
            const width = x - this.startX;
            const height = y - this.startY;
            
            this.currentShape
                .attr('x', width < 0 ? x : this.startX)
                .attr('y', height < 0 ? y : this.startY)
                .attr('width', Math.abs(width))
                .attr('height', Math.abs(height));
        }
    }
    
    finishShape() {
        if (this.currentShape) {
            this.saveAnnotation({
                type: this.currentTool,
                element: this.currentShape,
                color: this.currentColor,
                strokeWidth: this.currentStrokeWidth
            });
        }
        
        this.isDrawing = false;
        this.currentShape = null;
    }
    
    addText(x, y) {
        const text = prompt('Enter annotation text:');
        if (text && text.trim()) {
            const textElement = this.textGroup.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('fill', this.currentColor)
                .attr('font-size', '14px')
                .attr('font-family', 'Arial, sans-serif')
                .text(text.trim());
                
            this.saveAnnotation({
                type: 'text',
                element: textElement,
                text: text.trim(),
                x: x,
                y: y,
                color: this.currentColor
            });
        }
    }
    
    saveAnnotation(annotation) {
        this.annotations.push(annotation);
        this.saveToHistory();
        console.log('💾 Annotation saved:', annotation.type);
    }
    
    saveToHistory() {
        // Remove any history after current index (for redo functionality)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save current state
        this.history.push(this.serializeAnnotations());
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    serializeAnnotations() {
        return this.annotations.map(ann => ({
            type: ann.type,
            data: ann.data,
            text: ann.text,
            x: ann.x,
            y: ann.y,
            color: ann.color,
            strokeWidth: ann.strokeWidth
        }));
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
            console.log('↩️ Undo performed');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
            console.log('↪️ Redo performed');
        }
    }
    
    restoreFromHistory() {
        this.clearAll(false); // Don't save to history
        
        if (this.historyIndex >= 0 && this.history[this.historyIndex]) {
            const annotations = this.history[this.historyIndex];
            annotations.forEach(ann => this.recreateAnnotation(ann));
        }
    }
    
    recreateAnnotation(ann) {
        let element;
        
        switch (ann.type) {
            case 'path':
                element = this.pathGroup.append('path')
                    .attr('d', ann.data)
                    .attr('stroke', ann.color)
                    .attr('stroke-width', ann.strokeWidth)
                    .attr('fill', 'none')
                    .attr('stroke-linecap', 'round')
                    .attr('stroke-linejoin', 'round');
                break;
                
            case 'text':
                element = this.textGroup.append('text')
                    .attr('x', ann.x)
                    .attr('y', ann.y)
                    .attr('fill', ann.color)
                    .attr('font-size', '14px')
                    .attr('font-family', 'Arial, sans-serif')
                    .text(ann.text);
                break;
        }
        
        if (element) {
            this.annotations.push({
                type: ann.type,
                element: element,
                data: ann.data,
                text: ann.text,
                x: ann.x,
                y: ann.y,
                color: ann.color,
                strokeWidth: ann.strokeWidth
            });
        }
    }
    
    clearAll(saveToHistory = true) {
        this.pathGroup.selectAll('*').remove();
        this.shapeGroup.selectAll('*').remove();
        this.textGroup.selectAll('*').remove();
        
        this.annotations = [];
        
        if (saveToHistory) {
            this.saveToHistory();
        }
        
        console.log('🗑️ All annotations cleared');
    }
    
    setTool(tool) {
        this.currentTool = tool;
        console.log('🔧 Tool changed to:', tool);
    }
    
    setColor(color) {
        this.currentColor = color;
        console.log('🎨 Color changed to:', color);
    }
    
    setStrokeWidth(width) {
        this.currentStrokeWidth = width;
        console.log('📏 Stroke width changed to:', width);
    }
    
    exportAnnotations() {
        return JSON.stringify(this.serializeAnnotations(), null, 2);
    }
    
    importAnnotations(jsonData) {
        try {
            const annotations = JSON.parse(jsonData);
            this.clearAll(false);
            annotations.forEach(ann => this.recreateAnnotation(ann));
            this.saveToHistory();
            console.log('📥 Annotations imported successfully');
        } catch (error) {
            console.error('❌ Failed to import annotations:', error);
        }
    }
    
    saveToLocalStorage(key = 'fishery-annotations') {
        localStorage.setItem(key, this.exportAnnotations());
        console.log('💾 Annotations saved to localStorage');
    }
    
    loadFromLocalStorage(key = 'fishery-annotations') {
        const data = localStorage.getItem(key);
        if (data) {
            this.importAnnotations(data);
            console.log('📂 Annotations loaded from localStorage');
        }
    }
}

// Export for use in HTML
window.DrawingLayer = DrawingLayer;
