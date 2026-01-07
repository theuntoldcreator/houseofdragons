
import { Mail, ChevronRight } from 'lucide-react';

export default function Contact() {
    return (
        <div>
            {/* Tab Switcher */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex -mx-3 mb-4">
                <button className="flex-1 text-center py-2 border-b-2 border-blue-600 font-bold text-blue-600 text-sm">
                    Messages
                </button>
                <button className="flex-1 text-center py-2 border-b-2 border-transparent font-medium text-gray-500 text-sm">
                    Notifications
                </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Mail size={36} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No messages yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                    When you contact a seller or receive a reply, your messages will appear here.
                </p>

                <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Community Links</p>
                    <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-2 hover:bg-blue-100 transition">
                        {/* Telegram Icon Mockup using generic icon for now or Lucide */}
                        <div className="text-blue-500 font-bold text-xl px-1">T</div>
                        <div>
                            <p className="font-bold text-sm text-gray-800">Join Telegram Group</p>
                            <p className="text-[10px] text-gray-500">Connect with 500+ members</p>
                        </div>
                        <ChevronRight className="ml-auto text-blue-300" size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}
