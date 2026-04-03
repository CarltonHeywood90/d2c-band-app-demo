interface Event {
  event_date: string;
  venue_name: string;
  city: string;
  state: string;
  ticket_price?: number;
  total_tickets?: number;
  status: string;
}

export default function EventRow({ event }: { event: Event }) {
  const date = new Date(event.event_date)
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-8 border-b border-current border-opacity-10">
      <div className="text-center md:text-left min-w-[120px]">
        <div className="text-2xl font-black leading-none">{date.getDate()}</div>
        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50">
          {date.toLocaleString('default', { month: 'short' })} {date.getFullYear()}
        </div>
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h4 className="text-xl font-black uppercase tracking-tighter">{event.venue_name}</h4>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50">
          {event.city}, {event.state}
        </p>
      </div>
      
      <button className="px-6 py-2 border border-current font-bold uppercase text-[10px] tracking-widest">
        {event.ticket_price ? `$${(event.ticket_price / 100).toFixed(2)}` : 'TBA'}
      </button>
    </div>
  )
}