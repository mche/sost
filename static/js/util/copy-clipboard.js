function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position="fixed";  //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  var msg;

  try {
    msg = document.execCommand('copy') ? 'success' : 'fail';
    //~ console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    //~ console.error('Fallback: Oops, unable to copy', err);
    msg = err;
  }

  document.body.removeChild(textArea);
  return msg;
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) 
    return fallbackCopyTextToClipboard(text);
  
  return navigator.clipboard.writeText(text).then(function() {
    //~ console.log('Async: Copying to clipboard was successful!');
    return 'success';
  }, function(err) {
    //~ console.error('Async: Could not copy text: ', err);
    return err;
  });
}