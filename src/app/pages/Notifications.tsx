import { useState } from "react";
import { Bell, ThumbsUp, Clock, XCircle, Filter, ChevronDown } from "lucide-react";

export function Notifications() {
  const [resourceFilter, setResourceFilter] = useState("All Resources");

  const notifications = [
    { 
        id: 1, 
        status: "Approved", 
        desc: 'Your "Projector" request is approved.', 
        category: "App/Technology", 
        date: "2026-02-11 / 10:30" 
    },
    { 
        id: 2, 
        status: "Pending", 
        desc: 'Your "Smart Board" req is pending.', 
        category: "MultiMedia", 
        date: "2026-02-10 / 12:55" 
    },
    { 
        id: 3, 
        status: "Rejected", 
        desc: 'Your "Furniture - Chair" req is declined', 
        category: "Furniture", 
        date: "2026-02-07 / 13:45" 
    },
  ];

  return (
    <div className="space-y-8 h-full">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Bell size={40} className="fill-yellow-300 text-black" strokeWidth={2} />
        <h2 className="text-4xl font-handwriting border-b-2 border-black pb-2">Receive Notification</h2>
      </div>

      <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b-2 border-dashed border-black">
             <div className="flex items-center gap-4">
                 <label className="font-handwriting text-2xl w-32">Time Period</label>
                 <button className="flex-1 flex items-center justify-between px-4 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none font-bold">
                    Select Period <ChevronDown size={16} className="bg-green-700 text-white rounded p-0.5" />
                 </button>
             </div>
             
             <div className="flex items-center gap-4">
                 <label className="font-handwriting text-2xl w-32">Resource Type</label>
                 <div className="flex-1 relative group">
                    <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none font-bold">
                        {resourceFilter} <ChevronDown size={16} className="bg-red-600 text-white rounded p-0.5" />
                    </button>
                    {/* Dropdown */}
                    <div className="hidden group-hover:block absolute top-full left-0 w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 mt-1">
                        {["All Resources", "MultiMedia", "Practical-Lab", "Furniture", "App/Technology"].map((opt) => (
                            <div 
                                key={opt} 
                                onClick={() => setResourceFilter(opt)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-black last:border-b-0 font-medium"
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
        </div>

        {/* List */}
        <div className="space-y-0">
             {/* Header */}
             <div className="grid grid-cols-12 gap-4 border-b-2 border-black pb-2 font-handwriting text-xl mb-4">
                 <div className="col-span-2 text-center">Status</div>
                 <div className="col-span-7">Desc</div>
                 <div className="col-span-3 text-right">Date/Time</div>
             </div>

             {notifications.map((notif) => (
                 <div key={notif.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                     <div className="col-span-2 flex justify-center">
                        {notif.status === 'Approved' && <ThumbsUp size={32} className="text-green-600 fill-green-200" />}
                        {notif.status === 'Pending' && <Clock size={32} className="text-black dashed" />}
                        {notif.status === 'Rejected' && <XCircle size={32} className="text-red-600 fill-red-200" />}
                     </div>
                     <div className="col-span-7 text-lg font-medium font-handwriting">
                        {notif.desc}
                     </div>
                     <div className="col-span-3 text-right font-mono text-sm text-gray-600">
                        {notif.date}
                     </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
}
