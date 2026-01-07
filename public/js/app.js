// --- SUPABASE CONFIGURATION ---
let supabase = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Config & Init Supabase
    try {
        const configRes = await fetch('/api/config');
        const config = await configRes.json();

        if (config.supabaseUrl && config.supabaseKey) {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
            initRealtime();
        } else {
            console.error('Supabase Config Missing');
        }
    } catch (err) {
        console.error('Failed to load config:', err);
    }

    // 2. Initialize UI
    initApp();
});

function initRealtime() {
    if (!supabase) return;
    const channel = supabase.channel('listings-channel')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'listings' },
            (payload) => {
                console.log('New post received!', payload.new);
                const path = window.location.pathname;
                if (path === '/' || path.includes('index.html') || path.includes('listings.html')) {
                    showToast('New post arrived!');
                    setTimeout(() => {
                        if (path === '/' || path.includes('index.html')) {
                            fetchRecentListings();
                        } else {
                            fetchListings();
                        }
                    }, 500);
                }
            }
        )
        .subscribe();
}

function initApp() {
    let currentCity = localStorage.getItem('user_city') || null;

    if (!currentCity) {
        showLocationModal();
    } else {
        updateCityHeader(currentCity);
    }

    checkPageContext();

    const postAdForm = document.getElementById('postAdForm');
    if (postAdForm) {
        postAdForm.addEventListener('submit', handlePostAd);
    }

    setupAutocomplete();
}

function checkPageContext() {
    const path = window.location.pathname;
    if (path.includes('listings.html') || path === '/listings') {
        fetchListings();
    } else if (path === '/' || path.includes('index.html')) {
        fetchRecentListings();
    } else if (path.includes('details.html')) {
        loadListingDetails();
    }
}

function setupAutocomplete() {
    const cityInput = document.getElementById('city');
    const suggestionsBox = document.getElementById('city-suggestions');
    if (cityInput && suggestionsBox) {
        // Expanded List per User Request
        const TEXAS_CITIES = [
            'Addison, TX', 'Allen, TX', 'Arlington, TX', 'Austin, TX', 'Bedford, TX',
            'Carrollton, TX', 'Cedar Hill, TX', 'Coppell, TX', 'Dallas, TX', 'Denton, TX',
            'Desoto, TX', 'Duncanville, TX', 'Euless, TX', 'Farmers Branch, TX',
            'Flower Mound, TX', 'Fort Worth, TX', 'Frisco, TX', 'Garland, TX',
            'Grand Prairie, TX', 'Grapevine, TX', 'Haltom City, TX', 'Houston, TX',
            'Hurst, TX', 'Irving, TX', 'Keller, TX', 'Lancaster, TX', 'Lewisville, TX',
            'Little Elm, TX', 'Mansfield, TX', 'McKinney, TX', 'Mesquite, TX',
            'North Richland Hills, TX', 'Plano, TX', 'Richardson, TX', 'Rockwall, TX',
            'Rowlett, TX', 'Southlake, TX', 'The Colony, TX', 'University Park, TX', 'Wylie, TX'
        ];

        cityInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 1) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            const matches = TEXAS_CITIES.filter(city => city.toLowerCase().includes(query));

            suggestionsBox.innerHTML = '';
            if (matches.length > 0) {
                suggestionsBox.classList.remove('hidden');
                matches.forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 text-gray-700';
                    item.textContent = city;
                    item.onclick = () => {
                        cityInput.value = city;
                        suggestionsBox.classList.add('hidden');
                    };
                    suggestionsBox.appendChild(item);
                });
            } else {
                suggestionsBox.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!cityInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.add('hidden');
            }
        });
    }
}

function showLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.remove('hidden');
}

function selectCity(city) {
    const fullCity = city.includes(',') ? city : city + ', TX';
    localStorage.setItem('user_city', fullCity);
    updateCityHeader(fullCity);

    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.add('hidden');

    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html')) {
        fetchRecentListings();
    } else if (path.includes('listings.html')) {
        fetchListings();
    }
}

function updateCityHeader(city) {
    const btnText = document.getElementById('current-city-text');
    if (btnText) btnText.textContent = city;
}

