
/*
*   Berlinerds' Modal box for gallery
*   @Developed by Carlos Aparicio (FE Dev.) & Diego Ruiz del Árbol (BE Dev.) 
*   @Version: 2.0
*   @Release date: May-2015
*/

var Berlinerds_Gallery_Modal = function (options) {

    var root = this;

    /*--- options ---*/
    root.animation = options.animation;
    root.is_drupal = options.is_drupal;
    root.is_snap = options.is_snap;
    root.gestures_allowed = options.gestures_allowed;
    root.dimensions = options.dimensions;

    /*--- elements on earth ---*/
    root.trigger = $(options.trigger);
    root.trigger_class = options.trigger;
    root.daddy = root.trigger.parent();
    root.attribute = options.attribute_name;

    /*--- elements in sky ---*/
    root.modal = null;
    root.modal_inner = null;
    root.modal_picture = null;
    root.modal_picture_inner = '.BM_modal_picture_inner';
    root.old_modal_picture_inner = null;
    root.modal_prev = null;
    root.modal_next = null;
    root.modal_close = null;
    root.modal_anchor = $('body');

    /*--- elements in cloud ---*/
    root.font_cdn = 'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css';
    root.animate_cdn = 'http://cdnjs.cloudflare.com/ajax/libs/animate.css/3.2.6/animate.min.css';
    root.hammerJS_cdn = 'http://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js';

    /*--- vars ---*/
    root.is_opened = false;
    root.image_opened = null;
    root.image_index = -1;
    root.gallery_length = root.trigger.length;
    root.scr_array = function () {
        var arr = [];
        for (var i = 0; i < root.gallery_length; i++) {
            arr[i] = root.trigger.eq(i).attr(root.attribute);
        }
        return arr;
    }();

    root.size_limited = false;

    /*--- event helpers ---*/
    root.animation_classes = ['animated'];
    root.animationend = 'animationend animationend webkitAnimationEnd oanimationend MSAnimationEnd';
    root.animationstart = 'animationstart animationstart webkitAnimationStart oanimationstart MSAnimationStart';
    root.animationiteration = 'animationiteration animationiteration webkitAnimationIteration oanimationiteration MSAnimationIteration';
    root.which_event = function (string) {
        var output = '';
        var animation_array = {
            animationend: root.animationend.split(' '),
            animationstart: root.animationstart.split(' '),
            animationiteration: root.animationiteration.split(' ')
        }; 
        for (var key in animation_array) {
            for (var i = 0; i < animation_array[key].length; i++) {
                if (animation_array[key][i] === string) {
                    return animation_array[key][0];
                }
            }
        }       
    };
    
    root.whichTransitionEvent = function (){
        var animEndEventNames = {
            'WebkitAnimation' : 'webkitAnimationEnd',
            'MozAnimation'    : 'animationend',
            'OAnimation'      : 'oAnimationEnd',
            'msAnimation'     : 'MSAnimationEnd',
            'animation'       : 'animationend'
        };

        var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd otransitionend',
            'msTransition'     : 'MSTransitionEnd',
            'transition'       : 'transitionend'
        };

        var anim = animEndEventNames[ Modernizr.prefixed('animation') ];
        var trans = transEndEventNames[ Modernizr.prefixed('transition') ];

        var obj = {
            animate    : anim,
            transition : trans
        };

        return obj;
    };

    root.transEndEvent = root.whichTransitionEvent().transition;
    root.animEndEvent = root.whichTransitionEvent().animate;

    /*--- get image properties callback ---*/
    root.background_to_image = function(src, callback) {
        var img = new Image();
        var width, height;
    img.src = src;

    img.onload = function () {
        if (typeof width == 'undefined') width = this.width;
        if (typeof height == 'undefined') height = this.height;
        callback({ width: width, height: height, src: src });
      }
    };

};


