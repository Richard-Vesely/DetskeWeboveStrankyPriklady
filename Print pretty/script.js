// Handle the "Pretty Print" button click
document.getElementById('prettyPrintBtn').addEventListener('click', function() {
    // Get the text from the input field
    const inputText = document.getElementById('textInput').value;
    
    // Set the text in the neon display
    document.getElementById('neonDisplay').innerText = inputText;
    
    // Hide the input section (both input field and pretty print button)
    document.getElementById('inputSection').style.display = 'none';
    
    // Show the back button
    document.getElementById('backButton').style.display = 'block';
  });
  
  // Handle the "Back" button click
  document.getElementById('backButton').addEventListener('click', function() {
    // Show the input section again
    document.getElementById('inputSection').style.display = 'block';
    
    // Clear the neon display
    document.getElementById('neonDisplay').innerText = '';
    
    // Hide the back button
    document.getElementById('backButton').style.display = 'none';
  });
  