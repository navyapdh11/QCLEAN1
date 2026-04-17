'use client';
import { useChat } from 'ai/react';

export default function RAGChatWidget() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/rag',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: "Hi! I'm PrimeClean AI. Tell me your location and cleaning needs – I'll pull our latest pricing and availability instantly."
    }]
  });

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-full bg-white shadow-2xl rounded-2xl border border-gray-100 flex flex-col z-50 h-[500px]">
      <div className="p-4 bg-blue-600 text-white rounded-t-2xl font-semibold flex justify-between items-center">
        <span>PrimeClean AI Support</span>
        <span className="text-xs bg-blue-800 px-2 py-1 rounded-full">24/7</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-400 animate-pulse">Searching compliance docs & pricing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="e.g. Medical cleaning requirements in Sydney..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
