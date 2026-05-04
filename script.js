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
                const minHeight = 400;

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
    
    // Tool Selection Logic
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tool buttons
            toolBtns.forEach(b => b.classList.remove('active'));
            // Add active class to the clicked button
            btn.classList.add('active');
        });
    });

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