/*
* fn init
* initialize the object
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.init = function () {
    var _this = this;

    _this.create_modal();
};



/*
* fn create_modal
* build the HTML structure on load and sync the cdn connected libraries
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.create_modal = function () {
    var _this = this;

    _this.modal = $('<div class="BM_modal"></div>');
    _this.modal.appendTo(_this.modal_anchor);
    
    _this.modal_inner = $('<div class="BM_modal_inner"></div>');
    _this.modal_inner.appendTo(_this.modal);

    _this.modal_prev = $('<div class="BM_modal_prev"></div>');
    _this.modal_next = $('<div class="BM_modal_next"></div>');
    _this.modal_close = $('<div class="BM_modal_close"></div>');

    _this.modal_prev.appendTo(_this.modal_inner);
    _this.modal_next.appendTo(_this.modal_inner);
    _this.modal_close.appendTo(_this.modal_inner);


    if (_this.gestures_allowed === true) {
        var hammerJS_cdn = $('<!-- load animate by CDN with BE-Modal -->\
            <link rel="stylesheet" href="' + _this.hammerJS_cdn + ' ">\
            <!-- end of load animate -->');

        $('head').append(hammerJS_cdn);
    }

    this.init_events();

};


/*
* fn init_events
* initialize the events
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.init_events = function () {

    var that = this;

    /*---- open modal ----*/

    that.trigger.each(function (i, e) {
        $(e).on('click', function (ev) {

            var $this = $(ev.target).closest(that.trigger_class);
            that.image_index = $this.index(that.trigger_class);
            that.image_opened = $this.attr(that.attribute);

            if (that.is_opened === false) {
                that.open_modal();
            } else {
                return false;
            }

        });
    });


    /*---- close modal ----*/

    that.modal_close.each(function (i, e) {
        $(e).on('click', function (ev) {
            if (that.is_opened === true) {
                that.close_modal();
            } else {
                return false;
            }
        });
    });

    $(document).on('keyup', function(ev) {
        if (ev.keyCode == 27) {
            if (that.is_opened === true) {
                that.close_modal();
            } else {
                return false;
            }
        }
    });

    that.modal.each(function (i, e) {
        $(e).on('click', function (ev) {
            if ($(ev.target).is(that.modal)) {
                if (that.is_opened === true) {
                    that.close_modal();
                } else {
                    return false;
                }
            }
        });
    });


    /*---- navigate modal ----*/

    that.modal_prev.each(function (i, e) {
        $(e).on('click', function (ev) {
            if (that.is_opened === true) {
                that.prev();
            } else {
                return false;
            }
            
        });
    });

    $(document).on('keyup', function(ev) {
        if (ev.keyCode == 37) {
            if (that.is_opened === true) {
                that.prev();
            } else {
                return false;
            }
        }
    });


    that.modal_next.each(function (i, e) {
        $(e).on('click', function (ev) {
            if (that.is_opened === true) {
                that.next();
            } else {
                return false;
            }
            
        });
    });

    $(document).on('keyup', function(ev) {
        if (ev.keyCode == 39) {
            if (that.is_opened === true) {
                that.next();
            } else {
                return false;
            }
        }
    });


    /*---- gestures ----*/

    if (that.gestures_allowed === true) {
        var swipe = Hammer(document).on('drag swipe', function(e) {     
            if (Hammer.utils.isVertical(e.gesture.direction))
                    return false;
            
            e.gesture.preventDefault();
            
            if (e.type == 'swipe') {
                if(that.is_opened === true) {               
                    if (e.gesture.direction == 'left') {
                        that.next();
                    } else if (e.gesture.direction == 'right') {
                        that.prev();
                    }
                }
            }
        });
    }


    /*---- animationend ----*/

    $(document).on(that.animEndEvent, function (ev) {
        var type = that.which_event(ev.type);
        var animation_name = ev.originalEvent.animationName;
        var element = $(ev.target);

        // A. modal fadeIN
        if (that.modal.is(element) && animation_name === 'fadeIn' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);

            that.open_picture();
        }

        // B. modal fadeOut
        if (that.modal.is(element) && animation_name === 'fadeOut' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);
            element.removeClass('open');
        }

        // C. image slideInLeft
        if ($(that.modal_picture_inner).is(element) && animation_name === 'fadeInLeft' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);
        }

        if ($(that.modal_picture_inner).is(element) && animation_name === 'fadeInRight' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);
        }

        // D. image slideInRight
        if ($(that.modal_picture_inner).is(element) && animation_name === 'fadeOutRight' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);
            element.remove();
        }

        if ($(that.modal_picture_inner).is(element) && animation_name === 'fadeOutLeft' && type === 'animationend') {
            element.removeClass(that.animation_classes[0]);
            element.removeClass(animation_name);
            element.remove();
        }

    });

    
    /*---- resize window and orientation change ----*/
    $(window).on('resize orientationchange', function (e) {
        if (that.is_opened === true) {  
            var modal_picture_inner = $(modal_picture_inner);
            that.background_to_image(that.scr_array[that.image_index], function (img_obj) {     
                modal_picture_inner.css({
                    'background-image': 'url(' + img_obj.src + ')'
                });

                //set images' and containers' size
                that.limit_size(img_obj);

                //polyfill in case limit_size doesn't work
                if (that.size_limited === false) {
                    $.each([that.modal_picture, that.modal_inner], function (i, e) {
                        $(e).css({
                            'width': img_obj.width + 'px',
                            'height': img_obj.height + 'px'
                        });
                    });
                }
            });
        }
    });

};


