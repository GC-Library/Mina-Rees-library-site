// Utility functions for the Mina Rees Library site

// Debug flags for testing fallback scenarios
const DEBUG = {
    SIMULATE_COMMONS_DOWN: false,  // Set to true to simulate commons.gc.cuny.edu being down
    SIMULATE_LIBCAL_DOWN: false,   // Set to true to simulate libcal API being down
    SIMULATE_ALL_DOWN: false       // Set to true to simulate all external services being down
};

$(document).ready(function ($) {
    // Database list loading
    if (!DEBUG.SIMULATE_ALL_DOWN) {
        $(".database-list").load("https://lgapi-us.libapps.com/widgets.php?site_id=146&widget_type=2&search_terms=&search_match=2&subject_ids=&sort_by=name&list_format=2&drop_text=Select+a+Database...&output_format=1&load_type=2&enable_description=1&widget_embed_type=2&num_results=0&enable_more_results=0&window_target=2&config_id=1535395835265", function () {
            $("#s-lg-frm-az-widget-1535395835265").addClass('col-md-12');
        });
    }

    // Search functionality setup
    setupSearchHandlers();

    // Load dynamic content
    loadEvents();
    loadBlogEntries();
    loadLibraryHours();
    loadAlerts();
    loadCollections();
    loadVideos();
});

// Search functionality
function setupSearchHandlers() {
    $("#journalSearchButton").click(handleJournalSearch);
    $("#booksearchButton").click(handleBookSearch);
    $("#articleButton").click(handleArticleSearch);
    
    // Enter key handlers for all search inputs
    const searchInputMap = {
        '#primoQueryTemp2': handleJournalSearch,
        '#primoQueryTemp': handleBookSearch,
        '#articleSearch': handleArticleSearch
    };

    Object.entries(searchInputMap).forEach(([inputSelector, handler]) => {
        $(inputSelector).keydown(e => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission
                handler();
            }
        });
    });
}

// Events loading with fallback
function loadEvents() {
    if (DEBUG.SIMULATE_ALL_DOWN || DEBUG.SIMULATE_LIBCAL_DOWN) {
        handleEventsError();
        return;
    }

    $.ajax({
        url: 'https://gc-cuny.libcal.com/1.0/events?cal_id=15537&iid=5568&key=1329a09432a4a0fce7f49801a8824ed7',
        type: 'GET',
        success: handleEventsSuccess,
        error: handleEventsError
    });
}

