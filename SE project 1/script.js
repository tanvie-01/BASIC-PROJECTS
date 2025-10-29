document.addEventListener('DOMContentLoaded', () => {

    // --- HTML এলিমেন্ট সিলেক্ট করা ---
    const dateInput = document.getElementById('date-input');
    const fetchButton = document.getElementById('fetch-button');
    const surpriseButton = document.getElementById('surprise-button'); 
    const todayButton = document.getElementById('today-button'); // নতুন বাটন
    const searchBox = document.getElementById('search-box');
    const darkModeToggle = document.getElementById('dark-mode-checkbox'); 
    
    const eventsContainer = document.getElementById('events-container');
    const birthsContainer = document.getElementById('births-container');
    const deathsContainer = document.getElementById('deaths-container');

    // --- ডিফল্ট ডেটা লোড ---
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    dateInput.value = todayDateString; // ইনপুট ফিল্ডে আজকের তারিখ সেট করা
    getHistoryData(todayMonth, todayDay); // আজকের ডেটা লোড করা

    // --- ইভেন্ট লিসেনার (Event Listeners) ---

    // "খুঁজুন" বাটন
    fetchButton.addEventListener('click', () => {
        const selectedDate = new Date(dateInput.value);
        if (isValidDate(selectedDate)) {
            const month = selectedDate.getMonth() + 1;
            const day = selectedDate.getDate();
            getHistoryData(month, day);
        } else {
            alert("অনুগ্রহ করে একটি সঠিক তারিখ নির্বাচন করুন।");
        }
    });

    // "Surprise Me" বাটন
    surpriseButton.addEventListener('click', () => {
        const { month, day, dateString } = getRandomDate();
        dateInput.value = dateString; 
        getHistoryData(month, day);
    });

    // --- "আজকে" বাটন (নতুন) ---
    todayButton.addEventListener('click', () => {
        // আজকের তারিখের ভেরিয়েবলগুলো আমরা আগেই সেট করে রেখেছি
        dateInput.value = todayDateString; 
        getHistoryData(todayMonth, todayDay);
    });
    // --- শেষ ---

    // লাইভ ফিল্টার (সার্চ)
    searchBox.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchText)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    // ডার্ক মোড টগল
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); 
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light'); 
        }
    });

    // পেজ লোড হওয়ার সময় সেভ করা থিম চেক করা
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
    }
    loadTheme(); 


    // --- মূল ফাংশন: API থেকে ডেটা আনা ---
    function getHistoryData(month, day) {
        const apiUrl = `https://history.muffinlabs.com/date/${month}/${day}`;

        const loadingHTML = '<p>লোড হচ্ছে...</p>';
        eventsContainer.innerHTML = loadingHTML;
        birthsContainer.innerHTML = loadingHTML;
        deathsContainer.innerHTML = loadingHTML;
        searchBox.value = '';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                eventsContainer.innerHTML = '';
                birthsContainer.innerHTML = '';
                deathsContainer.innerHTML = '';

                populateSection(eventsContainer, data.data.Events, "ঘটনা");
                populateSection(birthsContainer, data.data.Births, "জন্ম");
                populateSection(deathsContainer, data.data.Deaths, "মৃত্যু");
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                const errorMsg = '<p>দুঃখিত, কোনো ডেটা পাওয়া যায়নি।</spp>';
                eventsContainer.innerHTML = errorMsg;
                birthsContainer.innerHTML = errorMsg;
                deathsContainer.innerHTML = errorMsg;
            });
    }

    // --- হেল্পার ফাংশন (Helper Functions) ---

    // সেকশন পপুলেট করার ফাংশন
    function populateSection(container, items, type) {
        if (items && items.length > 0) {
            items.forEach((item, index) => {
                const card = createHistoryCard(item, index);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `<p>এই তারিখে কোনো বিশেষ ${type} পাওয়া যায়নি।</p>`;
        }
    }

    // কার্ড তৈরির ফাংশন
    function createHistoryCard(item, index) {
        let wikipediaLink = (item.links && item.links.length > 0) ? item.links[0].link : '#';
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="card-year">${item.year}</div>
            <p class="card-text">${item.text}</p>
            <a href="${wikipediaLink}" target="_blank" class="card-link">আরও জানুন (উইকিপিডিয়া) &rarr;</a>
        `;
        return card;
    }

    // র‍্যান্ডম তারিখ জেনারেট করার ফাংশন
    function getRandomDate() {
        const currentYear = new Date().getFullYear(); 
        const startYear = 1900; 
        const randomYear = Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
        
        const month = Math.floor(Math.random() * 12) + 1;
        const daysInMonth = new Date(randomYear, month, 0).getDate();
        const day = Math.floor(Math.random() * daysInMonth) + 1;

        const monthString = month < 10 ? '0' + month : month;
        const dayString = day < 10 ? '0' + day : day;
        
        return {
            month: month,
            day: day,
            dateString: `${randomYear}-${monthString}-${dayString}`
        };
    }

    // তারিখ ভ্যালিড কিনা চেক করা
    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }
});