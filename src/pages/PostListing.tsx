
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, AlertCircle, ChevronDown, Search, MapPin } from 'lucide-react';
import { ALL_AREAS } from '../lib/locations';

const FORBIDDEN_KEYWORDS = [
  'adult', 'escort', 'meetups', 'sex', 'drugs', 'hookup', 'casino', 'gambling',
  'porn', 'nude', 'naked', 'massage', 'sensual', 'dating', 'romance', 'fling',
  'sugar', 'daddy', 'mistress', 'webcam', 'erotic', 'xxx', 'violence', 'blood'
];

export default function PostListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  const [selection, setSelection] = useState({
    roomType: '1bed/1bath',
    stayType: 'Private Room',
    propertyType: 'Apartment',
    category: 'Have'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: localStorage.getItem('selected_city') || 'Dallas',
    county: '',
    contact_email: ''
  });

  const filteredAreas = useMemo(() => {
    const term = formData.county.toLowerCase();
    const currentCity = formData.city.toLowerCase();

    // Show only areas for the currently selected city (e.g. Dallas)
    const cityAreas = ALL_AREAS.filter(item => item.city.toLowerCase() === currentCity);

    if (!term) return cityAreas.slice(0, 5);

    return cityAreas.filter(item =>
      item.area.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [formData.county, formData.city]);

  // Auto-build title based on selections
  useEffect(() => {
    const categoryPrefix = selection.category === 'Have' ? 'Available ' : 'Looking for ';
    const locationStr = formData.county || `${formData.city}`;
    const newTitle = `${categoryPrefix}${selection.roomType} ${selection.stayType} in ${locationStr}`;
    setFormData(prev => ({ ...prev, title: newTitle }));
  }, [selection, formData.city, formData.county]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelection(prev => ({ ...prev, [name]: value }));
  };

  const hasForbiddenContent = useMemo(() => {
    const content = (formData.title + ' ' + formData.description).toLowerCase();
    return FORBIDDEN_KEYWORDS.some(word => content.includes(word));
  }, [formData.title, formData.description]);

  const isFormComplete = formData.title.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.contact_email.trim() !== '';

  const canPost = isFormComplete && !hasForbiddenContent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasForbiddenContent) {
      setShowWarning(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: selection.category,
            city: formData.city,
            county: formData.county,
            contact_email: formData.contact_email
          }
        ])
        .select();

      if (error) throw error;
      console.log('Successfully posted:', data);
      alert('Success! Your listing is live.');
      navigate('/');
    } catch (err: any) {
      alert('Submission failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen page-enter">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[24px] p-8 max-w-[340px] shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="text-red-500" size={28} />
            </div>
            <h3 className="text-xl font-black text-[#101010] mb-2 leading-tight">Post Blocked</h3>
            <p className="text-secondary text-sm font-medium leading-relaxed mb-8">
              Your post contains keywords that violate our community guidelines (18+ content). Please remove restricted words.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full bg-black text-white py-4 rounded-xl font-bold transition-transform active:scale-95"
            >
              Understand
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-50 sticky top-0 bg-white/90 backdrop-blur-md z-10 h-[64px]">
        <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors -ml-2">
          <X size={22} className="text-zinc-800" />
        </button>
        <h2 className="font-bold text-[17px] text-[#101010] absolute left-1/2 -translate-x-1/2">New Post</h2>
        <button
          form="post-form"
          type="submit"
          disabled={loading || !canPost || hasForbiddenContent}
          className={`font-bold text-[16px] transition-all font-sans ${canPost && !hasForbiddenContent ? 'text-[#2b64dd] hover:opacity-70' : 'text-zinc-200 cursor-not-allowed'}`}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {hasForbiddenContent && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-2 flex items-center gap-2 animate-in slide-in-from-top-full duration-300">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-[12px] font-bold text-red-600 uppercase tracking-wider">Restricted Content Detected</span>
        </div>
      )}

      <form id="post-form" onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-8 pb-24">
        {/* Title Builder Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="font-bold text-[13px] text-zinc-400 uppercase tracking-widest">Title Builder</p>
          </div>

          <div className="text-left">
            <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Final Title</span>
            <div className="w-full text-lg font-black text-[#101010] bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100/50 mt-1 break-words whitespace-pre-wrap">
              {formData.title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 col-span-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">I am posting for...</span>
              <div className="flex p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                {['Have', 'Need'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelection(prev => ({ ...prev, category: type }))}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${selection.category === type
                      ? 'bg-white text-black shadow-sm border border-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                  >
                    {type === 'Have' ? 'I HAVE a Room' : 'I NEED a Room'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Property Type</span>
              <div className="relative">
                <select
                  name="propertyType"
                  value={selection.propertyType}
                  onChange={handleSelectionChange}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[14px] font-bold outline-none appearance-none hover:bg-zinc-100 transition-colors"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Stay Type</span>
              <div className="relative">
                <select
                  name="stayType"
                  value={selection.stayType}
                  onChange={handleSelectionChange}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[14px] font-bold outline-none appearance-none hover:bg-zinc-100 transition-colors"
                >
                  <option value="Private Room">Private Room</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="Entire Place">Entire Place</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Unit Config</span>
              <div className="relative">
                <select
                  name="roomType"
                  value={selection.roomType}
                  onChange={handleSelectionChange}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[14px] font-bold outline-none appearance-none hover:bg-zinc-100 transition-colors"
                >
                  <option value="1bed/1bath">1bed/1bath</option>
                  <option value="2bed/1bath">2bed/1bath</option>
                  <option value="2bed/2bath">2bed/2bath</option>
                  <option value="3bed/2bath">3bed/2bath</option>
                  <option value="3bed/3bath">3bed/3bath</option>
                  <option value="Studio">Studio</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>


        </div>

        {/* Accommodation Details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <p className="font-bold text-[13px] text-zinc-400 uppercase tracking-widest">Accommodation Details</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Exact Area / County</span>
              <div className="relative group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  name="county"
                  placeholder="e.g. Las Colinas, Irving"
                  value={formData.county}
                  onFocus={() => setShowAreaSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 200)}
                  onChange={(e) => {
                    handleChange(e);
                    setShowAreaSuggestions(true);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl pl-10 pr-4 py-3 text-[14px] font-bold outline-none placeholder:text-zinc-300 focus:bg-white focus:border-blue-200 transition-all shadow-sm"
                />
              </div>

              {/* Local Suggestions Dropdown */}
              {showAreaSuggestions && filteredAreas.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {filteredAreas.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setFormData(prev => ({
                          ...prev,
                          county: item.area,
                          city: item.city
                        }));
                        setShowAreaSuggestions(false);
                      }}
                      className="w-full px-5 py-3.5 text-left hover:bg-zinc-50 flex items-center justify-between group transition-colors border-b border-zinc-50 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-zinc-300 group-hover:text-blue-500 transition-colors" />
                        <div>
                          <p className="font-bold text-[14px] text-zinc-800">{item.area}</p>
                          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Around {item.city}</p>
                        </div>
                      </div>
                      <ChevronDown size={14} className="text-zinc-200 -rotate-90" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              name="description"
              rows={8}
              required
              placeholder="Details of the room (Rent, Move-in date, Utilities, Rules, etc.)"
              value={formData.description}
              onChange={handleChange}
              className="w-full text-[14px] placeholder:text-zinc-300 outline-none border border-zinc-100 bg-zinc-50 rounded-2xl p-4 leading-relaxed font-medium resize-none shadow-sm"
            ></textarea>
          </div>
        </div>

        {/* Your Contact */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="font-bold text-[13px] text-zinc-400 uppercase tracking-widest">Your Contact</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase pl-1">Email Details</span>
            <input
              type="email"
              name="contact_email"
              required
              placeholder="Where should they reach you?"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[14px] font-bold outline-none placeholder:text-zinc-300"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
