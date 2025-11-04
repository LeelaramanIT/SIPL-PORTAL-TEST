import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import { Box, Typography, useMediaQuery } from "@mui/material";
import Heading from "../../components/Heading";
import DialogBox from "../../components/DialogBox";

const Calendar = ({ variant = "full" }) => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  const handleDateClick = (selected) => {
    if (variant !== "full") return; // only allow adding events in full mode

    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      const colors = ["#AEDFF7", "#FDCB82", "#C3F584", "#F88E8E"];
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
    if (variant === "full") setOpen(true);
  };

  const confirmDelete = () => {
    selectedEvent.event.remove();
    setOpen(false);
    setSelectedEvent(null);
  };
  // Different style variants
  const variantStyles = {
    full: {
      calendarHeight: isMobile ? "69vh" : "75vh",
      fontSize: "1rem",
      titleSize: "1.25rem",
    },
    mini: { calendarHeight: "35vh", fontSize: "0.5rem", titleSize: "0.7rem" }, // was 22vh
    popup: {
      calendarHeight: "50vh",
      fontSize: "0.875rem",
      titleSize: "1.1rem",
    },
  };
  const { calendarHeight, fontSize, titleSize } =
    variantStyles[variant] || variantStyles.full;

  return (
    <Box m={isMobile ? 1 : 2}>
      {/* Show heading only in full mode */}
      {variant === "full" && <Heading level={1}>Calendar</Heading>}

      <Box
        display="flex"
        flexDirection={isMobile || variant === "mini" ? "column" : "row"}
        gap={2}
      >
        {/* Events Sidebar - only in full mode */}
        {variant === "full" && !isMobile && (
          <Box
            flex={1}
            p={2}
            bgcolor="#fff"
            borderRadius={2}
            boxShadow={1}
            maxHeight="79vh"
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
                    backgroundColor: event.backgroundColor || "#E0E0E0",
                    color: "#000",
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

        {/* Calendar */}
        <Box
          flex={variant === "full" ? 3 : 1}
          p={variant === "mini" ? 0 : 2}
          bgcolor="#fff"
          borderRadius={2}
          boxShadow={1}
          sx={{ fontSize }}
          minHeight={calendarHeight} // ✅ use minHeight instead of maxHeight
          overflow="hidden" // ✅ prevent scrollbar clipping in mini
        >
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: variant === "full" ? "prev,next today" : "",
              center: "title",
              right:
                variant === "full"
                  ? "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                  : "",
            }}
            height={calendarHeight}
            fixedWeekCount={true} // always show full 6 weeks for month
            contentHeight={variant === "mini" ? "auto" : "auto"}
            dayMaxEventRows={variant === "mini" ? 1 : 3} // mini = very compact
            selectable={variant === "full"}
            select={variant === "full" ? handleDateClick : null}
            eventsSet={(events) => setCurrentEvents(events)}
            eventClick={handleEventClick}
            // ⬇️ disable scrolling in mini version
            // dayMaxEventRows={false}
            expandRows={variant === "mini" ? true : false}
          />
        </Box>
      </Box>

      {/* Delete Event Popup */}
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
