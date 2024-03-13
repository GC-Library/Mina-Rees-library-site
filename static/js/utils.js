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
                $("#events").html(' <h3 class="lower-header"><a href="https://www.youtube.com/channel/UCF11xs3zCmMdMdWoOfxP_kg">Featured Video</a></h3><iframe id="vid" width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLbp9SdWbaAjmttsctx1kDqiVOZruZDwCm" frameborder="0" allowfullscreen></iframe>');
                swapVideos = function () {
                    const YOUTUBE_API_KEY = "AIzaSyDB8xovapQlJM7waqm0aU5o3rtA3B7olfI";
                    var playlistURL = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=UCF11xs3zCmMdMdWoOfxP_kg&part=snippet,id&order=date&maxResults=20`;
                    fetch(playlistURL)
                        .then(response => response.json())
                        .then(data => {
                            // play random video
                            var randomVideo = data.items[Math.floor(Math.random() * data.items.length)];
                            console.log(randomVideo);
                            var videoEmbed = document.getElementById('vid')
                            videoEmbed.src = `https://www.youtube.com/embed/${randomVideo.id.videoId}`;
                        });
                }
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
                    if (i > 3) {
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
                    .then(() => {
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
    })

    // Collections
    
    // a collections response: 
    // {"collection":[{"pid":{"value":"8163860070006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8163860070006140"},"mms_id":{"value":"9994446280206140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994446280206140"},"name":"Books on Black Lives and Anti-Racism from Graduate Center Authors","description":"Highlights from the Mina Rees Library's Anti-racism and #BlackLivesMatter Reading List, featuring books authored by Graduate Center faculty and alumni.","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8163860070006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"date_d","external_system":"","external_id":"","order":1},{"pid":{"value":"8166596730006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8166596730006140"},"mms_id":{"value":"9994462374706140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994462374706140"},"name":"Graduate Center Books on New York City History","description":"Highlights from Mina Rees Library's collection on the history (social, cultural, political, economic, architectural, etc.) of the five boroughs.","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8166596730006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"date_d","external_system":"","external_id":"","order":2},{"pid":{"value":"8192366290006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8192366290006140"},"mms_id":{"value":"9994593976406140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994593976406140"},"name":"Books That Began as CUNY Dissertations","description":"Browse our growing list of books that began as CUNY dissertations, collected by the Mina Rees Library's Dissertation Office.\n\n\n\n\n\n\n\n","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8192366290006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"date_d","external_system":"","external_id":"","order":3},{"pid":{"value":"8173365810006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8173365810006140"},"mms_id":{"value":"9994495475306140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994495475306140"},"name":"Joseph Buttinger Collection on Utopias","description":"Born in Bavaria, Joseph A. Buttinger became a socialist and at 24 served as the secretary of the Social Democratic Party of Austria. Imprisoned for several months in 1934 because of his political beliefs and anti-Nazi activities, he finally fled Austria for Paris when Germany annexed the country in 1938 and, in 1940, came to the United States. He helped form the International Rescue Committee, an organization dedicated to helping refugees fleeing from oppression. Only formally educated through sixth grade, Buttinger nonetheless became a scholar and analyst on Vietnam, writing several well-received books. He died in 1992. \n\nButtinger gave the last part of his utopia collection to the Graduate Center in 1971. There are a total of 1,204 titles in the collection, with the majority in English. However, there are large parts of the collection in French (247 titles) and in German (229 titles). The oldest book was published in 1631 and written by Sir Francis Bacon. Buttinger’s broad interpretation of “utopia” included not only works of fiction but also those dealing with the real world. Bob Brown’s autobiography and his practical manuscript based on his experience in founding a cooperative farm in Louisiana, are two titles while another is Robert Owen’s 1841 book on how to establish self-supporting colonies based on communism. There are books on slavery as well as rare serials. The most recent imprint is from 1972 and deals with forecasting future political and economic organizations.","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8173365810006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"title","external_system":"","external_id":"","order":4},{"pid":{"value":"8173266270006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8173266270006140"},"mms_id":{"value":"9994494376206140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994494376206140"},"name":"Queer Biography","description":"A small but diverse selection of biographies on LGBTQA+ subjects, all available to borrow from the library’s circulating collection. ","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8173266270006140","library":{"value":"GC001","desc":"Mina Rees Library"},"external_system":"","external_id":"","order":5},{"pid":{"value":"8167695920006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8167695920006140"},"mms_id":{"value":"9994467975506140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994467975506140"},"name":"Ukraine Since Independence","description":"Highlights from Mina Rees Library's collection on Ukraine's history, culture, politics and foreign relations since independence, including the impact of the Russian invasions of 2014 and 2022.","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8167695920006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"date_d","external_system":"","external_id":"","order":6},{"pid":{"value":"8168056000006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8168056000006140"},"mms_id":{"value":"9994469875906140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994469875906140"},"name":"Ukraine before 1989","description":"Highlights from Mina Rees Library's collection on the history (cultural and political) of Ukraine from its beginnings until independence from the former USSR. ","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8168056000006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"date_d","external_system":"","external_id":"","order":7},{"pid":{"value":"8170976240006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8170976240006140"},"mms_id":{"value":"9994486476006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994486476006140"},"name":"Academic Freedom","description":"Highlights from newly acquired books on academic freedom at the Mina Rees Library.","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8170976240006140","library":{"value":"GC001","desc":"Mina Rees Library"},"external_system":"","external_id":"","order":8},{"pid":{"value":"8189425850006140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections/8189425850006140"},"mms_id":{"value":"9994569275306140","link":"https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/9994569275306140"},"name":"Ebook Central GC purchased","description":"Ebook Central titles purchased by the Graduate Center","thumbnail":"/view/delivery/thumbnail/01CUNY_GC/8189425850006140","library":{"value":"GC001","desc":"Mina Rees Library"},"sort_by":"title","external_system":"","external_id":"","order":10}],"total_record_count":10}
    // const collectionsAPI = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/bibs/collections?apikey=l8xx19fe635164904a9a80d6787cbb6a28a5&format=json'

    // fetch(collectionsAPI, {
    //     mode: 'no-cors',
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     }
    // })
    //     // .then(response => response.text())
    //     .then(data => {
    //         console.log(data);
    //         // pick a collection at random
    //         const collection = data.collection[Math.floor(Math.random() * data.collection.length)];
    //         const collectionName = collection.name;
    //         const collectionDescription = collection.description;
    //         const collectionThumbnail = collection.thumbnail;
    //         const collectionLink = collection.pid.link;
    //         const collectionLinkText = "Browse the collection";
    //         const collectionData = {
    //             "collectionName": collectionName,
    //             "collectionDescription": collectionDescription,
    //             "collectionThumbnail": collectionThumbnail,
    //             "collectionLink": collectionLink,
    //             "collectionLinkText": collectionLinkText
    //         }
    //         var template = document.getElementById('collections-template').innerHTML;
    //         var rendered = Mustache.render(template, collectionData);
    //         $('#collection').html(rendered);
    //     },
    //         error => {
    //             console.log(error);
    //         }
    //     );


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