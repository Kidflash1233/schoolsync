
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDisplayItem } from '../../types';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface UpcomingEventsCardProps {
  title: string;
  events: CalendarDisplayItem[];
  isLoading: boolean;
  maxEvents?: number;
}

const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ title, events, isLoading, maxEvents = 5 }) => {

  const getEventItemStyle = (item: CalendarDisplayItem) => {
    let borderColor = 'border-gray-300';
    let bgColor = 'bg-gray-50';
    let textColor = 'text-gray-700';

    switch (item.sourceType) {
      case 'school_item':
        const schoolItem = item.item as any; // AcademicOrEventItem
        if (schoolItem.type === 'academic') {
          borderColor = 'border-blue-500'; bgColor = 'bg-blue-50'; textColor = 'text-blue-700';
        } else { // event
          borderColor = 'border-indigo-500'; bgColor = 'bg-indigo-50'; textColor = 'text-indigo-700';
        }
        break;
      case 'class_post':
        borderColor = 'border-green-500'; bgColor = 'bg-green-50'; textColor = 'text-green-700';
        break;
      case 'parent_reminder': // Relevant for teacher's view of this card
        borderColor = 'border-yellow-500'; bgColor = 'bg-yellow-50'; textColor = 'text-yellow-700';
        break;
    }
    return { borderColor, bgColor, textColor, rawType: item.sourceType === 'school_item' ? (item.item as any).type : item.sourceType.replace('_', ' ') };
  };
  
  const displayedEvents = events.slice(0, maxEvents);

  return (
    <Card title={title}>
      {isLoading ? (
        <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
      ) : displayedEvents.length > 0 ? (
        <div className="space-y-3">
          {displayedEvents.map(event => {
            const style = getEventItemStyle(event);
            return (
              <div key={event.id} className={`p-3 rounded-md border-l-4 ${style.borderColor} ${style.bgColor}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className={`font-semibold ${style.textColor}`}>{event.title}</h4>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(event.date), 'MMM d, yyyy')}
                          {event.className && event.className !== "All School (Global Feed)" && ` - ${event.className}`}
                        </p>
                    </div>
                     <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${
                        style.rawType === 'academic' ? 'bg-blue-200 text-blue-800' :
                        style.rawType === 'event' ? 'bg-indigo-200 text-indigo-800' :
                        style.rawType === 'class post' ? 'bg-green-200 text-green-800' :
                        'bg-yellow-200 text-yellow-800' // parent reminder
                    }`}>
                        {style.rawType}
                    </span>
                </div>
                {event.description && <p className="text-xs text-gray-600 mt-1 truncate">{event.description}</p>}
              </div>
            );
          })}
          <div className="pt-3 text-center">
            <Link to="/calendar" className="inline-flex items-center text-primary hover:text-primary-dark font-medium group">
              View Full Calendar
              <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
            <CalendarDaysIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            No upcoming events found.
        </div>
      )}
    </Card>
  );
};

export default UpcomingEventsCard;
