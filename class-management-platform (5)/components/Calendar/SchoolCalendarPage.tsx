
import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from 'date-fns';
import { fetchCalendarItemsForUser } from '../../services/apiService';
import { CalendarDisplayItem, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import AddEventModal from './AddEventModal';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const SchoolCalendarPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState<CalendarDisplayItem[]>([]);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  const loadCalendarData = () => {
    if (!currentUser) {
      setIsLoading(false);
      setError("User not found. Cannot load calendar.");
      return;
    }
    setIsLoading(true);
    fetchCalendarItemsForUser(
      currentUser.id,
      currentUser.role,
      currentUser.childStudentIds,
      currentUser.classIds
    )
      .then(data => {
        setCalendarEvents(data);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load calendar items:", err);
        setError("Could not load calendar items. Please try again later.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentUser]);

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarDisplayItem[]>();
    calendarEvents.forEach(item => {
      const dateKey = format(parseISO(item.date), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, item]);
    });
    return map;
  }, [calendarEvents]);

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const items = itemsByDate.get(dateKey) || [];
    if (items.length > 0) {
      setSelectedDayItems(items);
      setSelectedDateForModal(day);
      setIsDetailModalOpen(true);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleEventCreated = () => {
    loadCalendarData();
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4 px-1">
      <Button onClick={prevMonth} variant="secondary" size="sm" aria-label="Previous month" className="!p-2">
        <ChevronLeftIcon className="h-4.5 w-4.5" />
      </Button>
      <div className="flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-textDisplay">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        {!isToday(currentMonth) && (
             <Button onClick={goToToday} variant="ghost" size="sm" className="text-xs text-primary !py-0.5 !px-1.5 mt-0.5">
                Go to Today
            </Button>
        )}
      </div>
      <Button onClick={nextMonth} variant="secondary" size="sm" aria-label="Next month" className="!p-2">
        <ChevronRightIcon className="h-4.5 w-4.5" />
      </Button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-textSubtle uppercase leading-6 mb-1.5">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day}>{day}</div>
      ))}
    </div>
  );

  const getItemStyle = (item: CalendarDisplayItem): { bg: string, text: string, border: string, typeLabel: string } => {
    if (item.sourceType === 'school_item') {
      const schoolItem = item.item as any; // AcademicOrEventItem
      return schoolItem.type === 'academic' 
        ? { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500', typeLabel: 'Academic' }
        : { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500', typeLabel: 'Event' };
    }
    if (item.sourceType === 'class_post') {
      return { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500', typeLabel: 'Class Post' };
    }
    if (item.sourceType === 'parent_reminder') {
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-700', border: 'border-yellow-500', typeLabel: 'Reminder' };
    }
    return { bg: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500', typeLabel: 'General' };
  }

  const renderCells = () => (
    <div className="grid grid-cols-7 gap-px bg-borderLight border border-borderLight rounded-md overflow-hidden shadow-xs">
      {daysInMonth.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayItems = itemsByDate.get(dateKey) || [];
        const isCurrentMonthDay = isSameMonth(day, currentMonth);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={day.toString()}
            className={`relative p-1.5 min-h-[80px] sm:min-h-[100px] 
                        ${isCurrentMonthDay ? 'bg-bgSurface' : 'bg-bgMuted text-textDisabled'}
                        ${dayItems.length > 0 && isCurrentMonthDay ? 'cursor-pointer hover:bg-slate-50 transition-colors duration-150' : ''}`}
            onClick={isCurrentMonthDay ? () => handleDayClick(day) : undefined}
            role={isCurrentMonthDay && dayItems.length > 0 ? "button" : undefined}
            tabIndex={isCurrentMonthDay && dayItems.length > 0 ? 0 : -1}
            onKeyDown={isCurrentMonthDay && dayItems.length > 0 ? (e) => (e.key === 'Enter' || e.key === ' ') && handleDayClick(day) : undefined}
            aria-label={`Events for ${format(day, 'MMMM d, yyyy')}`}
          >
            <time
              dateTime={format(day, 'yyyy-MM-dd')}
              className={`text-xs font-medium
                          ${isCurrentDay ? 'bg-primary text-textOnPrimary rounded-full h-5 w-5 flex items-center justify-center absolute top-1 right-1' : ''}
                          ${!isCurrentMonthDay ? 'text-textDisabled' : 'text-textBody'}`}
            >
              {format(day, 'd')}
            </time>
            {isCurrentMonthDay && dayItems.length > 0 && (
              <div className="mt-5 space-y-0.5 overflow-hidden">
                {dayItems.slice(0, 2).map(item => {
                  const style = getItemStyle(item);
                  return (
                  <div key={item.id} 
                       className={`p-0.5 text-[0.65rem] rounded truncate ${style.bg} ${style.text}`}>
                    {item.title}
                  </div>
                );
                })}
                {dayItems.length > 2 && (
                  <div className="text-[0.65rem] text-textSubtle mt-0.5">
                    + {dayItems.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  
  if (isLoading && !calendarEvents.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger-textDark bg-danger-bgLight border border-danger-borderLight text-center p-4 rounded-md">{error}</p>;
  }

  const canAddEvents = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-3 sm:mb-0">
            <CalendarDaysIcon className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-semibold text-textDisplay">School Calendar</h1>
        </div>
        {canAddEvents && (
            <Button onClick={() => setIsAddEventModalOpen(true)} variant="primary" size="sm">
                <PlusCircleIcon className="h-4.5 w-4.5 mr-1.5" />
                Add New Event
            </Button>
        )}
      </div>
      
      <div className="bg-bgSurface p-3 sm:p-4 rounded-lg shadow-sm border border-borderLight">
        {isLoading && <div className="absolute inset-0 bg-bgSurface/70 flex justify-center items-center z-10"><LoadingSpinner /></div>}
        {renderHeader()}
        {renderDaysOfWeek()}
        {renderCells()}
      </div>

      {isDetailModalOpen && selectedDateForModal && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={
            <div className="flex items-center text-md">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" />
                Events for {format(selectedDateForModal, 'MMMM d, yyyy')}
            </div>
          }
          footer={
             <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)} size="sm">Close</Button>
          }
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-sm">
            {selectedDayItems.length > 0 ? selectedDayItems.map(item => {
              const style = getItemStyle(item);
              return (
              <div key={item.id} className={`p-3 rounded-md border-l-4 ${style.border} ${style.bg}`}>
                <h3 className={`text-md font-semibold ${style.text}`}>
                  {item.title}
                </h3>
                <span className={`text-[0.7rem] font-medium uppercase px-1.5 py-0.5 rounded-full mt-1 mb-1.5 inline-block ${style.bg} ${style.text} border ${style.border}`}>
                  {style.typeLabel}
                  {item.className && item.className !== "All School (Global Feed)" && ` (${item.className})`}
                  {item.studentName && ` (for ${item.studentName})`}
                </span>
                 {item.authorName && <p className="text-xs text-textSubtle mb-0.5">By: {item.authorName}</p>}
                <p className="text-xs text-textBody whitespace-pre-line">{item.description || "No description provided."}</p>
              </div>
            );
            }) : (
              <p className="text-textSubtle text-center py-4">No events scheduled for this day.</p>
            )}
          </div>
        </Modal>
      )}

      {isAddEventModalOpen && canAddEvents && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default SchoolCalendarPage;
