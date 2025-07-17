import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { Box, Typography, useMediaQuery } from '@mui/material';
import Heading from '../../components/Heading';
import DialogBox from '../../components/DialogBox';


const Calendar = ({ variant = 'full' }) => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isOpen, setOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleDateClick = (selected) => {
        const title = prompt('Please enter a new title for your event');
        const calendarApi = selected.view.calendar;
        calendarApi.unselect();

        if (title) {
            const colors = ['#AEDFF7', '#FDCB82', '#C3F584', '#F88E8E'];
            const bgColor = colors[Math.floor(Math.random() * colors.length)];

            calendarApi.addEvent({
                id: `${selected.dateStr}-${title}`,
                title,
                start: selected.startStr,
                end: selected.endStr,
                allDay: selected.allDay,
                backgroundColor: bgColor,
                borderColor: bgColor,
            });
        }
    };

    const handleEventClick = (selected) => {
        setSelectedEvent(selected);
        if (variant === 'full') setOpen(true);
    };

    const confirmDelete = () => {
        selectedEvent.event.remove();
        setOpen(false);
        setSelectedEvent(null);
    };
    const isMini = variant === 'mini';
    const variantStyles = {
        full: { calendarHeight: '75vh', fontSize: '1rem', titleSize: '1.25rem' },
        mini: { calendarHeight: '25vh', fontSize: '0.75rem', titleSize: '1rem' },
        popup: { calendarHeight: '50vh', fontSize: '0.875rem', titleSize: '1.1rem' },
      };
      const { calendarHeight, fontSize, titleSize } = variantStyles[variant] || variantStyles.full;
      


    return (
        <Box m={2}>
            {variant === 'full' && <Heading level={1}>Calendar</Heading>}

            <Box
                display="flex"
                flexDirection={isMobile || variant === 'mini' ? 'column' : 'row'}
                gap={2}
            >
                {variant === 'full' && (
                    <Box
                        flex={1}
                        p={isMini ? 1 : 2}
                        bgcolor="#fff"
                        borderRadius={2}
                        boxShadow={1}
                        maxHeight={isMini ? 'auto' : '79vh'}
                        overflow="auto"
                    >
                        <Typography variant="h6" sx={{ fontSize: titleSize }}>
                            Events
                        </Typography>

                        {currentEvents.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No events yet
                            </Typography>
                        ) : (
                            currentEvents.map((event) => (
                                <Box
                                    key={event.id}
                                    mt={1}
                                    p={1}
                                    borderRadius={1}
                                    sx={{
                                        backgroundColor: event.backgroundColor || '#E0E0E0',
                                        color: '#000',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontSize }}>
                                        📅 {event.title} — {event.startStr}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                )}

                <Box
                    flex={variant === 'full' ? 3 : 1}
                    p={isMini ? 0 : 2}
                    bgcolor="#fff"
                    borderRadius={2}
                    boxShadow={1}
                    sx={{ fontSize }}
                >
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: variant === 'full' ? 'prev,next today' : '',
                            center: 'title',
                            right: variant === 'full'
                                ? 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                                : '',
                        }}
                        height={variant === 'full' ? '75vh' : '20vh'}
                        selectable={variant === 'full'}
                        select={variant === 'full' ? handleDateClick : null}
                        eventsSet={(events) => setCurrentEvents(events)}
                        eventClick={handleEventClick}
                    />
                </Box>
            </Box>

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
