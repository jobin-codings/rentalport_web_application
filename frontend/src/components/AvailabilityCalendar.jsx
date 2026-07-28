import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

export default function AvailabilityCalendar({ bookedRanges = [], startDate, endDate, onSelectRange, isCompact = false }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format Date -> YYYY-MM-DD
  const toISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = toISODate(new Date());

  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day of week for first day of month (0 = Sun, 1 = Mon, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const isBooked = (dateStr) => {
    const target = new Date(dateStr);
    return bookedRanges.some(b => {
      const bStart = new Date(b.from);
      const bEnd = new Date(b.to);
      return target >= bStart && target <= bEnd;
    });
  };

  const handleDayClick = (dateStr) => {
    if (isBooked(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      onSelectRange(dateStr, '');
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        onSelectRange(dateStr, '');
      } else {
        // Check if any date in the selected range is booked
        const curr = new Date(startDate);
        const end = new Date(dateStr);
        let hasOverlap = false;

        while (curr <= end) {
          if (isBooked(toISODate(curr))) {
            hasOverlap = true;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (hasOverlap) {
          alert('Selected range overlaps with an existing booking. Please select available dates.');
          onSelectRange(dateStr, '');
        } else {
          onSelectRange(startDate, dateStr);
        }
      }
    }
  };

  const daysGrid = [];
  // Empty slots before month start
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month, d);
    daysGrid.push(toISODate(dObj));
  }

  return (
    <div className="avail-calendar" style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: isCompact ? '12px' : '18px',
      marginBottom: '16px'
    }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: isCompact ? '0.9rem' : '1rem' }}>
          <CalendarIcon size={16} color="var(--amber)" />
          <span>{monthNames[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="pill"
            style={{ padding: '4px 8px', borderRadius: '8px' }}
            onClick={handlePrevMonth}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="pill"
            style={{ padding: '4px 8px', borderRadius: '8px' }}
            onClick={handleNextMonth}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--steel-soft)', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {daysGrid.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} style={{ height: isCompact ? '32px' : '38px' }} />;
          }

          const dayNum = parseInt(dateStr.split('-')[2], 10);
          const isPast = dateStr < todayStr;
          const booked = isBooked(dateStr);
          const isStart = startDate === dateStr;
          const isEnd = endDate === dateStr;
          const inRange = startDate && endDate && dateStr >= startDate && dateStr <= endDate;

          let bg = 'rgba(255, 255, 255, 0.04)';
          let color = '#FFFFFF';
          let border = '1px solid transparent';
          let cursor = 'pointer';

          if (isPast) {
            bg = 'rgba(255, 255, 255, 0.02)';
            color = 'rgba(255, 255, 255, 0.2)';
            cursor = 'not-allowed';
          } else if (booked) {
            bg = 'rgba(239, 68, 68, 0.18)';
            color = '#FCA5A5';
            border = '1px solid rgba(239, 68, 68, 0.3)';
            cursor = 'not-allowed';
          } else if (isStart || isEnd) {
            bg = 'var(--amber)';
            color = '#000000';
            border = '1px solid var(--amber)';
          } else if (inRange) {
            bg = 'rgba(245, 158, 11, 0.25)';
            color = '#FFFFFF';
            border = '1px dashed rgba(245, 158, 11, 0.5)';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || booked}
              onClick={() => handleDayClick(dateStr)}
              style={{
                height: isCompact ? '32px' : '38px',
                borderRadius: '8px',
                background: bg,
                color: color,
                border: border,
                cursor: cursor,
                fontSize: isCompact ? '0.75rem' : '0.82rem',
                fontWeight: isStart || isEnd || inRange ? 700 : 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
              title={booked ? 'Booked' : isPast ? 'Past Date' : `Select ${dateStr}`}
            >
              <span>{dayNum}</span>
              {booked && !isCompact && (
                <span style={{ fontSize: '0.55rem', lineHeight: 1, color: '#FCA5A5', marginTop: '1px' }}>Booked</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.72rem', color: 'var(--steel-soft)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} /> Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Booked / Unavailable
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)' }} /> Selected Dates
        </div>
      </div>
    </div>
  );
}
