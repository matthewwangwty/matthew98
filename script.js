// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Windows 98 environment initialized.");

    // ==========================================
    // 1. Window Management, Dragging & Resizing
    // ==========================================
    
    // Desktop Icon Logic
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const taskbarApps = document.getElementById('taskbar-apps');

    // --- Dynamic App Registry ---
    // Each app: { windowId, iconSrc, title, desktopIconId }
    const appRegistry = [
        { windowId: 'blank-window', iconSrc: 'assets/paint.png', title: 'Greetings!', desktopIconId: 'paint-icon', openByDefault: true },
        { windowId: 'notepad-window', iconSrc: 'assets/notepad.png', title: 'About Me', desktopIconId: 'notepad-icon', openByDefault: true },
        { windowId: 'me-window', iconSrc: 'assets/camera.png', title: 'Me', desktopIconId: 'camera-icon', openByDefault: true },
        { windowId: 'explorer-window', iconSrc: 'assets/explorer.png', title: 'Projects', desktopIconId: 'explorer-icon', openByDefault: false },
        { windowId: 'file-viewer-window', iconSrc: 'assets/file.png', title: 'File Viewer', desktopIconId: null, openByDefault: false },
        { windowId: 'file-text-window', iconSrc: 'assets/notepad.png', title: 'Text File', desktopIconId: null, openByDefault: false }
    ];

    // Track which apps are currently "open" (have taskbar presence)
    const openApps = new Map(); // windowId -> { btn, windowEl }

    const bringToFront = (windowEl) => {
        const windows = document.querySelectorAll('.draggable-window');
        windows.forEach(w => w.style.zIndex = 10);
        windowEl.style.zIndex = 100;
        // Update taskbar active states
        openApps.forEach((app, id) => {
            if (app.windowEl === windowEl) {
                app.btn.classList.add('active');
            } else {
                app.btn.classList.remove('active');
            }
        });
    };

    const openApp = (appDef) => {
        const windowEl = document.getElementById(appDef.windowId);
        if (!windowEl) return;

        if (openApps.has(appDef.windowId)) {
            // Already open, just show and bring to front
            windowEl.style.display = 'flex';
            bringToFront(windowEl);
            return;
        }

        // Create taskbar button
        const btn = document.createElement('button');
        btn.className = 'taskbar-window-btn active';
        btn.innerHTML = `<img src="${appDef.iconSrc}" alt="${appDef.title}"> ${appDef.title}`;
        taskbarApps.appendChild(btn);

        // Show the window
        windowEl.style.display = 'flex';
        bringToFront(windowEl);

        // Store reference
        openApps.set(appDef.windowId, { btn, windowEl });

        // Taskbar button click logic
        btn.addEventListener('click', () => {
            if (windowEl.style.display === 'none') {
                // Minimized: restore
                windowEl.style.display = 'flex';
                bringToFront(windowEl);
            } else if (windowEl.style.zIndex == 100) {
                // Currently focused: minimize
                windowEl.style.display = 'none';
                btn.classList.remove('active');
            } else {
                // Open but not focused: bring to front
                bringToFront(windowEl);
            }
        });

        // Close button
        const closeBtn = windowEl.querySelector('button[aria-label="Close"]');
        if (closeBtn) {
            // Remove old listeners by cloning
            const newClose = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newClose, closeBtn);
            newClose.addEventListener('click', () => {
                windowEl.style.display = 'none';
                btn.remove();
                openApps.delete(appDef.windowId);
            });
        }

        // Minimize button
        const minBtn = windowEl.querySelector('button[aria-label="Minimize"]');
        if (minBtn) {
            const newMin = minBtn.cloneNode(true);
            minBtn.parentNode.replaceChild(newMin, minBtn);
            newMin.addEventListener('click', () => {
                windowEl.style.display = 'none';
                btn.classList.remove('active');
            });
        }
    };

    // Initialize Paint window position
    const paintWindow = document.getElementById('blank-window');
    const meWindow = document.getElementById('me-window');
    const initPaintWindow = () => {
        const minW = 320;
        const minH = 400;
        
        const finalW = Math.max(minW, window.innerWidth * 0.30);
        const finalH = Math.max(minH, window.innerHeight * 0.70); 
        
        paintWindow.style.width = `${finalW}px`;
        paintWindow.style.height = `${finalH}px`;
        paintWindow.style.left = `${(window.innerWidth - finalW) / 2}px`;
        paintWindow.style.top = `${(window.innerHeight - finalH) / 2}px`;

        if (meWindow) {
            // Position "Me" window in the upper right of Greetings
            // Offset it slightly so it looks layered
            meWindow.style.left = `${(window.innerWidth - finalW) / 2 + finalW - 100}px`;
            meWindow.style.top = `${(window.innerHeight - finalH) / 2 - 20}px`;
        }
    };
    initPaintWindow();

    // Open default apps
    appRegistry.forEach(app => {
        if (app.openByDefault) {
            openApp(app);
        }
    });
    
    // Ensure Paint is at the front on startup
    if (paintWindow) bringToFront(paintWindow);
    
    // Select icon on click
    desktopIcons.forEach(icon => {
        icon.addEventListener('mousedown', (e) => {
            desktopIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            e.stopPropagation(); // prevent desktop click from immediately deselecting
        });

        // Double click logic
        icon.addEventListener('dblclick', () => {
            // Check if it's an app icon
            const appDef = appRegistry.find(a => a.desktopIconId === icon.id);
            if (appDef) {
                openApp(appDef);
                return;
            }
            // External link icons
            if (icon.id === 'ie-icon') {
                window.open('https://www.linkedin.com/in/matthewwangwty/', '_blank');
            } else if (icon.id === 'github-icon') {
                window.open('https://github.com/matthewwangwty', '_blank');
            } else if (icon.id === 'recycle-icon') {
                // Open explorer and navigate to Recycle Bin
                currentDrive = 'recycle';
                currentFolder = null;
                buildTree();
                renderFileList();
                const explorerDef = appRegistry.find(a => a.windowId === 'explorer-window');
                if (explorerDef) openApp(explorerDef);
            }
        });
    });
    
    // Deselect if clicking desktop (outside icons)
    document.getElementById('desktop').addEventListener('mousedown', (e) => {
        desktopIcons.forEach(icon => icon.classList.remove('selected'));
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
            bringToFront(win);
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
                bringToFront(win);
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
                const minHeight = 400;

                if (currentHandle.includes('e')) {
                    let newWidth = Math.max(minWidth, startWidth + (e.clientX - startX));
                    win.style.width = `${newWidth}px`;
                }
                if (currentHandle.includes('s')) {
                    let newHeight = Math.max(minHeight, startHeight + (e.clientY - startY));
                    win.style.height = `${newHeight}px`;
                }
                if (currentHandle.includes('w')) {
                    let newWidth = Math.max(minWidth, startWidth - (e.clientX - startX));
                    win.style.width = `${newWidth}px`;
                    win.style.left = `${startLeft + (startWidth - newWidth)}px`;
                }
                if (currentHandle.includes('n')) {
                    let newHeight = Math.max(minHeight, startHeight - (e.clientY - startY));
                    win.style.height = `${newHeight}px`;
                    win.style.top = `${startTop + (startHeight - newHeight)}px`;
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
    let brushSize = 5;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // --- Custom Cursor System ---
    // Generate cursor data URLs from the tools sprite sheet
    const toolCursors = {}; // { toolName: 'url(...) x y, auto' }
    const cursorOutline = document.getElementById('cursor-outline');
    let isOverCanvas = false;

    // Sprite positions: toolName -> x offset in sprite
    const toolSpriteOffsets = {
        'eraser': 32,
        'fill': 48,
        'eyedropper': 64,
        'pencil': 96,
        'brush': 112,
        'airbrush': 128
    };

    // Load the tools sprite and generate individual cursor images
    const toolsSprite = new Image();
    toolsSprite.onload = () => {
        const size = 16;
        Object.entries(toolSpriteOffsets).forEach(([tool, offsetX]) => {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = size;
            offCanvas.height = size;
            const offCtx = offCanvas.getContext('2d');

            // Draw the icon from the sprite
            offCtx.drawImage(toolsSprite, offsetX, 0, size, size, 0, 0, size, size);

            // Convert to black and white
            const imgData = offCtx.getImageData(0, 0, size, size);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 128) continue; // skip transparent pixels
                const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                const bw = gray < 128 ? 0 : 255;
                d[i] = bw;
                d[i + 1] = bw;
                d[i + 2] = bw;
            }
            offCtx.putImageData(imgData, 0, 0);

            const dataUrl = offCanvas.toDataURL('image/png');
            // Hotspot at bottom-left (0, 15) so the icon appears to the top-right of the click point
            // For pencil, shift it left by setting the hotspot X to 4
            const hotspotX = tool === 'pencil' ? 4 : 0;
            toolCursors[tool] = `url(${dataUrl}) ${hotspotX} 15, auto`;
        });

        // Apply initial cursor for pencil
        updateCanvasCursor();
    };
    toolsSprite.src = 'assets/tools.png';

    // Update the canvas cursor based on the current tool
    const updateCanvasCursor = () => {
        const canvas = document.getElementById('paint-canvas');
        if (!canvas) return;

        if (currentTool === 'brush' || currentTool === 'eraser') {
            // Hide cursor, show outline overlay instead
            canvas.style.cursor = 'none';
        } else if (toolCursors[currentTool]) {
            canvas.style.cursor = toolCursors[currentTool];
        } else {
            canvas.style.cursor = 'crosshair';
        }
    };

    // Update the outline overlay size and shape
    const updateCursorOutline = () => {
        if (currentTool === 'brush') {
            cursorOutline.className = 'circle';
            cursorOutline.style.width = brushSize + 'px';
            cursorOutline.style.height = brushSize + 'px';
        } else if (currentTool === 'eraser') {
            cursorOutline.className = 'square';
            cursorOutline.style.width = brushSize + 'px';
            cursorOutline.style.height = brushSize + 'px';
        }
    };

    // --- Tool Selection Logic ---
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolOptionsPanel = document.getElementById('tool-options');

    // Map button titles to internal tool names
    const toolMap = {
        'Pencil': 'pencil',
        'Brush': 'brush',
        'Eraser': 'eraser',
        'Airbrush': 'airbrush',
        'Pick Color': 'eyedropper',
        'Fill': 'fill'
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

            // Update cursor
            updateCanvasCursor();
            updateCursorOutline();

            // Hide outline if not brush/eraser
            if (currentTool !== 'brush' && currentTool !== 'eraser') {
                cursorOutline.style.display = 'none';
            }

            // Hide/Show size options panel based on tool
            if (currentTool === 'pencil' || currentTool === 'fill' || currentTool === 'eyedropper') {
                toolOptionsPanel.style.visibility = 'hidden';
            } else {
                toolOptionsPanel.style.visibility = 'visible';
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
            updateCursorOutline();
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
            // Skip resize when the window is hidden/minimized (wrapper collapses to 0x0)
            const rect = canvasWrapper.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            // Save the current drawing data
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            if (canvas.width > 0 && canvas.height > 0) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            // Update internal dimensions
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

        // Eraser draws with static square shapes, avoiding rotation
        const drawSquareLine = (x1, y1, x2, y2, color, size) => {
            ctx.fillStyle = color;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.max(Math.abs(dx), Math.abs(dy));
            
            if (distance === 0) {
                ctx.fillRect(x1 - size / 2, y1 - size / 2, size, size);
                return;
            }

            for (let i = 0; i <= distance; i++) {
                const x = x1 + (dx * i) / distance;
                const y = y1 + (dy * i) / distance;
                ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
            }
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
            updateCanvasCursor();
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

        // Flood fill (bucket tool) — scanline algorithm for performance
        const floodFill = (startX, startY, fillColor) => {
            const w = canvas.width;
            const h = canvas.height;
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;

            // Parse fill color to RGB
            const tempEl = document.createElement('div');
            tempEl.style.color = fillColor;
            document.body.appendChild(tempEl);
            const computed = getComputedStyle(tempEl).color;
            document.body.removeChild(tempEl);
            const rgbMatch = computed.match(/\d+/g);
            const fillR = parseInt(rgbMatch[0]);
            const fillG = parseInt(rgbMatch[1]);
            const fillB = parseInt(rgbMatch[2]);

            // Get the color at the clicked pixel
            const idx = (startY * w + startX) * 4;
            const targetR = data[idx];
            const targetG = data[idx + 1];
            const targetB = data[idx + 2];
            const targetA = data[idx + 3];

            // Don't fill if the target color is already the fill color
            if (targetR === fillR && targetG === fillG && targetB === fillB) return;

            const tolerance = 0; // Exact match
            const matchesTarget = (i) => {
                return Math.abs(data[i] - targetR) <= tolerance &&
                       Math.abs(data[i + 1] - targetG) <= tolerance &&
                       Math.abs(data[i + 2] - targetB) <= tolerance &&
                       Math.abs(data[i + 3] - targetA) <= tolerance;
            };

            const setPixel = (i) => {
                data[i] = fillR;
                data[i + 1] = fillG;
                data[i + 2] = fillB;
                data[i + 3] = 255;
            };

            // Scanline flood fill
            const stack = [[startX, startY]];
            while (stack.length > 0) {
                let [x, y] = stack.pop();
                let i = (y * w + x) * 4;

                // Move up to the topmost matching pixel in this column
                while (y >= 0 && matchesTarget(i)) {
                    y--;
                    i -= w * 4;
                }
                y++;
                i += w * 4;

                let reachLeft = false;
                let reachRight = false;

                // Scan downward
                while (y < h && matchesTarget(i)) {
                    setPixel(i);

                    // Check left
                    if (x > 0) {
                        if (matchesTarget(i - 4)) {
                            if (!reachLeft) {
                                stack.push([x - 1, y]);
                                reachLeft = true;
                            }
                        } else {
                            reachLeft = false;
                        }
                    }

                    // Check right
                    if (x < w - 1) {
                        if (matchesTarget(i + 4)) {
                            if (!reachRight) {
                                stack.push([x + 1, y]);
                                reachRight = true;
                            }
                        } else {
                            reachRight = false;
                        }
                    }

                    y++;
                    i += w * 4;
                }
            }

            ctx.putImageData(imageData, 0, 0);
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

            // Fill (bucket) tool
            if (currentTool === 'fill') {
                const pos = getCanvasPos(e);
                const color = (e.button === 2) ? secondaryColor : primaryColor;
                floodFill(Math.floor(pos.x), Math.floor(pos.y), color);
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
            // Track cursor outline position for brush/eraser
            if ((currentTool === 'brush' || currentTool === 'eraser') && isOverCanvas) {
                cursorOutline.style.left = e.clientX + 'px';
                cursorOutline.style.top = e.clientY + 'px';
            }

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

        // Show/hide cursor outline on canvas enter/leave
        canvas.addEventListener('mouseenter', () => {
            isOverCanvas = true;
            if (currentTool === 'brush' || currentTool === 'eraser') {
                updateCursorOutline();
                cursorOutline.style.display = 'block';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            isOverCanvas = false;
            cursorOutline.style.display = 'none';
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
    // 4. FREE RAM Virus Logic
    // ==========================================
    const freeRamIcon = document.getElementById('freeram-icon');
    let isInverted = false;
    let fakeCursorObj = null;
    let hideCursorStyle = null;
    let virusInitialized = false;

    const initVirus = () => {
        if (virusInitialized) return;
        virusInitialized = true;

        hideCursorStyle = document.createElement('style');
        hideCursorStyle.innerHTML = `* { cursor: none !important; }`;

        fakeCursorObj = document.createElement('div');
        fakeCursorObj.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 9999999;
            display: none;
        `;
        document.body.appendChild(fakeCursorObj);

        // Intercept and invert all mouse events
        const events = ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'contextmenu'];
        events.forEach(eventType => {
            window.addEventListener(eventType, (ev) => {
                if (!isInverted || ev._isFake) return;
                
                ev.stopPropagation();
                ev.preventDefault();

                let fakeX = window.innerWidth - ev.clientX;
                let fakeY = window.innerHeight - ev.clientY;

                let target = document.elementFromPoint(fakeX, fakeY) || document.body;

                if (eventType === 'mousemove') {
                    fakeCursorObj.style.left = fakeX + 'px';
                    fakeCursorObj.style.top = fakeY + 'px';

                    // Handle canvas mouseenter/mouseleave manually since they don't bubble
                    const isOver = (target === canvas || (canvas && canvas.contains(target)));
                    if (isOver && !isOverCanvas) {
                        canvas.dispatchEvent(new MouseEvent('mouseenter'));
                    } else if (!isOver && isOverCanvas) {
                        canvas.dispatchEvent(new MouseEvent('mouseleave'));
                    }

                    // Update fake cursor appearance
                    if (isOver && (currentTool === 'brush' || currentTool === 'eraser')) {
                        fakeCursorObj.style.display = 'none';
                    } else {
                        fakeCursorObj.style.display = 'block';
                        if (isOver && toolCursors[currentTool]) {
                            let urlMatch = toolCursors[currentTool].match(/url\((.*?)\)/);
                            if (urlMatch) {
                                fakeCursorObj.style.backgroundImage = `url(${urlMatch[1]})`;
                                let parts = toolCursors[currentTool].split(' ');
                                let hX = parts[1] && parts[1] !== 'auto' ? parseInt(parts[1]) : 0;
                                let hY = parts[2] && parts[2] !== 'auto' ? parseInt(parts[2]) : 0;
                                fakeCursorObj.style.marginLeft = `-${hX}px`;
                                fakeCursorObj.style.marginTop = `-${hY}px`;
                            }
                        } else {
                            // Default arrow cursor or crosshair
                            if (isOver) {
                                fakeCursorObj.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 0 L10 20 M0 10 L20 10" stroke="black" stroke-width="1"/></svg>')`;
                                fakeCursorObj.style.marginLeft = '-10px';
                                fakeCursorObj.style.marginTop = '-10px';
                            } else {
                                fakeCursorObj.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M1 1 L14 10 L9 11 L12 16 L10 17 L7 12 L3 15 Z" fill="white" stroke="black" stroke-width="1"/></svg>')`;
                                fakeCursorObj.style.marginLeft = '0px';
                                fakeCursorObj.style.marginTop = '0px';
                            }
                        }
                    }
                }

                let fakeEvent = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    clientX: fakeX,
                    clientY: fakeY,
                    button: ev.button,
                    buttons: ev.buttons
                });
                fakeEvent._isFake = true;
                target.dispatchEvent(fakeEvent);
            }, true); // Use capture phase to catch everything first
        });
    };

    if (freeRamIcon) {
        freeRamIcon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            initVirus();
            
            isInverted = !isInverted;

            if (isInverted) {
                document.head.appendChild(hideCursorStyle);
                fakeCursorObj.style.display = 'block';
                
                // Move to random spot
                const maxX = window.innerWidth - 80;
                const maxY = window.innerHeight - 100;
                freeRamIcon.style.top = Math.floor(Math.random() * maxY) + 'px';
                freeRamIcon.style.left = Math.floor(Math.random() * maxX) + 'px';
                freeRamIcon.style.right = 'auto';
                freeRamIcon.style.bottom = 'auto';
            } else {
                if (hideCursorStyle.parentNode) document.head.removeChild(hideCursorStyle);
                fakeCursorObj.style.display = 'none';
                
                // Restore original position
                freeRamIcon.style.top = '';
                freeRamIcon.style.left = '';
                freeRamIcon.style.right = '0px';
                freeRamIcon.style.bottom = '40px';
            }
        });
    }

    // ==========================================
    // 5. CRT Display Mode Toggle
    // ==========================================
    const displayIcon = document.getElementById('display-icon');
    const scanlinesOverlay = document.getElementById('scanlines-overlay');
    let crtEnabled = true;

    if (displayIcon && scanlinesOverlay) {
        displayIcon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            crtEnabled = !crtEnabled;
            scanlinesOverlay.style.display = crtEnabled ? 'block' : 'none';
        });
    }

    // ==========================================
    // 6. File Explorer
    // ==========================================

    // --- File type definitions (icon, extension, display name) ---
    const fileTypeDefs = {
        video:    { icon: 'assets/video.png',    ext: '.mpg',  typeName: 'Video Clip',     size: '1,024KB' },
        image:    { icon: 'assets/file.png',     ext: '.jpeg', typeName: 'JPEG Image',     size: '256KB' },
        text:     { icon: 'assets/file.png',     ext: '.txt',  typeName: 'Text Document',  size: '1KB' },
        shortcut: { icon: 'assets/internet_explorer.png', ext: '',      typeName: 'Shortcut',       size: '1KB', overlay: 'assets/shortcut.png' },
        folder:   { icon: 'assets/folder.png',   ext: '',      typeName: 'File Folder',    size: '' }
    };

    // --- Project data (ADD NEW PROJECTS HERE) ---
    // Each drive has folders, each folder has files.
    // File types: 'video', 'image', 'text', 'shortcut'
    const projectData = {
        'C:': {
            label: 'Projects (C:)',
            folders: [
                {
                    name: 'test project',
                    files: [
                        { name: 'demo_video',  type: 'video' },
                        { name: 'screenshot',  type: 'image' },
                        { name: 'readme',      type: 'text',     content: 'cheeseburger' },
                        { name: 'Website',     type: 'shortcut', url: 'https://google.com' }
                    ]
                }
            ]
        },
        'D:': {
            label: 'Art (D:)',
            folders: []
        }
    };

    // Recycle Bin (special location, not a drive)
    const recycleBin = {
        label: 'Recycle Bin',
        files: [
            { name: 'secrets', type: 'text', content: 'applesauce' }
        ]
    };

    const explorerTree = document.getElementById('explorer-tree');
    const explorerFileList = document.getElementById('explorer-file-list');
    const explorerStatus = document.getElementById('explorer-status');
    const explorerTitle = document.getElementById('explorer-title');

    let currentDrive = 'C:';
    let currentFolder = null; // null = drive root, string = folder name

    // --- Build tree view ---
    const buildTree = () => {
        if (!explorerTree) return;
        explorerTree.innerHTML = '';
        const indent = (level) => `padding-left: ${4 + level * 16}px;`;

        // Desktop
        const addItem = (icon, label, level, opts = {}) => {
            const div = document.createElement('div');
            div.className = 'explorer-tree-item' + (opts.disabled ? ' disabled' : '') + (opts.selected ? ' selected' : '');
            div.style.cssText = indent(level);
            div.innerHTML = `<img src="${icon}" alt="">${label}`;
            if (opts.onClick && !opts.disabled) {
                div.addEventListener('click', opts.onClick);
                div.style.cursor = 'pointer';
            }
            explorerTree.appendChild(div);
            return div;
        };

        addItem('assets/desktop.png', 'Desktop', 0, { disabled: true });
        addItem('assets/computer.png', 'My Computer', 1, { disabled: true });
        addItem('assets/floppy35.png', '3½ Floppy (A:)', 2, { disabled: true });

        // Drives
        Object.keys(projectData).forEach(driveKey => {
            const drive = projectData[driveKey];
            const isSelected = currentDrive === driveKey && currentFolder === null;
            const driveItem = addItem('assets/drive.png', drive.label, 2, {
                selected: isSelected,
                onClick: () => { currentDrive = driveKey; currentFolder = null; buildTree(); renderFileList(); }
            });

            // Show folders under this drive if it's the current drive
            if (currentDrive === driveKey) {
                drive.folders.forEach(folder => {
                    const isFolderSelected = currentFolder === folder.name;
                    addItem('assets/folder.png', folder.name, 3, {
                        selected: isFolderSelected,
                        onClick: () => { currentFolder = folder.name; buildTree(); renderFileList(); }
                    });
                });
            }
        });

        // Greyed-out items
        addItem('assets/drive.png', '(E:)', 2, { disabled: true });
        addItem('assets/drive.png', '(F:)', 2, { disabled: true });
        addItem('assets/computer.png', 'Printers', 1, { disabled: true });
        addItem('assets/computer.png', 'Control Panel', 1, { disabled: true });
        addItem('assets/computer.png', 'Dial-Up Networking', 1, { disabled: true });
        addItem('assets/computer.png', 'Scheduled Tasks', 1, { disabled: true });
        addItem('assets/recycling.png', 'Recycle Bin', 1, {
            selected: currentDrive === 'recycle',
            onClick: () => { currentDrive = 'recycle'; currentFolder = null; buildTree(); renderFileList(); }
        });
    };

    // --- Render the right-side file list ---
    const renderFileList = () => {
        if (!explorerFileList) return;
        explorerFileList.innerHTML = '';

        const drive = projectData[currentDrive];

        // Update title bar
        if (explorerTitle) {
            let path;
            if (currentDrive === 'recycle') {
                path = 'Recycle Bin';
            } else if (drive) {
                path = currentFolder ? `${drive.label}\\${currentFolder}` : drive.label;
            }
            explorerTitle.innerHTML = `<img src="assets/explorer.png" alt="" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;image-rendering:pixelated;">Exploring - ${path}`;
        }

        let items = [];

        if (currentDrive === 'recycle') {
            // Show recycle bin contents
            items = recycleBin.files.map(f => ({ ...f }));
        } else if (!drive) {
            return;
        } else if (currentFolder === null) {
            // Show folders in the drive root
            items = drive.folders.map(f => ({ name: f.name, type: 'folder', folderRef: f }));
        } else {
            // Show files in the selected folder
            const folder = drive.folders.find(f => f.name === currentFolder);
            if (folder) {
                items = folder.files.map(f => ({ ...f }));
            }
        }

        items.forEach(item => {
            const def = fileTypeDefs[item.type];
            const displayName = item.type === 'folder' ? item.name : (item.name + def.ext);

            const row = document.createElement('div');
            row.className = 'explorer-file-row';

            // Build icon HTML (with overlay for shortcuts)
            let iconHtml;
            if (item.type === 'shortcut') {
                iconHtml = `<span style="position:relative;display:inline-block;width:16px;height:16px;margin-right:3px;flex-shrink:0;"><img src="${def.icon}" style="width:16px;height:16px;position:absolute;top:0;left:0;"><img src="${def.overlay}" style="width:16px;height:16px;position:absolute;top:0;left:0;"></span>`;
            } else {
                iconHtml = `<img src="${def.icon}" alt="">`;
            }

            row.innerHTML = `
                <span class="file-name">${iconHtml}${displayName}</span>
                <span class="file-size">${def.size}</span>
                <span class="file-type">${def.typeName}</span>
            `;

            // Click to select
            row.addEventListener('click', () => {
                explorerFileList.querySelectorAll('.explorer-file-row').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            });

            // Double-click to open
            row.addEventListener('dblclick', () => {
                if (item.type === 'folder') {
                    currentFolder = item.name;
                    buildTree();
                    renderFileList();
                } else {
                    openFile(item);
                }
            });

            explorerFileList.appendChild(row);
        });

        if (explorerStatus) {
            explorerStatus.textContent = `${items.length} object(s)`;
        }
    };

    // --- Open a file from the explorer ---
    const openFile = (file) => {
        const def = fileTypeDefs[file.type];
        const displayName = file.name + def.ext;

        if (file.type === 'shortcut') {
            window.open(file.url, '_blank');
            return;
        }

        if (file.type === 'video' || file.type === 'image') {
            // Update the file viewer window content
            const titleEl = document.getElementById('file-viewer-title');
            const imgEl = document.getElementById('file-viewer-img');
            if (titleEl) titleEl.innerHTML = `<img src="${def.icon}" alt="" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;image-rendering:pixelated;">${displayName}`;
            if (imgEl) imgEl.src = 'assets/placeholder.png';

            // Update registry title for taskbar
            const viewerDef = appRegistry.find(a => a.windowId === 'file-viewer-window');
            if (viewerDef) viewerDef.title = displayName;

            // If already open, close first to reset taskbar button text
            if (openApps.has('file-viewer-window')) {
                const existing = openApps.get('file-viewer-window');
                existing.btn.remove();
                openApps.delete('file-viewer-window');
            }
            openApp(viewerDef);
        }

        if (file.type === 'text') {
            const titleEl = document.getElementById('file-text-title');
            const textArea = document.getElementById('file-text-area');
            if (titleEl) titleEl.innerHTML = `<img src="assets/notepad.png" alt="" style="width:14px;height:14px;margin-right:4px;vertical-align:middle;image-rendering:pixelated;">${displayName} - Notepad`;
            if (textArea) textArea.value = file.content || '';

            const textDef = appRegistry.find(a => a.windowId === 'file-text-window');
            if (textDef) textDef.title = displayName;

            if (openApps.has('file-text-window')) {
                const existing = openApps.get('file-text-window');
                existing.btn.remove();
                openApps.delete('file-text-window');
            }
            openApp(textDef);
        }
    };

    // Initialize explorer on load
    buildTree();
    renderFileList();

});
