// Hide stray Edit and Save buttons that appear on embedded pages
(function() {
  function hideEditorButtons() {
    // Find all buttons on the page
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach(button => {
      const text = button.textContent.trim();
      const styles = window.getComputedStyle(button);
      
      // Check if it's an Edit or Save button with purple background
      if ((text === 'Edit' || text === 'Save') && 
          styles.backgroundColor === 'rgb(118, 75, 162)') {
        button.style.display = 'none';
        console.log('Hidden editor button:', text);
      }
      
      // Also hide buttons in fixed/absolute position at bottom left
      if ((styles.position === 'fixed' || styles.position === 'absolute') &&
          parseInt(styles.bottom) >= 0 && parseInt(styles.bottom) < 100 &&
          parseInt(styles.left) >= 0 && parseInt(styles.left) < 100) {
        const bgColor = styles.backgroundColor;
        if (bgColor === 'rgb(118, 75, 162)' || text === 'Edit' || text === 'Save') {
          button.style.display = 'none';
          console.log('Hidden positioned editor button:', text);
        }
      }
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideEditorButtons);
  } else {
    hideEditorButtons();
  }
  
  // Also run after a short delay to catch dynamically added buttons
  setTimeout(hideEditorButtons, 500);
  setTimeout(hideEditorButtons, 1000);
  setTimeout(hideEditorButtons, 2000);
})();
