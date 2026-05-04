// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Windows 98 environment initialized.");

    // ==========================================
    // 1. Window Management & Dragging
    // ==========================================
    
    // Variables for tracking window drag state
    let isDragging = false;
    let activeWindow = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // We will attach event listeners for window dragging here later
    // The typical logic:
    // - mousedown on .title-bar: start dragging
    // - mousemove on document: update active window position
    // - mouseup on document: stop dragging

    // ==========================================
    // 2. Canvas & MS Paint functionality
    // ==========================================
    
    // We will build functionality to spawn new MS Paint windows with canvas
    // Canvas logic structure:
    // - A container for the tools
    // - A <canvas> element
    // - Variables for tool state (e.g. pencil, fill, color picker)
    // - Event listeners on canvas for mousedown, mousemove, mouseup to draw

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
