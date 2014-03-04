
var YouTubePlayer = (function(){

	/**
	* Check if client has Flash
	*/
	var _hasFlash = function(){
		var hasFlash = false;

		try {
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if(fo) hasFlash = true;
		}catch(e){
			if(navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) hasFlash = true;
		}

		return hasFlash;
	};

	// Public
	var ytp = {};

	ytp.init = function(options){

		// Set options - TODO: merge with defaults and validate
		this.$el = options.element;
		this.videoId = options.videoId;
		this.playerWidth = options.width;
		this.playerHeight = options.height;
		this.videoElId = options.videoElId;

		this.hasFlash = _hasFlash();

		if(this.hasFlash){

			google.setOnLoadCallback(function(){
				ytp.createFlashPlayer(ytp.playerWidth, ytp.playerHeight, ytp.videoElId);
			});

		}else{

			$.getScript( '//www.youtube.com/iframe_api');

			window.onYouTubeIframeAPIReady = function(){
				ytp.player = ytp.createIframePlayer(ytp.videoId, ytp.playerWidth, ytp.playerHieght);
			}
		}

		this.events();

		return this;
	};

	ytp.events = function(){

		$('.player-controls .play-pause-btn', ytp.$el).click(function(e){
			ytp.playPauseToggle();
		});

		$('.player-controls .mute-btn', ytp.$el).click(function(e){
			ytp.muteToggle();
		});

		$('#yt_scrubber').mousedown(function(e){
			var mX = e.pageX - $('#yt_controls').offset().left - 34;
			var perc = Math.round(mX/(scrubber_width/100)*100)/100;
			$('#yt_progress').width(perc+'%');
			seekVideo(perc);
		});

		$('.player-controls .scrubber .inner', ytp.$el).click(function(e){

			var mX = e.pageX - $(e.currentTarget).offset().left,
				scrubberWidth = $('.scrubber .inner', ytp.$el).width(),
				perc = Math.round( mX / (scrubberWidth/100) )

			ytp.seekVideo(perc);
		});
	};

	ytp.createIframePlayer = function(videoId, width, height){

		var player = new YT.Player('yt-player', {
			width: width,
			height: height,
			videoId: videoId,
			events: {
				'onReady': this.onPlayerReady,
				'onStateChange': this.onPlayerStateChange,
				'onPlaybackQualityChange': this.onPlayerPlaybackQualityChange,
				'onError': this.onPlayerError
			}
		});

		return player;
	};

	/**
	 * Create the Flash player embedd
	 */
	ytp.createFlashPlayer = function(width, height, videoElId){

		// Lets Flash from another domain call JavaScript
		var params = {
			allowScriptAccess: 'always'
		};

		// The element id of the Flash embed
		var atts = {
			id: 'embedd-' + videoElId
		};

		// All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
		swfobject.embedSWF('http://www.youtube.com/apiplayer?' +
							'version=3&enablejsapi=1&playerapiid=player1',
							videoElId, width, height, '9', null, null, params, atts);
	};

	ytp.initPlayer = function(){
		this.player = this.loadFlashPlayer(this.videoId, this.videoElId);

		// Setup look to listen for player info
		setInterval(this.updatePlayerInfo, 250);
		this.updatePlayerInfo();
	};

	/**
	 * Load video into Flash player
	 */
	ytp.loadFlashPlayer = function(videoId, elId){

		var player = document.getElementById('embedd-' + elId);

		player.addEventListener('onStateChange', 'onPlayerStateChange');
		player.addEventListener('onError', 'onPlayerError');

		player.cueVideoById(videoId);

		return player;
	};

	/**
	 * Listen for player state change
	 */
	ytp.stateChange = function(e){
		ytp.duration = ytp.player.getDuration();
	};

	/**
	 * Listen for player error
	 */
	ytp.onPlayerError = function(errorCode){
		switch(errorCode){
			case 2:
				var errorMessage = 'The video embedd contains invalid parameters '+errorCode+'.';
				break;
			case 100:
				var errorMessage = 'This video was not found '+errorCode+'.';
				break;
			case 101:
				var errorMessage = 'This video cannot be played back in an embedded player '+errorCode+'.';
				break;
			case 150:
				var errorMessage = 'This video cannot be played back in an embedded player '+errorCode+'.';
				break;
			default:
				var errorMessage = 'An error occured with this video with the error type '+errorCode+'.';
		}
		alert(errorMessage);
	}

	ytp.updatePlayerInfo = function(){
		if(ytp.player && ytp.player.getDuration && ytp.player.getPlayerState() === 1){
			ytp.resizeScrubber(ytp.player.getCurrentTime());
		}
	};

	ytp.resizeScrubber = function(time){

		// Update played bar
		if(ytp.duration && time > 0 && time < ytp.duration){
			var perc = Math.round( time/ (ytp.duration/100)*100)/100;
			$('.scrubber-progress', ytp.$el).width(perc+'%');
		}

		// Update loaded bar
		$('.scrubber-loaded', ytp.$el).width( (ytp.player.getVideoLoadedFraction() * 100) + '%');
	};

	ytp.seekVideo = function(perc){
		var seconds = Math.round((ytp.duration/100)*perc);
		ytp.player.seekTo(seconds, true);
	}

	/**
	 * Play video
	 */
	ytp.play = function(){
		this.player.playVideo();
	};

	/**
	 * Stop video
	 */
	ytp.stop = function(){
		this.player.stopVideo();
	};

	/**
	 * Toggle player play/pause
	 */
	ytp.playPauseToggle = function(e){
		if(this.player.getPlayerState() === 1){
			this.player.pauseVideo();
			this.$el.addClass('is-paused').removeClass('is-playing');
		}else{
			this.player.playVideo();
			this.$el.removeClass('is-paused').addClass('is-playing');
		}
	};

	/**
	 * Toggle player mute
	 */
	ytp.muteToggle = function(e){
		if(this.player.isMuted()){
			this.player.unMute();
			this.$el.removeClass('is-muted');
		}else{
			this.player.mute();
			this.$el.addClass('is-muted');
		}
	};

	return ytp;
});

var customPlayer1 = YouTubePlayer().init({
	element: $('#player-1'),
	videoElId: 'yt-video-1',
	videoId: 'N3NDZL1RYKw',
	width: 600,
	height: 480
});

var customPlayer2 = YouTubePlayer().init({
	element: $('#player-2'),
	videoElId: 'yt-video-2',
	videoId: '97pv_kiYhv4',
	width: 600,
	height: 480
});

// This method must be called in global scope
function onYouTubePlayerReady (event){
	customPlayer1.initPlayer();
	customPlayer2.initPlayer();
}

// This method must be called in global scope
function onPlayerStateChange(event){
	customPlayer1.stateChange(event);
	customPlayer2.stateChange(event);
}