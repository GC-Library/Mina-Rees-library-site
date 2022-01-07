
$(document).ready(function ($) {
    $(".database-list").load("https://lgapi-us.libapps.com/widgets.php?site_id=146&widget_type=2&search_terms=&search_match=2&subject_ids=&sort_by=name&list_format=2&drop_text=Select+a+Database...&output_format=1&load_type=2&enable_description=1&widget_embed_type=2&num_results=0&enable_more_results=0&window_target=2&config_id=1535395835265", function () {
        $("#s-lg-frm-az-widget-1535395835265").addClass('col-md-12');
    })

    $("#booksearchButton").click(function () {
        query = $("input#primoQueryTemp").val();
        radio = $("#searchCUNY > li input[name=ONESEARCH]:checked").val();
        finalQuery = "https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=" + radio + ",contains," + query + "&tab=Everything&search_scope=MyInst_and_CI&sortby=rank&mfacet=rtype,include,books,1&mfacet=rtype,include,book_chapters,1&lang=en_US&mode=basic&offset=0";
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
        finalQuery = "https://cuny-gc.primo.exlibrisgroup.com/discovery/search?vid=01CUNY_GC:CUNY_GC&query=" + radio + ",contains," + query + "&tab=Everything&search_scope=MyInst_and_CI&sortby=rank&facet=rtype,exclude,book_chapters&facet=rtype,exclude,books&lang=en_US&mode=basic&offset=0";
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
                var event_link = event.url.public;
                var event_date = new Date(event.start);
                var event_time = event_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                var event_date_string_with_day = event_date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                var event_time_string = event_time
                var event_name = event.title;
                var event_description = event.description;
                var event_description_start = event_description.indexOf('<p>');

                var event_description_short = event_description.substring(event_description_start, event_description_start + 300) + "...";
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
                            console.log(data.items);
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

    $('#news').rss('https://gclibrary.commons.gc.cuny.edu/category/blog/website-front-page/feed/?fsk=5c1146bca3512',
        {
            limit: 4,
            ssl: true,
            support: false,
            layoutTemplate: "<h3 class='lower-header'><a href='https://gclibrary.commons.gc.cuny.edu/'>News &amp; Views</a></h3><ul class='news'>{entries}</ul>",

            // inner template for each entry
            entryTemplate: '<li>{image}<h4><a href="{url}">{title}</a></h4><p>{shortBodyWithDots}</p></li>',

            // additional token definition for in-template-usage
            // default: {}
            // valid values: any object/hash
            tokens: {
                image: function (entry, tokens) {
                    return entry.content.match(/<img[^>]+>/) || "";
                },
                shortBodyWithDots: function (entry, tokens) {
                    // get all text after open p tag
                    var shortBodyText = entry.content.replace(/<[^>]+>/g, '');
                    var truncatedBodyText = shortBodyText.substring(0, 200) + "...";
                    return truncatedBodyText;
                }
            },
            // formats the date with moment.js (optional)
            // default: 'dddd MMM Do'
            // valid values: see http://momentjs.com/docs/#/displaying/
            dateFormat: "MMMM Do, YYYY",

            // localizes the date with moment.js (optional)
            // default: 'en'
            dateLocale: "en",

            // Defines the format which is used for the feed.
            // Default: null (utf8)
            // valid values: https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
            encoding: "ISO-8859-1",

            // Defined the order of the feed's entries.
            // Default: undefined (keeps the order of the original feed)
            // valid values: All entry properties; title, link, content, contentSnippet, publishedDate, categories, author, thumbnail
            // Order can be reversed by prefixing a dash (-)
            order: "-publishedDate",

            // formats the date in whatever manner you choose. (optional)
            // this function should return your formatted date.
            // this is useful if you want to format dates without moment.js.
            // if you don't use moment.js and don't define a dateFormatFunction, the dates will
            // not be formatted; they will appear exactly as the RSS feed gives them to you.
            dateFormatFunction: function (date) { },

            // a callback, which gets triggered when an error occurs
            // default: function() { throw new Error("jQuery RSS: url don't link to RSS-Feed") }
            error: function () {
                console.log("News rss did not load.");
            },

            // a callback, which gets triggered when everything was loaded successfully
            // this is an alternative to the next parameter (callback function)
            // default: function(){}
            success: function () { },

            // a callback, which gets triggered once data was received but before the rendering.
            // this can be useful when you need to remove a spinner or something similar
            onData: function () { }
        },

        // callback function
        // called after feeds are successfully loaded and after animations are done
        function callback() { }
    );

    $.ajax({
        url: 'https://gc-cuny.libcal.com/widget/hours/grid?iid=5568&format=json&weeks=4&systemTime=0',
        type: 'GET',
        success: function (result) {
            var minaRees = result.locations[0]
            var hoursThisWeek = minaRees.weeks[0]
            var today = moment().format('dddd');

            // add 15 minutes to "to" time 
            const correctHours = Object.keys(hoursThisWeek).map(key => {
                var hours = hoursThisWeek[key]
                hours.day = key
                if (hours.times.status === "open") {
                    var to = hours.times.hours[0].to
                    var from = hours.times.hours[0].from
                    var fromTime = moment(from, "HH:mm")
                    hours.times.hours[0].from = fromTime.format("h A")
                    var toTime = moment(to, "hh:mm A").add(15, 'minutes').format("h A")
                    hours.times.hours[0].to = toTime
                }
                return hours
            });
            const renderHours = Object.keys(correctHours).map(key => {
                var hours = correctHours[key]
                if (hours.day === today) {
                    hours.isToday = true
                }else{
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
            var todayHours = "Today's Hours: " + todayHours[0].times.hours[0].from + " - " + todayHours[0].times.hours[0].to
            $('#today-hours').html(todayHours)
            var template = document.getElementById('hours-template').innerHTML;
            var rendered = Mustache.render(template, hours);
            $('#hours').html(rendered);
        }
    });



    $.ajax({
        url: 'alert.yml', dataType: 'text', success: function (data) {
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
});