/*
* fn open_modal
* open the modal and add an image on animationend (in events)
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.open_modal = function () {
    var _this = this;   

    //1. open modal block
    _this.modal.addClass('open');
    _this.modal.addClass('animated');
    _this.modal.addClass('fadeIn');

    //2. add picture
    //IN ANIMATION-EVENT A.
    
    //3. Update Object
    _this.is_opened = true;

};


/*
* fn close_modal
* close the modal and reset parameters
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.close_modal = function () {
    var _this = this;       
    if (_this.is_opened === true) {

        //1. close modal block
        _this.modal.addClass('animated');
        _this.modal.addClass('fadeOut');

        //2. set to 0
        _this.reset();

        _this.is_opened = false;
    
    }
};


/*
* fn init
* add a picture in the blank left by the modal
* @params: dir (strings 'to-left or 'to-right' based on where the picture is coming from)
*/

Berlinerds_Gallery_Modal.prototype.open_picture = function (dir) {
    var _this = this;       

    //create the modal for the first time the picture has to be opened
    if (_this.modal_picture === null) {
        _this.modal_picture = $('<div class="BM_modal_picture"></div>');
        _this.modal_picture.appendTo(_this.modal_inner);
        _this.modal_picture = $('.BM_modal_picture');
    }

    //create the inner picture block
    var modal_picture_inner = $('<div class="BM_modal_picture_inner"></div>');
    modal_picture_inner.appendTo(_this.modal_picture);
    _this.old_modal_picture_inner = modal_picture_inner;

    //set css-animation based on the direction @param dir.
    if (dir === 'to_left') {
        modal_picture_inner.addClass('animated');
        modal_picture_inner.addClass('fadeInLeft');
    } else {
        modal_picture_inner.addClass('animated');
        modal_picture_inner.addClass('fadeInRight');        
    }

    //get the image infos
    _this.background_to_image(_this.scr_array[_this.image_index], function (img_obj) {  
        // set the image
        modal_picture_inner.css({ 'background-image': 'url(' + img_obj.src + ')' });

        //set images' and containers' size
        _this.limit_size(img_obj);

        //polyfill in case limit_size doesn't work
        if (_this.size_limited === false) {
            $.each([_this.modal_picture, _this.modal_inner], function (i, e) {
                $(e).css({
                    'width': img_obj.width + 'px',
                    'height': img_obj.height + 'px'
                });
            });
        }
    });
};


/*
* fn close_picture
* makes disappear an image
* @params: dir (strings 'to-left or 'to-right' based on where the picture has to go to)
*/

