import { useState, useEffect } from 'react';
import * as webllm from "@mlc-ai/web-llm";
import './app.css';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are helpful assistant that can help me with my task" }
  ]);
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initProgress, setInitProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setLoading(true);
        setError("");
        
        const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
        
        const engine = await webllm.CreateMLCEngine(
          selectedModel,
          {
            initProgressCallback: (progress) => {
              console.log("Init Progress:", progress);
              setInitProgress(`Loading model: ${Math.round(progress.progress * 100)}%`);
            }
          }
        );
        
        setEngine(engine);
        setInitProgress("Model loaded successfully!");
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize engine:", err);
        setError(`Failed to load model: ${err.message}`);
        setLoading(false);
      }
    };

    initializeEngine();
  }, []);

  async function sendMessageToLlm() {
    if (!engine) {
      setError("Model not loaded yet. Please wait.");
      return;
    }

    if (!input.trim()) return;

    try {
      const tempMessages = [...messages];
      tempMessages.push({
        role: "user",
        content: input
      });
      
      setMessages(tempMessages);
      setInput("");
      setLoading(true);

      const reply = await engine.chat.completions.create({
        messages: tempMessages
      });

      const text = reply.choices[0].message.content;
      setMessages([...tempMessages, {
        role: "assistant",
        content: text
      }]);
      setLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <main>
      <section>
        <div className="conversation-area">
          <div className='messages'>
            {error && (
              <div className="message error" style={{backgroundColor: '#d32f2f', color: 'white'}}>
                {error}
              </div>
            )}
            {loading && initProgress && (
              <div className="message system" style={{backgroundColor: '#1976d2', color: 'white'}}>
                {initProgress}
              </div>
            )}
            {messages.filter(message => message.role !== "system").map((msg, i) => (
              <div className={`message ${msg.role}`} key={i}>
                {msg.content}
              </div>
            ))}
            {loading && !initProgress && (
              <div className="message system" style={{backgroundColor: '#1976d2', color: 'white'}}>
                Thinking...
              </div>
            )}
          </div>
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessageToLlm()}
              type="text"
              placeholder={engine ? "Message LLM" : "Loading model..."}
              disabled={!engine || loading}
            />
            <button 
              onClick={sendMessageToLlm}
              disabled={!engine || loading || !input.trim()}
            >
              {loading ? "..." : "send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;