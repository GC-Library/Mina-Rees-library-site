// function searchPrimo() {
//     document.getElementById("primoJournalQuery").value = "any,contains," + document.getElementById("primoQueryTemp2").value.replace(/[,]/g, " ");
//     console.log(document.forms["searchForm"]);
//     document.forms["searchForm"].submit();
//     }

$(document).ready(function ($) {
    $(".database-list").load("https://lgapi-us.libapps.com/widgets.php?site_id=146&widget_type=2&search_terms=&search_match=2&subject_ids=&sort_by=name&list_format=2&drop_text=Select+a+Database...&output_format=1&load_type=2&enable_description=1&widget_embed_type=2&num_results=0&enable_more_results=0&window_target=2&config_id=1535395835265", function () {
        $("#s-lg-frm-az-widget-1535395835265").addClass('col-md-12');
    })

    $("#journalSearchButton").click(function () {
        var query = $("#primoQueryTemp2").val();
        query = 'query=any,contains,' + query.replace(/[,]/g, " ") + '&tab=jsearch_slot&vid=01CUNY_GC:CUNY_GC&offset=0&journals=any,' + query.replace(/[,]/g, " ");
        window.location = 'https://cuny-gc.primo.exlibrisgroup.com/discovery/jsearch?' + query;
    });
    $('#primoQueryTemp2').keypress(function (e) {
        if (e.which == 13) {//Enter key pressed
            $('#journalSearchButton').click();//Trigger search button click event
        }
    });

    $("#booksearchButton").click(function () {
        query = $("input#primoQueryTemp").val();
        radio = $("#searchCUNY > li input[name=ONESEARCH]:checked").val();
        finalQuery = "https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=" + radio + ",contains," + query + "&tab=Everything&search_scope=IZ_CI_AW&sortby=rank&mfacet=rtype,include,books,1&mfacet=rtype,include,book_chapters,1&lang=en_US&mode=basic&offset=0";
        window.location = finalQuery;
    });
    $('#primoQueryTemp').keypress(function (e) {
        if (e.which == 13) {//Enter key pressed
            $('#booksearchButton').click();//Trigger search button click event
        }
    });
    $("#articleButton").click(function () {
        query = $("#articleSearch").val();
        radio = $("#articleSearchRadio > li input[name=articleSearch]:checked").val();
        finalQuery = "https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=" + radio + ",contains," + query + "&tab=Everything&search_scope=IZ_CI_AW&sortby=rank&facet=rtype,exclude,book_chapters&facet=rtype,exclude,books&lang=en_US&mode=basic&offset=0";
        window.location = finalQuery;
    });
    $('#articleSearch').keypress(function (e) {
        if (e.which == 13) {//Enter key pressed
            $('#articleButton').click();//Trigger search button click event
        }
    });

    $('.bento-tabs a').click(function (e) {
        e.preventDefault();
        $(this).parent().removeClass('active');
    });

    $.ajax({
        url: 'https://gc-cuny.libcal.com/1.0/events?cal_id=15537&iid=5568&key=1329a09432a4a0fce7f49801a8824ed7',
        type: 'GET',
        success: function (result) {
            var allEvents = [];
            for (var i = 0; i < 2; i++) {
                var event = result.events[i];
                if (event == null) {
                    break;
                }
                var event_description = event.description;
                var event_link = event.url.public;
                var event_date = new Date(event.start);
                var event_time = event_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                var event_date_string_with_day = event_date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                var event_time_string = event_time
                var event_name = event.title;
                var event_description_start = event_description.indexOf('<p>');

                var event_description_stripped = event_description.replace(/(<([^>]+)>)/gi, "");
                var event_description_short = event_description_stripped.substring(0, 300) + "...";
                var eventData = {
                    "event_name": event_name,
                    "event_description": event_description_short,
                    "event_date": event_date_string_with_day,
                    "event_time": event_time_string,
                    "event_link": event_link
                };
                allEvents.push(eventData);
            }
            var events = {
                "events": allEvents
            }
            // if events is empty then display a different message
            if (events.events.length == 0) {
                console.log("No events found");
                $("#events").html('<h3 class="lower-header">EXPLORE OUR DIGITAL PROJECTS</h3><iframe title="Content Box frame" id="s-lg-widget-frame-1716564549198" width="" height="" scrolling="no" style="height: 410px; width: 90%;" src="//lgapi-us.libapps.com/widget_box.php?site_id=146&widget_type=8&output_format=2&widget_title=Digital+Collections+Gallery&widget_height=&widget_width=&widget_embed_type=1&guide_id=1204677&box_id=32696065&map_id=38442276&content_only=0&include_jquery=0&config_id=1716564549198"></iframe>');

                $('.events-section').removeClass('col-md-8').addClass('col-md-7');

                swapVideos();
            } else {
                var template = document.getElementById('template').innerHTML;
                var rendered = Mustache.render(template, events);
                $('#events').html(rendered);
            }

        }
    });


    const fetchBlogEntries = function () {
        var entriesList = [];
        fetch('https://gclibrary.commons.gc.cuny.edu/category/blog/website-front-page/feed/?fsk=5c1146bca3512')
            .then(response => response.text())
            .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const items = data.querySelectorAll("item");
                items.forEach((el, i) => {
                    if (i > 2) {
                        return;
                    }
                    // select all elements in item
                    const all = el.querySelectorAll("*");
                    // all is a Nodelist. Find the content element
                    const allArray = Array.from(all);
                    var contentElement = allArray.find(el => el.tagName === "content:encoded").innerHTML;

                    var entry = {
                        title: el.querySelector("title").innerHTML,
                        link: el.querySelector("link").innerHTML,
                        pubDate: el.querySelector("pubDate").innerHTML,
                        description: el.querySelector("description").innerHTML,
                    }
                    const DOMparser = new DOMParser();
                    if (!contentElement.match(/<img[^>]+>/)) {
                        entry.image = "";
                    }
                    else {
                        entry.image = contentElement.match(/<img[^>]+>/)[0];
                        entry.image = DOMparser.parseFromString(entry.image, "text/html").body.firstChild.src;
                    }
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = contentElement;
                    contentElement = tempDiv.textContent || tempDiv.innerText || "";
                    entry.content = contentElement;
                    entry.shortBodyWithDots = entry.content.replace(/<[^>]+>/g, '');
                    entry.shortBodyWithDots = entry.shortBodyWithDots.substring(0, 200) + "...";
                    var title = entry.title;
                    var temptTitle = document.createElement("div");
                    temptTitle.innerHTML = title;
                    title = temptTitle.textContent || temptTitle.innerText || "";
                    entry.title = title;
                    entriesList.push(entry);
                });
            }).then(() => {
                fetch('https://gclibrary.commons.gc.cuny.edu/category/blog/fellow-post/feed/?fsk=5c1146bca3512')
                    .then(response => response.text())
                    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                    .then(data => {
                        const items = data.querySelectorAll("item");
                        items.forEach((el, i) => {
                            if (i > 0) {
                                return;
                            }
                            // select all elements in item
                            const all = el.querySelectorAll("*");
                            // all is a Nodelist. Find the content element
                            const allArray = Array.from(all);
                            var contentElement = allArray.find(el => el.tagName === "content:encoded").innerHTML;

                            var entry = {
                                title: el.querySelector("title").innerHTML,
                                link: el.querySelector("link").innerHTML,
                                pubDate: el.querySelector("pubDate").innerHTML,
                                description: el.querySelector("description").innerHTML,
                            }
                            const DOMparser = new DOMParser();
                            if (!contentElement.match(/<img[^>]+>/)) {
                                entry.image = "";
                            }
                            else {
                                entry.image = contentElement.match(/<img[^>]+>/)[0];
                                entry.image = DOMparser.parseFromString(entry.image, "text/html").body.firstChild.src;
                            }
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = contentElement;
                            contentElement = tempDiv.textContent || tempDiv.innerText || "";
                            entry.content = contentElement;
                            entry.shortBodyWithDots = entry.content.replace(/<[^>]+>/g, '');
                            entry.shortBodyWithDots = entry.shortBodyWithDots.substring(0, 200) + "...";
                            var title = entry.title;
                            var temptTitle = document.createElement("div");
                            temptTitle.innerHTML = title;
                            title = temptTitle.textContent || temptTitle.innerText || "";
                            entry.title = title;
                            entriesList.push(entry);
                        });
                    }).then(() => {
                        var news = {
                            "items": []
                        }
                        news.items = entriesList
                        var template = document.getElementById('news-template').innerHTML;
                        var rendered = Mustache.render(template, news);
                        $('#news').html(rendered);
                    })
            })
    }
    fetchBlogEntries();

    $.ajax({
        url: 'https://gc-cuny.libcal.com/widget/hours/grid?iid=5568&format=json&weeks=4&systemTime=0',
        type: 'GET',
        success: function (result) {
            var minaRees = result.locations[0]
            var hoursThisWeek = minaRees.weeks[0]
            var today = moment().format('dddd');
            const correctHours = Object.keys(hoursThisWeek).map(key => {
                var hours = hoursThisWeek[key]
                hours.day = key
                return hours
            });
            const renderHours = Object.keys(correctHours).map(key => {
                var hours = correctHours[key]
                if (hours.day === today) {
                    hours.isToday = true
                } else {
                    hours.isToday = false
                }
                if (hours.times.status && hours.times.status !== "closed") {
                    hours.rendered = hours.times.hours.map(hour => {
                        return `${hour.from} - ${hour.to}`
                    }).join("")
                }
                return hours
            })
            var hours = {
                "days": renderHours
            }
            var todayHours = hours.days.filter(day => day.day === today)
            if (todayHours[0].times.status === "closed") {
                todayHours = "Today's Hours: Closed"
            } else {
                var todayHours = "Today's Hours: " + todayHours[0].times.hours[0].from + " - " + todayHours[0].times.hours[0].to
            }
            $('#today-hours').html(todayHours)
            var template = document.getElementById('hours-template').innerHTML;
            var rendered = Mustache.render(template, hours);
            $('#hours').html(rendered);
        },
        error: function (err) {
            console.log(err);
        }
    });

    $.ajax({
        url: 'https://raw.githubusercontent.com/GC-Library/Mina-Rees-library-site/main/alert.yml', dataType: 'text', success: function (data) {
            const doc = jsyaml.load(data)
            const alert = doc.alert
            const alertText = alert.message;
            const alertColor = alert.style;
            const toShow = alert.show;
            const alertHTML = '<div class="alert alert-dismissible alert-' + alertColor + ' fade show" role="alert">' + alertText
                + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
            if (toShow) {
                var target = $('#alert-container')
                target.html(alertHTML).find('.alert').addClass(alertColor)
            }
        }
    });

    fetch('./data/collections.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            // pick a collection at random but not mms_id 9994569275306140
            const collections = data.collection.filter(collection => collection.mms_id.value !== "9994569275306140");
            const collection = collections[Math.floor(Math.random() * collections.length)];
            const collectionName = collection.name;
            const collectionDescription = collection.description;
            const collectionThumbnail = collection.thumbnail;
            const collectionLink = collection.pid.value;
            const collectionLinkText = "Browse the collection";
            const collectionData = {
                "collection":
                    [{
                        "collectionName": collectionName,
                        "collectionDescription": collectionDescription,
                        "collectionThumbnail": 'https://cuny-gc.primo.exlibrisgroup.com' + collectionThumbnail,
                        "collectionLink": 'https://cuny-gc.primo.exlibrisgroup.com/discovery/collectionDiscovery?vid=01CUNY_GC:CUNY_GC&collectionId=' + collectionLink,
                        "collectionLinkText": collectionLinkText
                    }]
            }
            var template = document.getElementById('collections-template').innerHTML;
            var rendered = Mustache.render(template, collectionData);
            $('#collection').html(rendered);
        },
            error => {
                console.log(error);
            }
        );

    swapVideos = function () {
    //    list of video IDs in data/videos.txt 
        fetch('./data/videos.txt')
            .then(response => response.text())
            .then(data => {
                const videoIDs = data.split("\n");
                const randomVideoID = videoIDs[Math.floor(Math.random() * videoIDs.length)];
                const videoEmbed = document.getElementById('vid')
                videoEmbed.src = `https://www.youtube.com/embed/${randomVideoID}`;
            });
        fetch(playlistURL)
            .then(response => response.json())
            .then(data => {
                // play random video
                var randomVideo = data.items[Math.floor(Math.random() * data.items.length)];
                var videoEmbed = document.getElementById('vid')
                videoEmbed.src = `https://www.youtube.com/embed/${randomVideo.id.videoId}`;
            });
    }
    swapVideos();

    // profiles
    // const librarians = ["Stephen Zweibel","Elvis Bakaitis","Maura Smale","Mason Brown",
    // "Jill Cirasella", "Beth Posner", "Marilyn Reside", "Alycia Sellie", "Stephen Klein",
    // "Roxanne Shirazi", "Polly Thistlethwaite", "Silvia Cho"]
    // const librarian = librarians[Math.floor(Math.random() * librarians.length)];
    // const librarianHyphenated = librarian.replace(/\s+/g, '-').toLowerCase();
    // $.ajax({
    //     url: 'https://gc.cuny.edu/people/' + librarianHyphenated, type: 'HEAD', success: function (data) {
    //         const target = $('#librarian')
    //         target.html(data)
    //         // target.attr("href", "https://gc.cuny.edu/people/" + libarianHyphenated)
    //     }, error: function (err) {
    //         console.log(err);
    //     }
    // })
});