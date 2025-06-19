
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Post, AcademicOrEventItem, PostType } from '../../types';
import { fetchGlobalPosts, createPost, fetchAcademicAndEventItems, createAcademicOrEventItem } from '../../services/apiService';
import Button from '../UI/Button';
import FeedCard from '../Feeds/FeedCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Input from '../UI/Input';
import { format } from 'date-fns';
import { MegaphoneIcon, CalendarDaysIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

type ActiveTab = 'announcements' | 'calendar';

const GlobalFeedManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [globalPosts, setGlobalPosts] = useState<Post[]>([]);
  const [calendarItems, setCalendarItems] = useState<AcademicOrEventItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('announcements');

  // State for new announcement form
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>(PostType.ACADEMIC_ANNOUNCEMENT);

  // State for new calendar item form
  const [showCalendarItemForm, setShowCalendarItemForm] = useState(false);
  const [newCalendarItemTitle, setNewCalendarItemTitle] = useState('');
  const [newCalendarItemDescription, setNewCalendarItemDescription] = useState('');
  const [newCalendarItemDate, setNewCalendarItemDate] = useState('');
  const [newCalendarItemType, setNewCalendarItemType] = useState<'academic' | 'event'>('academic');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    setIsLoadingPosts(true);
    try {
      const posts = await fetchGlobalPosts();
      setGlobalPosts(posts);
    } catch (error) {
      console.error("Failed to load global posts", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadCalendarItems = async () => {
    setIsLoadingCalendar(true);
    try {
      const items = await fetchAcademicAndEventItems();
      setCalendarItems(items);
    } catch (error) {
      console.error("Failed to load calendar items", error);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'announcements') {
      loadAnnouncements();
    } else if (activeTab === 'calendar') {
      loadCalendarItems();
    }
  }, [activeTab]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPostTitle.trim() || !newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost({
        authorId: currentUser.id,
        title: newPostTitle,
        content: newPostContent,
        type: newPostType,
        targetClassId: 'master-class-global', // Ensure global posts target master class
        isCalendarEvent: newPostType === PostType.EVENT_ANNOUNCEMENT, // Make event announcements calendar events
        eventDate: newPostType === PostType.EVENT_ANNOUNCEMENT ? new Date().toISOString() : undefined // Dummy date, admin should set this if making it a real calendar event
      }, currentUser);
      setNewPostTitle('');
      setNewPostContent('');
      setShowPostForm(false);
      await loadAnnouncements(); 
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCalendarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarItemTitle.trim() || !newCalendarItemDescription.trim() || !newCalendarItemDate) return;
    setIsSubmitting(true);
    try {
        await createAcademicOrEventItem({
            title: newCalendarItemTitle,
            description: newCalendarItemDescription,
            date: new Date(newCalendarItemDate).toISOString(),
            type: newCalendarItemType,
        });
        setNewCalendarItemTitle('');
        setNewCalendarItemDescription('');
        setNewCalendarItemDate('');
        setShowCalendarItemForm(false);
        await loadCalendarItems(); 
    } catch (error) {
        console.error("Failed to create calendar item", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ElementType;
  }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ease-in-out
        ${isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-textSubtle hover:text-textDisplay hover:border-borderDefault'
        }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-textDisplay">Global Feeds & Calendar</h1>
      
      <div className="border-b border-borderLight">
        <nav className="-mb-px flex space-x-px" aria-label="Tabs">
          <TabButton
            label="Global Announcements"
            isActive={activeTab === 'announcements'}
            onClick={() => setActiveTab('announcements')}
            icon={MegaphoneIcon}
          />
          <TabButton
            label="Academic & Event Calendar"
            isActive={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            icon={CalendarDaysIcon}
          />
        </nav>
      </div>

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
              <Button onClick={() => setShowPostForm(!showPostForm)} variant="primary" size="sm">
                  <PlusCircleIcon className="h-4 w-4 mr-1.5 inline"/> {showPostForm ? 'Cancel Post' : 'Create New Announcement'}
              </Button>
          </div>
          {showPostForm && (
              <form onSubmit={handleCreatePost} className="p-4 border border-borderDefault rounded-md mb-6 space-y-4 bg-bgSurface shadow-sm">
                  <h3 className="text-lg font-medium text-textDisplay">New Announcement</h3>
                  <Input label="Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required />
                  <div>
                      <label htmlFor="newPostContentAdmin" className="block text-sm font-medium text-textBody mb-1">Content</label>
                      <textarea id="newPostContentAdmin" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} rows={4} required className="mt-1 block w-full px-3 py-2 border border-borderDefault rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-bgSurface placeholder-textSubtle" />
                  </div>
                  <div>
                      <label htmlFor="newPostTypeAdmin" className="block text-sm font-medium text-textBody mb-1">Type</label>
                      <select id="newPostTypeAdmin" value={newPostType} onChange={(e) => setNewPostType(e.target.value as PostType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-borderDefault focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-bgSurface">
                          <option value={PostType.ACADEMIC_ANNOUNCEMENT}>Academic Announcement</option>
                          <option value={PostType.EVENT_ANNOUNCEMENT}>Event Announcement</option>
                          <option value={PostType.CLASS_UPDATE}>General Update (For All School)</option>
                      </select>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isSubmitting} size="sm">Post Announcement</Button>
                  </div>
              </form>
          )}
          {isLoadingPosts ? <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div> : globalPosts.length > 0 ? (
            globalPosts.map(post => <FeedCard key={post.id} post={post} />)
          ) : <div className="text-center py-10 text-textSubtle bg-bgSurface rounded-md border border-borderLight"><MegaphoneIcon className="h-12 w-12 mx-auto text-textSubtle/50 mb-2"/>No global announcements yet.</div>}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-4">
           <div className="flex justify-end">
              <Button onClick={() => setShowCalendarItemForm(!showCalendarItemForm)} variant="primary" size="sm">
                 <PlusCircleIcon className="h-4 w-4 mr-1.5 inline"/> {showCalendarItemForm ? 'Cancel Entry' : 'Add Calendar Item'}
              </Button>
          </div>
          {showCalendarItemForm && (
               <form onSubmit={handleCreateCalendarItem} className="p-4 border border-borderDefault rounded-md mb-6 space-y-4 bg-bgSurface shadow-sm">
                  <h3 className="text-lg font-medium text-textDisplay">New Calendar Item</h3>
                  <Input label="Title" value={newCalendarItemTitle} onChange={(e) => setNewCalendarItemTitle(e.target.value)} required />
                  <Input label="Date" type="date" value={newCalendarItemDate} onChange={(e) => setNewCalendarItemDate(e.target.value)} required />
                  <div>
                      <label htmlFor="newCalendarItemDescAdmin" className="block text-sm font-medium text-textBody mb-1">Description</label>
                      <textarea id="newCalendarItemDescAdmin" value={newCalendarItemDescription} onChange={(e) => setNewCalendarItemDescription(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-2 border border-borderDefault rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-bgSurface placeholder-textSubtle" />
                  </div>
                  <div>
                      <label htmlFor="newCalendarItemTypeAdmin" className="block text-sm font-medium text-textBody mb-1">Type</label>
                      <select id="newCalendarItemTypeAdmin" value={newCalendarItemType} onChange={(e) => setNewCalendarItemType(e.target.value as 'academic' | 'event')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-borderDefault focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-bgSurface">
                          <option value="academic">Academic</option>
                          <option value="event">Event</option>
                      </select>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isSubmitting} size="sm">Add to Calendar</Button>
                  </div>
              </form>
          )}
          {isLoadingCalendar ? <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div> : calendarItems.length > 0 ? (
            <div className="bg-bgSurface p-3 sm:p-4 rounded-md border border-borderLight shadow-sm">
                <ul className="space-y-3">
                    {calendarItems.map(item => (
                    <li key={item.id} className={`p-3 rounded-md border-l-4 ${item.type === 'academic' ? 'border-blue-400 bg-blue-500/10' : 'border-indigo-400 bg-indigo-500/10'}`}>
                        <div className="flex justify-between items-start">
                        <h4 className={`font-semibold text-md ${item.type === 'academic' ? 'text-blue-700' : 'text-indigo-700'}`}>{item.title}</h4>
                        <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ml-2 ${item.type === 'academic' ? 'bg-blue-200 text-blue-800' : 'bg-indigo-200 text-indigo-800'}`}>{item.type}</span>
                        </div>
                        <p className="text-sm text-textBody mt-0.5">{item.description}</p>
                        <p className="text-xs text-textSubtle mt-1.5">Date: {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}</p>
                    </li>
                    ))}
                </ul>
            </div>
          ) : <div className="text-center py-10 text-textSubtle bg-bgSurface rounded-md border border-borderLight"><CalendarDaysIcon className="h-12 w-12 mx-auto text-textSubtle/50 mb-2"/>No calendar items yet.</div>}
        </div>
      )}
    </div>
  );
};

export default GlobalFeedManager;
