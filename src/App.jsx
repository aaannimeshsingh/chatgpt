import { useState, useEffect } from 'react';
import * as webllm from "@mlc-ai/web-llm";
import './app.css';

function App() {
  const [count,setCount]=useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are helpful assistant that can help me with my task" }
  ]);
  const [engine, setEngine] = useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
    webllm.CreateMLCEngine(
      selectedModel,
      {
        initProgressCallback: (progress) => {
          console.log("Init Progress:", progress);
        }
      }
    ).then((engine) => {
      setEngine(engine);
    });
  }, []);

  async function sendMessageToLlm() {
  const tempMessages = [...messages];
  tempMessages.push({
    role:"user",
    content:input
  })

  setMessages(tempMessages);
  setInput("");
  engine.chat.completions.create({
    messages:tempMessages
  }).then(((reply)=>{
    console.log("reply",reply);
    const text=reply.choices[0].message.content
    
    
    setMessages([...tempMessages,{
      role:"assistant",
      content:text
    }]);
  }))
  
}


  return (
    <main>
      <section>
        <div className="conversation-area">
          <div className='messages'>
            {messages.filter(message=>message.role!=="system").map((msg, i) => (
              <div className={`message ${msg.role}`} key={i}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessageToLlm()}
              type="text"
              placeholder="Message LLM"
            />
            <button onClick={sendMessageToLlm}>send</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