Berlinerds_Gallery_Modal.prototype.close_picture = function (dir) {
    var _this = this;       

    if (dir === 'to_left') {
        _this.old_modal_picture_inner.addClass('animated');
        _this.old_modal_picture_inner.addClass('fadeOutRight');
    } else {
        _this.old_modal_picture_inner.addClass('animated');
        _this.old_modal_picture_inner.addClass('fadeOutLeft');  
    }
};


/*
* fn reset
* set all the values to default in the object
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.reset = function () {
    var _this = this;   

    _this.modal_picture.remove();
    _this.modal_picture = null;
};


/*
* fn prev
* go to prev image
* @params: no params
*/

Berlinerds_Gallery_Modal.prototype.prev = function () {
    var _this = this;

    if (_this.image_index > 0) {
        _this.image_index--;
    } else {
        _this.image_index = _this.gallery_length - 1;
    }
    

    _this.close_picture('to_left');
    _this.open_picture('to_left');
};
    

/*
* fn next
* go to next image
* @params: no params
*/
    
Berlinerds_Gallery_Modal.prototype.next = function () {
    var _this = this;       
    
    if (_this.image_index < (_this.gallery_length - 1)) {
        _this.image_index++;
    } else {
        _this.image_index = 0;
    }

    _this.close_picture('to_right');
    _this.open_picture('to_right');
};


/*
* fn limit_size
* initialize the object
* @params: img_obj. Object got by callbacking the image from the background src.
* @returns all the size calculations of the modal_inner in the modal
*/

Berlinerds_Gallery_Modal.prototype.limit_size = function (img_obj) {
    
    var _this = this;       
    var win_width = $(window).innerWidth();
    var win_height = $(window).innerHeight();
    
    var win_orientation = function () {
        if (win_width > win_height) {
            return 'landscape';
        } else {
            return 'portrait';
        }
    }();

    var match_query = function () {
        if (win_width >= 830) {
            return 'default';
        } else if (win_width < 830 && win_width >= 500) {
            return '830';
        } else if (win_width < 500) {
            return '500';
        }
    }();

    var width = img_obj.width;
    var height = img_obj.height;
    var orientation = (width >= height) ? 'horizontal' : 'vertical';
    var proportion = (orientation === 'horizontal') ? width/height : height/width;
    var dimension_type = (_this.dimensions[match_query].indexOf('%') > 0) ? 'percent' : 'pixels';
    var vertical_limit;
    var max_width = null;
    var max_height = null;

    // CALCULO DE TAMAÑOS !!!

    //calculate max widths or max heights
    if (dimension_type === 'percent') {
        vertical_limit = (win_height * parseFloat(_this.dimensions[match_query])) / 100;

        // condiciones normales.
        // orientacion de la imagen horizontal
        if (orientation === 'horizontal') {
            max_width = (win_width * parseFloat(_this.dimensions[match_query])) / 100  + 'px';
            max_height = 'auto';
            
            if (width > parseFloat(max_width)) {
                width = max_width;
                height = parseFloat(max_width) / proportion + 'px';
            } else {
                width = width + 'px';
                height = height + 'px';
            }
        }

        // orientacion de la imagen vertical
        if (orientation === 'vertical') {
            max_height = (win_height * parseFloat(_this.dimensions[match_query])) / 100  + 'px';
            max_width = 'auto';
            
            if (height > parseFloat(max_height)) {
                height = max_height;
                width = parseFloat(max_height) / proportion + 'px';
            } else {
                width = width + 'px';
                height = height + 'px';
            }
        }

        //si la altura es más pequeña que el tamaño de la imagen con limite
        if (parseFloat(height) > vertical_limit) {
            max_height = (win_height * parseFloat(_this.dimensions[match_query]) - 10) / 100  + 'px';
            max_width = parseFloat(max_height) * proportion + 'px';
            width = max_width;
            height = max_height

        }

    } else {

        //pixels supported in the future
    }


    $.each([_this.modal_picture, _this.modal_inner], function (i, e) {
        $(e).css({
            'width': width,
            'height': height, 
            'max-width': max_width, 
            'max-height': max_height, 
        });
    });

    _this.size_limited = true;
};

