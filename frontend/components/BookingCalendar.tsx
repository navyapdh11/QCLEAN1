'use client';
import { useState, useEffect } from 'react';

interface Slot {
  date: string;
  time: string;
  available: boolean;
}

export default function BookingCalendar({ serviceId, postcode }: { serviceId: string, postcode: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available slots from K8s Booking Service via Vercel Rewrite
    fetch(`/api/booking/availability?service=${serviceId}&postcode=${postcode}`)
      .then(res => res.json())
      .then(data => setSlots(data.slots))
      .catch(err => console.error("Failed to load slots", err));
  }, [serviceId, postcode]);

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {slots.length === 0 && <p className="text-sm text-gray-500 col-span-3">Checking availability for {postcode}...</p>}
      {slots.map((slot, idx) => (
        <button
          key={idx}
          disabled={!slot.available}
          onClick={() => setSelected(`${slot.date}T${slot.time}`)}
          className={`p-2 border rounded-lg text-xs transition ${
            !slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            selected === `${slot.date}T${slot.time}` ? 'bg-blue-600 text-white border-blue-600' :
            'hover:border-blue-500'
          }`}
        >
          {slot.date.slice(5)} <br /> {slot.time}
        </button>
      ))}
    </div>
  );
}
