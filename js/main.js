document.querySelector('#cancel').addEventListener('click', function() {
    window.location.reload();
});
function getURLQuery() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    return params.url;
}

// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
function getUYouTubeId(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}
$(document).ready(function() {
    $(window).on('load', function() {
        query = getURLQuery()
        if(query && query.indexOf('you') >= 0) {
            document.getElementById("url").value = query;
            document.getElementById("download").click();
        }
    })
})
document.querySelector('#download').addEventListener('click', function() {
    var url = document.querySelector('#url').value;
    document.getElementById("title").innerHTML = "";
    document.getElementById("thumbnail").src = "";
    document.getElementById("mp4").innerHTML = "";
    document.getElementById("audio").innerHTML = "";
    if (url.length == 0) {
        alert('Please input a link');
        return;
    }
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gm
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/gm
    const destination = regex.exec(url)
    const youtubeDestination = youtubeRegex.exec(url)
    // regex for youtube and youtube music
    if (!destination || !destination[0] || !youtubeDestination || !youtubeDestination[0]) {
        alert('Invalid URL')
        return;
    } 
    const dynamicWaitText = async (callback) => {
        res = await callback() 
        for (i = 3; i < 0; i--) {
            document.getElementById('ready').innerHTML = `Please wait${".".repeat(i)}`;
            if (i == 0) i = 3;
            if (res) break;
        }
    }

    const videoLink = destination[0];
    dynamicWaitText(function () {
        downloadVideo(videoLink)
    });

    function downloadVideo(videoLink) {
        res = fetch('https://save-from.net/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoLink
            })
        })
    
        res.then(res => res.json())
            .then(res => {
                if (res.meta) {
                    $(document).ready(function(){
                        document.getElementById('title').innerHTML = `${res.meta.title}<br>(${res.meta.duration})`;    
                        document.getElementById('thumbnail').src = `https://img.youtube.com/vi/${res.id}/hqdefault.jpg`;
                        document.getElementById('mp4').className = "w-48 text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
                        document.getElementById('audio').className = `${$(window).width() < 768 ? '' :  " w-48 text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"}`;
                        document.getElementById('ready').innerHTML = '<i class="fa-brands fa-youtube"></i> Ready to download';
                        for (var i = 0; i < res.url.length; i++) {
                            dl =document.createElement('a');
                            dl.href = `${res.url[i].url}`
                            dl.className = 'inline-flex relative items-center py-2 px-4 w-full text-sm font-medium rounded-t-lg border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white'
                            dl.innerHTML = `${res.url[i].attr.class && res.url[i].attr.class == 'no-audio' ? "<i class='fa-solid fa-volume-xmark mr-2'></i>" : "<i class='fa-solid fa-volume-high mr-2'></i>"}    ${res.url[i].quality}.${res.url[i].ext}    ${res.url[i].contentLength ? `${(res.url[i].contentLength / 1060687.7).toFixed(2) } MB` : ''}`
                            append = `#${res.url[i].ext == 'mp4' ? res.url[i].ext : 'audio'}`;
                            document.querySelector(`${$(window).width() < 768 ? '#mp4' : append}`).appendChild(dl);
                        }
                        return true;
                    });
                } else {
                    $(document).ready(()=>{
                        document.getElementById('ready').innerHTML = '<div class="text-red-200">Sorry<i class="fa-light fa-face-disappointed"></i><br>No result found</div>';
                    })
                }
            })
            .catch((e) => {
                $(document).ready(()=>{
                    document.getElementById('ready').innerHTML = '<div class="text-red-200">Sorry<i class="fa-light fa-face-disappointed"></i><br>No result found</div>';
                }) 
            })
    }
});