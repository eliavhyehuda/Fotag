'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        this.imageModel = imageModel;
        this.view = "GRID_VIEW";
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            var self = this;
            var imageTemplate = document.getElementById('image-template');
            var container = document.createElement('div');

            container.appendChild(document.importNode(imageTemplate.content, true));
            var container_thumb = container.querySelector('.thumbnail');
            var container_img = container.querySelector('.uploaded-img');
            container_img.src = '.'+self.imageModel.path;
            container_thumb.addEventListener('click', function () {
                var container_module = container.querySelector('.img-module');
                if (container_module.className == 'img-module expand') {
                    container_module.className = 'img-module';
                    container_img.className = 'uploaded-img';
                    container_thumb.className = 'thumbnail';
                } else {
                    container_module.className = 'img-module expand';
                    container_img.className = 'uploaded-img expand';
                    container_thumb.className = 'thumbnail expand';
                }
            });
            var container_name = container.querySelector('.file-name');
            container_name.innerHTML = self.imageModel.path.replace('/images/','');
            var container_date = container.querySelector('.last-updated');
            var mod_date = self.imageModel.modificationDate;
            container_date.innerHTML = mod_date.getUTCDate() + '/' + mod_date.getUTCMonth() + '/' + mod_date.getUTCFullYear();
            var container_rating = container.querySelector('.stars');
            var rating;
            if (self.imageModel.getTempRating() != 0){
                rating = self.imageModel.getTempRating();
            } else {
                rating = self.imageModel.rating;
            }

            var i;
            var span;
            for (i = 0; i<rating; i++){
                span = document.createElement('span');
                span.className = 'fa fa-star';
                container_rating.appendChild(span);
            }
            for (i = rating; i<5; i++){
                span = document.createElement('span');
                span.className = 'fa fa-star-o';
                container_rating.appendChild(span);
            }
            var getRating = function (ev) {
                var off_x = container_rating.offsetLeft;
                var off_y = container_rating.offsetTop;
                if (container_rating.offsetParent) {
                    off_x += container_rating.offsetParent.offsetLeft;
                    off_y += container_rating.offsetParent.offsetTop;
                    if (container_rating.offsetParent.offsetParent) {
                        off_x += container_rating.offsetParent.offsetParent.offsetLeft;
                        off_y += container_rating.offsetParent.offsetParent.offsetTop;
                    }
                }

                off_x -= ev.pageX;
                off_x = Math.abs(off_x);
                off_y -= ev.pageY;

                var rating = off_x/17;
                rating ++;
                return Math.min(5,Math.floor(rating));
            };
            container_rating.addEventListener('click', function (ev) {
                rating = getRating(ev);
                self.imageModel.setRating(rating);
            });

            container_rating.addEventListener('mouseover', function (ev) {
                rating = getRating(ev);
                self.imageModel.setTempRating(rating);
            });

            container_rating.addEventListener('mouseout', function (ev) {
                self.imageModel.setTempRating(0);
            });

            return container;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            if (this.imageModel != imageModel) {
                this.imageModel = imageModel;
            }
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            if (this.view != viewType) {
                this.view = viewType;
                this.container.className = viewType;
            }
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.view;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            // TODO
            return new ImageRenderer(imageModel);
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.imageRendererFactory = new ImageRendererFactory ();
        this.imageCollectionmodel = {};
        this.imageRenderers = [];
        this.ratingFilter = 0;

        this.viewType = GRID_VIEW;
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            var self = this;
            var container = document.getElementById('photo-container');
            container.innerHTML = "";
            _.each(
                self.imageRenderers, 
                function (imageRenderer){
                    if (imageRenderer.imageModel.getRating() >= self.ratingFilter) {
                        container.appendChild(imageRenderer.getElement());
                    }
                }
            );

            return container;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageRendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            if (this.imageRendererFactory != imageRendererFactory){
                this.imageRendererFactory = imageRendererFactory;
            }
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionmodel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            var self = this;
            if (self.imageCollectionmodel != imageCollectionModel){
                if (self.imageCollectionmodel){
                    _.each(self.imageCollectionmodel.listeners, function (listener){
                        self.imageCollectionmodel.removeListener(listener);
                    })
                }
                imageCollectionModel.addListener(function (eventType, imageModelCollection, imageModel, eventDate){
                    if (eventType == 'IMAGE_ADDED_TO_COLLECTION_EVENT'){
                        self.imageRenderers.push(self.imageRendererFactory.createImageRenderer(imageModel));
                    } else if (eventType == 'IMAGE_REMOVED_FROM_COLLECTION_EVENT') {
                        self.getElement();
                    } else if (eventType == 'IMAGE_META_DATA_CHANGED_EVENT') {
                        self.getElement();
                    }
                });
            }
        },

        setRatingFilter: function (rating){
            this.ratingFilter = rating;
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            if (this.viewType != viewType) {
                this.viewType = viewType;
            }
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.viewType = "GRID_VIEW";
        this.listeners = [];
        this.rating = 0;

        var toolbarTemplate = document.getElementById('toolbar-template');
        this.container = document.createElement('div');
        this.container.appendChild(document.importNode(toolbarTemplate.content, true));
    };

    _.extend(Toolbar.prototype, {

        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            // TODO
            return this.container;
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            var index = this.listeners.indexOf(listener_fn);
            if (index >= 0) {
                this.listeners.splice(index, 1);
            }
            //this.listeners = _.without(this.listeners, listener_fn);
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            var self = this;
            if (self.viewType != viewType){
                self.viewType = viewType;
                _.each(self.listeners, function (listener){
                    listener(self, viewType, new Date().toUTCString());
                })
            }
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.rating;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            var self = this;
            if (self.rating != rating){
                self.rating = rating;
                _.each(self.listeners, function (listener){
                    listener(self, RATING_CHANGE, new Date().toUTCString());
                })
            }
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}