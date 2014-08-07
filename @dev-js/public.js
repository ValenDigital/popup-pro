;(function () {
	var Popup = function( _options ) {

		var me = this,
			$doc = jQuery( document ),
			$win = jQuery( window ),
			$po_old_bg = jQuery( '#darkbackground' ),
			$po_div = null,
			$po_msg = null,
			$po_close = null,
			$po_hide = null,
			$po_resize = null,
			$po_back = null
			;

		this.data = {};
		this.have_popup = false;

		/**
		 * Close Pop Up and set the "never see again" flag.
		 */
		this.close_forever = function close_forever() {
			var expiry = me.data.expiry || 365;

			me.close_popup();
			if ( _options['preview'] ) { return false; }

			me.set_cookie( 'po_h', 1, expiry );
			return false;
		};

		/**
		 * Close Pop Up.
		 * Depending on the "multi_open" flag it can be opened again.
		 */
		this.close_popup = function close_popup() {
			jQuery( 'html' ).removeClass( 'has-popup' );

			if ( me.data.display_data['click_multi'] ) {
				$po_old_bg.hide();
				$po_div.hide();
			} else {
				$po_old_bg.remove();
				$po_div.remove();

				me.have_popup = false;
			}

			$doc.trigger( 'popup-closed' );
			// Legacy trigger.
			$doc.trigger( 'popover-closed' );

			if ( ! me.have_popup ) {
				me.next_popup();
			}
			return false;
		};

		/**
		 * When user clicked on the background-layer.
		 */
		this.background_clicked = function background_clicked( ev ) {
			var el = jQuery( ev.target );

			if ( el.hasClass( 'wdpu-background' ) ) {
				if ( ! me.data.overlay_close ) { return; }

				me.close_popup();
			}
		}

		/**
		 * Resize and move the Pop Up. Triggered when Pop Up is loaded and
		 * window is resized.
		 */
		this.move_popup = function move_popup() {
			if ( me.data.custom_size ) {
				$po_resize.width(me.data.width)
					.height(me.data.height);
			}

			if ( ! $po_resize.hasClass( 'no-move' ) ) {
				// Short delay before positioning the popup to give the browser time
				// to show/resize the popup (20ms ~ 1 screen refresh)
				window.setTimeout(function() {
					var win_width = $win.width(),
						win_height = $win.height(),
						msg_width = $po_msg.outerWidth(),
						msg_height = $po_msg.outerHeight(),
						msg_left = (win_width - msg_width) / 2,
						msg_top = (win_height - msg_height) / 2;

					if ( msg_width+30 > win_width || msg_left < 0 ) {
						if ( isNaN( me.data._switch_width ) ) {
							me.data._switch_width = win_width;
							$po_resize.addClass('small-width').css({ 'left': '' });
						}
					} else if ( me.data._switch_width < win_width ) {
						me.data._switch_width = undefined;
						$po_resize.removeClass('small-width');
						$po_resize.css({ 'left': msg_left });
					} else {
						$po_resize.css({ 'left': msg_left });
					}

					if ( msg_top < 10 ) { msg_top = 10; }
					$po_resize.css({ 'top': msg_top });
				}, 20);
			}
		};

		/**
		 * Reject the current Pop Up: Do not display it.
		 */
		this.reject = function reject() {
			me.have_popup = false;
			me.data = {};
		};

		/**
		 * Check if the Pop Up is ready to be displayed.
		 * If it is ready then it is displayed.
		 */
		this.maybe_show_popup = function maybe_show_popup() {
			me.fetch_dom();
			// Move the Pop Up out of the viewport but make it visible.
			// This way the browser will start to render the contents and there
			// will be no delay when the Pop Up is made visible later.
			$po_div.css({
				'opacity': 0,
				'z-index': -1,
				'position': 'absolute',
				'left': -1000,
				'width': 100,
				'right': 'auto',
				'top': -1000,
				'height': 100,
				'bottom': 'auto'
			}).show();

			$doc.trigger( 'popup-init', [me, me.data] );

			if ( me.have_popup ) {
				switch ( me.data.display ) {
					case 'scroll':
						$win.on( 'scroll', me.show_at_position );
						break;

					case 'anchor':
						$win.on( 'scroll', me.show_at_element );
						break;

					case 'delay':
						var delay = me.data.display_data.delay * 1000;
						if ( 'm' == me.data.display_data.delay_type ) {
							delay *= 60;
						}

						window.setTimeout( function() {
							me.show();
						}, delay );
						break;

					default:
						// A custom action will show the Pop Up (e.g. click/leave)
						setTimeout(function() {
							if ( 'function' == typeof me.custom_handler ) {
								me.custom_handler( me );
							}
						}, 20);
				}

			} else {
				// Pop Up was rejected during popup-init event. Do not display.
				me.next_popup();
			}
		};

		/**
		 * Observe the scroll-top to trigger the Pop Up.
		 */
		this.show_at_position = function show_at_position( ev ) {
			var height, perc,
				el = jQuery( this ),
				top = el.scrollTop();

			switch ( me.data.display_data.scroll_type ) {
				case 'px':
					if ( top >= me.data.display_data.scroll ) {
						$win.off( 'scroll', me.show_at_position );
						me.show();
					}
					break;

				case '%':
				default:
					height = $doc.height() - $win.height();
					perc = 100 * top / height;

					if ( perc >= me.data.display_data.scroll ) {
						$win.off( 'scroll', me.show_at_position );
						me.show();
					}
					break;
			}
		};

		/**
		 * Tests if a specific HTML element is visible to trigger the Pop Up.
		 * We intentionally calculate el_top every time this function is called
		 * because the element may be hidden or not present at page load.
		 */
		this.show_at_element = function show_at_element( ev ) {
			var anchor = jQuery( me.data.display_data.anchor ),
				view_top = $win.scrollTop(),
				view_bottom = view_top + $win.height(),
				el_top = anchor.offset().top,
				offset = view_bottom - el_top;

			// When 10px of the element are visible show the Pop Up.
			if ( offset > 10 ) {
				$win.off( 'scroll', me.show_at_element );
				me.show();
			}
		};

		/**
		 * Display the Pop Up!
		 */
		this.show = function show() {
			$po_back.on( 'click', me.background_clicked );
			$doc.on( 'popup-closed', me.reinit );

			$win.off("resize.popup").on("resize.popup", function () {
				me.move_popup(me.data);
			});

			$po_div.show().removeAttr( 'style' );
			$po_old_bg.show();

			me.move_popup(me.data);

			jQuery( 'html' ).addClass( 'has-popup' );

			$po_hide.off( "click", me.close_forever )
				.on( "click", me.close_forever );

			if ( me.data && me.data.close_hide ) {
				$po_close.off( 'click', me.close_forever )
					.on( 'click', me.close_forever );
			} else {
				$po_close.off( 'click', me.close_popup )
					.on( 'click', me.close_popup );
			}

			$po_msg.hover(function() {
				jQuery( '.claimbutton' ).removeClass( 'hide' );
			}, function() {
				jQuery( '.claimbutton' ).addClass( 'hide' );
			});

			$doc.trigger( 'popup-displayed', [me.data, me] );
			// Legacy trigger.
			$doc.trigger( 'popover-displayed', [me.data, me] );
		};


		/*-----  Dynamically load Pop Ups  ------*/


		/**
		 * Finds the Pop Up DOM elements and stores them in protected member
		 * variables for easy access.
		 */
		this.fetch_dom = function fetch_dom() {
			// The top container of the Pop Up.
			$po_div = jQuery( '#' + me.data['html_id'] );

			// The container that should be resized (custom size).
			$po_resize = $po_div.find( '.resize' );

			// The container that holds the message:
			// For new styles this is same as $po_resize.
			// For old popup styles this is a different contianer...
			$po_msg = $po_div.find( '.wdpu-msg' );

			// Close button.
			$po_close = $po_div.find( '.wdpu-close' );

			// Hide forever button.
			$po_hide = $po_div.find( '.wdpu-hide-forever' );

			// The modal background.
			if ( $po_div.hasClass( 'wdpu-background' ) ) {
				$po_back = $po_div;
			} else {
				$po_back = $po_div.find( '.wdpu-background' );
				if ( ! $po_back.length && $po_old_bg.length ) {
					$po_back = $po_old_bg;
				}
			}

			if ( ! $po_resize.length ) {
				$po_resize = $po_div;
			}
		};

		/**
		 * Insert the Pop Up CSS and HTML as hidden elements into the DOM.
		 */
		this.prepare_dom = function prepare_dom() {
			if ( me.data['html'] === '' ) { return false; }

			jQuery( '<style type="text/css">' + me.data['styles'] + '</style>' )
				.appendTo('head');

			jQuery( me.data['html'] )
				.appendTo('body');

			me.fetch_dom();

			$po_div.hide();
			$po_old_bg.hide();

			me.maybe_show_popup();
		};

		/**
		 * Load popup data via ajax.
		 */
		this.load_popup = function load_popup( id, data ) {
			var ajax_args, ajax_data,
				po_id = 0,
				thefrom = window.location,
				thereferrer = document.referrer;

			me.have_popup = false;

			var handle_done = function handle_done( data ) {
				me.data = data;

				if ( data ) {
					me.have_popup = true;
					me.prepare_dom();
				}
			};

			// Legacy: force_popover = load a popup_id by ID.
			if ( typeof force_popover != 'undefined' ) {
				po_id = force_popover.toString();
			}

			// New way of specifying popup ID is via param: load(id)
			if ( typeof id != 'undefined' ) {
				po_id = id.toString();
			}

			ajax_data = {
				'action':    'inc_popup',
				'do':        _options['do'],
				thefrom:     thefrom.toString(),
				thereferrer: thereferrer.toString()
			};
			if ( po_id ) { ajax_data['po_id'] = po_id; }
			if ( data ) { ajax_data['data'] = data; }
			if ( _options['preview'] ) { ajax_data['preview'] = true; }

			ajax_args = {
				url:           _options['ajaxurl'],
				dataType:      'jsonp',
				jsonpCallback: 'po_data',
				data: ajax_data,
				success: function( data ) {
					handle_done( data );
				},
				complete: function() {
					$doc.trigger( 'popup-load-done', [me.data, me] );
				}
			};
			return jQuery.ajax(ajax_args);
		};

		/**
		 * Try to load the next Pop Up from the server.
		 */
		this.next_popup = function next_popup() {
			console.log ('try to fetch next popup...');
		};


		/*-----  Init  ------*/


		this.init = function init() {
			if ( ! _options['popup'] ) {
				me.have_popup = false;
				me.load_popup();
			} else {
				me.have_popup = true;
				me.data = _options['popup'];
				me.maybe_show_popup();
			}
		};

		/**
		 * Used for certain rules (e.g. on-click rule) to show the Pop Up
		 * again when the rule validates a second time.
		 */
		this.reinit = function reinit() {
			if ( me.data.display_data['click_multi'] ) {
				me.maybe_show_popup();
			}
		};


		/*======================================*\
		==========================================
		==                                      ==
		==           HELPER FUNCTIONS           ==
		==                                      ==
		==========================================
		\*======================================*/


		// Get a cookie value.
		this.get_cookie = function get_cookie( name ) {
			var i, c, cookie_name, value,
				ca = document.cookie.split( ';' );

			if ( me.data && me.data.popup_id ) {
				cookie_name = name + '-' + me.data.popup_id + "=";
			} else {
				cookie_name = name + "=";
			}

			for ( i = 0; i < ca.length; i += 1 ) {
				c = ca[i];
				while ( c.charAt(0) === ' ' ) {
					c = c.substring( 1, c.length );
				}
				if (c.indexOf( cookie_name ) === 0 ) {
					return c.substring( cookie_name.length, c.length );
				}
			}
			return null;
		};

		// Saves the value into a cookie.
		this.set_cookie = function set_cookie( name, value, days ) {
			var date, expires, cookie_name;

			if ( _options['preview'] ) { return; }

			if ( ! isNaN( days ) ) {
				date = new Date();
				date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
				expires = "; expires=" + date.toGMTString();
			} else {
				expires = "";
			}

			if ( me.data && me.data.popup_id ) {
				cookie_name = name + '-' + me.data.popup_id;
			} else {
				cookie_name = name;
			}

			document.cookie = cookie_name + "=" + value + expires + "; path=/";
		};


		/*-----  Finished  ------*/


		// Only expose the "init" and "load" functions of the Pop Up.
		return {
			init: me.init,
			load: me.load_popup,
			extend: me
		};
	};


	// Initialize the Pop Up one the page is loaded.
	jQuery(function() {
		window.inc_popup = new Popup( _popup_data );
		if ( _popup_data['noinit'] || _popup_data['preview'] ) { return; }
		inc_popup.init();
	});

})();