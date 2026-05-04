// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Windows 98 environment initialized.");

    // ==========================================
    // 1. Window Management, Dragging & Resizing
    // ==========================================
    
    // Desktop Icon Logic
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const paintWindow = document.getElementById('blank-window');
    const taskbarPaintBtn = document.getElementById('taskbar-paint');
    const closeBtn = paintWindow.querySelector('button[aria-label="Close"]');
    const minimizeBtn = paintWindow.querySelector('button[aria-label="Minimize"]');

    // Initialize Paint window to middle third of screen (scaled up by 30%)
    const initPaintWindow = () => {
        const minW = 320;
        const minH = 640; // Restored the 640px minimum requested earlier
        
        // Calculate 1/3 of screen scaled up by 30% (which is ~43% of screen)
        const finalW = Math.max(minW, window.innerWidth * 0.43);
        
        // Screens are typically much wider than tall. 1/3 height was hitting the minimum clamp. 
        // We use 65% of screen height here so it actually scales vertically by a visible 30% above the clamp.
        const finalH = Math.max(minH, window.innerHeight * 0.65); 
        
        paintWindow.style.width = `${finalW}px`;
        paintWindow.style.height = `${finalH}px`;
        paintWindow.style.left = `${(window.innerWidth - finalW) / 2}px`;
        paintWindow.style.top = `${(window.innerHeight - finalH) / 2}px`;
    };
    initPaintWindow();
    
    // Select icon on click
    desktopIcons.forEach(icon => {
        icon.addEventListener('mousedown', (e) => {
            desktopIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            e.stopPropagation(); // prevent desktop click from immediately deselecting
        });

        // Double click logic
        icon.addEventListener('dblclick', () => {
            if (icon.id === 'paint-icon') {
                paintWindow.style.display = 'flex';
                taskbarPaintBtn.style.display = 'flex';
                // Bring to front
                paintWindow.style.zIndex = 100;
                taskbarPaintBtn.classList.add('active');
                // trigger resize observer fix by tweaking size slightly
                const width = parseInt(paintWindow.style.width);
                paintWindow.style.width = width + 1 + 'px';
                setTimeout(() => { paintWindow.style.width = width + 'px'; }, 10);
            } else if (icon.id === 'ie-icon') {
                window.open('https://www.linkedin.com/in/matthewwangwty/', '_blank');
            } else if (icon.id === 'github-icon') {
                window.open('https://github.com/matthewwangwty', '_blank');
            }
        });
    });
    
    // Deselect if clicking desktop (outside icons)
    document.getElementById('desktop').addEventListener('mousedown', (e) => {
        desktopIcons.forEach(icon => icon.classList.remove('selected'));
    });

    // Close button logic
    closeBtn.addEventListener('click', () => {
        paintWindow.style.display = 'none';
        taskbarPaintBtn.style.display = 'none';
    });

    // Minimize button logic
    minimizeBtn.addEventListener('click', () => {
        paintWindow.style.display = 'none';
        taskbarPaintBtn.classList.remove('active');
    });

    // Taskbar toggle logic
    taskbarPaintBtn.addEventListener('click', () => {
        if (paintWindow.style.display === 'none') {
            paintWindow.style.display = 'flex';
            paintWindow.style.zIndex = 100;
            taskbarPaintBtn.classList.add('active');
        } else {
            if (paintWindow.style.zIndex == 100) {
                // Currently focused, so minimize
                paintWindow.style.display = 'none';
                taskbarPaintBtn.classList.remove('active');
            } else {
                // Open but not focused, bring to front
                paintWindow.style.zIndex = 100;
                taskbarPaintBtn.classList.add('active');
            }
        }
    });

    // Setup logic for all draggable windows
    const windows = document.querySelectorAll('.draggable-window');
    
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        titleBar.style.cursor = 'default'; // Let the system feel classic, but we make it drag
        
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // Window Dragging
        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = win.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // Bring to front
            windows.forEach(w => w.style.zIndex = 10);
            win.style.zIndex = 100;
        });

        // Resizing Logic
        const resizeHandles = win.querySelectorAll('.resize-handle');
        let isResizing = false;
        let currentHandle = null;
        let startX, startY, startWidth, startHeight, startTop, startLeft;

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentHandle = handle.className.split(' ')[1]; // gets 'n', 's', 'e', 'w', etc.
                startX = e.clientX;
                startY = e.clientY;
                const rect = win.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                startTop = rect.top;
                startLeft = rect.left;
                
                // Bring to front
                windows.forEach(w => w.style.zIndex = 10);
                win.style.zIndex = 100;
                e.preventDefault(); // Prevent text selection
            });
        });

        // Global mouse movement for both drag and resize
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                win.style.left = `${e.clientX - dragOffsetX}px`;
                win.style.top = `${e.clientY - dragOffsetY}px`;
            }
            
            if (isResizing) {
                const minWidth = 320;
                const minHeight = 640;

                if (currentHandle.includes('e')) {
                    let newWidth = startWidth + (e.clientX - startX);
                    if (newWidth > minWidth) win.style.width = `${newWidth}px`;
                }
                if (currentHandle.includes('s')) {
                    let newHeight = startHeight + (e.clientY - startY);
                    if (newHeight > minHeight) win.style.height = `${newHeight}px`;
                }
                if (currentHandle.includes('w')) {
                    let newWidth = startWidth - (e.clientX - startX);
                    if (newWidth > minWidth) {
                        win.style.width = `${newWidth}px`;
                        win.style.left = `${startLeft + (e.clientX - startX)}px`;
                    }
                }
                if (currentHandle.includes('n')) {
                    let newHeight = startHeight - (e.clientY - startY);
                    if (newHeight > minHeight) {
                        win.style.height = `${newHeight}px`;
                        win.style.top = `${startTop + (e.clientY - startY)}px`;
                    }
                }
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
            currentHandle = null;
        });
    });

    // ==========================================
    // 2. Canvas & MS Paint functionality
    // ==========================================
    
    // --- Drawing State ---
    let currentTool = 'pencil'; // Default to pencil
    let primaryColor = '#000000';
    let secondaryColor = '#FFFFFF';
    let brushSize = 2;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // --- Tool Selection Logic ---
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolOptionsPanel = document.getElementById('tool-options');

    // Map button titles to internal tool names
    const toolMap = {
        'Pencil': 'pencil',
        'Brush': 'brush',
        'Eraser': 'eraser',
        'Airbrush': 'airbrush',
        'Pick Color': 'eyedropper'
    };

    // Tools that draw on the canvas
    const drawableTools = ['pencil', 'brush', 'eraser', 'airbrush'];

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Don't select disabled tools
            if (btn.classList.contains('disabled')) return;

            // Remove active class from all tool buttons
            toolBtns.forEach(b => b.classList.remove('active'));
            // Add active class to the clicked button
            btn.classList.add('active');

            const title = btn.getAttribute('title');
            if (toolMap[title]) {
                currentTool = toolMap[title];
            }

            // Update canvas cursor based on tool
            if (canvas) {
                if (currentTool === 'eyedropper') {
                    canvas.style.cursor = 'crosshair';
                } else if (currentTool === 'eraser') {
                    canvas.style.cursor = 'cell';
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            }
        });
    });

    // Set Pencil as initially active tool
    const pencilBtn = document.querySelector('.tool-btn[title="Pencil"]');
    if (pencilBtn) {
        toolBtns.forEach(b => b.classList.remove('active'));
        pencilBtn.classList.add('active');
    }

    // --- Size Selection Logic ---
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            sizeOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            brushSize = parseInt(opt.dataset.size);
        });
    });

    // --- Color Selection Logic ---
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const primaryColorDisplay = document.querySelector('.color.primary');
    const secondaryColorDisplay = document.querySelector('.color.secondary');

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            // Left click sets primary color
            primaryColor = swatch.style.backgroundColor;
            if (primaryColorDisplay) {
                primaryColorDisplay.style.backgroundColor = primaryColor;
            }
        });

        swatch.addEventListener('contextmenu', (e) => {
            // Right click sets secondary color
            e.preventDefault();
            secondaryColor = swatch.style.backgroundColor;
            if (secondaryColorDisplay) {
                secondaryColorDisplay.style.backgroundColor = secondaryColor;
            }
        });
    });

    // --- Canvas Setup ---
    const canvas = document.getElementById('paint-canvas');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas && canvasWrapper) {
        // Function to resize the canvas's internal drawing buffer to match its display size
        // This prevents the drawing from being stretched or blurry when the window scales
        const resizeCanvas = () => {
            // Save the current drawing data
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            if (canvas.width > 0 && canvas.height > 0) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            // Update internal dimensions
            const rect = canvasWrapper.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            // Fill with white background by default
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore the drawing data (optional, depends on if we want to scale or crop. MS paint crops)
            if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                ctx.drawImage(tempCanvas, 0, 0);
            }
        };

        // Resize observer to handle window resizing
        const observer = new ResizeObserver(() => {
            resizeCanvas();
        });
        observer.observe(canvasWrapper);

        // Initial setup
        resizeCanvas();

        // Load Greetings.png onto the canvas
        const greetingsImg = new Image();
        greetingsImg.onload = () => {
            // Calculate scale to fit image within the canvas while maintaining aspect ratio
            const scale = Math.min(canvas.width / greetingsImg.width, canvas.height / greetingsImg.height);
            const w = greetingsImg.width * scale;
            const h = greetingsImg.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            
            ctx.drawImage(greetingsImg, x, y, w, h);
        };
        greetingsImg.src = 'assets/Greetings.png';

        // --- Drawing Functions ---
        const getCanvasPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const drawLine = (x1, y1, x2, y2, color, size) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        // Eraser draws with square strokes
        const drawSquareLine = (x1, y1, x2, y2, color, size) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'square';
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        };

        // Airbrush sprays random dots in a radius
        const sprayPaint = (x, y, color, radius) => {
            const density = Math.floor(radius * 3); // more dots for bigger radius
            ctx.fillStyle = color;
            for (let i = 0; i < density; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                const sx = x + Math.cos(angle) * dist;
                const sy = y + Math.sin(angle) * dist;
                ctx.fillRect(sx, sy, 1, 1);
            }
        };

        // Eyedropper picks the color under the cursor
        const pickColor = (x, y, setSecondary) => {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = '#' + 
                ('0' + pixel[0].toString(16)).slice(-2) +
                ('0' + pixel[1].toString(16)).slice(-2) +
                ('0' + pixel[2].toString(16)).slice(-2);
            
            if (setSecondary) {
                secondaryColor = hex;
                if (secondaryColorDisplay) {
                    secondaryColorDisplay.style.backgroundColor = hex;
                }
            } else {
                primaryColor = hex;
                if (primaryColorDisplay) {
                    primaryColorDisplay.style.backgroundColor = hex;
                }
            }

            // After picking, switch back to pencil
            currentTool = 'pencil';
            toolBtns.forEach(b => b.classList.remove('active'));
            if (pencilBtn) pencilBtn.classList.add('active');
            canvas.style.cursor = 'crosshair';
        };

        const getToolSize = () => {
            if (currentTool === 'pencil') return 1; // Pencil is always 1px
            return brushSize;
        };

        const getToolColor = (e) => {
            if (currentTool === 'eraser') return '#FFFFFF';
            // Right-click draws with secondary color
            if (e && e.buttons === 2) return secondaryColor;
            return primaryColor;
        };

        // Airbrush spray interval reference
        let sprayInterval = null;

        // --- Mouse Event Handlers ---
        canvas.addEventListener('mousedown', (e) => {
            // Eyedropper tool
            if (currentTool === 'eyedropper') {
                const pos = getCanvasPos(e);
                pickColor(Math.floor(pos.x), Math.floor(pos.y), e.button === 2);
                return;
            }

            // Only respond to drawable tools
            if (!drawableTools.includes(currentTool)) return;

            isDrawing = true;
            const pos = getCanvasPos(e);
            lastX = pos.x;
            lastY = pos.y;

            const size = getToolSize();
            const color = getToolColor(e);

            if (currentTool === 'eraser') {
                // Draw a square dot
                ctx.fillStyle = color;
                ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
            } else if (currentTool === 'airbrush') {
                // Start spraying continuously
                sprayPaint(pos.x, pos.y, color, size * 2);
                sprayInterval = setInterval(() => {
                    if (isDrawing) {
                        sprayPaint(lastX, lastY, getToolColor(e), size * 2);
                    }
                }, 50);
            } else {
                // Draw a single dot for click-without-drag (pencil/brush)
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            if (!drawableTools.includes(currentTool)) return;

            const pos = getCanvasPos(e);
            const size = getToolSize();
            const color = getToolColor(e);

            if (currentTool === 'eraser') {
                drawSquareLine(lastX, lastY, pos.x, pos.y, color, size);
            } else if (currentTool === 'airbrush') {
                sprayPaint(pos.x, pos.y, color, size * 2);
            } else {
                drawLine(lastX, lastY, pos.x, pos.y, color, size);
            }

            lastX = pos.x;
            lastY = pos.y;
        });

        // Stop drawing on mouseup anywhere (not just canvas) to handle edge cases
        document.addEventListener('mouseup', (e) => {
            isDrawing = false;
            if (sprayInterval) {
                clearInterval(sprayInterval);
                sprayInterval = null;
            }
        });

        // Prevent context menu on canvas so right-click draws with secondary color
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    // ==========================================
    // 3. Taskbar & Start Menu
    // ==========================================
    
    // Logic for interacting with the Start Button
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("Start button clicked. (Menu implementation pending)");
        });
    }
});
