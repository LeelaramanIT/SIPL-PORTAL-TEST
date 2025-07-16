import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { Box, Typography } from '@mui/material';
import Heading from '../../components/Heading';
import DialogBox from '../../components/DialogBox';

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setOpen] = useState(false);

  const handleDateClick = (selected) => {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    setSelectedEvent(selected);
    setOpen(true);
  };

  const confirmDelete = () => {
    selectedEvent.event.remove();
    setOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Box m={2}>
      <Heading level={1}>Calendar</Heading>

      {/* Flex container */}
      <Box display="flex" gap={2}>
        {/* Left panel - Event List */}
        <Box
          flex="1"
          p={2}
          bgcolor="#fff"
          borderRadius={2}
          boxShadow={1}
          maxHeight="75vh"
          overflow="auto"
        >
          <Typography variant="h6">Events</Typography>
          {currentEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events yet
            </Typography>
          ) : (
            currentEvents.map((event) => (
              <Typography key={event.id} variant="body2" mt={1}>
                📅 {event.title} — {event.startStr}
              </Typography>
            ))
          )}
        </Box>

        {/* Right panel - Calendar */}
        <Box
          flex="3"
          p={2}
          bgcolor="#fff"
          borderRadius={2}
          boxShadow={1}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            }}
            height="75vh"
            selectable={true}
            select={handleDateClick}
            eventsSet={(events) => setCurrentEvents(events)}
            eventClick={handleEventClick}
          />
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      {isOpen && selectedEvent && (
        <DialogBox
          title="Delete Event"
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          message={`Are you sure you want to delete the event "${selectedEvent.event.title}"?`}
          onConfirm={confirmDelete}
          cancelText="Cancel"
          confirmText="Delete"
        />
      )}
    </Box>
  );
};

export default Calendar;
