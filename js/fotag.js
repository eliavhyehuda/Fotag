'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');
    
    var imageCollectionModel = new modelModule.ImageCollectionModel();

    var imageCollectionView = new viewModule.ImageCollectionView();
    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    imageCollectionModel.addListener(function (eventType, imageModelCollection, imageModel, eventDate) {
        if (eventType == modelModule.IMAGE_ADDED_TO_COLLECTION_EVENT) {
            appContainer.appendChild(imageCollectionView.getElement());
        }
    });

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    appContainer.appendChild(fileChooser.getElement());

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        '/images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    ));
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    var toolbar = new viewModule.Toolbar ();
    toolbar.addListener(function(toolbar, eventType, eventDate){
        if (eventType == viewModule.RATING_CHANGE){
            imageCollectionView.setRatingFilter(toolbar.getCurrentRatingFilter());
            imageCollectionView.getElement();
        }
    });
    appContainer.appendChild(toolbar.getElement());

    document.getElementById('rating_filter').addEventListener('change', function () {
        toolbar.setRatingFilter(document.getElementById('rating_filter').value);
    });
    document.getElementById('grid_button').addEventListener('click', function () {
        toolbar.setToView(viewModule.GRID_VIEW);
        document.getElementById('photo-container').className = 'grid';
        document.getElementById('grid_button').className = 'clicked';
        document.getElementById('list_button').className = '';
    });
    document.getElementById('list_button').addEventListener('click', function () {
        toolbar.setToView(viewModule.LIST_VIEW);
        document.getElementById('photo-container').className = 'list';
        document.getElementById('list_button').className = 'clicked';
        document.getElementById('grid_button').className = '';
    });

    // Demo retrieval
    var storedImageCollection = modelModule.loadImageCollectionModel();
    var storedImageDiv = document.createElement('div');
    _.each(
        storedImageCollection.getImageModels(),
        function(imageModel) {
            imageCollectionModel.addImageModel(imageModel);
        }
    );
    appContainer.appendChild(storedImageDiv);

    window.addEventListener('unload', function () {
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    /*

    //added code
    var toolbar = new viewModule.Toolbar();
    appContainer.appendChild(toolbar.getElement());

    //var newImage = new modelModule.ImageModel('/images/GOPR0044-small.jpg', )


    //var imageRenderer = new viewModule.ImageRenderer();
    //appContainer.appendChild(imageRenderer.getElement());

    //end of added code


    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    appContainer.appendChild(fileChooser.getElement());

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        _.each(
            files,
            function(file) {
                var newDiv = document.createElement('div');
                var fileInfo = "File name: " + file.name + ", last modified: " + file.lastModifiedDate;
                newDiv.innerText = fileInfo;
                //appContainer.appendChild(newDiv);

                var newImage = new modelModule.ImageModel('images/' + file.name, file.lastModifiedDate, '', 0);
                var imageRenderer = new viewModule.ImageRenderer(newImage);
                appContainer.appendChild(imageRenderer.getElement());


                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        '/images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    ));
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });
    // Demo retrieval
    var storedImageCollection = modelModule.loadImageCollectionModel();
    var storedImageDiv = document.createElement('div');
    _.each(
        storedImageCollection.getImageModels(),
        function(imageModel) {
            var imageModelDiv = document.createElement('div');
            imageModelDiv.innerText = "ImageModel from storage: " + JSON.stringify(imageModel);
            storedImageDiv.appendChild(imageModelDiv);
        }
    );
    appContainer.appendChild(storedImageDiv);
    */
});