// --- STRICT VALIDATION ---
const BANNED_WORDS = [
    '18+', 'adult', 'sex', 'escort', 'nude', 'xxx', 'erotic', 'massage', 'fetish', 'kink',
    'incall', 'outcall', 'bodyrub', 'dominatra', 'mistress', 'horny', 'nsfw', 'porn',
    'naked', 'sensual', 'intimate', 'lover', 'hookup', 'fwb', 'casual', 'encounter',
    'dating', 'sugar', 'daddy', 'baby', 'mutually', 'arrangement', 'allowance', 'discrete',
    'beneficial', 'companionship', 'female wanted', 'male wanted', 'fun', 'romance',
    '420', 'weed', 'drugs', 'pills', 'smoke', 'high', 'kush', 'carts', 'shrooms', 'gun', 'ammo',
    'cashapp', 'western union', 'moneygram', 'crypto', 'bitcoin', 'investment'
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handlePostAd(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const containsRestricted = (text) => {
        if (!text) return false;
        const lower = text.toLowerCase();
        return BANNED_WORDS.find(word => lower.includes(word));
    };

    const badTitle = containsRestricted(data.title);
    if (badTitle) {
        alert(`SAFETY ALERT: The Title contains restricted content ("${badTitle}"). Please remove non-accommodation terms.`);
        return;
    }
    const badDesc = containsRestricted(data.description);
    if (badDesc) {
        alert(`SAFETY ALERT: The Description contains restricted content ("${badDesc}"). Please provide only accommodation details.`);
        return;
    }
    const badName = containsRestricted(data.contactName);
    if (badName) {
        alert(`SAFETY ALERT: The Name field contains restricted content. Please use a real name.`);
        return;
    }

    if (!EMAIL_REGEX.test(data.contactInfo)) {
        alert('PRIVACY ALERT: Please provide a valid Email Address for secure contact.');
        return;
    }

    try {
        if (!supabase) {
            alert('Database connecting... please try again in a moment.');
            return;
        }

        data.created_at = new Date().toISOString();
        data.postedDate = new Date().toISOString();

        const { data: insertedData, error } = await supabase
            .from('listings')
            .insert([data])
            .select();

        if (error) throw error;

        alert('Ad posted successfully!');
        window.location.href = '/listings.html';
    } catch (error) {
        console.error('Error posting ad:', error);
        alert('Error posting ad: ' + error.message);
    }
}

async function fetchListings() {
    if (!supabase) return;
    try {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        renderListings(listings || []);
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
}

async function fetchRecentListings() {
    if (!supabase) return;
    try {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) throw error;
        renderListings(listings || []);
    } catch (error) {
        console.error('Error fetching recent listings:', error);
    }
}

async function loadListingDetails() {
    if (!supabase) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('details-container');
    if (!id || !container) return;

    try {
        const { data: listing, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (listing) {
            const date = new Date(listing.postedDate || listing.created_at).toLocaleDateString();
            let badgeClass = listing.category.includes('Have') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';

            container.innerHTML = `
                <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-[60px] bg-white z-40">
                    <button onclick="window.history.back()" class="text-gray-500 p-2 -ml-2 hover:bg-gray-50 rounded-full transition"><i class="fa-solid fa-arrow-left"></i></button>
                    <span class="font-bold text-gray-700 text-sm truncate">${listing.title}</span>
                    <button class="text-gray-400 p-2"><i class="fa-solid fa-ellipsis"></i></button>
                </div>
                <div class="p-4">
                     <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeClass}">${listing.category}</span>
                        <div class="text-right">
                             <p class="text-lg font-bold text-blue-600">${listing.price ? '$' + listing.price : 'Contact'}</p>
                             <p class="text-xs text-gray-400">${date}</p>
                        </div>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">${listing.title}</h1>
                    <div class="flex items-center text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">
                        <i class="fa-solid fa-location-dot mr-2 text-red-500"></i> ${listing.city}
                    </div>
                    <h2 class="text-sm font-bold text-gray-900 mb-2">About</h2>
                    <p class="text-gray-600 text-base mb-8 whitespace-pre-wrap">${listing.description}</p>
                    <div class="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                         <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                            ${listing.contactName ? listing.contactName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                            <p class="font-bold text-gray-900 text-sm">${listing.contactName || 'User'}</p>
                            <p class="text-xs text-gray-500">Member</p>
                        </div>
                    </div>
                    <div class="mt-8">
                        <button onclick="alert('Contact: ${listing.contactInfo}')" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition">
                            Contact Seller
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center p-8">Listing not found.</p>';
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-center p-8">Error loading details.</p>';
    }
}

function renderListings(listings, containerId = 'listings-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-gray-500">No listings found.</div>';
        return;
    }

    const currentCity = localStorage.getItem('user_city');
    // Loose filter: fuzzy match logic
    const filteredListings = currentCity
        ? listings.filter(l => {
            // Check if listing city contains current city selection or vice versa
            // e.g. Listing: "Denton, TX", Selection: "Denton" -> Match
            // e.g. Listing: "Denton", Selection: "Denton, TX" -> Match
            if (!l.city) return false;
            const lCity = l.city.toLowerCase();
            const sCity = currentCity.toLowerCase().replace(', tx', '').trim();
            return lCity.includes(sCity);
        })
        : listings;

    if (filteredListings.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500">No listings found for ${currentCity}.</div>`;
        return;
    }

    filteredListings.forEach(listing => {
        const date = new Date(listing.postedDate || listing.created_at).toLocaleDateString();
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer';

        // Badge Logic
        let badgeClass = listing.category.includes('Have') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badgeClass}">${listing.category}</span>
                <span class="text-[11px] text-gray-400 font-medium">${date}</span>
            </div>
            <h3 class="text-[16px] font-bold text-gray-900 leading-tight mb-1 line-clamp-2">${listing.title}</h3>
            <div class="flex items-center text-gray-500 text-xs mb-3">
                <i class="fa-solid fa-location-dot mr-1"></i> ${listing.city}
            </div>
            <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        ${listing.contactName ? listing.contactName[0].toUpperCase() : 'U'}
                    </div>
                    <span class="text-xs text-gray-600 font-medium">${listing.contactName || 'User'}</span>
                </div>
                <span class="text-xs text-blue-600 font-semibold">View <i class="fa-solid fa-chevron-right text-[10px] ml-1"></i></span>
            </div>
        `;
        card.onclick = () => window.location.href = `/details.html?id=${listing.id}`;
        container.appendChild(card);
    });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold z-[60] animate-bounce';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
