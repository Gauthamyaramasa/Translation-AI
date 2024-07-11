import React, { useState } from 'react';
import './App.css';

function App() {
  const [messageA, setMessageA] = useState('');
  const [messageB, setMessageB] = useState('');
  const [chatA, setChatA] = useState([]);
  const [chatB, setChatB] = useState([]);
  const [languageA, setLanguageA] = useState('English');
  const [languageB, setLanguageB] = useState('English');

  const languageCodes = {
    English: 'en',
    Hindi: 'hi',
    Telugu: 'te',
    Tamil: 'ta',
    Kannada: 'kn',
    Malayalam: 'ml',
  };

  const sendMessage = (sender) => {
    const messageToSend = sender === 'A' ? messageA : messageB;
    const sourceLangCode = languageCodes[sender === 'A' ? languageA : languageB];
    const targetLangCode = languageCodes[sender === 'A' ? languageB : languageA];
    
    if (messageToSend) {
      // Reset input to empty
      sender === 'A' ? setMessageA('') : setMessageB('');

      fetch('https://translation-ai-server.onrender.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageToSend,
          sourceLang: sourceLangCode,
          targetLang: targetLangCode,
        }),
      })
      .then(response => response.json())
      .then(data => {
        // Assume data contains { translatedText: '...', targetLang: '...' }
        const translatedText = data.translatedText;
        
        // Update chat for User A or User B depending on the sender
        if (sender === 'A') {
          setChatA((prevChat) => [...prevChat, { sender, message: messageToSend }]);
          setChatB((prevChat) => [...prevChat, { sender, message: translatedText }]);
        } else {
          setChatB((prevChat) => [...prevChat, { sender, message: messageToSend }]);
          setChatA((prevChat) => [...prevChat, { sender, message: translatedText }]);
        }
      })
      .catch(error => {
        console.error('Translation error:', error);
      });
    }
  };


  return (
    <div className="App">
      <h1>Translation AI</h1>
      <div className="language-selection-container">
        <div className="language-select">
          <label htmlFor="language-a">Preferred Language:</label>
          <select id="language-a" value={languageA} onChange={(e) => setLanguageA(e.target.value)}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
          </select>
        </div>
        <div className="language-select">
          <label htmlFor="language-b">Preferred Language:</label>
          <select id="language-b" value={languageB} onChange={(e) => setLanguageB(e.target.value)}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
          </select>
        </div>
      </div>
      <div className="chat-container">
        {/* User A Chat Box */}
      <div className="chat-box">
        <h2>User A</h2>
        <div className="messages">
          {chatA.map((msg, index) => (
            <p key={index} className={`message ${msg.sender === 'A' ? 'right' : 'left'}`}>{msg.message}</p>
          ))}
        </div>
        {/* Message input for User A */}
        <div className="chat-input">
            <input type="text" value={messageA} onChange={(e) => setMessageA(e.target.value)} />
            <button onClick={() => sendMessage('A')}>Translate</button>
          </div>
      </div>
        
        {/* User B Chat Box */}
      <div className="chat-box">
        <h2>User B</h2>
        <div className="messages">
          {chatB.map((msg, index) => (
            <p key={index} className={`message ${msg.sender === 'B' ? 'right' : 'left'}`}>{msg.message}</p>
          ))}
        </div>
        {/* Message input for User B */}
        <div className="chat-input">
            <input type="text" value={messageB} onChange={(e) => setMessageB(e.target.value)} />
            <button onClick={() => sendMessage('B')}>Translate</button>
          </div>
      </div>

      </div>
    </div>
  );
}

export default App;
