
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchConversationsForUser, fetchMessages, sendMessage } from '../../services/apiService';
import { Conversation, Message as MessageType, User } from '../../types';
import LoadingSpinner from '../UI/LoadingSpinner';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';


const ParentMessages: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation(); // To get state for pre-selecting a conversation
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingConversations(true);
      fetchConversationsForUser(currentUser.id)
        .then(convos => {
            setConversations(convos);
            // Check if there's a preselectUserId from navigation state
            const preselectUserId = location.state?.preselectUserId;
            if (preselectUserId) {
                const convoToSelect = convos.find(c => c.participant.id === preselectUserId);
                if (convoToSelect) {
                    handleSelectConversation(convoToSelect);
                }
            }
        })
        .catch(console.error)
        .finally(() => setIsLoadingConversations(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, location.state]);

  const loadMessages = async (participantId: string) => {
    if (!currentUser) return;
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await fetchMessages(currentUser.id, participantId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.participant.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedConversation || !newMessageContent.trim()) return;
    setIsSending(true);
    try {
      await sendMessage({
        senderId: currentUser.id,
        receiverId: selectedConversation.participant.id,
        content: newMessageContent,
      }, currentUser);
      setNewMessageContent('');
      await loadMessages(selectedConversation.participant.id);
      fetchConversationsForUser(currentUser.id).then(setConversations);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingConversations) return <Card title="Messages"><LoadingSpinner /></Card>;

 return (
    <div className="flex h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white overflow-y-auto ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <Card title="Your Teacher Contacts" className="shadow-none rounded-none h-full">
            {conversations.length > 0 ? (
                <ul>
                {conversations.map(convo => (
                    <li key={convo.id} 
                        onClick={() => handleSelectConversation(convo)}
                        className={`p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${selectedConversation?.id === convo.id ? 'bg-indigo-50' : ''}`}
                    >
                    <div className="flex items-center space-x-3">
                        <Avatar src={convo.participant.avatarUrl} alt={convo.participant.name} size="md" />
                        <div>
                        <p className="font-semibold text-neutral-dark">{convo.participant.name} <span className="text-xs text-gray-500">(Teacher)</span></p>
                        <p className="text-sm text-gray-500 truncate w-48">{convo.lastMessage.content}</p>
                        </div>
                        {convo.unreadCount > 0 && <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{convo.unreadCount}</span>}
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="p-4 text-center text-gray-500">No message history with teachers yet.</p>
            )}
        </Card>
      </div>

      <div className={`w-full md:w-2/3 bg-gray-50 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
                 <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeftIcon className="h-5 w-5"/>
                </Button>
                <Avatar src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.name} size="md" />
                <div>
                    <h2 className="text-lg font-semibold text-neutral-dark">{selectedConversation.participant.name}</h2>
                     <p className="text-xs text-gray-500">Teacher</p>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {isLoadingMessages ? <LoadingSpinner /> : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.senderId === currentUser?.id ? 'bg-primary text-white' : 'bg-white text-neutral-dark'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>{format(new Date(msg.timestamp), 'p')}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
              <Input 
                value={newMessageContent} 
                onChange={(e) => setNewMessageContent(e.target.value)} 
                placeholder="Type your message..." 
                className="flex-1 !mb-0"
                disabled={isSending}
              />
              <Button type="submit" isLoading={isSending} disabled={isSending || !newMessageContent.trim()} className="rounded-full !p-3">
                 <PaperAirplaneIcon className="h-5 w-5 text-white"/>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Select a teacher to view messages or start a new conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentMessages;
