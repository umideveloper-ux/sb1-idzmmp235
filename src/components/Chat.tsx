import React, { useState, useEffect, useRef } from 'react';
import { School, Message } from '../types';
import { Send, Paperclip, Smile, Car } from 'lucide-react';
import { db } from '../firebase';
import { ref, push, onChildAdded, query, orderByKey, limitToLast } from 'firebase/database';

interface ChatProps {
  currentSchool: School;
  schools: School[];
}

const Chat: React.FC<ChatProps> = ({ currentSchool, schools }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const messagesQuery = query(messagesRef, orderByKey(), limitToLast(100));
    
    const unsubscribe = onChildAdded(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const newMsg: Message = {
        id: snapshot.key as string,
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        content: data.content,
        timestamp: new Date(data.timestamp),
      };
      setMessages((prevMessages) => {
        if (!prevMessages.some(msg => msg.id === newMsg.id)) {
          return [...prevMessages, newMsg].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
        return prevMessages;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
      schoolId: currentSchool.id,
      schoolName: currentSchool.name,
      content: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col bg-gray-100 h-[600px] rounded-lg overflow-hidden shadow-lg">
      {/* Chat header */}
      <div className="bg-teal-600 text-white px-4 py-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white text-teal-600 flex items-center justify-center mr-3">
          <Car className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold">Sürücü Kursları Sohbeti</h2>
          <p className="text-xs">{schools.length} katılımcı</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')]">
        {messages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            className={`flex ${
              message.schoolId === currentSchool.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-lg ${
                message.schoolId === currentSchool.id
                  ? 'bg-teal-100 text-teal-900'
                  : 'bg-white text-gray-800'
              }`}
            >
              {message.schoolId !== currentSchool.id && (
                <p className="font-semibold text-xs text-teal-600">{message.schoolName}</p>
              )}
              <p className="text-sm break-words">{message.content}</p>
              <p className="text-xs text-right mt-1 text-gray-500">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSendMessage} className="bg-gray-200 px-4 py-2 flex items-center">
        <button type="button" className="text-gray-600 hover:text-gray-800 mr-2">
          <Smile className="h-6 w-6" />
        </button>
        <button type="button" className="text-gray-600 hover:text-gray-800 mr-2">
          <Paperclip className="h-6 w-6" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesaj yazın"
          className="flex-grow px-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="ml-2 bg-teal-500 text-white rounded-full p-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;