// Blog entries fetching with fallback
async function loadBlogEntries() {
    try {
        // Simulate API being down if debug flag is set
        if (DEBUG.SIMULATE_ALL_DOWN || DEBUG.SIMULATE_COMMONS_DOWN) {
            throw new Error('Simulated API downtime');
        }

        // Try main feed first
        const timestamp = new Date().getTime();
        const response = await fetch(`https://gclibrary.commons.gc.cuny.edu/category/blog/website-front-page/feed/?fsk=5c1146bca3512&_=${timestamp}`, {
            cache: 'no-store',  // Prevent caching to always get fresh feed
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) throw new Error('Primary feed unavailable');
        
        const str = await response.text();
        const data = new window.DOMParser().parseFromString(str, "text/xml");
        let entriesList = processNewsEntries(data, 3);
        
        // Try fellow posts feed if main feed succeeded
        try {
            const fellowResponse = await fetch(`https://gclibrary.commons.gc.cuny.edu/category/blog/fellow-post/feed/?fsk=5c1146bca3512&_=${timestamp}`, {
                cache: 'no-store',  // Prevent caching to always get fresh feed
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });
            if (fellowResponse.ok) {
                const fellowStr = await fellowResponse.text();
                const fellowData = new window.DOMParser().parseFromString(fellowStr, "text/xml");
                const fellowEntries = processNewsEntries(fellowData, 1);
                entriesList = entriesList.concat(fellowEntries);
            }
        } catch (fellowError) {
            console.log('Fellow posts unavailable:', fellowError.message);
        }

        renderNews({ items: entriesList });

        
    } catch (error) {
        console.log('Commons site unavailable:', error.message);
        $('.news-section.rss-feed.row').remove();
    }
}

// Library hours loading with fallback
function loadLibraryHours() {
    if (DEBUG.SIMULATE_ALL_DOWN || DEBUG.SIMULATE_LIBCAL_DOWN) {
        handleHoursError();
        return;
    }

    $.ajax({
        url: 'https://gc-cuny.libcal.com/widget/hours/grid?iid=5568&format=json&weeks=4&systemTime=0',
        type: 'GET',
        success: handleHoursSuccess,
        error: handleHoursError
    });
}

// Alert system
function loadAlerts() {
    if (DEBUG.SIMULATE_ALL_DOWN) {
        // Still try to load alerts as they're from GitHub
        handleAlertError();
        return;
    }

    $.ajax({
        url: 'https://raw.githubusercontent.com/GC-Library/Mina-Rees-library-site/main/alert.yml',
        dataType: 'text',
        success: handleAlertSuccess,
        error: handleAlertError
    });
}

// Collections display with fallback
function loadCollections() {
    if (DEBUG.SIMULATE_ALL_DOWN) {
        handleCollectionsError();
        return;
    }

    fetch('./data/collections.json')
        .then(response => response.json())
        .then(handleCollectionsSuccess)
        .catch(handleCollectionsError);
}

// Video rotation with fallback
function loadVideos() {
    if (DEBUG.SIMULATE_ALL_DOWN) {
        handleVideoError();
        return;
    }

    fetch('./data/videos.txt')
        .then(response => response.text())
        .then(handleVideoSuccess)
        .catch(handleVideoError);
}

// Success handlers
function handleEventsSuccess(result) {
    let allEvents = [];
    for (let i = 0; i < 2; i++) {
        const event = result.events[i];
        if (!event) break;
        
        allEvents.push({
            event_name: event.title,
            event_description: event.description.replace(/(<([^>]+)>)/gi, "").substring(0, 300) + "...",
            event_date: new Date(event.start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            event_time: new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event_link: event.url.public
        });
    }

    if (allEvents.length === 0) {
        $("#events").html('<h3 class="lower-header">No upcoming events</h3>');
    } else {
        const template = document.getElementById('template').innerHTML;
        $("#events").html(Mustache.render(template, { events: allEvents }));
    }
}

function handleHoursSuccess(result) {
    const today = moment().format('dddd');
    const hoursThisWeek = result.locations[0].weeks[0];
    
    const formattedHours = Object.keys(hoursThisWeek).map(key => ({
        ...hoursThisWeek[key],
        day: key,
        isToday: key === today,
        rendered: hoursThisWeek[key].times.status !== "closed" 
            ? hoursThisWeek[key].times.hours.map(h => `${h.from} - ${h.to}`).join("") 
            : "Closed"
    }));

    const todayHours = formattedHours.find(h => h.isToday);
    $('#today-hours').html(todayHours.times.status === "closed" 
        ? "Today's Hours: Closed"
        : `Today's Hours: ${todayHours.times.hours[0].from} - ${todayHours.times.hours[0].to}`
    );

    const template = document.getElementById('hours-template').innerHTML;
    $('#hours').html(Mustache.render(template, { days: formattedHours }));
}

function handleAlertSuccess(data) {
    const alert = jsyaml.load(data).alert;
    if (alert.show) {
        const alertHTML = `<div class="alert alert-dismissible alert-${alert.style} fade show" role="alert">
            ${alert.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        $('#alert-container').html(alertHTML).find('.alert').addClass(alert.style);
    }
}

function handleCollectionsSuccess(data) {
    const collections = data.collection.filter(c => c.mms_id.value !== "9994569275306140");
    const collection = collections[Math.floor(Math.random() * collections.length)];
    
    const collectionData = {
        collection: [{
            collectionName: collection.name,
            collectionDescription: collection.description,
            collectionThumbnail: 'https://cuny-gc.primo.exlibrisgroup.com' + collection.thumbnail,
            collectionLink: 'https://cuny-gc.primo.exlibrisgroup.com/discovery/collectionDiscovery?vid=01CUNY_GC:CUNY_GC&collectionId=' + collection.pid.value,
            collectionLinkText: "Browse the collection"
        }]
    };

    const template = document.getElementById('collections-template').innerHTML;
    $('#collection').html(Mustache.render(template, collectionData));
}

function handleVideoSuccess(data) {
    const videoIDs = data.split("\n").filter(id => id.trim());
    const randomVideoID = videoIDs[Math.floor(Math.random() * videoIDs.length)];
    document.getElementById('vid').src = `https://www.youtube.com/embed/${randomVideoID}`;
}

// Error handlers
function handleEventsError() {
    $("#events").html('<h3 class="lower-header">Events information temporarily unavailable</h3>');
}

function handleHoursError() {
    $('#hours').html('<h3 class="lower-header">Hours information temporarily unavailable</h3>');
    $('#today-hours').html('Hours: See website');
}

function handleAlertError() {
    console.log('Failed to load alerts');
}

function handleCollectionsError() {
    $('#collection').html('<h3 class="lower-header">Featured collections temporarily unavailable</h3>');
}

function handleVideoError() {
    document.getElementById('vid').src = 'https://www.youtube.com/embed/gNUyfj-z1gk'; // Fallback to default video
}

// Helper functions
function processNewsEntries(data, limit) {
    const items = data.querySelectorAll("item");
    const entries = [];
    items.forEach((el, i) => {
        if (i >= limit) return;

        const all = el.querySelectorAll("*");
        const allArray = Array.from(all);
        const contentElement = allArray.find(el => el.tagName === "content:encoded")?.innerHTML || "";

        const entry = {
            title: el.querySelector("title")?.innerHTML || "",
            link: el.querySelector("link")?.innerHTML || "",
            shortBodyWithDots: processContent(contentElement),
            image: extractImage(contentElement)
        };

        entries.push(entry);
    });
    return entries;
}

function processContent(content) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.substring(0, 200) + "...";
}

function extractImage(content) {
    const imgMatch = content.match(/<img[^>]+>/);
    if (!imgMatch) return "";
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = imgMatch[0];
    return tempDiv.firstChild?.src || "";
}

function renderNews(newsData) {
    const template = document.getElementById('news-template').innerHTML;
    $('#news').html(Mustache.render(template, newsData));
}

// Search handlers
function handleJournalSearch() {
    const query = $("#primoQueryTemp2").val().replace(/[,]/g, " ");
    window.location = `https://cuny-gc.primo.exlibrisgroup.com/discovery/jsearch?query=any,contains,${query}&tab=jsearch_slot&vid=01CUNY_GC:CUNY_GC&offset=0&journals=any,${query}`;
}

function handleBookSearch() {
    const query = $("input#primoQueryTemp").val();
    const radio = $("#searchCUNY > li input[name=ONESEARCH]:checked").val();
    window.location = `https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=${radio},contains,${query}&tab=Everything&search_scope=IZ_CI_AW&sortby=rank&mfacet=rtype,include,books,1&mfacet=rtype,include,book_chapters,1&lang=en_US&mode=basic&offset=0`;
}

function handleArticleSearch() {
    const query = $("#articleSearch").val();
    const radio = $("#articleSearchRadio > li input[name=articleSearch]:checked").val();
    window.location = `https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=${radio},contains,${query}&tab=Everything&search_scope=IZ_CI_AW&sortby=rank&facet=rtype,exclude,book_chapters&facet=rtype,exclude,books&lang=en_US&mode=basic&offset=0`;
}
