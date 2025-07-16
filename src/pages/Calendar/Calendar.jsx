// src/components/CalendarView.jsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import '@fullcalendar/timegrid/index.css';

const Calendar = ({ variant = 'full', events = [] }) => {
  const isFull = variant === 'full';

  return (
    <div className={isFull ? 'p-4 bg-white shadow rounded-2xl' : ''}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={
          isFull
            ? {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth',
              }
            : false // hide header in mini mode
        }
        events={events}
        height={isFull ? 'auto' : 'auto'}
        dayMaxEventRows={isFull} // only true in full view
        eventContent={(arg) => {
          if (isFull) {
            return <div>{arg.event.title}</div>;
          } else {
            // Mini version: colored block only
            return (
              <div
                style={{
                  backgroundColor: arg.event.backgroundColor || '#60a5fa', // default blue
                  height: '6px',
                  borderRadius: '4px',
                  marginTop: '2px',
                }}
              ></div>
            );
          }
        }}
      />
    </div>
  );
};

export default Calendar;
