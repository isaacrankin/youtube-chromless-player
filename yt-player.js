
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

		this.hasFlash = _hasFlash();

		if(this.hasFlash){

			google.setOnLoadCallback(function(){
				ytp.createFlashPlayer(ytp.playerWidth, ytp.playerHeight);
			});

			window.onYouTubePlayerReady = function(id){
				ytp.player = ytp.loadFlashPlayer(ytp.videoId);

				// Setup look to listen for player info
				setInterval(ytp.updatePlayerInfo, 250);
				ytp.updatePlayerInfo();
			};

			window.onPlayerStateChange = ytp.onPlayerStateChange;

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

		$('.player-controls .play-pause-btn').click(function(e){
			ytp.playPauseToggle();
		});

		$('.player-controls .mute-btn').click(function(e){
			ytp.muteToggle();
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
	ytp.createFlashPlayer = function(width, height){

		// Lets Flash from another domain call JavaScript
		var params = {
			allowScriptAccess: 'always'
		};

		// The element id of the Flash embed
		var atts = {
			id: 'yt-player'
		};

		// All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
		swfobject.embedSWF('http://www.youtube.com/apiplayer?' +
							'version=3&enablejsapi=1&playerapiid=player1',
							'yt-player', width, height, '9', null, null, params, atts);
	};

	/**
	 * Load video into Flash player
	 */
	ytp.loadFlashPlayer = function(videoId){

		var player = document.getElementById('yt-player');

		player.addEventListener('onStateChange', 'onPlayerStateChange');
		player.addEventListener('onError', 'onPlayerError');

		player.cueVideoById(videoId);

		return player;
	};

	/**
	 * Listen for player state change
	 */
	ytp.onPlayerStateChange = function(e){
		ytp.duration = ytp.player.getDuration();
		console.debug(e);
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

	ytp.seekVideo = function(){
		var seconds = Math.round((duration/100)*perc);
		ytplayer.seekTo(seconds, true);
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

var customPlayer = new YouTubePlayer().init({
	element: $('#player-1'),
	videoId: 'N3NDZL1RYKw',
	width: 600,
	height: 480
});